import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    const mockGetRequest = jest.fn().mockReturnValue({ user });
    const mockGetHandler = jest.fn();
    const mockGetClass = jest.fn();

    return {
      switchToHttp: () => ({
        getRequest: mockGetRequest,
      }),
      getHandler: mockGetHandler,
      getClass: mockGetClass,
    } as unknown as ExecutionContext;
  };

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockExecutionContext({ roles: ['user'] });
    const canActivate = guard.canActivate(context);
    expect(canActivate).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('should allow access if the user has a required role', () => {
    const requiredRoles = ['admin'];
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    const context = createMockExecutionContext({ roles: ['admin', 'user'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if the user does not have a required role', () => {
    const requiredRoles = ['admin'];
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    const context = createMockExecutionContext({ roles: ['user', 'guest'] });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access if the user has no roles', () => {
    const requiredRoles = ['admin'];
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    const context = createMockExecutionContext({ roles: [] });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access if the user object does not have a roles property', () => {
    const requiredRoles = ['admin'];
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    const context = createMockExecutionContext({}); // User without roles property
    expect(guard.canActivate(context)).toBe(false);
  });
});
