import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const startTime = Date.now();

    this.logger.log(`[Request] ${method} ${url}`);
    if (Object.keys(query).length > 0) {
      this.logger.debug(`Query: ${JSON.stringify(query)}`);
    }
    if (Object.keys(params).length > 0) {
      this.logger.debug(`Params: ${JSON.stringify(params)}`);
    }
    if (Object.keys(body).length > 0) {
      const sanitizedBody = { ...body };
      if (sanitizedBody.password) delete sanitizedBody.password;
      this.logger.debug(`Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(`[Response] ${method} ${url} - ${duration}ms`);
          this.logger.debug(`Response: ${JSON.stringify(data).substring(0, 500)}`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`[Error] ${method} ${url} - ${duration}ms`);
          this.logger.error(`Error: ${error.message}`, error.stack);
        },
      }),
    );
  }
}
