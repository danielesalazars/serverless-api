import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { NestFactory } from '@nestjs/core';
import { UserModule } from '../user.module';
import { UserService } from '../services/user.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '../dtos/create-user.dto';

let cachedApp = null;

const createUserFunction: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  if (!cachedApp) {
    const app = await NestFactory.createApplicationContext(UserModule);
    cachedApp = app.get(UserService);
  }

  const dto = plainToInstance(CreateUserDto, req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    context.res = {
      status: 400,
      body: errors,
    };
    return;
  }

  const user = cachedApp.createUser(dto);
  context.res = {
    status: 201,
    body: user,
  };
};

export default createUserFunction;
