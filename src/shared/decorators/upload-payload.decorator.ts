import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

export const UploadPayload = createParamDecorator(
  (data: ClassConstructor<unknown>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const arquivos = request.files;
    const body = request.body;

    return { arquivos, body, dtoClass: data };
  },
);