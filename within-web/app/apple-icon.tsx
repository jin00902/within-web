import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** iOS 홈 화면용 — 모서리를 iOS가 깎으므로 원 없이 여백을 넉넉히 */
export default function AppleIcon() {
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
          color: '#221e19',
          fontSize: 96,
          fontWeight: 500,
          letterSpacing: '-3px',
        }}
      >
        W
      </div>
    ),
    { ...size },
  );
}
