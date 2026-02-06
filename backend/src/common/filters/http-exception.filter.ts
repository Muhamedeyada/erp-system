import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const resp = exceptionResponse as { message?: string | string[]; errors?: string[] };
    let message: string | string[] = resp?.message ?? exception.message;
    const errors = resp?.errors ?? (Array.isArray(message) ? message : undefined);
    const messageStr = Array.isArray(message) ? 'Validation failed' : (message as string);

    const body = {
      success: false,
      statusCode: status,
      message: messageStr,
      ...(errors && errors.length > 0 && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(`${status} ${request.method} ${request.url} - ${messageStr}`);

    response.status(status).json(body);
  }
}
