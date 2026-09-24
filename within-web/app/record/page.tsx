'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AXES, getBrowserSupabase } from '@/lib/supabaseBrowser';
import BodyMap, { labelFor, type BodyMark, type BodySide } from '../components/BodyMap';

type Entry = {
  id: string;
  entry_date: string;
  headline: string;
  ax_intensity: number | null;
  note: string | null;
  created_at: string;
};

type Mark = { entry_id: string; side: BodySide; region: string };
type Term = { entry_id: string; axis: string; surface: string };

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
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [authMsg, setAuthMsg] = useState('');

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [marks, setMarks] = useState<BodyMark[]>([]);
  const [recent, setRecent] = useState<Record<string, string[]>>({});
  const [marksBy, setMarksBy] = useState<Record<string, Mark[]>>({});
  const [termsBy, setTermsBy] = useState<Record<string, Term[]>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [intensity, setIntensity] = useState(5);
  const [intensityTouched, setIntensityTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);

  // 한 번 쓴 주소는 이 기기에 남겨둡니다. 매번 다시 치지 않게.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('within.email');
      if (saved) setEmail(saved);
    } catch {
      // 저장이 막힌 브라우저에서도 화면은 그대로 동작합니다.
    }
  }, []);

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
      .select('id, entry_date, headline, ax_intensity, note, created_at')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);
    setEntries((data as Entry[]) || []);

    const { data: mk } = await supabase
      .from('body_marks')
      .select('entry_id, side, region')
      .limit(400);
    const byMark: Record<string, Mark[]> = {};
    ((mk as Mark[]) || []).forEach((r) => {
      (byMark[r.entry_id] || (byMark[r.entry_id] = [])).push(r);
    });
    setMarksBy(byMark);
  }, [supabase, session]);

  // 내가 전에 쓴 말만 불러옵니다. 남의 말은 가져오지 않습니다.
  const loadTerms = useCallback(async () => {
    if (!supabase || !session) return;
    const { data } = await supabase
      .from('entry_terms')
      .select('entry_id, axis, surface, created_at')
      .order('created_at', { ascending: false })
      .limit(400);
    const rows = (data as Term[]) || [];

    const by: Record<string, string[]> = {};
    rows.forEach((r) => {
      const list = by[r.axis] || (by[r.axis] = []);
      if (list.length < 5 && !list.includes(r.surface)) list.push(r.surface);
    });
    setRecent(by);

    const byEntry: Record<string, Term[]> = {};
    rows.forEach((r) => {
      (byEntry[r.entry_id] || (byEntry[r.entry_id] = [])).push(r);
    });
    setTermsBy(byEntry);
  }, [supabase, session]);

  useEffect(() => {
    void loadEntries();
    void loadTerms();
  }, [loadEntries, loadTerms]);

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
      setAuthMsg('지금은 메일을 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    try {
      localStorage.setItem('within.email', addr);
    } catch {
      // 저장에 실패해도 로그인 자체는 진행됩니다.
    }
    setCode('');
    setSent(true);
  };

  // 메일에 적힌 여섯 자리를 이 화면에서 바로 확인합니다.
  // 앱 밖으로 나갔다 오지 않으므로 로그인이 이 앱에 남습니다.
  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const token = code.replace(/\D/g, '');
    if (token.length !== 6) {
      setAuthMsg('메일에 적힌 여섯 자리 숫자를 넣어주세요.');
      return;
    }
    setVerifying(true);
    setAuthMsg('');
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: 'email',
    });
    setVerifying(false);
    if (error) {
      setAuthMsg('숫자가 맞지 않거나 시간이 지났습니다. 다시 받아주세요.');
      return;
    }
    setCode('');
    setSent(false);
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

    const { data: created, error } = await supabase
      .from('entries')
      .insert(row)
      .select('id')
      .single();

    // 부위 표시는 기록이 만들어진 뒤에 붙습니다. 실패해도 기록 자체는 남습니다.
    if (!error && created && marks.length > 0) {
      await supabase.from('body_marks').insert(
        marks.map((m) => ({
          entry_id: created.id,
          user_id: session.user.id,
          side: m.side,
          region: m.region,
          x: m.x,
          y: m.y,
        })),
      );
    }

    // 축마다 적은 말을 사전에 올립니다. 쉼표·가운뎃점·빗금으로 나눈 것만 나눕니다.
    if (!error && created) {
      const terms: { axis: string; surface: string }[] = [];
      AXES.forEach((a) => {
        draft[a.key]
          .split(/[,·/]/)
          .map((x) => x.trim())
          .filter(Boolean)
          .forEach((surface) => terms.push({ axis: a.key, surface }));
      });
      if (terms.length > 0) {
        await supabase.from('entry_terms').insert(
          terms.map((t) => ({
            entry_id: created.id,
            user_id: session.user.id,
            axis: t.axis,
            surface: t.surface,
          })),
        );
      }
    }

    setSaving(false);
    if (error) {
      setFormMsg('저장하지 못했습니다. 잠시 후 다시 눌러주세요.');
      return;
    }
    setDraft(EMPTY);
    setMarks([]);
    setIntensity(5);
    setIntensityTouched(false);
    setSaved(true);
    void loadEntries();
    void loadTerms();
  };

  // 부위 표시와 어휘 연결을 먼저 지우고 기록을 지웁니다.
  // 데이터베이스의 cascade 설정에 의존하지 않도록 순서를 직접 둡니다.
  const remove = async (id: string) => {
    if (!supabase) return;
    setRemoving(true);
    await supabase.from('entry_terms').delete().eq('entry_id', id);
    await supabase.from('body_marks').delete().eq('entry_id', id);
    const { error } = await supabase.from('entries').delete().eq('id', id);
    setRemoving(false);
    if (error) {
      setFormMsg('지우지 못했습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setConfirming(null);
    setOpen(null);
    void loadEntries();
    void loadTerms();
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
.rec-list li{list-style:none;border-bottom:1px solid var(--rule)}
.rec-row{width:100%;appearance:none;background:none;border:0;cursor:pointer;
padding:14px 0;text-align:left;font-family:inherit;font-size:15px;
display:flex;gap:14px;align-items:baseline}
.rec-row time{flex:0 0 auto;font-size:12.5px;color:var(--light);font-variant-numeric:tabular-nums}
.rec-row span{color:var(--ink);flex:1 1 auto}
.rec-row i{flex:0 0 auto;width:7px;height:7px;margin-top:5px;border-right:1px solid var(--rule-strong);
border-bottom:1px solid var(--rule-strong);transform:rotate(45deg);transition:transform .2s}
.rec-row i.on{transform:rotate(-135deg)}
.rec-row:hover span{color:var(--light)}
.rec-detail{padding:2px 0 18px 0;display:grid;gap:7px}
.rec-detail p{margin:0;font-size:14px;line-height:1.75;color:var(--ink)}
.rec-detail b{display:inline-block;min-width:66px;font-weight:400;font-size:11.5px;
letter-spacing:.14em;color:var(--light)}
.rec-detail .rec-bare{color:var(--faint);font-size:13px}
.rec-detail .rec-del{margin-top:9px;font-size:12.5px;color:var(--faint)}
.slider-row input[type=range]{-webkit-appearance:none;appearance:none;width:100%;
height:1px;background:var(--rule-strong);outline:none;margin:0;padding:0;border:0}
.slider-row input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
width:15px;height:15px;border-radius:50%;background:var(--ivory-card);
border:1px solid var(--ink);cursor:pointer}
.slider-row input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;
background:var(--ivory-card);border:1px solid var(--ink);cursor:pointer}
.slider-row input[type=range]::-moz-range-track{height:1px;background:var(--rule-strong);border:0}
.slider-row input[type=range]:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px var(--rule)}
.rec-cell{min-width:0}
.rec-recent{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
.rec-recent button{appearance:none;background:transparent;cursor:pointer;
border:1px solid var(--rule);border-radius:999px;padding:3px 10px;
font-family:inherit;font-size:12px;color:var(--faint);
transition:color .2s,border-color .2s}
.rec-recent button:hover{color:var(--ink);border-color:var(--rule-strong)}
.otp{width:100%;padding:14px 13px;font-family:inherit;font-size:30px;font-weight:500;
letter-spacing:.42em;text-indent:.42em;text-align:center;color:var(--ink);
font-variant-numeric:tabular-nums;background:var(--ivory-card);
border:1px solid var(--rule-strong);border-radius:2px;outline:none}
.otp:focus{border-color:var(--light)}
.otp::placeholder{color:var(--faint);letter-spacing:.3em}
.linky{background:none;border:0;padding:0;font:inherit;color:var(--light);
text-decoration:underline;cursor:pointer}
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
            <form onSubmit={verifyCode} style={{ marginTop: 26 }}>
              <p className="small" style={{ marginBottom: 22 }}>
                <b>{email}</b> 으로 보냈습니다.<br />
                메일에 적힌 <b>여섯 자리 숫자</b>를 아래에 넣어주세요.
              </p>
              <div className="field">
                <label htmlFor="rec-code">숫자 여섯 자리</label>
                <input
                  id="rec-code"
                  className="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  placeholder="······"
                  value={code}
                  onChange={(ev) => setCode(ev.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <button type="submit" className="btn btn-solid" disabled={verifying}>
                {verifying ? '확인 중…' : '들어가기'}
              </button>
              {authMsg && <p className="msg err">{authMsg}</p>}
              <p className="tiny" style={{ marginTop: 18 }}>
                한 번만 넣으면 됩니다. 다음부터는 바로 열립니다.
              </p>
              <p className="tiny" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="linky"
                  onClick={() => {
                    setSent(false);
                    setCode('');
                    setAuthMsg('');
                  }}
                >
                  메일을 못 받았습니다 · 다시 보내기
                </button>
              </p>
            </form>
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
                숫자 받기
              </button>
              {authMsg && <p className="msg err">{authMsg}</p>}
              <p className="tiny" style={{ marginTop: 18 }}>
                비밀번호는 없습니다. 메일로 온 여섯 자리 숫자로 들어옵니다.
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

              <p className="tiny" style={{ margin: '30px 0 0' }}>
                몸의 어디였습니까 — 여러 곳을 골라도 됩니다
              </p>
              <BodyMap value={marks} onChange={setMarks} />

              <p className="tiny" style={{ margin: '30px 0 14px' }}>
                여덟 개 축으로 풀어보기 — 비워두셔도 됩니다
                {Object.keys(recent).length > 0 && (
                  <>
                    <br />
                    아래 작은 말들은 전에 내가 쓴 말입니다. 오늘의 말이 따로 있다면 그것을 적으세요.
                  </>
                )}
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
                    <div className="rec-cell">
                      <input
                        id={`rec-${a.key}`}
                        type="text"
                        placeholder={a.hint}
                        value={draft[a.key]}
                        onChange={(ev) => set(a.key, ev.target.value)}
                      />
                      {(recent[a.key] || []).length > 0 && (
                        <div className="rec-recent">
                          {(recent[a.key] || []).map((w) => (
                            <button key={w} type="button" onClick={() => set(a.key, w)}>
                              {w}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                {entries.slice(0, 12).map((x) => {
                  const isOpen = open === x.id;
                  const mk = marksBy[x.id] || [];
                  const tm = termsBy[x.id] || [];
                  return (
                    <li key={x.id}>
                      <button
                        type="button"
                        className="rec-row"
                        aria-expanded={isOpen}
                        onClick={() => {
                          setOpen(isOpen ? null : x.id);
                          setConfirming(null);
                        }}
                      >
                        <time dateTime={x.entry_date}>
                          {x.entry_date.slice(5).replace('-', '.')}
                        </time>
                        <span>{x.headline}</span>
                        <i className={isOpen ? 'on' : ''} aria-hidden="true" />
                      </button>

                      {isOpen && (
                        <div className="rec-detail">
                          {mk.length > 0 && (
                            <p>
                              <b>부위</b>
                              {mk.map((m) => labelFor(m.side, m.region)).join(' · ')}
                            </p>
                          )}
                          {x.ax_intensity != null && (
                            <p>
                              <b>강도</b>
                              {x.ax_intensity} / 10
                            </p>
                          )}
                          {AXES.map((a) => {
                            const words = tm.filter((t) => t.axis === a.key).map((t) => t.surface);
                            if (words.length === 0) return null;
                            return (
                              <p key={a.key}>
                                <b>{a.label}</b>
                                {words.join(' · ')}
                              </p>
                            );
                          })}
                          {x.note && (
                            <p>
                              <b>메모</b>
                              {x.note}
                            </p>
                          )}
                          {mk.length === 0 && tm.length === 0 && !x.note && x.ax_intensity == null && (
                            <p className="rec-bare">한 줄만 남기신 날입니다.</p>
                          )}

                          <p className="rec-del">
                            {confirming === x.id ? (
                              <>
                                정말 지울까요? 되돌릴 수 없습니다.{' '}
                                <button
                                  type="button"
                                  className="linky"
                                  disabled={removing}
                                  onClick={() => void remove(x.id)}
                                >
                                  {removing ? '지우는 중…' : '지웁니다'}
                                </button>
                                {' · '}
                                <button
                                  type="button"
                                  className="linky"
                                  onClick={() => setConfirming(null)}
                                >
                                  아니요
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="linky"
                                onClick={() => setConfirming(x.id)}
                              >
                                이 기록 지우기
                              </button>
                            )}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
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
