import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { I18nService, I18nContext } from 'nestjs-i18n';

/**
 * Global gateway filter that maps microservice errors to proper HTTP responses.
 * Supports i18n translation — services throw translation keys (e.g. 'errors.USER_NOT_FOUND')
 * and this filter translates them based on the request language.
 *
 * Flow:
 *   Microservice throws HttpException
 *   → AllExceptionsToRpcFilter wraps it as RpcException({ statusCode, message, error })
 *   → NATS serialises it
 *   → Gateway receives plain object via firstValueFrom()
 *   → This filter extracts statusCode/message, translates keys, sends HTTP response
 */
@Injectable()
@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcToHttpExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  catch(exception: any, host: ArgumentsHost) {
    const lang = I18nContext.current(host)?.lang ?? 'en';
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status(code: number): { json(body: any): void } }>();

    // ── Already a proper NestJS HttpException (thrown locally in gateway) ──
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        return response.status(status).json({
          statusCode: status,
          message: this.translate(body, lang),
        });
      }

      if (typeof body === 'object' && body !== null) {
        const msg = (body as any)?.message;
        return response.status(status).json({
          ...body,
          statusCode: status,
          message: this.translateMessage(msg, lang),
        });
      }

      return response.status(status).json(body);
    }

    // ── RPC error from microservice (serialised by AllExceptionsToRpcFilter) ──
    const rpcData = this.extractRpcData(exception);
    const status = rpcData.statusCode;
    const message = this.translateMessage(rpcData.message, lang);
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
      `Unhandled exception: ${JSON.stringify(rpcData.message)}`,
      exception?.stack ?? JSON.stringify(exception),
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.translate('errors.INTERNAL_SERVER_ERROR', lang),
    });
  }

  // ────────────────────────────────────────────────────────────────────────

  /**
   * Translate a single message string.
   * If it looks like a translation key (contains '.'), attempt translation.
   * Falls back to the original string if translation fails or key not found.
   */
  private translate(message: string, lang: string): string {
    if (!message || !message.includes('.')) return message;
    try {
      const translated = this.i18n.translate(message as any, { lang }) as string;
      return translated ?? message;
    } catch {
      return message;
    }
  }

  private translateMessage(message: string | string[], lang: string): string | string[] {
    if (Array.isArray(message)) {
      return message.map((m) => this.translate(m, lang));
    }
    if (typeof message === 'string') {
      return this.translate(message, lang);
    }
    return message;
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
      message: 'errors.INTERNAL_SERVER_ERROR' as string | string[],
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
