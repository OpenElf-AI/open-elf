import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(@Inject(MetricsService) private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();
          this.metricsService.recordRequest(
            url,
            method,
            duration,
            response.statusCode,
            true,
          );
        },
        error: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();
          this.metricsService.recordRequest(
            url,
            method,
            duration,
            response.statusCode || 500,
            false,
          );
        },
      }),
    );
  }
}
