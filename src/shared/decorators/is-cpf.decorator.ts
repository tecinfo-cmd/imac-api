import { registerDecorator, ValidationOptions } from 'class-validator';
import { CPFValidator } from '../../elegibilidade/validators/cpf';
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * A custom decorator that combines CPF validation and sanitization.
 * It removes any non-digit characters from the string before validating it as a CPF.
 *
 * @param validationOptions - Optional validation options from class-validator.
 */
export function IsCpf(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Transform(({ value }) => value?.replace(/[^\d]/g, '')),
    (object: Object, propertyName: string) => {
      registerDecorator({
        name: 'isCpf',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [],
        validator: CPFValidator,
      });
    },
  );
}
