import { validate } from 'class-validator';
import { CreateElegibilidadeRequestDto } from './create-elegibilidade-request.dto';

describe('CreateElegibilidadeDto', () => {
  let dto: CreateElegibilidadeRequestDto;

  beforeEach(() => {
    dto = new CreateElegibilidadeRequestDto();
  });

  it('should be valid with correct data', async () => {
    dto.carFederal = 'MT-1302405-E6D3395B6D274F42AE22DD56987CDD52';
    dto.telefone = '(55) 11987654321';
    dto.email = 'email@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if car is empty', async () => {
    dto.carFederal = '';
    dto.telefone = '(55) 11987654321';
    dto.email = 'email@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail if car has incorrect length', async () => {
    dto.carFederal = '12345';
    dto.telefone = '(55) 11987654321';
    dto.email = 'email@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);

    const carError = errors.find(error => error.property === 'carFederal');
    expect(carError).toBeDefined();
    expect(carError?.constraints).toHaveProperty('isLength');
    expect(carError?.constraints?.isLength).toBe('O CAR Federal deve conter entre 43 caracteres');
  });

  it('should fail if telefone is empty', async () => {
    dto.carFederal = 'MT-1302405-E6D3395B6D274F42AE22DD56987CDD52';
    dto.telefone = '';
    dto.email = 'email@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);

    const telefoneError = errors.find(error => error.property === 'telefone');
    expect(telefoneError).toBeDefined();
    expect(telefoneError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail if telefone is invalid', async () => {
    dto.carFederal = 'MT-1302405-E6D3395B6D274F42AE22DD56987CDD52';
    dto.telefone = '119876';
    dto.email = 'email@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);

    const telefoneError = errors.find(error => error.property === 'telefone');
    expect(telefoneError).toBeDefined();
    expect(telefoneError?.constraints).toHaveProperty('isValidPhone');
    expect(telefoneError?.constraints?.isValidPhone).toBe('O telefone deve ter 11 dígitos (com DDD) ou 13 dígitos (com DDI)');
  });

  it('should fail if email is empty', async () => {
    dto.carFederal = 'MT1302405E6D3395B';
    dto.telefone = '(55) 11987654321';
    dto.email = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    const emailError = errors.find(error => error.property === 'email');
    expect(emailError).toBeDefined();
    expect(emailError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail if email is invalid', async () => {
    dto.carFederal = 'MT-1302405-E6D3395B6D274F42AE22DD56987CDD52';
    dto.telefone = '(55) 11987654321';
    dto.email = 'invalid-email';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);

    const emailError = errors.find(error => error.property === 'email');
    expect(emailError).toBeDefined();
    expect(emailError?.constraints).toHaveProperty('isEmail');
    expect(emailError?.constraints?.isEmail).toBe('O email deve ser válido');
  });

  it('should be valid with optional telefone', async () => {
    dto.carFederal = 'MT-1302405-E6D3395B6D274F42AE22DD56987CDD52';
    dto.telefone = '(11) 987654321';
    dto.email = 'email@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if telefone has incorrect format but required validation rules', async () => {
    dto.carFederal = 'MT1302405E6D3395B';
    dto.telefone = '987654321';
    dto.email = 'email@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    const telefoneError = errors.find(error => error.property === 'telefone');
    expect(telefoneError).toBeDefined();
    expect(telefoneError?.constraints).toHaveProperty('isValidPhone');
    expect(telefoneError?.constraints?.isValidPhone).toBe('O telefone deve ter 11 dígitos (com DDD) ou 13 dígitos (com DDI)');
  });
});