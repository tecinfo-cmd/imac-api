import { NextFunction, Request, Response } from 'express';
import { RequestsLogMiddleware } from './requests-log-middleware';
import { Logger } from '@nestjs/common';

describe('RequestsLogMiddleware', () => {
  let requestsLogMiddleware: RequestsLogMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    requestsLogMiddleware = new RequestsLogMiddleware();
    mockRequest = {
      method: 'GET',
      baseUrl: '/test',
      headers: {
        'user-agent': 'jest-test',
      },
      read: jest.fn(), // Mock the read method
    };
    mockResponse = {
      statusCode: 200,
      end: jest.fn(), // Mock the end method,
      write: jest.fn(), // Mock the write method,
    };
    mockNext = jest.fn();

    // Mock the Logger methods
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log the request method and URL', () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log');

    requestsLogMiddleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(logSpy).toHaveBeenCalledWith({
      type: 'Request',
      method: 'GET',
      url: '/test',
      headers: { 'user-agent': 'jest-test' },
      query: '',
      data: '',
      msg: 'Request GET /test',
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log the user-agent header', () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log');

    requestsLogMiddleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(logSpy).toHaveBeenCalledWith({
      type: 'Request',
      method: 'GET',
      url: '/test',
      headers: { 'user-agent': 'jest-test' },
      query: '',
      data: '',
      msg: 'Request GET /test',
    });
    expect(mockNext).toHaveBeenCalled();
  });
});