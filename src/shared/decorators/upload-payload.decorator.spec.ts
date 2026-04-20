import { ExecutionContext } from '@nestjs/common';

class MockDto {}

let factory: (data: unknown, ctx: ExecutionContext) => any;

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: (fn: (data: unknown, ctx: ExecutionContext) => any) => {
    factory = fn;
    return () => {};
  },
}));

import { UploadPayload } from './upload-payload.decorator';

describe('UploadPayload Decorator', () => {
  it('should be defined', () => {
    expect(UploadPayload).toBeDefined();
  });

  it('should extract files and body from the request and return them with the DTO class', () => {
    const mockBody = { name: 'test-body' };
    const mockFiles = [{ originalname: 'test.pdf', buffer: Buffer.from('test') }];

    const mockCtx = {
      switchToHttp: () => ({
        getRequest: () => ({
          body: mockBody,
          files: mockFiles,
        }),
      }),
    } as unknown as ExecutionContext;

    const result = factory(MockDto, mockCtx);

    expect(result).toEqual({
      arquivos: mockFiles,
      body: mockBody,
      dtoClass: MockDto,
    });
  });

  it('should handle cases where files are not present on the request', () => {
    const mockBody = { name: 'test-body-no-files' };
    const mockCtx = {
      switchToHttp: () => ({ getRequest: () => ({ body: mockBody }) }),
    } as unknown as ExecutionContext;

    const result = factory(MockDto, mockCtx);

    expect(result).toEqual({ arquivos: undefined, body: mockBody, dtoClass: MockDto });
  });

  it('should handle cases where body is not present on the request', () => {
    const mockFiles = [{ originalname: 'test.pdf', buffer: Buffer.from('test') }];
    const mockCtx = {
      switchToHttp: () => ({ getRequest: () => ({ files: mockFiles }) }),
    } as unknown as ExecutionContext;

    const result = factory(MockDto, mockCtx);

    expect(result).toEqual({ arquivos: mockFiles, body: undefined, dtoClass: MockDto });
  });
});