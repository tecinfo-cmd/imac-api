import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isValidCARFederal', async: false })
export class CarFederalValidator implements ValidatorConstraintInterface {
  // Define a regex para o formato MT-1302405-E6D3395B6D274F42AE22DD56GHIJDD52
  private readonly carFederalRegex = /^[A-Z]{2}-\d{7}-[A-Z0-9]{32}$/;

  validate(car: string): boolean {
    // Sanitiza o CAR antes de validar
    const sanitizedCar = this.sanitizeCar(car);

    // Valida o formato usando regex
    return sanitizedCar.length === 43 && this.carFederalRegex.test(sanitizedCar);
  }

  sanitizeCar(car: string): string {
    // Remove todos os caracteres que não são letras ou números
    return car.replace(/[^A-Za-z0-9-]/g, '');
  }

  defaultMessage(): string {
    return 'O CAR federal informado não é válido. Certifique-se de usar o formato XX-XXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  }
}
