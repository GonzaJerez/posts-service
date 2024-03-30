import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthUser } from '../types/auth-user.interface';

/**
 * Decorador de parametro para obtener el usuario de la req
 */
export const GetUser = createParamDecorator(
  (data: any | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user: IAuthUser = req.user;

    return user;
  },
);
