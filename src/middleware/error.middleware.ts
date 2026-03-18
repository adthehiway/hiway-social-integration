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
    const url = err.config?.url || 'unknown';
    const method = err.config?.method?.toUpperCase() || '?';

    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      console.error(`[Ayrshare] ${method} ${url} → TIMEOUT`, logContext);
      return res.status(504).json({ error: 'Ayrshare API timeout — try again' });
    }

    if (!err.response) {
      console.error(`[Ayrshare] ${method} ${url} → NO RESPONSE (${err.code || err.message})`, logContext);
      return res.status(502).json({ error: `Ayrshare API unreachable: ${err.code || err.message}` });
    }

    const status = err.response.status;
    const respData = err.response.data;
    const ayrshareMsg = respData?.message || respData?.details || respData?.error || (typeof respData === 'string' ? respData : JSON.stringify(respData)) || 'Unknown';
    console.error(`[Ayrshare] ${method} ${url} → ${status}: ${ayrshareMsg}`, logContext);
    console.error(`[Ayrshare] Full response:`, JSON.stringify(respData).substring(0, 500));
    return res.status(status >= 500 ? 502 : status).json({
      error: `Ayrshare API error: ${ayrshareMsg}`,
    });
  }

  console.error(`[Error] ${err.name || 'Unknown'}: ${err.message}`, logContext);
  if (err.stack) console.error(err.stack.split('\n').slice(0, 5).join('\n'));
  return res.status(500).json({ error: err.message || 'Internal server error' });
}
