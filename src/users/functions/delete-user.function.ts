import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { INestApplicationContext, HttpException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UserService } from '../services/user.service';
import { UserModule } from '../users.module';

let cachedApp: INestApplicationContext | null = null;

async function bootstrapNestApp(): Promise<INestApplicationContext> {
  if (!cachedApp) {
    const app = await NestFactory.createApplicationContext(UserModule);
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

const deleteUserFunction: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  context.log('HTTP trigger function processed a request for delete-user.');

  try {
    const app = await bootstrapNestApp();
    const userService = app.get(UserService);

    const userId = req.params?.id;
    if (!userId) {
      context.res = {
        status: 400,
        body: { message: 'User ID is required in the path.' },
        headers: { 'Content-Type': 'application/json' },
      };
      return;
    }

    await userService.deleteUser(userId);

    context.res = {
      status: 204,
      body: null,
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    context.log.error('Error deleting user:', error);
    if (error instanceof HttpException) {
      context.res = {
        status: error.getStatus(),
        body: { message: error.message, ...(error.getResponse() as any).error && { error: (error.getResponse() as any).error } },
        headers: { 'Content-Type': 'application/json' },
      };
    } else {
      context.res = {
        status: 500,
        body: { message: 'Internal server error', error: error.message },
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }
};

export default deleteUserFunction;