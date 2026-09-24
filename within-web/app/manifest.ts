import type { MetadataRoute } from 'next';

/**
 * 홈 화면에 추가했을 때의 모습.
 * 스토어에 올리지 않고도 앱처럼 열리게 합니다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WITHIN · 감각구독',
    short_name: 'WITHIN',
    description: '몸이 보내는 신호를 알아차리고, 내 언어로 옮기는 훈련.',
    lang: 'ko',
    start_url: '/record',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f6f2ea',
    theme_color: '#f6f2ea',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
