import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nService, I18nContext } from 'nestjs-i18n';

/**
 * Intercepts successful responses and translates any message fields
 * that look like i18n translation keys (e.g. 'errors.USER_DEACTIVATED').
 */
@Injectable()
export class TranslateResponseInterceptor implements NestInterceptor {
  constructor(private readonly i18n: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const lang = I18nContext.current(context)?.lang ?? 'en';

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && typeof data.message === 'string') {
          return { ...data, message: this.translate(data.message, lang) };
        }
        return data;
      }),
    );
  }

  private translate(key: string, lang: string): string {
    if (!key || !key.includes('.')) return key;
    try {
      const translated = this.i18n.translate(key as any, { lang }) as string;
      return translated ?? key;
    } catch {
      return key;
    }
  }
}
