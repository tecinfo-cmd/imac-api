import { CPFValidator } from './cpf';

describe('CPFValidator', () => {
  let cpfValidator: CPFValidator;

  beforeEach(async () => {
    cpfValidator = new CPFValidator();
  });

  it('should return true on valid CPF with special characters', () => {
    expect(cpfValidator.validate("851.242.740-00")).toBeTruthy();
  });

  it('should return true on valid CPF without special characters', () => {
    expect(cpfValidator.validate("85124274000")).toBeTruthy();
  });

  it('should return false on invalid CPF', () => {
    expect(cpfValidator.validate("invalid_cpf")).toBeFalsy();
  })
});
