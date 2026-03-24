import { errorHandler, AppError } from '../../../src/middleware/error.middleware';
import { Request, Response, NextFunction } from 'express';

describe('errorHandler', () => {
  let mockRes: Partial<Response>;
  const mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('handles AppError with correct status', () => {
    const err = new AppError(404, 'Not found');
    errorHandler(err, { headers: {}, method: 'GET', path: '/' } as unknown as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  it('handles generic error as 500', () => {
    const err = new Error('oops');
    errorHandler(err, { headers: {}, method: 'GET', path: '/' } as unknown as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'oops' });
  });
});
