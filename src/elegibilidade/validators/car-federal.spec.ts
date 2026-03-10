import { CarFederalValidator } from './car-federal';

describe('CarFederalValidator', () => {
  let validator: CarFederalValidator;

  beforeEach(() => {
    validator = new CarFederalValidator();
  });

  describe('validate', () => {
    it('should validate a correct CAR format', () => {
      const validCar = 'MT-1302405-E6D3395B6D274F42AE22DD56GHIJDD52';

      // Sanitiza e valida
      const result = validator.validate(validCar);

      expect(result).toBe(true); // Espera que o CAR seja válido
    });

    it('should invalidate a CAR without the correct format', () => {
      const invalidCar1 = 'MT1302405-E6D3395B6D274F42AE22DD56GHIJDD5'; // CAR com comprimento errado
      const invalidCar2 = 'MT1302405E6D3395B6D274F42AE22DD56GHIJDD52'; // CAR sem hífen
      const invalidCar3 = 'MT1302405-!@#%$^&*GHIJDD52'; // CAR com caracteres inválidos
      const invalidCar4 = 'M12302405-E6D3395B6D274F42AE22DD56GHIJDD52'; // Prefixo errado

      // Testa vários formatos inválidos
      expect(validator.validate(invalidCar1)).toBe(false);
      expect(validator.validate(invalidCar2)).toBe(false);
      expect(validator.validate(invalidCar3)).toBe(false);
      expect(validator.validate(invalidCar4)).toBe(false);
    });
  });

  describe('sanitizeCar', () => {
    it('should sanitize the CAR by removing invalid characters', () => {
      const rawCar = 'MT1302405-E6D3395B6D274F42AE22DD56!@#GHIJDD52';
      const sanitizedCar = validator.sanitizeCar(rawCar);
      
      // A string sanitizada deve remover caracteres não alfanuméricos e o hífen
      expect(sanitizedCar).toBe('MT1302405-E6D3395B6D274F42AE22DD56GHIJDD52');
    });
  });

  describe('defaultMessage', () => {
    it('should return the correct default error message', () => {
      const message = validator.defaultMessage();
      expect(message).toBe('O CAR federal informado não é válido. Certifique-se de usar o formato XX-XXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    });
  });
});
