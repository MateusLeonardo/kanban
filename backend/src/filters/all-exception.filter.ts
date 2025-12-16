import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from 'generated/prisma/internal/prismaNamespace';

export interface ExceptionResponse {
  type?: string;
  statusCode?: number;
  message?: string;
}
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json({
        type: exception.constructor.name,
        statusCode: exception.getStatus(),
        message: exception.message,
      });
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        type: exception.constructor.name,
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
    }

    if (exception instanceof PrismaClientValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        type: exception.constructor.name,
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      type: 'InternalServerError',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
