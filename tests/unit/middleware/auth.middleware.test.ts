import { internalOnlyMiddleware } from '../../../src/middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';

function buildReq(headers: Record<string, string>, hostname: string): Partial<Request> {
  const req: Partial<Request> = { headers };
  Object.defineProperty(req, 'hostname', { get: () => hostname });
  return req;
}

describe('internalOnlyMiddleware', () => {
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
  });

  it('returns 403 for external host', () => {
    const req = buildReq({ host: 'evil.com', 'x-company-id': 'comp1' }, 'evil.com');
    internalOnlyMiddleware(req as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });

  it('allows localhost', () => {
    const req = buildReq({ host: 'localhost:3000', 'x-company-id': 'comp1' }, 'localhost');
    internalOnlyMiddleware(req as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('allows 127.0.0.1', () => {
    const req = buildReq({ host: '127.0.0.1:3000', 'x-company-id': 'comp1' }, '127.0.0.1');
    internalOnlyMiddleware(req as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('allows railway internal hosts', () => {
    const req = buildReq({ host: 'myapp.railway.internal:3000', 'x-company-id': 'comp1' }, 'myapp.railway.internal');
    internalOnlyMiddleware(req as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('returns 400 without company id', () => {
    const req = buildReq({ host: 'localhost:3000' }, 'localhost');
    internalOnlyMiddleware(req as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('passes companyId to request', () => {
    const req = buildReq({ host: 'localhost:3000', 'x-company-id': 'comp1' }, 'localhost');
    internalOnlyMiddleware(req as Request, mockRes as Response, mockNext);
    expect(req.companyId).toBe('comp1');
  });
});
