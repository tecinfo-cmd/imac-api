import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isValidPhone', async: false })
export class TelefoneValidator implements ValidatorConstraintInterface {
  validate(phone: string): boolean {
    const sanitizedPhone = phone.replace(/[^0-9]/g, '');

    // Valida se possui 11 ou 13 dígitos
    return sanitizedPhone.length === 11 || sanitizedPhone.length === 13;
  }

  defaultMessage(): string {
    return 'O telefone deve ter 11 dígitos (com DDD) ou 13 dígitos (com DDI)';
  }
}