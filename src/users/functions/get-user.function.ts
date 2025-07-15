import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';

const getUserFunction: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  try {
    const id = req.query.id || req.params?.id;
    const repo = new UserRepository();
    const service = new UserService(repo);
    const user = await service.getUserById(id);

    if (!user) {
      context.res = {
        status: 404,
        body: { message: 'Usuario no encontrado' },
      };
      return;
    }

    context.res = {
      status: 200,
      body: user,
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: { message: 'Error al obtener usuario', error: err.message },
    };
  }
};

export default getUserFunction;
