'use client';

import { useMemo, useRef, useState } from 'react';

export type BodySide = 'front' | 'back';
export type BodyMark = { side: BodySide; region: string; x: number; y: number };

const W = 200;
const H = 440;

/**
 * 몸의 오른쪽 절반 윤곽(정수리 → 어깨 → 팔 → 몸통 → 다리 → 사타구니).
 * 왼쪽은 이 점들을 x축으로 뒤집어 만듭니다. 그래야 가운데에 선이 겹치지 않습니다.
 */
const HALF: [number, number][] = [
  // 머리 — 정수리에서 오른쪽 관자놀이, 턱선까지
  [100, 12], [109, 15], [114, 24], [114, 34], [111, 43], [106, 50],
  // 목
  [105, 54], [105, 60],
  // 어깨
  [113, 63], [124, 66], [133, 71], [139, 78],
  // 팔 바깥선
  [143, 92], [145, 108], [148, 134], [150, 158],
  // 손
  [152, 176], [152, 190], [149, 197], [144, 196], [141, 189],
  // 팔 안쪽선 — 손에서 겨드랑이로 올라옵니다
  [138, 168], [135, 146], [132, 122], [130, 104],
  // 겨드랑이
  [126, 94],
  // 몸통 옆선 — 갈비에서 허리로
  [124, 104], [126, 120], [127, 138],
  [125, 152], [123, 166],
  // 골반
  [127, 180], [131, 194], [132, 208],
  // 허벅지 바깥선
  [130, 232], [127, 262],
  // 무릎
  [123, 290], [121, 308],
  // 종아리
  [120, 330], [117, 356],
  // 발목
  [113, 382], [112, 394],
  // 발
  [118, 402], [119, 409], [112, 411], [105, 409], [103, 401],
  // 다리 안쪽선 — 발목에서 사타구니로 올라옵니다
  [103, 386], [105, 356], [107, 330], [106, 306],
  [104, 280], [102, 250], [100, 224],
];

