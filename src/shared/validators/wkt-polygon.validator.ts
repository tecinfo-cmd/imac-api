import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

const wktRegex = /^((POLYGON|MULTIPOLYGON)\s*\(\(.+\)\)|GEOMETRYCOLLECTION\s*\(.+\))$/i;

@ValidatorConstraint({ async: false })
export class IsWktValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return wktRegex.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `A propriedade '${args.property}' deve ser uma string de Well-Known Text (WKT) válida do tipo POLYGON ou MULTIPOLYGON.`;
  }
}