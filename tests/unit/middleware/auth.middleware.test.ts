jest.mock('../../../src/config/env', () => ({
  env: { HIWAY_API_KEY: 'test-key' },
}));

import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';

describe('authMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
  });

  it('returns 401 without api key', () => {
    authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 with wrong api key', () => {
    mockReq.headers = { 'x-api-key': 'wrong' };
    authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 without company id', () => {
    mockReq.headers = { 'x-api-key': 'test-key' };
    authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('passes with valid key and company id', () => {
    mockReq.headers = { 'x-api-key': 'test-key', 'x-company-id': 'comp1' };
    authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.companyId).toBe('comp1');
  });
});
