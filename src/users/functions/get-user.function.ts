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

app.http('get-user', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'api/users/{id}',
  handler: async (
    req: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    context.log(
      'HTTP trigger function processed a request for get-user-by-id.',
    );

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

      const user = await userService.findUserById(userId);

      if (!user) {
        return {
          status: 404, // OK
          jsonBody: { message: `User with ID ${userId} not found.` },
          headers: { 'Content-Type': 'application/json' },
        };
      }

      return {
        status: 200, // OK
        jsonBody: user,
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (error) {
      context.log('Error getting user:', error);
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
