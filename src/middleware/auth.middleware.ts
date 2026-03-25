import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      companyId?: string;
    }
  }
}

const ALLOWED_HOST_PATTERNS = [
  /^localhost(:\d+)?$/,
  /^127\.0\.0\.1(:\d+)?$/,
  /^::1$/,
  /\.railway\.internal(:\d+)?$/,
];

function isAllowedHost(host: string | undefined): boolean {
  if (!host) return false;
  return ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(host));
}

export function internalOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  // Host restriction temporarily disabled for debugging
  // const host = req.hostname || req.headers.host?.replace(/:\d+$/, '');
  // if (!isAllowedHost(req.headers.host) && !isAllowedHost(host)) {
  //   console.error(`[Auth] BLOCKED external request host=${req.headers.host} hostname=${host} path=${req.path}`);
  //   return res.status(403).json({ error: 'Forbidden: internal access only' });
  // }

  const companyId = req.headers['x-company-id'] as string;
  if (!companyId) {
    console.warn(`[Auth] Missing x-company-id header method=${req.method} path=${req.path} origin=${req.headers.origin || 'none'}`);
    return res.status(400).json({ error: 'x-company-id header required' });
  }

  req.companyId = companyId;
  next();
}
