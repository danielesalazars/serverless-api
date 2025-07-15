import { AzureFunction, Context, HttpRequest } from '@azure/functions';
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

const updateUserFunction: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  context.log('HTTP trigger function processed a request for update-user.');

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

    const updateUserDto = plainToInstance(UpdateUserDto, req.body);
    const errors = await validate(updateUserDto);

    if (errors.length > 0) {
      context.res = {
        status: 400,
        body: {
          message: 'Validation failed',
          errors: errors.map((err) => ({
            property: err.property,
            constraints: err.constraints,
          })),
        },
        headers: { 'Content-Type': 'application/json' },
      };
      return;
    }

    const updatedUser = await userService.updateUser(userId, updateUserDto);
    context.res = {
      status: 200,
      body: updatedUser,
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    context.log.error('Error updating user:', error);
    if (error instanceof HttpException) {
      context.res = {
        status: error.getStatus(),
        body: {
          message: error.message,
          ...((error.getResponse() as any).error && {
            error: (error.getResponse() as any).error,
          }),
        },
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

export default updateUserFunction;
