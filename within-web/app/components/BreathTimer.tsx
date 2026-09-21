'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Step = { label: string; cue: string };

const STEPS: Step[] = [
  {
    label: '01 · 관찰',
    cue: '눈을 감거나 시선을 내려놓습니다. 평소처럼 숨을 쉬며, 아무것도 바꾸지 않고 지켜봅니다. 들숨과 날숨의 온도가 다른가요.',
  },
  {
    label: '02 · 깊이',
    cue: '한 손은 가슴에, 한 손은 배 위에. 어느 손이 먼저 움직이나요. 숨은 어디까지 내려가나요 — 목, 가슴, 배 아래.',
  },
  {
    label: '03 · 경계',
    cue: '들숨이 끝나고 날숨이 시작되기 전, 짧은 멈춤이 있습니다. 그 멈춤은 편안한가요, 서두르나요.',
  },
];

const STEP_SECONDS = 60;
const TOTAL = STEPS.length * STEP_SECONDS;
const SOUND_KEY = 'within.sound';

function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ── 싱잉볼 — 오실레이터로 직접 합성합니다 (외부 음원 파일 없음) ───────── */

let audioCtx: AudioContext | null = null;

async function playBowl(opts: { f0?: number; gain?: number; dur?: number } = {}) {
  const f0 = opts.f0 ?? 210;
  const peak = opts.gain ?? 0.26;
  const dur = opts.dur ?? 9;

  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();

    const ctx = audioCtx;
    // 브라우저가 오디오를 멈춰둔 상태에서는 시계(currentTime)가 흐르지 않습니다.
    // 먼저 깨우고, 깨어난 뒤의 시각을 기준으로 소리를 예약해야 합니다.
    // (이걸 기다리지 않으면 예약 시각이 이미 지나간 시점이 되어 소리 없이 끝납니다)
    if (ctx.state !== 'running') {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }
    if (ctx.state !== 'running') return;

    const t0 = ctx.currentTime + 0.02;

    const out = ctx.createGain();
    out.gain.value = peak;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 5200;
    out.connect(lp);
    lp.connect(ctx.destination);

    // 싱잉볼의 배음은 정수배가 아닙니다 — 종·볼 특유의 비조화 배음비
    const partials = [
      { r: 1.0, a: 1.0, d: 1.0 },
      { r: 2.76, a: 0.36, d: 0.6 },
      { r: 5.4, a: 0.15, d: 0.38 },
      { r: 8.93, a: 0.06, d: 0.24 },
    ];

    partials.forEach((p) => {
      const beat = 0.45 + p.r * 0.22; // 아주 살짝 어긋난 쌍 — 울렁이는 맥놀이
      [0, beat].forEach((off) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f0 * p.r + off;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(p.a * 0.5, t0 + 0.035);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * p.d);
        o.connect(g);
        g.connect(out);
        o.start(t0);
        o.stop(t0 + dur * p.d + 0.1);
      });
    });

    // 채가 볼에 닿는 순간의 짧은 숨소리
    const len = Math.floor(ctx.sampleRate * 0.28);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1700;
    bp.Q.value = 0.8;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.06, t0);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
    src.connect(bp);
    bp.connect(ng);
    ng.connect(out);
    src.start(t0);
  } catch {
    // 소리가 나지 않아도 타이머는 그대로 돕니다
  }
}

export default function BreathTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [soundOn, setSoundOn] = useState(true);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const rang = useRef(false);

  const done = elapsed >= TOTAL;
  const stepIndex = Math.min(Math.floor(elapsed / STEP_SECONDS), STEPS.length - 1);
  const remaining = Math.max(TOTAL - elapsed, 0);

  useEffect(() => {
    try {
      if (localStorage.getItem(SOUND_KEY) === 'off') setSoundOn(false);
    } catch {
      /* 저장소를 못 읽어도 기본값으로 동작합니다 */
    }
  }, []);

  const clear = useCallback(() => {
    if (tick.current) {
      clearInterval(tick.current);
      tick.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      clear();
      return;
    }
    tick.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= TOTAL) {
          setRunning(false);
          return TOTAL;
        }
        return e + 1;
      });
    }, 1000);
    return clear;
  }, [running, clear]);

  // 3분이 끝나면 더 낮고 긴 소리로 한 번
  useEffect(() => {
    if (!done) {
      rang.current = false;
      return;
    }
    if (rang.current) return;
    rang.current = true;
    if (soundOn) void playBowl({ f0: 157.5, dur: 11, gain: 0.22 });
  }, [done, soundOn]);

  // 들숨 3.6초 / 날숨 3.6초 — 느린 호흡 리듬으로 원이 열리고 닫힘
  useEffect(() => {
    if (!running) return;
    setPhase('inhale');
    const swing = setInterval(() => {
      setPhase((p) => (p === 'inhale' ? 'exhale' : 'inhale'));
    }, 3600);
    return () => clearInterval(swing);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setPhase('inhale');
  };

  const toggleRun = () => {
    if (!running && soundOn) void playBowl(); // 시작 — 한 번 울립니다
    setRunning((r) => !r);
  };

  const toggleSound = () => {
    setSoundOn((on) => {
      const next = !on;
      try {
        localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
      } catch {
        /* 저장이 막혀 있어도 이번 방문 동안은 유지됩니다 */
      }
      if (next) void playBowl({ gain: 0.18, dur: 6 }); // 켜면 한 번 들려드립니다
      return next;
    });
  };

  return (
    <div className="timer">
      <div className={`orb ${running ? phase : ''}`} aria-hidden="true">
        <span className="clock">{done ? '0:00' : mmss(remaining)}</span>
      </div>

      <div className="phase">
        {done ? '마침' : running ? STEPS[stepIndex].label : '3분의 미션'}
      </div>

      <p className="cue">
        {done
          ? '천천히, 평소의 호흡으로 돌아옵니다. 오늘 내 숨은 어떤 모양이었나요.'
          : running
            ? STEPS[stepIndex].cue
            : '편하게 앉아, 하던 일을 잠시 내려놓습니다. 준비가 되면 시작을 누르세요.'}
      </p>

      <div className="dots" aria-hidden="true">
        {STEPS.map((s, i) => (
          <i key={s.label} className={i <= stepIndex && (running || done) ? 'on' : ''} />
        ))}
      </div>

      <div className="btn-row">
        {!done && (
          <button type="button" className="btn btn-solid" onClick={toggleRun}>
            {running ? '잠시 멈춤' : elapsed > 0 ? '이어서' : '시작하기'}
          </button>
        )}
        {(elapsed > 0 || done) && (
          <button type="button" className="btn btn-quiet" onClick={reset}>
            {done ? '다시 하기' : '처음으로'}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        style={{
          display: 'inline-block',
          marginTop: 18,
          padding: '4px 2px',
          background: 'none',
          border: 0,
          font: 'inherit',
          fontSize: 12.5,
          letterSpacing: '0.06em',
          color: 'var(--light)',
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 4,
        }}
      >
        싱잉볼 소리 · {soundOn ? '켜짐' : '꺼짐'}
      </button>
    </div>
  );
}
