'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SRC = '/within-lost-and-found.mp3';
const STORE_KEY = 'within.music';

const FULL = 0.3; // 배경으로 머무는 크기 — 글 읽기를 방해하지 않는 선
const DUCKED = 0.09; // 3분 호흡 타이머가 도는 동안
const FADE_IN_MS = 3500;
const FADE_OUT_MS = 1200;

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const duckedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [broken, setBroken] = useState(false);

  const stopFade = useCallback(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  // 소리를 계단이 아니라 경사로 바꿉니다 — 갑자기 켜지고 꺼지지 않도록
  const fadeTo = useCallback(
    (target: number, ms: number, done?: () => void) => {
      const el = audioRef.current;
      if (!el) return;
      stopFade();
      const from = el.volume;
      const steps = Math.max(1, Math.round(ms / 50));
      let i = 0;
      fadeRef.current = setInterval(() => {
        i += 1;
        const t = i / steps;
        el.volume = Math.min(1, Math.max(0, from + (target - from) * t));
        if (i >= steps) {
          stopFade();
          if (done) done();
        }
      }, 50);
    },
    [stopFade],
  );

  const targetVolume = useCallback(() => (duckedRef.current ? DUCKED : FULL), []);

  const start = useCallback(
    (fade: boolean) => {
      const el = audioRef.current;
      if (!el) return Promise.reject(new Error('no-audio'));
      el.volume = fade ? 0 : targetVolume();
      return el.play().then(() => {
        setPlaying(true);
        if (fade) fadeTo(targetVolume(), FADE_IN_MS);
      });
    },
    [fadeTo, targetVolume],
  );

  // 처음 열었을 때: 바로 틀어보고, 브라우저가 막으면 첫 클릭·터치를 기다립니다
  useEffect(() => {
    let off = false;
    try {
      off = localStorage.getItem(STORE_KEY) === 'off';
    } catch {
      /* 저장소를 못 읽어도 기본값으로 갑니다 */
    }
    if (off) return;

    const el = audioRef.current;
    if (!el) return;

    let armed = false;
    const wake = () => {
      if (armed) return;
      armed = true;
      start(true).catch(() => undefined);
      remove();
    };
    const remove = () => {
      document.removeEventListener('pointerdown', wake);
      document.removeEventListener('keydown', wake);
      document.removeEventListener('touchstart', wake);
    };

    start(true).catch(() => {
      // 자동 재생이 막힌 경우 — 화면을 한 번 건드리는 순간 조용히 시작합니다
      document.addEventListener('pointerdown', wake, { once: true });
      document.addEventListener('keydown', wake, { once: true });
      document.addEventListener('touchstart', wake, { once: true });
    });

    return remove;
  }, [start]);

  // 3분 호흡 타이머가 도는 동안에는 음악을 뒤로 물립니다
  useEffect(() => {
    const orb = document.querySelector('.orb');
    if (!orb) return;
    const check = () => {
      const running = orb.className.includes('inhale') || orb.className.includes('exhale');
      if (running === duckedRef.current) return;
      duckedRef.current = running;
      const el = audioRef.current;
      if (el && !el.paused) fadeTo(running ? DUCKED : FULL, 1400);
    };
    const mo = new MutationObserver(check);
    mo.observe(orb, { attributes: true, attributeFilter: ['class'] });
    check();
    return () => mo.disconnect();
  }, [fadeTo]);

  useEffect(() => stopFade, [stopFade]);

  // 재생이 실제로 시작된 순간을 기준으로 버튼과 음량을 맞춥니다.
  // 백그라운드 탭에서는 play() 약속이 늦게 풀려, 이 신호가 없으면 0의 음량으로 흐를 수 있습니다.
  const handlePlaying = () => {
    setPlaying(true);
    const el = audioRef.current;
    if (el && el.volume < 0.005 && !fadeRef.current) fadeTo(targetVolume(), FADE_IN_MS);
  };

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      fadeTo(0, FADE_OUT_MS, () => {
        el.pause();
        setPlaying(false);
      });
      try {
        localStorage.setItem(STORE_KEY, 'off');
      } catch {
        /* 이번 방문 동안만 유지됩니다 */
      }
    } else {
      start(true).catch(() => setBroken(true));
      try {
        localStorage.setItem(STORE_KEY, 'on');
      } catch {
        /* 이번 방문 동안만 유지됩니다 */
      }
    }
  };

  if (broken) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.music-toggle{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:60;
display:inline-flex;align-items:center;gap:9px;padding:9px 15px 9px 13px;
font-family:inherit;font-size:12px;letter-spacing:.14em;color:var(--muted);
background:rgba(251,249,244,.86);border:1px solid var(--rule);border-radius:100px;
cursor:pointer;backdrop-filter:blur(8px);transition:color .25s ease,border-color .25s ease}
.music-toggle:hover{color:var(--ink);border-color:var(--rule-strong)}
.music-toggle:focus-visible{outline:2px solid var(--light);outline-offset:2px}
.music-eq{display:inline-flex;align-items:flex-end;gap:2px;height:11px}
.music-eq i{width:2px;height:3px;background:var(--light);display:block;transition:height .3s ease}
.music-toggle[aria-pressed="true"] .music-eq i{background:var(--ink);animation:musicbar 1.25s ease-in-out infinite}
.music-toggle[aria-pressed="true"] .music-eq i:nth-child(2){animation-delay:.18s}
.music-toggle[aria-pressed="true"] .music-eq i:nth-child(3){animation-delay:.36s}
@keyframes musicbar{0%,100%{height:3px}50%{height:11px}}
@media (prefers-reduced-motion: reduce){.music-toggle[aria-pressed="true"] .music-eq i{animation:none;height:7px}}
@media (max-width:720px){.music-toggle{right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));padding:8px 13px 8px 11px;font-size:11px}}
`,
        }}
      />
      <audio
        ref={audioRef}
        src={SRC}
        loop
        preload="auto"
        onPlaying={handlePlaying}
        onError={() => setBroken(true)}
        aria-hidden="true"
      />
      <button
        type="button"
        className="music-toggle"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? '배경음악 끄기' : '배경음악 켜기'}
        title="길을 잃어도 — Lost & Found"
      >
        <span className="music-eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {playing ? '음악 끄기' : '음악 켜기'}
      </button>
    </>
  );
}
