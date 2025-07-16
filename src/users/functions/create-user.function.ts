import {
  app,
  InvocationContext,
  HttpRequest,
  HttpResponseInit,
} from '@azure/functions';
import { INestApplicationContext, HttpException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserService } from '../services/user.service';
import { UserModule } from '../user.module';

let cachedApp: INestApplicationContext | null = null;

async function bootstrapNestApp(): Promise<INestApplicationContext> {
  if (!cachedApp) {
    const app = await NestFactory.createApplicationContext(UserModule);
    // app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

app.http('create-user', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'api/users',
  handler: async (
    req: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    context.log('HTTP trigger function processed a request for create-user.');

    try {
      const app = await bootstrapNestApp();
      const userService = app.get(UserService);

      const createUserDto = plainToInstance(CreateUserDto, await req.json());
      const errors = await validate(createUserDto);

      if (errors.length > 0) {
        return {
          status: 400,
          jsonBody: {
            message: 'Validation failed',
            errors: errors.map((err) => ({
              property: err.property,
              constraints: err.constraints,
            })),
          },
          headers: { 'Content-Type': 'application/json' },
        };
      }

      const user = await userService.createUser(createUserDto);
      return {
        status: 201,
        jsonBody: user,
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (error) {
      context.log('Error creating user:', error);

      if (error instanceof HttpException) {
        return {
          status: error.getStatus(),
          jsonBody: {
            message: error.message,
            ...((error.getResponse() as any).error && {
              error: (error.getResponse() as any).error,
            }),
          },
          headers: { 'Content-Type': 'application/json' },
        };
      } else {
        return {
          status: 500,
          jsonBody: { message: 'Internal server error', error: error.message },
          headers: { 'Content-Type': 'application/json' },
        };
      }
    }
  },
});
