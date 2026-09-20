'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AXES, getBrowserSupabase } from '@/lib/supabaseBrowser';

type Entry = {
  id: string;
  entry_date: string;
  headline: string;
  ax_intensity: number | null;
  created_at: string;
};

type Draft = Record<string, string>;

const EMPTY: Draft = {
  headline: '',
  ax_location: '',
  ax_temp: '',
  ax_pressure: '',
  ax_movement: '',
  ax_texture: '',
  ax_time: '',
  ax_space: '',
  note: '',
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function lastSevenDays() {
  const out: { iso: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ iso, label: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()] });
  }
  return out;
}

export default function RecordPage() {
  const supabase = getBrowserSupabase();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [authMsg, setAuthMsg] = useState('');

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [intensity, setIntensity] = useState(5);
  const [intensityTouched, setIntensityTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);

  // 로그인 상태를 따라갑니다. 메일 링크로 돌아오면 여기서 세션이 잡힙니다.
  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const loadEntries = useCallback(async () => {
    if (!supabase || !session) return;
    const { data } = await supabase
      .from('entries')
      .select('id, entry_date, headline, ax_intensity, created_at')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);
    setEntries((data as Entry[]) || []);
  }, [supabase, session]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const addr = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      setAuthMsg('메일 주소를 다시 확인해 주세요.');
      return;
    }
    setAuthMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { emailRedirectTo: `${window.location.origin}/record` },
    });
    if (error) {
      setAuthMsg('지금은 링크를 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setSent(true);
  };

  const set = (key: string, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !session) return;
    const headline = draft.headline.trim();
    if (!headline) {
      setFormMsg('오늘 가장 또렷했던 자리를 한 줄만 적어주세요.');
      return;
    }
    setSaving(true);
    setFormMsg('');

    const row: Record<string, string | number | null> = {
      user_id: session.user.id,
      entry_date: todayISO(),
      headline,
      ax_intensity: intensityTouched ? intensity : null,
      note: draft.note.trim() || null,
    };
    AXES.forEach((a) => {
      row[a.key] = draft[a.key].trim() || null;
    });

    const { error } = await supabase.from('entries').insert(row);
    setSaving(false);
    if (error) {
      setFormMsg('저장하지 못했습니다. 잠시 후 다시 눌러주세요.');
      return;
    }
    setDraft(EMPTY);
    setIntensity(5);
    setIntensityTouched(false);
    setSaved(true);
    void loadEntries();
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setEntries([]);
    setSent(false);
  };

  const week = lastSevenDays();
  const days = new Set(entries.map((x) => x.entry_date));
  const kept = week.filter((d) => days.has(d.iso)).length;

  return (
    <main className="wrap" style={{ paddingBlock: '72px 96px', maxWidth: 560 }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.rec-axes{display:grid;gap:14px;margin-top:8px}
.rec-axis{display:grid;grid-template-columns:96px 1fr;gap:14px;align-items:center}
.rec-axis label{margin:0;font-size:12.5px;letter-spacing:.14em;color:var(--light)}
.rec-axis input{width:100%;padding:11px 13px;font-family:inherit;font-size:15px;color:var(--ink);
background:var(--ivory-card);border:1px solid var(--rule-strong);border-radius:2px;outline:none}
.rec-axis input:focus{border-color:var(--light)}
.rec-axis input::placeholder{color:var(--faint)}
.rec-week{display:flex;gap:10px;justify-content:center;margin:0 0 6px}
.rec-week div{text-align:center;font-size:11px;color:var(--light);letter-spacing:.1em}
.rec-week i{display:block;width:8px;height:8px;border-radius:50%;margin:0 auto 7px;
background:transparent;border:1px solid var(--rule-strong)}
.rec-week i.on{background:var(--ink);border-color:var(--ink)}
.rec-list{border-top:1px solid var(--rule);margin-top:14px}
.rec-list li{list-style:none;border-bottom:1px solid var(--rule);padding-block:14px;
display:flex;gap:14px;align-items:baseline;font-size:15px}
.rec-list time{flex:0 0 auto;font-size:12.5px;color:var(--light);font-variant-numeric:tabular-nums}
.rec-list span{color:var(--ink)}
@media (max-width:560px){.rec-axis{grid-template-columns:1fr;gap:6px}}
`,
        }}
      />

      <p className="eyebrow">daily record</p>
      <h1 style={{ fontSize: 27 }}>감각사전</h1>

      {!ready && <p className="small" style={{ marginTop: 28 }}>불러오는 중…</p>}

      {ready && !supabase && (
        <p className="small" style={{ marginTop: 28 }}>
          기록 기능을 준비하고 있습니다. 조금만 기다려 주세요.
        </p>
      )}

      {ready && supabase && !session && (
        <div style={{ marginTop: 28 }}>
          <p className="lead">
            매일의 감각을 한 줄씩 남기고, 4주 뒤 나만의 감각사전으로 묶습니다.
          </p>
          {sent ? (
            <p className="small">
              메일함을 확인해 주세요. 보내드린 링크를 누르면 이 화면으로 돌아와 바로 기록할 수 있습니다.
              비밀번호는 없습니다.
            </p>
          ) : (
            <form onSubmit={sendLink} style={{ marginTop: 26 }}>
              <div className="field">
                <label htmlFor="rec-email">메일 주소</label>
                <input
                  id="rec-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-solid">
                로그인 링크 받기
              </button>
              {authMsg && <p className="msg err">{authMsg}</p>}
              <p className="tiny" style={{ marginTop: 18 }}>
                비밀번호 없이, 메일로 온 링크로 들어옵니다.
              </p>
            </form>
          )}
        </div>
      )}

      {ready && supabase && session && (
        <div style={{ marginTop: 30 }}>
          <div className="rec-week" aria-label="지난 7일 기록">
            {week.map((d) => (
              <div key={d.iso}>
                <i className={days.has(d.iso) ? 'on' : ''} />
                {d.label}
              </div>
            ))}
          </div>
          <p className="tiny center" style={{ marginBottom: 34 }}>
            지난 7일 중 {kept}일 기록
          </p>

          {saved ? (
            <div style={{ textAlign: 'center', paddingBlock: 20 }}>
              <h3 style={{ marginBottom: 12 }}>오늘 기록이 남았습니다</h3>
              <p className="small" style={{ marginBottom: 24 }}>
                내일 이 자리에서 또 만나요. 오늘 쓴 단어가 내일의 사전이 됩니다.
              </p>
              <button type="button" className="btn btn-quiet" onClick={() => setSaved(false)}>
                하나 더 적기
              </button>
            </div>
          ) : (
            <form onSubmit={save}>
              <div className="field">
                <label htmlFor="rec-headline">오늘 몸에서 가장 또렷했던 자리</label>
                <input
                  id="rec-headline"
                  type="text"
                  placeholder="예: 오후 내내 어깨 위가 무거웠다"
                  value={draft.headline}
                  onChange={(ev) => set('headline', ev.target.value)}
                />
              </div>

              <p className="tiny" style={{ margin: '26px 0 14px' }}>
                여덟 개 축으로 풀어보기 — 비워두셔도 됩니다
              </p>

              <div className="rec-axes">
                <div className="rec-axis">
                  <label htmlFor="rec-intensity">강도</label>
                  <div className="slider-row" style={{ marginTop: 0 }}>
                    <input
                      id="rec-intensity"
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={intensity}
                      onChange={(ev) => {
                        setIntensity(Number(ev.target.value));
                        setIntensityTouched(true);
                      }}
                    />
                    <output className="slider-val">
                      {intensityTouched ? `${intensity} / 10` : '– / 10'}
                    </output>
                  </div>
                </div>

                {AXES.map((a) => (
                  <div className="rec-axis" key={a.key}>
                    <label htmlFor={`rec-${a.key}`}>{a.label}</label>
                    <input
                      id={`rec-${a.key}`}
                      type="text"
                      placeholder={a.hint}
                      value={draft[a.key]}
                      onChange={(ev) => set(a.key, ev.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="field" style={{ marginTop: 26 }}>
                <label htmlFor="rec-note">한 줄 메모</label>
                <input
                  id="rec-note"
                  type="text"
                  placeholder="남기고 싶은 말이 있다면"
                  value={draft.note}
                  onChange={(ev) => set('note', ev.target.value)}
                />
              </div>

              <div style={{ marginTop: 28 }}>
                <button type="submit" className="btn btn-solid" disabled={saving}>
                  {saving ? '저장 중…' : '저장'}
                </button>
              </div>
              {formMsg && <p className="msg err">{formMsg}</p>}
            </form>
          )}

          {entries.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <p className="eyebrow">지난 기록</p>
              <ul className="rec-list" style={{ padding: 0, margin: 0 }}>
                {entries.slice(0, 8).map((x) => (
                  <li key={x.id}>
                    <time dateTime={x.entry_date}>{x.entry_date.slice(5).replace('-', '.')}</time>
                    <span>{x.headline}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="tiny" style={{ marginTop: 44 }}>
            {session.user.email}
            {'  ·  '}
            <button
              type="button"
              onClick={signOut}
              style={{
                background: 'none',
                border: 0,
                padding: 0,
                font: 'inherit',
                color: 'var(--light)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              로그아웃
            </button>
          </p>
          <p className="tiny">기록은 본인만 볼 수 있습니다.</p>
        </div>
      )}
    </main>
  );
}
