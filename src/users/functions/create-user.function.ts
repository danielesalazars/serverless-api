import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { INestApplicationContext, ValidationPipe, HttpException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserService } from '../services/user.service';
import { UserModule } from '../users.module'; 

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

const createUserFunction: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  context.log('HTTP trigger function processed a request for create-user.');

  try {
    const app = await bootstrapNestApp();
    const userService = app.get(UserService);

    const createUserDto = plainToInstance(CreateUserDto, req.body);
    const errors = await validate(createUserDto);

    if (errors.length > 0) {
      context.res = {
        status: 400,
        body: {
          message: 'Validation failed',
          errors: errors.map(err => ({
            property: err.property,
            constraints: err.constraints,
          })),
        },
        headers: { 'Content-Type': 'application/json' },
      };
      return;
    }

    const user = await userService.createUser(createUserDto);
    context.res = {
      status: 201,
      body: user,
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    context.log.error('Error creating user:', error);
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

export default createUserFunction;