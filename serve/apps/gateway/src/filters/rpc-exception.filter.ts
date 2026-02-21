import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * Global gateway filter that maps microservice errors to proper HTTP responses.
 *
 * Flow:
 *   Microservice throws HttpException
 *   → AllExceptionsToRpcFilter wraps it as RpcException({ statusCode, message, error })
 *   → NATS serialises it
 *   → Gateway receives plain object via firstValueFrom()
 *   → This filter extracts statusCode/message and sends correct HTTP response
 */
@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcToHttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status(code: number): { json(body: any): void } }>();

    // ── Already a proper NestJS HttpException (thrown locally in gateway) ──
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return response.status(status).json(
        typeof body === 'string' ? { statusCode: status, message: body } : body,
      );
    }

    // ── RPC error from microservice (serialised by AllExceptionsToRpcFilter) ──
    const rpcData = this.extractRpcData(exception);
    const status = rpcData.statusCode;
    const message = rpcData.message;
    const error = rpcData.error;

    if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      return response.status(status).json({
        statusCode: status,
        message,
        error,
      });
    }

    // ── Truly unexpected — log full details ────────────────────────────
    this.logger.error(
      `Unhandled exception: ${JSON.stringify(message)}`,
      exception?.stack ?? JSON.stringify(exception),
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  // ────────────────────────────────────────────────────────────────────────

  /**
   * Extract error data from an RPC exception.
   *
   * NestJS NATS transport delivers the RpcException error in various shapes:
   *   - Direct: { statusCode: 401, message: '...', error: '...' }
   *   - Wrapped in `err`: Error object with `.message` as JSON string
   *   - Deeply nested: { error: { statusCode, message, error } }
   */
  private extractRpcData(err: any): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    const defaultResult = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR as number,
      message: 'Internal server error' as string | string[],
      error: 'InternalServerError',
    };

    if (!err) return defaultResult;

    // Case 1: Error.message is a JSON string containing our RpcException data
    if (err instanceof Error && err.message) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.statusCode) {
          return {
            statusCode: parsed.statusCode,
            message: parsed.message ?? defaultResult.message,
            error: parsed.error ?? HttpStatus[parsed.statusCode] ?? defaultResult.error,
          };
        }
      } catch {
        // not JSON — fall through
      }
    }

    // Case 2: Direct object with statusCode
    if (typeof err?.statusCode === 'number' && err.statusCode >= 400) {
      return {
        statusCode: err.statusCode,
        message: err.message ?? defaultResult.message,
        error: err.error ?? HttpStatus[err.statusCode] ?? defaultResult.error,
      };
    }

    // Case 3: Nested in .error property
    const inner = err?.error;
    if (inner && typeof inner === 'object' && typeof inner.statusCode === 'number') {
      return {
        statusCode: inner.statusCode,
        message: inner.message ?? defaultResult.message,
        error: inner.error ?? HttpStatus[inner.statusCode] ?? defaultResult.error,
      };
    }

    // Case 4: .status is a number (some NestJS versions)
    if (typeof err?.status === 'number' && err.status >= 400 && err.status < 600) {
      return {
        statusCode: err.status,
        message: err.message ?? defaultResult.message,
        error: err.error ?? HttpStatus[err.status] ?? defaultResult.error,
      };
    }

    // Case 5: message is JSON string at top level
    if (typeof err?.message === 'string') {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.statusCode) {
          return {
            statusCode: parsed.statusCode,
            message: parsed.message ?? defaultResult.message,
            error: parsed.error ?? defaultResult.error,
          };
        }
      } catch {
        // not JSON
      }
    }

    return defaultResult;
  }
}
