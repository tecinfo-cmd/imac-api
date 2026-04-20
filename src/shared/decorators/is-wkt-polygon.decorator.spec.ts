import { validate } from 'class-validator';
import { IsWktPolygon } from '../decorators/is-wkt-polygon.decorator';
import { IsWktValidator } from '../validators/wkt-polygon.validator';

class TestDto {
  @IsWktPolygon()
  geometry: string;
}

describe('IsWktConstraint', () => {
  const validator = new IsWktValidator();

  it('should return true for a valid POLYGON string', () => {
    const wkt = 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))';
    expect(validator.validate(wkt, {} as any)).toBe(true);
  });

  it('should return true for a valid MULTIPOLYGON string', () => {
    const wkt = 'MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))';
    expect(validator.validate(wkt, {} as any)).toBe(true);
  });

  it('should return true for a GEOMETRYCOLLECTION string', () => {
    const wkt = 'GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40))';
    expect(validator.validate(wkt, {} as any)).toBe(true);
  });

  it('should return false for a POINT string', () => {
    const wkt = 'POINT (30 10)';
    expect(validator.validate(wkt, {} as any)).toBe(false);
  });

  it('should return false for a LINESTRING string', () => {
    const wkt = 'LINESTRING (30 10, 10 30, 40 40)';
    expect(validator.validate(wkt, {} as any)).toBe(false);
  });

  it('should return false for a string with an invalid format', () => {
    const wkt = 'POLYGON (30 10, 40 40, 20 40)'; // Missing outer parentheses
    expect(validator.validate(wkt, {} as any)).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(validator.validate('', {} as any)).toBe(false);
  });

  it('should return false for a non-string value like a number', () => {
    expect(validator.validate(12345, {} as any)).toBe(false);
  });

  it('should return false for null', () => {
    expect(validator.validate(null, {} as any)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(validator.validate(undefined, {} as any)).toBe(false);
  });
});

describe('IsWktPolygon Decorator', () => {
  it('should validate a valid POLYGON string', async () => {
    const dto = new TestDto();
    dto.geometry = 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid MULTIPOLYGON string', async () => {
    const dto = new TestDto();
    dto.geometry = 'MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate a POINT string', async () => {
    const dto = new TestDto();
    dto.geometry = 'POINT (30 10)';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.IsWktValidator).toBeDefined();
    expect(errors[0].constraints?.IsWktValidator).toEqual("A propriedade 'geometry' deve ser uma string de Well-Known Text (WKT) válida do tipo POLYGON ou MULTIPOLYGON.");
  });
});
