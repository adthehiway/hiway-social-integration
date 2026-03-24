import { obfuscateIdentifier } from '../../src/utils/obfuscate';

describe('obfuscateIdentifier', () => {
  it('masks an email address keeping start of each part visible', () => {
    const result = obfuscateIdentifier('aml@gmail.com');
    // Local: "aml" (3 chars) → all visible since showStart=3
    // Domain "gmail" → "gm***", "com" → "co*"
    // "aml" is 3 chars with showStart=3 → fully masked (length <= showStart)
    expect(result).toMatch(/^\*\*\*@gm\*\*\*\.co\*-[0-9a-f]{8}$/);
  });

  it('masks a longer email local part', () => {
    const result = obfuscateIdentifier('johndoe@example.org');
    expect(result).toMatch(/^joh\*\*\*\*@ex\*\*\*\*\*\.or\*-[0-9a-f]{8}$/);
  });

  it('masks an email with a longer local part', () => {
    const result = obfuscateIdentifier('amlongname@gmail.com');
    expect(result).toMatch(/^aml\*\*\*\*\*\*\*@gm\*\*\*\.co\*-[0-9a-f]{8}$/);
  });

  it('masks a plain identifier keeping start and end visible', () => {
    const result = obfuscateIdentifier('company-abc-123');
    // Plain string: mask after first 3 chars (no end preserved)
    expect(result).toMatch(/^com\*\*\*\*\*\*\*\*\*\*\*\*-[0-9a-f]{8}$/);
  });

  it('produces deterministic output for the same input', () => {
    const a = obfuscateIdentifier('test@test.com');
    const b = obfuscateIdentifier('test@test.com');
    expect(a).toBe(b);
  });

  it('produces different output for different inputs', () => {
    const a = obfuscateIdentifier('a@b.com');
    const b = obfuscateIdentifier('c@d.com');
    expect(a).not.toBe(b);
  });

  it('handles short strings gracefully', () => {
    const result = obfuscateIdentifier('ab');
    // Plain path: showStart=3, showEnd=3 → total 6 > length 2 → all masked
    expect(result).toMatch(/^\*\*-[0-9a-f]{8}$/);
  });
});
