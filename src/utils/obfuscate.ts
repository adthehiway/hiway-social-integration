import crypto from 'crypto';

/**
 * Obfuscates an identifier for use as an Ayrshare profile title.
 * Keeps enough visible to be recognisable, masks the rest, and appends
 * a short hash suffix so profiles remain unique.
 *
 * Examples:
 *   "aml@gmail.com"       → "aml*****@gm**l.c** -a23c0cc5"
 *   "company-abc-123"     → "com***********123-f7b2a1e0"
 */
export function obfuscateIdentifier(value: string): string {
  const hash = crypto.createHash('sha256').update(value).digest('hex').slice(0, 8);

  return `${obfuscateEmail(value)}-${hash}`;
}

function obfuscateEmail(value: string): string {
  if (!value.includes('@')) {
    // Treat as local-only: mask everything after first 3 chars
    return maskPart(value, 3);
  }

  const [local, domain] = value.split('@');

  const maskedLocal = maskPart(local, 3);

  const domainParts = domain.split('.');
  const maskedDomain = domainParts
    .map((part) => maskPart(part, 2))
    .join('.');

  return `${maskedLocal}@${maskedDomain}`;
}

function maskPart(str: string, showStart: number, showEnd = 0): string {
  if (str.length <= showStart + showEnd) {
    return '*'.repeat(str.length);
  }
  const start = str.slice(0, showStart);
  const end = showEnd > 0 ? str.slice(-showEnd) : '';
  const masked = '*'.repeat(str.length - showStart - showEnd);
  return `${start}${masked}${end}`;
}
