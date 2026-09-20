import type { Metadata, Viewport } from 'next';
import './globals.css';
import BackgroundMusic from './components/BackgroundMusic';

const SITE = 'WITHIN · 감각구독';
const DESC =
  '다시, 나를 만나다. 내 몸의 감각을 알아차리고 언어로 옮기는 훈련 — Somatic Vocabulary Training. 감각구독 뉴스레터와 무료 가이드 《몸은 이미 말하고 있다》.';

export const metadata: Metadata = {
  title: { default: SITE, template: `%s · WITHIN` },
  description: DESC,
  keywords: ['WITHIN', '감각구독', '소마틱', 'Somatic Vocabulary Training', '감각어휘', '신체감각 알아차림', '내면소통', '뉴스레터'],
  openGraph: {
    title: SITE,
    description: DESC,
    type: 'website',
    locale: 'ko_KR',
    siteName: 'WITHIN',
  },
  twitter: { card: 'summary_large_image', title: SITE, description: DESC },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6f2ea',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <BackgroundMusic />
      </body>
    </html>
  );
}
