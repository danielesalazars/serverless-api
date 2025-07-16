import {
  app,
  InvocationContext,
  HttpRequest,
  HttpResponseInit,
} from '@azure/functions';
import { INestApplicationContext, HttpException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UserService } from '../services/user.service';
import { UserModule } from '../user.module';

let cachedApp: INestApplicationContext | null = null;

async function bootstrapNestApp(): Promise<INestApplicationContext> {
  if (!cachedApp) {
    const app = await NestFactory.createApplicationContext(UserModule);
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

app.http('delete-user', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'api/users/{id}',
  handler: async (
    req: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    context.log('HTTP trigger function processed a request for delete-user.');

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

      const deleteCount = await userService.deleteUser(userId);

      if (Number(deleteCount) === 0) {
        return {
          status: 404,
          jsonBody: { message: `User with ID ${userId} not found.` },
          headers: { 'Content-Type': 'application/json' },
        };
      }

      return {
        status: 204,
      };
    } catch (error) {
      context.log('Error deleting user:', error);
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
