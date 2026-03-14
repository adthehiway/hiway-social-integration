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

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Handle Axios errors from Ayrshare calls
  if (err.isAxiosError) {
    const status = err.response?.status || 502;
    const message = err.response?.data?.message || err.message;
    console.error('Ayrshare API error:', status, message);
    return res.status(status >= 500 ? 502 : status).json({
      error: `Ayrshare API error: ${message}`,
    });
  }

  console.error('Unhandled error:', err.message || err);
  return res.status(500).json({ error: 'Internal server error' });
}
