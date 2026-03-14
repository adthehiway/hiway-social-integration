import { validate } from '../../../src/middleware/validation.middleware';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

describe('validate middleware', () => {
  const schema = z.object({ name: z.string().min(1) });
  const middleware = validate(schema);
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
  });

  it('passes valid body to next', () => {
    mockReq.body = { name: 'test' };
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.body).toEqual({ name: 'test' });
  });

  it('returns 400 for invalid body', () => {
    mockReq.body = {};
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
