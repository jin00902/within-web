-- ============================================================
--  WITHIN · 감각구독  —  Supabase 스키마
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN 하세요.
-- ============================================================

create table if not exists public.subscribers (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,
  name                text,
  source              text default 'unknown',        -- ebook | newsletter
  consent_privacy     boolean not null default false, -- [필수] 개인정보 수집·이용
  consent_marketing   boolean not null default false, -- [선택] 뉴스레터 수신
  ebook_downloaded_at timestamptz,
  user_agent          text,
  unsubscribed_at     timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists subscribers_created_at_idx on public.subscribers (created_at desc);
create index if not exists subscribers_source_idx     on public.subscribers (source);

-- 행 수준 보안: 서비스 롤(서버)만 읽고 쓴다. 브라우저에서는 접근 불가.
alter table public.subscribers enable row level security;

-- 발송 대상 목록 (수신 동의 + 해지하지 않은 사람)
create or replace view public.newsletter_audience as
  select email, name, created_at
  from public.subscribers
  where consent_marketing = true
    and unsubscribed_at is null
  order by created_at desc;
