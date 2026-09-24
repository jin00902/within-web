import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

/** 아이보리 바탕에 가는 원, 그 안의 W — 3분 타이머의 원과 같은 형태 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f6f2ea',
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '50%',
            border: '4px solid #cdc2ac',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#221e19',
            fontSize: 190,
            fontWeight: 500,
            letterSpacing: '-6px',
          }}
        >
          W
        </div>
      </div>
    ),
    { ...size },
  );
}
