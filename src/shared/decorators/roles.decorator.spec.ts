import { Roles } from './roles.decorator';
import { Reflector } from '@nestjs/core';

describe('Roles Decorator', () => {
  it('should be defined', () => {
    expect(Roles).toBeDefined();
  });

  it('should set metadata for a class with the given roles', () => {
    const reflector = new Reflector();
    const roles = ['admin', 'user'];

    @Roles(...roles)
    class TestClass {}

    const attachedRoles = reflector.get<string[]>('roles', TestClass);
    expect(attachedRoles).toEqual(roles);
  });

  it('should set metadata for a method with the given roles', () => {
    const reflector = new Reflector();
    const roles = ['moderator'];

    class TestController {
      @Roles(...roles)
      public findOne() {}
    }

    const attachedRoles = reflector.get<string[]>('roles', new TestController().findOne);
    expect(attachedRoles).toEqual(roles);
  });

  it('should set metadata with an empty array if no roles are provided', () => {
    const reflector = new Reflector();

    @Roles()
    class TestClassWithNoRoles {}

    const attachedRoles = reflector.get<string[]>('roles', TestClassWithNoRoles);
    expect(attachedRoles).toEqual([]);
  });
});