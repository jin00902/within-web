'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * 브라우저에서 쓰는 Supabase 클라이언트.
 * 공개 키(anon)만 사용하며, 실제 접근 범위는 테이블의 RLS가 정합니다.
 * 환경변수가 없으면 null을 돌려주어 화면이 조용히 안내로 바뀌게 합니다.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export const AXES = [
  { key: 'ax_location', label: '위치', hint: '예: 가슴 중앙' },
  { key: 'ax_temp', label: '온도', hint: '예: 서늘한' },
  { key: 'ax_pressure', label: '압력과 힘', hint: '예: 조이는' },
  { key: 'ax_movement', label: '움직임', hint: '예: 한자리에 머문다' },
  { key: 'ax_texture', label: '질감', hint: '예: 거칠다' },
  { key: 'ax_time', label: '시간', hint: '예: 잠들기 전에 강해진다' },
  { key: 'ax_space', label: '공간', hint: '예: 손바닥만 한 넓이' },
] as const;

export type AxisKey = (typeof AXES)[number]['key'];
