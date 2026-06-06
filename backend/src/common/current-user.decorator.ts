import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type RequestUser = {
  sub: number;
  email: string;
  role: string;
};

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): RequestUser => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});
