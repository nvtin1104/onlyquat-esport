import { Catch, HttpException, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

/**
 * Global filter for microservices (core, esports).
 *
 * Catches any HttpException (UnauthorizedException, ForbiddenException, etc.)
 * and re-throws it as an RpcException with the original status + message
 * so the gateway can reconstruct the correct HTTP response.
 */
@Catch()
export class AllExceptionsToRpcFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(AllExceptionsToRpcFilter.name);

  catch(exception: any, host: any): Observable<any> {
    // ── HttpException → RpcException with preserved details ───────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      const rpcError = new RpcException({
        statusCode: status,
        message:
          typeof response === 'string'
            ? response
            : (response as any)?.message ?? exception.message,
        error:
          typeof response === 'string'
            ? response
            : (response as any)?.error ?? exception.name,
      });

      return super.catch(rpcError, host);
    }

    // ── Already an RpcException — pass through ────────────────────────
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    // ── Unknown error — log and wrap ──────────────────────────────────
    this.logger.error(
      `Unexpected error: ${exception?.message ?? exception}`,
      exception?.stack,
    );

    const rpcError = new RpcException({
      statusCode: 500,
      message: 'Internal server error',
      error: 'InternalServerError',
    });

    return super.catch(rpcError, host);
  }
}
