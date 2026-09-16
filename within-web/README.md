# WITHIN · 감각구독 — 홍보 앱

감각어휘 훈련(SVT)을 소개하고, 뉴스레터 신청과 무료 전자책 배포로 회원 DB를 모으는 한 페이지 앱.

## 화면 구성
- 히어로 — 다시, 나를 만나다
- WHY WITHIN? — 지금 나는 어떤가?
- Notice · Feel · Change
- 감각어휘 훈련(SVT) — 막연한 말을 몸의 문장으로 바꾸는 인터랙션
- 왜 이 방법이 작동하는가 — 뇌과학 근거 4장
- 3분 체험 — 호흡 알아차림 타이머 (관찰·깊이·경계)
- 무료 가이드 《몸은 이미 말하고 있다》 — 이메일 받고 다운로드
- 감각구독 뉴스레터 신청 — Vol.1 미리보기
- FOUNDER / 푸터 / 개인정보 처리방침

## 기술 구성
- Next.js 15 (App Router) · TypeScript · 순수 CSS
- `app/api/subscribe` — 구독자 저장(Supabase) + 전자책 다운로드 토큰 발급
- `app/api/ebook` — HMAC 서명 토큰 검증 후 PDF 전달 (7일 만료)
- `supabase/schema.sql` — subscribers 테이블 + newsletter_audience 뷰

## 연결 순서
1. **Supabase**: 프로젝트 생성 → SQL Editor에 `supabase/schema.sql` 붙여넣고 RUN
2. **Vercel 환경변수** (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`  ← service_role 키 (절대 공개 금지)
   - `EBOOK_TOKEN_SECRET` ← `openssl rand -hex 32` 같은 긴 랜덤 문자열
3. **전자책**: PDF를 `assets/ebook.pdf` 로 넣고 커밋 → 재배포
4. **공개 설정**: Vercel → Settings → Deployment Protection → Vercel Authentication **Off**

환경변수가 없어도 화면과 폼은 정상 동작하며, 저장만 건너뜁니다.

## 로컬 실행
```bash
npm install
npm run dev     # http://localhost:3000
```

## GitHub 연결
```bash
git init
git add -A
git commit -m "WITHIN 감각구독 홍보 앱"
git branch -M main
git remote add origin https://github.com/<계정>/within-app.git
git push -u origin main
```
이후 Vercel에서 이 저장소를 Import 하면, 커밋할 때마다 자동 배포됩니다.
.
