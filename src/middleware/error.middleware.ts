import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const logContext = {
    method: req.method,
    path: req.path,
    companyId: req.headers['x-company-id'] || 'none',
  };

  if (err instanceof AppError) {
    console.error(`[AppError] ${err.statusCode} ${err.message}`, logContext);
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.isAxiosError) {
    const status = err.response?.status || 502;
    const ayrshareMsg = err.response?.data?.message || err.response?.data?.details || 'Unknown';
    const url = err.config?.url || 'unknown';
    const method = err.config?.method?.toUpperCase() || '?';
    console.error(`[Ayrshare] ${method} ${url} → ${status}: ${ayrshareMsg}`, logContext);
    return res.status(status >= 500 ? 502 : status).json({
      error: `Ayrshare API error: ${ayrshareMsg}`,
    });
  }

  console.error(`[Error] ${err.name || 'Unknown'}: ${err.message}`, logContext);
  if (err.stack) console.error(err.stack.split('\n').slice(0, 5).join('\n'));
  return res.status(500).json({ error: err.message || 'Internal server error' });
}
