import BreathTimer from './components/BreathTimer';
import SignupForm from './components/SignupForm';
import VocabTranslator from './components/VocabTranslator';

const SCIENCE = [
  {
    who: 'Karl Friston · 자유에너지 원리',
    title: '뇌는 끊임없이 예측한다',
    body: '뇌는 다음 순간을 미리 그려두고, 실제 몸에서 올라온 신호와의 차이를 줄이려 움직입니다. 가슴이 조이거나 숨이 짧아지는 감각은 그 차이가 남긴 흔적입니다.',
  },
  {
    who: 'Lisa F. Barrett · 구성된 감정 이론',
    title: '감정은 발견되지 않고 구성된다',
    body: '감정은 몸 안에서 기다리고 있는 것이 아니라, 신체 신호를 뇌가 해석해 지금 만들어내는 것입니다. 해석에 쓸 언어가 늘어나면 느낌의 해상도가 함께 올라갑니다.',
  },
  {
    who: 'Antonio Damasio · 소마틱 마커',
    title: '몸의 표지가 선택에 개입한다',
    body: '결정은 머리에서만 이뤄지지 않습니다. 몸에 남은 감각의 표지가 판단에 먼저 도착합니다. 그 표지를 읽을 수 있을 때, 선택은 조금 더 나의 것이 됩니다.',
  },
  {
    who: 'Matthew Lieberman · 감정 이름 붙이기',
    title: '이름을 붙이면 파도가 낮아진다',
    body: '느낌에 이름을 붙이는 순간, 편도체의 반응은 잦아들고 전전두피질의 활동이 올라갑니다. 말이 되어 나온 감각은 나를 덜 흔듭니다.',
  },
];

