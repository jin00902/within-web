'use client';

import { useState } from 'react';

const VAGUE = ['그냥 스트레스 받아.', '기분이 별로야.', '좀 불안해.', '아무것도 하고 싶지 않아.'];

const REGION = ['가슴이', '목과 어깨가', '배가', '머리가', '손끝이', '등 뒤가'];

const QUALITY = [
  '답답하고',
  '조여들고',
  '무겁게 눌리고',
  '뜨겁게 오르고',
  '서늘하게 식고',
  '가늘게 떨리고',
  '텅 빈 것 같고',
  '무언가 얹힌 것 같고',
];

const BREATH = [
  '호흡이 짧아졌어.',
  '숨이 얕아졌어.',
  '숨을 자주 멈추고 있어.',
  '길게 내쉬고 싶어.',
];

function Row({
  step,
  label,
  options,
  value,
  onPick,
}: {
  step: string;
  label: string;
  options: string[];
  value: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div className="tag">
        {step} · {label}
      </div>
      <div className="chip-row">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className="chip"
            aria-pressed={value === o}
            onClick={() => onPick(value === o ? '' : o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function VocabTranslator() {
  const [vague, setVague] = useState<string>(VAGUE[0]);
  const [region, setRegion] = useState<string>('');
  const [quality, setQuality] = useState<string>('');
  const [breath, setBreath] = useState<string>('');

  const parts = [region, quality].filter(Boolean).join(' ');
  const sentence = [parts ? `${parts},` : '', breath].filter(Boolean).join(' ').trim();
  const complete = Boolean(region && quality && breath);

  return (
    <div className="translate">
      <Row step="01" label="막연한 말 고르기" options={VAGUE} value={vague} onPick={(v) => setVague(v || VAGUE[0])} />
      <Row step="02" label="어디에서 느껴지나요" options={REGION} value={region} onPick={setRegion} />
      <Row step="03" label="어떤 감각인가요" options={QUALITY} value={quality} onPick={setQuality} />
      <Row step="04" label="호흡은 어떤가요" options={BREATH} value={breath} onPick={setBreath} />

      <hr className="rule" style={{ margin: '34px auto 30px' }} />

      <div className="before">
        <div className="tag">BEFORE</div>
        <div className="txt italic">&ldquo;{vague}&rdquo;</div>
      </div>

      <div className="arrow" aria-hidden="true">
        ↓
      </div>

      <div className="after">
        <div className="tag">AFTER · 감각어휘</div>
        <div className="txt">
          {sentence ? (
            <>&ldquo;{sentence}&rdquo;</>
          ) : (
            <span className="quiet italic" style={{ fontSize: 15 }}>
              위에서 몸의 자리와 감각, 호흡을 골라 보세요. 막연한 말이 문장이 됩니다.
            </span>
          )}
        </div>
      </div>

      {complete && (
        <p className="small" style={{ marginTop: 26, marginBottom: 0 }}>
          같은 하루를 두 문장으로 말해 보면, 몸이 무엇을 말하고 있었는지 조금 더 또렷해집니다.
          이것이 WITHIN의 감각어휘 훈련(Somatic Vocabulary Training)입니다.
        </p>
      )}
    </div>
  );
}
