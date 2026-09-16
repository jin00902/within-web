'use client';

import { useState } from 'react';

type Variant = 'ebook' | 'newsletter';

const COPY: Record<Variant, { cta: string; pending: string; doneTitle: string; doneBody: string }> = {
  ebook: {
    cta: '무료 가이드 받기',
    pending: '보내는 중…',
    doneTitle: '준비되었습니다',
    doneBody: '아래에서 바로 내려받으세요. 입력하신 메일로도 새 감각구독 소식을 보내드립니다.',
  },
  newsletter: {
    cta: '감각구독 신청하기',
    pending: '신청 중…',
    doneTitle: '구독이 시작되었습니다',
    doneBody: '매달 하나의 감각 키워드를 편지로 보내드립니다. 첫 편지에서 만나요.',
  },
};

export default function SignupForm({ variant }: { variant: Variant }) {
  const copy = COPY[variant];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(variant === 'newsletter');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('메일 주소를 다시 확인해 주세요.');
      return;
    }
    if (!privacy) {
      setError('개인정보 수집·이용에 동의해 주세요.');
      return;
    }

    setState('sending');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          source: variant,
          consentPrivacy: privacy,
          consentMarketing: marketing,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || '잠시 후 다시 시도해 주세요.');
      setToken(data.token || '');
      setState('done');
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : '잠시 후 다시 시도해 주세요.');
    }
  };

  if (state === 'done') {
    return (
      <div className="done">
        <div className="mark" aria-hidden="true">
          ✓
        </div>
        <h3 style={{ marginBottom: 12 }}>{copy.doneTitle}</h3>
        <p className="small" style={{ maxWidth: 380, margin: '0 auto 28px' }}>
          {copy.doneBody}
        </p>
        {variant === 'ebook' && token && (
          <a className="btn btn-solid" href={`/api/ebook?t=${encodeURIComponent(token)}`}>
            《몸은 이미 말하고 있다》 받기
          </a>
        )}
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor={`name-${variant}`}>이름 (선택)</label>
        <input
          id={`name-${variant}`}
          type="text"
          autoComplete="name"
          placeholder="어떻게 불러드리면 좋을까요"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={`email-${variant}`}>메일 주소</label>
        <input
          id={`email-${variant}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="consent">
        <label>
          <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
          <span>
            [필수] 이름·메일 주소 수집 및 이용에 동의합니다.{' '}
            <a href="/privacy" target="_blank" rel="noreferrer">
              자세히
            </a>
          </span>
        </label>
        <label>
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          <span>[선택] 감각구독 뉴스레터와 새 소식을 메일로 받겠습니다.</span>
        </label>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button type="submit" className="btn btn-solid" disabled={state === 'sending'}>
          {state === 'sending' ? copy.pending : copy.cta}
        </button>
      </div>

      {error && (
        <p className="form-msg err" style={{ textAlign: 'center' }}>
          {error}
        </p>
      )}
      <p className="form-msg tiny" style={{ textAlign: 'center' }}>
        언제든 한 번의 클릭으로 수신을 멈출 수 있습니다.
      </p>
    </form>
  );
}
