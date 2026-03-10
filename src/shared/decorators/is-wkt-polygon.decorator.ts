import { registerDecorator, ValidationOptions } from "class-validator";
import { IsWktValidator } from "../validators/wkt-polygon.validator";

export function IsWktPolygon(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsWktValidator,
    });
  };
}