import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.EBOOK_TOKEN_SECRET || 'within-dev-secret-change-me';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일

const b64url = (buf: Buffer) => buf.toString('base64url');

function sign(payload: string) {
  return b64url(createHmac('sha256', SECRET).update(payload).digest());
}

/** 이메일에 연결된 7일짜리 다운로드 토큰 */
export function createDownloadToken(email: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${b64url(Buffer.from(email))}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyDownloadToken(token: string): { email: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [emailPart, expPart, mac] = parts;
  const payload = `${emailPart}.${expPart}`;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  const exp = Number(expPart);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;

  try {
    return { email: Buffer.from(emailPart, 'base64url').toString('utf8') };
  } catch {
    return null;
  }
}
