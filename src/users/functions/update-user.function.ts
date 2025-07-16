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
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserService } from '../services/user.service';
import { UserModule } from '../user.module';

let cachedApp: INestApplicationContext | null = null;

async function bootstrapNestApp(): Promise<INestApplicationContext> {
  if (!cachedApp) {
    const app = await NestFactory.createApplicationContext(UserModule);
    // app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true })); // Optional
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

app.http('update-user', {
  methods: ['PUT'],
  authLevel: 'function',
  route: 'api/users/{id}',
  handler: async (
    req: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    context.log('HTTP trigger function processed a request for update-user.');

    try {
      const app = await bootstrapNestApp();
      const userService = app.get(UserService);

      const userId = req.params?.id;
      if (!userId) {
        return {
          status: 400,
          jsonBody: { message: 'User ID is required in the path.' },
          headers: { 'Content-Type': 'application/json' },
        };
      }

      const reqBody = await req.json();
      const updateUserDto = plainToInstance(UpdateUserDto, reqBody);
      const errors = await validate(updateUserDto);

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

      const updatedUser = await userService.updateUser(userId, updateUserDto);

      if (!updatedUser) {
        return {
          status: 404,
          jsonBody: { message: `User with ID ${userId} not found.` },
          headers: { 'Content-Type': 'application/json' },
        };
      }

      return {
        status: 200,
        jsonBody: updatedUser,
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (error) {
      context.log('Error updating user:', error);
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
