import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getSupabase } from '@/lib/supabase';
import { verifyDownloadToken } from '@/lib/token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FILENAME = '몸은 이미 말하고 있다 - WITHIN 감각어휘 가이드.pdf';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('t') || '';
  const verified = verifyDownloadToken(token);

  if (!verified) {
    return new NextResponse(
      '<!doctype html><meta charset="utf-8"><title>링크가 만료되었습니다</title>' +
        '<body style="font-family:Georgia,serif;background:#f6f2ea;color:#2b2620;' +
        'display:grid;place-items:center;height:100vh;margin:0;text-align:center;line-height:2">' +
        '<div><p style="letter-spacing:.24em;font-size:14px">W I T H I N</p>' +
        '<p>다운로드 링크가 만료되었거나 올바르지 않습니다.</p>' +
        '<p><a href="/#ebook" style="color:#2b2620">다시 신청하기 →</a></p></div>',
      { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  let file: Buffer;
  try {
    file = await readFile(path.join(process.cwd(), 'assets', 'ebook.pdf'));
  } catch {
    return new NextResponse(
      '<!doctype html><meta charset="utf-8"><title>가이드 준비 중</title>' +
        '<body style="font-family:Georgia,serif;background:#f6f2ea;color:#2b2620;' +
        'display:grid;place-items:center;height:100vh;margin:0;text-align:center;line-height:2">' +
        '<div><p style="letter-spacing:.24em;font-size:14px">W I T H I N</p>' +
        '<p>신청이 정상적으로 접수되었습니다.<br>가이드 파일 등록이 마무리되는 대로<br>' +
        '남겨주신 메일로 바로 보내드립니다.</p>' +
        '<p><a href="/" style="color:#2b2620">처음으로 →</a></p></div>',
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // 다운로드 기록 (실패해도 다운로드는 진행)
  const supabase = getSupabase();
  if (supabase) {
    void supabase
      .from('subscribers')
      .update({ ebook_downloaded_at: new Date().toISOString() })
      .eq('email', verified.email)
      .then(({ error }) => {
        if (error) console.error('[within] 다운로드 기록 실패:', error.message);
      });
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="within-guide.pdf"; filename*=UTF-8''${encodeURIComponent(FILENAME)}`,
      'Content-Length': String(file.length),
      'Cache-Control': 'private, no-store',
    },
  });
}
