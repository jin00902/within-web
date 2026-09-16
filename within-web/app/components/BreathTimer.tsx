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

function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function BreathTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const done = elapsed >= TOTAL;
  const stepIndex = Math.min(Math.floor(elapsed / STEP_SECONDS), STEPS.length - 1);
  const remaining = Math.max(TOTAL - elapsed, 0);

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
          <button type="button" className="btn btn-solid" onClick={() => setRunning((r) => !r)}>
            {running ? '잠시 멈춤' : elapsed > 0 ? '이어서' : '시작하기'}
          </button>
        )}
        {(elapsed > 0 || done) && (
          <button type="button" className="btn btn-quiet" onClick={reset}>
            {done ? '다시 하기' : '처음으로'}
          </button>
        )}
      </div>
    </div>
  );
}
