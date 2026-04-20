import { CNPJValidator } from './cnpj';

describe.only('CNPJValidator', () => {
  let cnpjValidator: CNPJValidator;

  beforeEach(async () => {
    cnpjValidator = new CNPJValidator();
  });

  it('should return true on valid CNPJ with special characters', () => {
    expect(cnpjValidator.validate("69.948.592/0001-74")).toBeTruthy();
  });

  it('should return true on valid CNPJ without special characters', () => {
    expect(cnpjValidator.validate("69948592000174")).toBeTruthy();
  });

  it('should return false on invalid CNPJ', () => {
    expect(cnpjValidator.validate("invalid_cnpj")).toBeFalsy();
  })
});