function smooth(pts: [number, number][]): string {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += ` Q ${cx} ${cy} ${((cx + nx) / 2).toFixed(1)} ${((cy + ny) / 2).toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
}

const OUTLINE = (() => {
  const mirrored = HALF.map(([x, y]) => [W - x, y] as [number, number]).reverse().slice(1);
  return `${smooth([...HALF, ...mirrored])} Z`;
})();

type Region = { key: string; label: string; x: number; y: number };

/** 좌·우는 보는 사람이 아니라 기록하는 사람의 몸을 기준으로 합니다. */
const FRONT: Region[] = [
  { key: 'head', label: '머리', x: 100, y: 26 },
  { key: 'face', label: '얼굴·턱', x: 100, y: 46 },
  { key: 'throat', label: '목', x: 100, y: 66 },
  { key: 'shoulder_r', label: '오른 어깨', x: 72, y: 72 },
  { key: 'shoulder_l', label: '왼 어깨', x: 128, y: 72 },
  { key: 'chest', label: '가슴', x: 100, y: 104 },
  { key: 'solar', label: '명치', x: 100, y: 134 },
  { key: 'belly', label: '배', x: 100, y: 160 },
  { key: 'lower_belly', label: '아랫배', x: 100, y: 186 },
  { key: 'pelvis', label: '골반', x: 100, y: 211 },
  { key: 'arm_r', label: '오른팔', x: 63, y: 124 },
  { key: 'arm_l', label: '왼팔', x: 137, y: 124 },
  { key: 'hand_r', label: '오른손', x: 54, y: 192 },
  { key: 'hand_l', label: '왼손', x: 146, y: 192 },
  { key: 'thigh_r', label: '오른 허벅지', x: 85, y: 252 },
  { key: 'thigh_l', label: '왼 허벅지', x: 115, y: 252 },
  { key: 'calf_r', label: '오른 종아리', x: 88, y: 340 },
  { key: 'calf_l', label: '왼 종아리', x: 112, y: 340 },
  { key: 'foot_r', label: '오른발', x: 89, y: 404 },
  { key: 'foot_l', label: '왼발', x: 111, y: 404 },
];

const BACK: Region[] = [
  { key: 'back_head', label: '뒤통수', x: 100, y: 28 },
  { key: 'nape', label: '목덜미', x: 100, y: 62 },
  { key: 'trap_r', label: '오른 어깨 뒤', x: 72, y: 72 },
  { key: 'trap_l', label: '왼 어깨 뒤', x: 128, y: 72 },
  { key: 'upper_back', label: '등 위', x: 100, y: 104 },
  { key: 'mid_back', label: '등 가운데', x: 100, y: 136 },
  { key: 'low_back', label: '허리', x: 100, y: 168 },
  { key: 'sacrum', label: '엉치', x: 100, y: 196 },
  { key: 'buttock', label: '엉덩이', x: 100, y: 220 },
  { key: 'arm_r', label: '오른팔', x: 63, y: 124 },
  { key: 'arm_l', label: '왼팔', x: 137, y: 124 },
  { key: 'hand_r', label: '오른손', x: 54, y: 192 },
  { key: 'hand_l', label: '왼손', x: 146, y: 192 },
  { key: 'ham_r', label: '오른 허벅지 뒤', x: 85, y: 252 },
  { key: 'ham_l', label: '왼 허벅지 뒤', x: 115, y: 252 },
  { key: 'calf_r', label: '오른 종아리', x: 88, y: 340 },
  { key: 'calf_l', label: '왼 종아리', x: 112, y: 340 },
  { key: 'heel_r', label: '오른 뒤꿈치', x: 89, y: 404 },
  { key: 'heel_l', label: '왼 뒤꿈치', x: 111, y: 404 },
];

const REGIONS: Record<BodySide, Region[]> = { front: FRONT, back: BACK };
const HIT = 30; // 이 거리 안에서 가장 가까운 부위를 고릅니다.

export function labelFor(side: BodySide, key: string): string {
  return REGIONS[side].find((r) => r.key === key)?.label ?? key;
}

export default function BodyMap({
  value,
  onChange,
}: {
  value: BodyMark[];
  onChange: (next: BodyMark[]) => void;
}) {
  const [side, setSide] = useState<BodySide>('front');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const here = useMemo(() => value.filter((m) => m.side === side), [value, side]);
  const picked = useMemo(() => new Set(here.map((m) => m.region)), [here]);

  const toggle = (region: string, x: number, y: number) => {
    if (picked.has(region)) {
      onChange(value.filter((m) => !(m.side === side && m.region === region)));
    } else {
      onChange([
        ...value,
        { side, region, x: Number((x / W).toFixed(3)), y: Number((y / H).toFixed(3)) },
      ]);
    }
  };

  // 사람이 정확히 점 위를 누르지 않으므로, 누른 자리에서 가장 가까운 부위를 찾습니다.
  const onPointer = (ev: React.PointerEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const px = ((ev.clientX - box.left) / box.width) * W;
    const py = ((ev.clientY - box.top) / box.height) * H;
    let best: Region | null = null;
    let bestD = Infinity;
    for (const r of REGIONS[side]) {
      const d = Math.hypot(r.x - px, r.y - py);
      if (d < bestD) { bestD = d; best = r; }
    }
    if (best && bestD <= HIT) toggle(best.key, px, py);
  };

  const names = here.map((m) => labelFor(side, m.region));

  return (
    <div className="bm">
      <style
        dangerouslySetInnerHTML={{
          __html: `
.bm{margin-top:10px}
.bm-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}
.bm-sides{display:flex;gap:0;border:1px solid var(--rule-strong);border-radius:2px;overflow:hidden}
.bm-sides button{appearance:none;border:0;background:transparent;cursor:pointer;
font-family:inherit;font-size:11.5px;letter-spacing:.18em;color:var(--light);
padding:6px 15px;transition:background .2s,color .2s}
.bm-sides button+button{border-left:1px solid var(--rule-strong)}
.bm-sides button.on{background:var(--ink);color:var(--ivory)}
.bm-clear{appearance:none;border:0;background:transparent;cursor:pointer;padding:0;
font-family:inherit;font-size:11.5px;letter-spacing:.1em;color:var(--faint);
border-bottom:1px solid var(--rule-strong)}
.bm-clear:hover{color:var(--light)}
.bm-stage{display:flex;justify-content:center;padding:6px 0 2px}
.bm-svg{width:196px;height:auto;max-width:100%;touch-action:manipulation}
.bm-figure{fill:none;stroke:var(--rule-strong);stroke-width:1.1;
stroke-linejoin:round;stroke-linecap:round}
.bm-hit{fill:transparent;cursor:crosshair}
.bm-dot{fill:var(--ink);pointer-events:none}
.bm-guide{fill:var(--rule-strong);pointer-events:none;transition:fill .2s}
.bm-key:hover~.bm-guide{fill:var(--light)}
.bm-halo{fill:none;stroke:var(--ink);stroke-width:.8;opacity:.28;pointer-events:none}
.bm-key{fill:transparent;stroke:none;cursor:pointer;outline:none}
.bm-key:focus-visible{stroke:var(--light);stroke-width:1;stroke-dasharray:2 2}
.bm-picked{margin-top:8px;text-align:center;font-size:13px;color:var(--ink);
line-height:1.7;min-height:22px}
.bm-picked em{font-style:normal;color:var(--faint)}
`,
        }}
      />

      <div className="bm-head">
        <div className="bm-sides" role="group" aria-label="몸의 앞뒤">
          <button type="button" className={side === 'front' ? 'on' : ''} onClick={() => setSide('front')}>앞</button>
          <button type="button" className={side === 'back' ? 'on' : ''} onClick={() => setSide('back')}>뒤</button>
        </div>
        {value.length > 0 && (
          <button type="button" className="bm-clear" onClick={() => onChange([])}>모두 지우기</button>
        )}
      </div>

      <div className="bm-stage">
        <svg
          ref={svgRef}
          className="bm-svg"
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label={`몸 ${side === 'front' ? '앞' : '뒤'} — 느껴진 자리를 누르세요`}
        >
          <path className="bm-figure" d={OUTLINE} />

          <rect className="bm-hit" x={0} y={0} width={W} height={H} onPointerDown={onPointer} />

          {REGIONS[side].map((r) => {
            const on = picked.has(r.key);
            return (
              <g key={r.key}>
                <circle
                  className="bm-key"
                  cx={r.x}
                  cy={r.y}
                  r={13}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={on}
                  aria-label={r.label}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                      ev.preventDefault();
                      toggle(r.key, r.x, r.y);
                    }
                  }}
                >
                  <title>{r.label}</title>
                </circle>
                {on ? (
                  <>
                    <circle className="bm-halo" cx={r.x} cy={r.y} r={10} />
                    <circle className="bm-dot" cx={r.x} cy={r.y} r={4.2} />
                  </>
                ) : (
                  <circle className="bm-guide" cx={r.x} cy={r.y} r={1.7} />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="bm-picked">
        {names.length ? names.join(' · ') : <em>옅은 점 가까이를 누르면 자리가 잡힙니다</em>}
      </p>
    </div>
  );
}
