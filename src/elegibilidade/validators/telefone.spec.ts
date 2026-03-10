import { TelefoneValidator } from './telefone';

describe('PhoneValidator', () => {
  let phoneValidator: TelefoneValidator;

  beforeEach(() => {
    phoneValidator = new TelefoneValidator();
  });

  it('should return true for valid phone with DDD (11 digits)', () => {
    expect(phoneValidator.validate('(11) 98765-4321')).toBeTruthy();
  });

  it('should return true for valid phone with DDI (13 digits)', () => {
    expect(phoneValidator.validate('+55 (11) 98765-4321')).toBeTruthy();
  });

  it('should return true for valid phone without special characters', () => {
    expect(phoneValidator.validate('5511987654321')).toBeTruthy();
  });

  it('should return false for phone without enough digits', () => {
    expect(phoneValidator.validate('(11) 8765')).toBeFalsy();
  });

  it('should return false for phone with more than 13 digits', () => {
    expect(phoneValidator.validate('123456789012345')).toBeFalsy();
  });

  it('should return false for non-numeric characters', () => {
    expect(phoneValidator.validate('invalid-phone')).toBeFalsy();
  });

  it('should return false for empty phone', () => {
    expect(phoneValidator.validate('')).toBeFalsy();
  });
});