export default function Home() {
  return (
    <>
      <header className="site-head">
        <div className="bar">
          <a className="wordmark" href="#top">
            W I T H I N
          </a>
          <nav className="nav-links">
            <a className="hide-sm" href="#way">
              훈련법
            </a>
            <a className="hide-sm" href="#science">
              뇌과학
            </a>
            <a href="#practice">3분 체험</a>
            <a href="#ebook">무료 가이드</a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* ---------------- HERO ---------------- */}
        <section className="hero">
          <div className="wrap center">
            <div className="breath" aria-hidden="true" />
            <p className="tagline">다시, 나를 만나다</p>
            <p className="wordmark wordmark-lg" style={{ margin: '22px 0 34px' }}>
              WITHIN
            </p>
            <h1>
              내 몸의 감각에 집중하고,
              <br />
              온전히 나에게로 돌아오는 여정.
            </h1>
            <p className="lead quiet" style={{ margin: '30px auto 44px', maxWidth: 480 }}>
              막연한 기분을 몸의 언어로 옮기는 훈련.
              <br />
              뇌과학이 밝혀낸 방법으로, 하루 3분부터.
            </p>
            <div className="btn-row">
              <a className="btn btn-solid" href="#ebook">
                무료 가이드 받기
              </a>
              <a className="btn" href="#newsletter">
                감각구독 신청
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- WHY WITHIN ---------------- */}
        <section className="shade">
          <div className="wrap center">
            <p className="eyebrow">why within?</p>
            <h2>지금 나는 어떤가?</h2>
            <hr className="rule rule-spaced" />
            <p className="lead">
              해야 할 일과 돌봐야 할 사람 사이에서, 우리는 자기 상태를 가장 나중에 확인합니다.
              몸이 보내는 신호는 대개 &lsquo;괜찮다&rsquo;는 말로 덮이고,
              감정은 &lsquo;스트레스&rsquo; 한 단어에 뭉쳐 담깁니다.
            </p>
            <p className="lead">
              그런데 몸은 이미 말하고 있었습니다. 긴장하면 얕아지고, 안심하면 길어지는 숨처럼 —
              가장 정직한 기록은 언제나 몸에 남습니다.
            </p>
            <p className="lead italic quiet">
              WITHIN은 그 기록을 읽는 법을 연습하는 곳입니다.
            </p>
          </div>
        </section>

        {/* ---------------- NOTICE / FEEL / CHANGE ---------------- */}
        <section className="tight">
          <div className="wrap-wide">
            <div className="center" style={{ marginBottom: 48 }}>
              <p className="eyebrow">notice · feel · change</p>
              <h2>감각을 알아차리는 작은 경험이</h2>
              <h2 className="quiet">삶을 바꾸는 시작이라고 믿습니다</h2>
            </div>
            <div className="steps">
              <div>
                <div className="n">N O T I C E</div>
                <h3>알아차리기</h3>
                <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
                  지금 내 몸 어디에서 무엇이 일어나는지, 판단 없이 지켜봅니다.
                </p>
              </div>
              <div>
                <div className="n">F E E L</div>
                <h3>느끼고 옮기기</h3>
                <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
                  뭉쳐 있던 느낌을 온도·무게·리듬처럼 구체적인 말로 나눕니다.
                </p>
              </div>
              <div>
                <div className="n">C H A N G E</div>
                <h3>고르고 바꾸기</h3>
                <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
                  읽을 수 있게 된 감각 위에서, 다음 행동을 스스로 고릅니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- OUR WAY · SVT ---------------- */}
        <section id="way" className="shade">
          <div className="wrap">
            <div className="center" style={{ marginBottom: 44 }}>
              <p className="eyebrow">our way</p>
              <h2>감각어휘 훈련</h2>
              <p className="small" style={{ marginTop: 10 }}>
                Somatic Vocabulary Training · SVT
              </p>
              <hr className="rule rule-spaced" />
              <p className="lead">
                알아차리고 → 표현하고 → 구분하고 → 연결합니다.
                <br />
                <span className="quiet">
                  &lsquo;그냥 스트레스 받아&rsquo;에서 &lsquo;가슴이 답답하고 호흡이 짧아졌어&rsquo;로.
                </span>
              </p>
            </div>
            <VocabTranslator />
            <p className="small center" style={{ marginTop: 26 }}>
              몸 감각을 읽는 8가지 차원과 7일 연습 계획은 무료 가이드에 담겨 있습니다.
            </p>
          </div>
        </section>

        {/* ---------------- 뇌과학 ---------------- */}
        <section id="science">
          <div className="wrap-wide">
            <div className="center" style={{ marginBottom: 48 }}>
              <p className="eyebrow">the science</p>
              <h2>왜 이 방법이 작동하는가</h2>
              <p className="lead quiet" style={{ marginTop: 20, maxWidth: 520, margin: '20px auto 0' }}>
                감각을 언어로 옮기는 일은 감성적인 취향이 아니라,
                뇌가 몸을 다루는 방식에 대한 연구 위에 서 있습니다.
              </p>
            </div>
            <div className="cards two">
              {SCIENCE.map((s) => (
                <article className="card" key={s.who}>
                  <div className="who">{s.who}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- 3분 체험 ---------------- */}
        <section id="practice" className="shade">
          <div className="wrap">
            <div className="center" style={{ marginBottom: 40 }}>
              <p className="eyebrow">action · 3 minutes</p>
              <h2>숨의 온도와 깊이 측정하기</h2>
              <p className="small" style={{ marginTop: 12 }}>
                지금 이 화면에서, 3분이면 됩니다
              </p>
            </div>

            <BreathTimer />

            <div style={{ marginTop: 44 }}>
              <p className="eyebrow center">insight · 나에게로 돌아오는 문장</p>
              <div className="journal">
                오늘 내 숨은 &nbsp;[ 얕았다 · 깊었다 · 급했다 · 고요했다 ]
                <br />
                더 편안했던 쪽은 &nbsp;[ 들숨 · 날숨 ]
                <br />
                지금 내가 받아들이기 벅찬 것, 혹은 놓아주기 주저하는 것은 &nbsp;[ &nbsp;&nbsp;&nbsp; ]
              </div>
              <p className="small center" style={{ marginTop: 22 }}>
                정답은 없습니다. 오늘의 숨은 오늘만의 모양이니까요.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- 무료 전자책 ---------------- */}
        <section id="ebook">
          <div className="wrap center">
            <p className="eyebrow">free guide</p>
            <h2>《몸은 이미 말하고 있다》</h2>
            <p className="small" style={{ marginTop: 12 }}>
              감각어휘 입문 가이드 · PDF
            </p>
            <hr className="rule rule-spaced" />
            <div
              style={{
                maxWidth: 380,
                margin: '0 auto 44px',
                textAlign: 'left',
                fontSize: 15,
                lineHeight: 2.2,
              }}
            >
              <div>✓&nbsp;&nbsp;몸과 감정의 차이</div>
              <div>✓&nbsp;&nbsp;신체감각 8가지 차원</div>
              <div>✓&nbsp;&nbsp;Somatic Vocabulary 실습</div>
              <div>✓&nbsp;&nbsp;7-Day Somatic Practice</div>
            </div>
            <SignupForm variant="ebook" />
          </div>
        </section>

        {/* ---------------- 감각구독 뉴스레터 ---------------- */}
        <section id="newsletter" className="shade">
          <div className="wrap center">
            <p className="eyebrow">sensory letter</p>
            <h2>감각구독</h2>
            <hr className="rule rule-spaced" />
            <p className="lead">
              매월 하나의 감각 키워드를 깊이 파고드는 편지.
              <br />
              <span className="quiet">
                읽는 글에서 끝나지 않고, 그날 바로 몸으로 해볼 수 있는 미션까지.
              </span>
            </p>

            <div
              style={{
                border: '1px solid var(--rule-strong)',
                borderRadius: 2,
                padding: '30px 26px',
                maxWidth: 420,
                margin: '40px auto 44px',
              }}
            >
              <div className="tiny" style={{ letterSpacing: '0.2em' }}>
                VOL. 01
              </div>
              <h3 style={{ margin: '10px 0 8px', fontSize: 21 }}>호흡의 바운더리</h3>
              <p className="small" style={{ marginBottom: 18 }}>
                키워드 01 · 들숨과 날숨
              </p>
              <p className="small italic" style={{ marginBottom: 0 }}>
                &ldquo;들숨과 날숨 사이 — 당신의 경계는 어디에 있나요.&rdquo;
              </p>
            </div>

            <SignupForm variant="newsletter" />
          </div>
        </section>

        {/* ---------------- FOUNDER ---------------- */}
        <section className="tight">
          <div className="wrap center">
            <p className="eyebrow">founder</p>
            <h2>김진영</h2>
            <p className="small" style={{ marginTop: 14 }}>
              공학박사 · 교육자 · 정치 정책 경험 · 내면소통 전문가
            </p>
            <hr className="rule rule-spaced" />
            <p className="lead">
              공학적 사고와 교육, 사회와 인간에 대한 경험을 바탕으로
              몸의 감각과 언어의 관계를 탐구합니다.
            </p>
            <p className="lead italic quiet">
              배우며 나눕니다 — 감각을 언어로.
            </p>
          </div>
        </section>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer>
        <div className="wrap">
          <p className="wordmark" style={{ fontSize: 14, letterSpacing: '0.2em' }}>
            WITHIN
          </p>
          <p className="small italic" style={{ margin: '8px 0 0' }}>
            다시, 나를 만나다.
          </p>

          <div className="links">
            <a href="https://withinlab.carrd.co" target="_blank" rel="noreferrer">
              홈페이지
            </a>
            <a href="https://within.stibee.com" target="_blank" rel="noreferrer">
              지난 뉴스레터
            </a>
            <a href="https://www.youtube.com/@WiTHIN-o1o" target="_blank" rel="noreferrer">
              YouTube
            </a>
            <a href="https://www.instagram.com/within.gyeol" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="/privacy">개인정보 처리방침</a>
          </div>

          <p className="tiny">
            FairBiz Inc.
            <br />
            <a href="mailto:hello@within.me.kr" style={{ color: 'var(--light)', textDecoration: 'underline' }}>
              hello@within.me.kr
            </a>
            <br />
            부산 해운대구 센텀중앙로 97
          </p>

          <p className="tiny" style={{ marginTop: 20, marginBottom: 0 }}>
            WITHIN의 감각어휘 훈련은 자기 이해를 돕는 교육 프로그램이며,
            <br />
            의료적 진단이나 치료를 대신하지 않습니다.
          </p>
        </div>
      </footer>
    </>
  );
}
