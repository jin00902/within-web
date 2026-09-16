import type { Metadata } from 'next';

export const metadata: Metadata = { title: '개인정보 처리방침' };

export default function Privacy() {
  return (
    <main className="wrap" style={{ padding: '80px 24px 96px' }}>
      <p className="tagline center">W I T H I N</p>
      <h1 style={{ fontSize: 24, textAlign: 'center', margin: '26px 0 12px' }}>
        개인정보 수집·이용 안내
      </h1>
      <hr className="rule rule-spaced" />

      <h3>1. 수집하는 항목</h3>
      <p className="small">
        이름(선택), 메일 주소(필수), 신청 경로 및 접속 브라우저 정보.
      </p>

      <h3>2. 수집·이용 목적</h3>
      <p className="small">
        무료 가이드 《몸은 이미 말하고 있다》 제공, 감각구독 뉴스레터 발송, 구독자 문의 응대.
      </p>

      <h3>3. 보유 및 이용 기간</h3>
      <p className="small">
        수신 거부 또는 삭제 요청 시까지 보관하며, 요청을 받은 즉시 지체 없이 파기합니다.
        3년 이상 활동이 없는 구독자의 정보는 별도 안내 후 파기합니다.
      </p>

      <h3>4. 처리 위탁</h3>
      <p className="small">
        메일 발송을 위해 스티비(Stibee), 데이터 보관을 위해 Supabase, 웹사이트 호스팅을 위해 Vercel을
        이용합니다. 위탁 업무는 발송·보관·호스팅에 한하며, 목적 외로 이용되지 않습니다.
      </p>

      <h3>5. 동의를 거부할 권리</h3>
      <p className="small">
        수집에 동의하지 않을 수 있으며, 이 경우 가이드 제공과 뉴스레터 발송이 이루어지지 않습니다.
        동의 후에도 언제든 메일 하단의 수신거부 링크 또는 아래 주소로 철회하실 수 있습니다.
      </p>

      <h3>6. 문의</h3>
      <p className="small">
        FairBiz Inc. · 부산 해운대구 센텀중앙로 97
        <br />
        <a href="mailto:hello@within.me.kr" style={{ textDecoration: 'underline' }}>
          hello@within.me.kr
        </a>
      </p>

      <hr className="rule rule-spaced" />
      <p className="center">
        <a className="btn btn-quiet" href="/">
          돌아가기
        </a>
      </p>
    </main>
  );
}
