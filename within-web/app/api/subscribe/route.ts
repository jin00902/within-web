import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { createDownloadToken } from '@/lib/token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 아주 가벼운 남용 방지 (인스턴스 단위, 최선노력)
const hits = new Map<string, number[]>();
const LIMIT = 8;
const WINDOW = 10 * 60 * 1000;

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > LIMIT;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: '요청을 읽을 수 없습니다.' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 60);
  const source = ['ebook', 'newsletter'].includes(String(body.source)) ? String(body.source) : 'unknown';
  const consentPrivacy = body.consentPrivacy === true;
  const consentMarketing = body.consentMarketing === true;

  if (!EMAIL_RE.test(email) || email.length > 160) {
    return NextResponse.json({ ok: false, error: '메일 주소를 다시 확인해 주세요.' }, { status: 400 });
  }
  if (!consentPrivacy) {
    return NextResponse.json({ ok: false, error: '개인정보 수집·이용 동의가 필요합니다.' }, { status: 400 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: '요청이 많습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 429 },
    );
  }

  const token = createDownloadToken(email);
  const supabase = getSupabase();

  // Supabase가 아직 연결되지 않아도 화면 흐름은 끊기지 않게 한다.
  if (!supabase) {
    console.warn('[within] Supabase 미설정 — 구독자 저장을 건너뜁니다:', email);
    return NextResponse.json({ ok: true, stored: false, token });
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from('subscribers').upsert(
    {
      email,
      name: name || null,
      source,
      consent_privacy: consentPrivacy,
      consent_marketing: consentMarketing,
      user_agent: (req.headers.get('user-agent') || '').slice(0, 300) || null,
      updated_at: now,
    },
    { onConflict: 'email' },
  );

  if (error) {
    console.error('[within] subscribe 저장 실패:', error.message);
    // 사용자 경험은 막지 않되, 저장 실패는 알린다.
    return NextResponse.json({ ok: true, stored: false, token });
  }

  return NextResponse.json({ ok: true, stored: true, token });
}
