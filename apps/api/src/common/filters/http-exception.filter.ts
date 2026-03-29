import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = (exceptionResponse as any).message || 'Internal server error';
        errorDetails = (exceptionResponse as any).error || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'Internal server error';
      // 在生产环境中不暴露详细错误信息
      if (process.env.NODE_ENV !== 'production') {
        errorDetails = exception.stack;
      }
    }

    const errorResponse = {
      code: status,
      message: message,
      data: null,
      error: errorDetails,
      timestamp: Date.now(),
    };

    response.status(status).json(errorResponse);
  }
}
