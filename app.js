'use strict';

const APP_VERSION = '1.2.1';
const STORE_KEY = 'quoteCompare.quotes.v1';
const CHECK_KEY = 'quoteCompare.checks.v1';
const SEED_KEY = 'quoteCompare.seed';      // 기본 견적을 어디까지 넣었는지 (지운 견적이 다시 생기지 않도록)
const BASIS_KEY = 'quoteCompare.basis.v1'; // 동일기준 비교 설정
const SEED_VERSION = 3;   // 3: 받은 견적서 사진 10장 기준으로 데이터 재정의

/* ======================================================================
 * 원본 견적서(2026-10-25) 3장에서 옮겨 온 기본 데이터
 * original: 견적서에 인쇄된 값 — 앱 계산값과 대조(검산)하는 데 사용
 * ==================================================================== */
const COMMON = {
  model: '투싼 NX5 런칭 가솔린 1.6 터보 2WD A/T',
  extColor: '에코트로닉 그레이펄',
  delivery: 343000, deliveryRegion: '경기/부천시(시흥)',
  discount: 0, point: 0, taxAdj: 0,
  deposit: 100000, insurance: 1900, evSubsidy: 0,   // 계약금·의무보험료는 고정
  rate: 4.2, months: 60,
  acqRate: 7, bond: 0, bondRegion: '경기도', plate: 43000, stamp: 2000, agentFee: 30000,
  dealer: '역곡역 카마스터', quoteNo: '', memo: '',
  tint: '', blackbox: '', ppf: '', glassCoat: false, waterCoat: false,   // 옵션(용품·서비스)
  method: 'annuity',             // 상환방식: annuity 원리금균등 | principal 원금균등
  loanName: '자동차할부(참고용)', cashback: 0,   // 할부 상품명, 카드 캐시백 등 혜택
  manual: {},   // 견적서 값을 직접 입력한 항목 { monthly|interest|acqTax: { value, key } }
};
const FIXED = { deposit: 100000, insurance: 1900 };

function sampleQuotes() {
  return [
    {
      ...COMMON, id: 's1', title: '역곡역 · 기본', quoteDate: '2026-10-25 16:04',
      trim: '인스퍼레이션', code: 'GXJJ5TPT1 A01 PE2/SOS', intColor: '블랙/샌드베이지 투톤',
      basePrice: 37900000, purePrice: 37900000, optionText: '', principal: 15800000, handover: 22343000, doc: { interest: 1744555 },
      original: { totalSale: 38243000, monthly: 292409, interest: 1744555, acqTax: 2433640, regTotal: 2508640, pay1: 22444900, pay2: 24953540 },
    },
    {
      ...COMMON, id: 's2', title: '역곡역 · 빌트인캠', quoteDate: '2026-10-25 16:13',
      trim: '인스퍼레이션', code: 'GXJJ5TPT1 A17 PE2/ISB', intColor: '브라운',
      basePrice: 37900000, purePrice: 38550000, optionText: '빌트인캠2플러스(65만)', principal: 16500000, handover: 22293000, doc: { interest: 1821845 },
      original: { totalSale: 38893000, monthly: 305364, interest: 1821845, acqTax: 2475000, regTotal: 2550000, pay1: 22394900, pay2: 24944900 },
    },
    {
      ...COMMON, id: 's3', title: '역곡역 · 익스클루시브', quoteDate: '2026-10-25 14:27',
      trim: '익스클루시브', code: 'GXJJ5TET1 AA1 PE2/SOS', intColor: '블랙/샌드베이지 투톤',
      basePrice: 35300000, purePrice: 36250000, optionText: '커넥트플러스(95만)', principal: 14000000, handover: 22493000, doc: { interest: 1545808 },
      original: { totalSale: 36593000, monthly: 259096, interest: 1545808, acqTax: 2328640, regTotal: 2403640, pay1: 22594900, pay2: 24998540 },
    },
  ];
}

// 2026-10-26~27에 추가로 받은 견적 7건 (doc: 견적서 금액 → 직접 입력값으로 넣음)
const NX5_TEXT = 'The all new 투싼(NX5) 가솔린 1.6T 터보 2WD 인스퍼레이션 (A/T 런칭)';
function seedQuotesV2() {
  const base = { ...COMMON, trim: '인스퍼레이션', basePrice: 37900000, purePrice: 37900000, optionText: '', dealer: '', quoteNo: '', code: '' };
  return [
    {
      ...base, id: 'n1', title: '탄현 (4.1%)', quoteDate: '2026-10-27 14:14',
      code: 'GXJJ5TPT1 A01 PE2/ISB', intColor: '브라운', delivery: 360000, deliveryRegion: '서울/서울특별시(시흥)', point: 300000,
      principal: 15400000, handover: 22460000, rate: 4.1, plate: 30000, stamp: 2000, agentFee: 15000,
      dealer: '탄현 카마스터',
      memo: '포인트 30만원(세이브오토) 반영 · 세금계산서 반영금액 38,110,000원',
      doc: { monthly: 284309, interest: 1658595, acqTax: 2425180 },
      original: { totalSale: 37960000, monthly: 284309, interest: 1658595, acqTax: 2425180, regTotal: 2472180, pay1: 22561900, pay2: 25034080 },
    },
    {
      ...base, id: 'n2', title: '담당 미표기 (원금균등)', quoteDate: '2026-10-26', model: NX5_TEXT,
      extColor: '에코트로닉 그레이 펄(PE2)', intColor: '블랙/인레이 소일 브라운 패키지(ISB)', delivery: 373000, deliveryRegion: '경기 고양시 / 시흥',
      principal: 15700000, handover: 22473000, rate: 4.4, method: 'principal', loanName: '원금균등상환',
      plate: 40000, stamp: 2000, agentFee: 40000,
      memo: '월 납입금 290,929원은 원금균등 평균 · 이 양식의 "총 소요 비용"은 등록비 포함 납입금(Ⅱ)과 같은 뜻 · 자동차세 연 290,830원',
      doc: { monthly: 290929 },
      original: { totalSale: 38273000, monthly: 290929, acqTax: 2435550, regTotal: 2517550, pay1: 22574900, pay2: 25092450 },
    },
    {
      ...base, id: 'n3', title: '고덕 (5.6%)', quoteDate: '2026-10-26', model: NX5_TEXT,
      extColor: '에코트로닉 그레이 펄(PE2)', intColor: '블랙/인레이 소일 브라운 패키지(ISB)', delivery: 360000, deliveryRegion: '',
      principal: 15900000, handover: 22260000, rate: 5.6, loanName: '표준형 모빌리티',
      plate: 35000, stamp: 2000, agentFee: 55000, dealer: '고덕대리점',
      doc: { monthly: 304443 },
      original: { totalSale: 38260000, monthly: 304443, acqTax: 2434720, regTotal: 2526720, pay1: 22361900, pay2: 24888620 },
    },
    {
      ...base, id: 'n4', title: '하나카드 오토할부 (캐시백)', quoteDate: '2026-10-26',
      model: '디 올 뉴 투싼 2027년형 가솔린 1.6 터보 인스퍼레이션 2WD',
      extColor: '에코트로닉 그레이 펄(PE2)', intColor: '블랙/인레이 소일 브라운 패키지', delivery: 373000, deliveryRegion: '경기 고양시 (시흥 출고장)',
      principal: 15800000, handover: 22373000, rate: 4.4, method: 'principal', loanName: '하나카드 오토할부 (원금균등)',
      plate: 0, stamp: 0, agentFee: 87000, cashback: 313220,
      memo: '대행료 칸 87,000원 = 인지대·번호판·대행료 등 합계 · 할부·인도금 카드 결제 · 월 1회차 321,266원 ~ 60회차 264,319원 · 캐시백 313,220원(인도금의 약 1.4%)',
      doc: { monthly: 292793 },
      original: { totalSale: 38273000, monthly: 292793, acqTax: 2435550, regTotal: 2522550, pay1: 22474900, pay2: 24997450 },
    },
    {
      ...base, id: 'n5', title: '외대역', quoteDate: '2026-10-26 11:39',
      code: 'GXJJ5TPT1 A01 PE2/ISB', intColor: '브라운', delivery: 360000, deliveryRegion: '서울/서울특별시(신갈)', point: 300000,
      principal: 15000000, handover: 22860000, rate: 4.4, plate: 30000, stamp: 2000, agentFee: 35000,
      dealer: '외대역 카마스터',
      memo: '포인트 30만원(세이브오토) 반영 · 세금계산서 반영금액 38,110,000원',
      doc: { monthly: 278963, interest: 1737824, acqTax: 2425180 },
      original: { totalSale: 37960000, monthly: 278963, interest: 1737824, acqTax: 2425180, regTotal: 2492180, pay1: 22961900, pay2: 25454080 },
    },
    {
      ...base, id: 'n6', title: '남사', quoteDate: '2026-10-26 11:15',
      code: 'GXJJ5TPT1 A01 PE2/ISB', intColor: '브라운', delivery: 373000, deliveryRegion: '경기/고양시(시흥)',
      principal: 15700000, handover: 22473000, rate: 4.4, plate: 45000, stamp: 2000, agentFee: 30000,
      dealer: '남사 카마스터',
      doc: { monthly: 291982, interest: 1818922 },
      original: { totalSale: 38273000, monthly: 291982, interest: 1818922, acqTax: 2435550, regTotal: 2512550, pay1: 22574900, pay2: 25087450 },
    },
    {
      ...base, id: 'n7', title: '운정 (화이트)', quoteDate: '2026-10-26', model: NX5_TEXT,
      purePrice: 38000000, optionText: '세레니티 화이트 펄 외장컬러(10만)',
      extColor: '세레니티 화이트 펄(W6H)', intColor: '블랙 모노톤(NNB)', delivery: 373000, deliveryRegion: '', point: 300000,
      principal: 15600000, handover: 22373000, rate: 4.4, loanName: '표준형',
      plate: 38000, stamp: 2000, agentFee: 30000, dealer: '운정지점',
      memo: '할인 30만원 = 현대카드 Save Auto(세이브오토)',
      doc: { monthly: 290122, acqTax: 2432370 },
      original: { totalSale: 38073000, monthly: 290122, acqTax: 2432370, regTotal: 2502370, pay1: 22474900, pay2: 24977270 },
    },
  ];
}

// 받은 견적서 사진 10장 = 앱의 기본 견적 (사진은 quotes/<id>.jpg, 개인정보 가림)
function canonicalQuotes() {
  return [...sampleQuotes(), ...seedQuotesV2()].map((q) => migrate({ ...q, photos: [`quotes/${q.id}.jpg`] }));
}

function blankQuote() {
  return {
    ...COMMON, id: 'q' + Date.now().toString(36), title: '새 견적', quoteDate: today(),
    model: '', trim: '', code: '', extColor: '', intColor: '', dealer: '', quoteNo: '',
    delivery: 0, deliveryRegion: '', basePrice: 0, purePrice: 0, optionText: '', principal: 0, handover: 0, original: null, manual: {},
  };
}

// 개인정보 보관 안 함: 예전 버전이 기기에 저장해 둔 담당자 이름 들어간 제목·담당을 지점명으로 바꾸고 견적번호를 지움.
// 예전 문자열은 원문 대신 해시로만 알아봄 (코드에도 이름을 남기지 않기 위해)
const hashStr = (str) => {
  let h = 5381;
  for (const ch of String(str)) h = ((h * 33) ^ ch.codePointAt(0)) >>> 0;
  return h.toString(36);
};
const OLD_PERSONAL = new Set(['g3qs5n', '1ph5sxb', '1gqv7ge', '1kwcq3j', '1m5ohst', '1f0gq95', '10uy0ys', '5l4drx',
  '1e0z5ez', '1kw0o5r', '2j5ore', 'b2md9y', 'zd6kcb', '1xc8d9i', '1cu7jr2', '1egpje4', '1uyhnv6']);
let scrubBase = null;
function scrubPersonal(m) {
  scrubBase ??= Object.fromEntries([...sampleQuotes(), ...seedQuotesV2()].map((x) => [x.id, x]));
  const base = scrubBase[m.id];
  if (base && OLD_PERSONAL.has(hashStr(m.title))) m.title = base.title;
  if (base && OLD_PERSONAL.has(hashStr(m.dealer))) m.dealer = base.dealer;
  if (/^S\d{14}$/.test(String(m.quoteNo || '').trim())) m.quoteNo = '';
}

// 이전 버전 데이터(선택 품목 목록·파츠·색상 금액)를 순수차량가격 방식으로 옮김
function migrate(q) {
  const m = { ...COMMON, original: null, ...q, ...FIXED };
  if (m.purePrice == null) {
    const opts = (q.options || []).filter((o) => o.name || o.price);
    m.purePrice = (q.basePrice || 0) + opts.reduce((s, o) => s + (+o.price || 0), 0) + (q.partsPrice || 0) + (q.colorPrice || 0);
    m.optionText = opts.map((o) => `${o.name || '옵션'}(${Math.round((+o.price || 0) / 10000)}만)`).join(', ');
  }
  delete m.options; delete m.partsPrice; delete m.colorPrice;
  if (m.handover == null) {
    const totalSale = m.purePrice + m.delivery - m.discount - m.point - m.taxAdj;
    m.handover = Math.max(0, totalSale - m.principal - m.deposit - m.evSubsidy);
  }
  m.manual = { ...(q.manual || {}) };   // 견적마다 따로 (COMMON의 객체를 같이 쓰지 않게)
  scrubPersonal(m);
  m.photos = [...(q.photos || [])];
  m.userPhotos = [...(q.userPhotos || [])];
  // 견적서 인쇄값(doc)은 직접 입력값으로 저장 → 앱 자동 계산과 다르면 견적서 값을 씀
  if (m.doc) {
    const totalSale = m.purePrice + m.delivery - m.discount - m.point - m.taxAdj;
    for (const [f, value] of Object.entries(m.doc)) {
      m.manual[f] = { value, key: f === 'acqTax' ? taxKey(m, totalSale) : loanKey(m) };
    }
    delete m.doc;
  }
  return m;
}

/* ---------- 저장소 (브라우저 저장 실패 시에도 앱은 동작) ---------- */
function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch { return fallback; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장 불가(사생활 모드 등) */ }
}

let quotes = loadJSON(STORE_KEY, null);
if (Array.isArray(quotes) && (loadJSON(SEED_KEY, 1) || 1) >= SEED_VERSION) {
  quotes = quotes.map(migrate);
} else {
  // 처음 실행, 또는 v3 이전 데이터: 요청에 따라 기존 견적·기준 설정·체크리스트를 지우고 받은 견적서 기준으로 새로 시작
  quotes = canonicalQuotes();
  saveJSON(STORE_KEY, quotes);
  try { localStorage.removeItem(BASIS_KEY); localStorage.removeItem(CHECK_KEY); } catch { /* 무시 */ }
}
saveJSON(SEED_KEY, SEED_VERSION);
let checks = loadJSON(CHECK_KEY, {});
let saveTimer = 0;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveJSON(STORE_KEY, quotes), 250);
}

/* ======================================================================
 * 계산 — 원본 견적서 3장으로 검증한 산식
 * ==================================================================== */
function amortize(P, ratePct, n, method = 'annuity') {
  if (!(P > 0) || !(n > 0)) return { monthly: 0, interest: 0, rows: [], first: 0, last: 0 };
  const r = ratePct / 100 / 12;
  if (method === 'principal') {
    // 원금균등상환: 매달 원금은 같고 이자는 잔액에 비례 → 납입금이 점점 줄어듦 (월 납입금은 평균)
    const base = Math.floor(P / n);
    let bal = P, interest = 0;
    const rows = [];
    for (let k = 1; k <= n; k++) {
      const i = Math.round(bal * r);
      const prin = k === n ? bal : base;
      bal -= prin;
      interest += i;
      rows.push({ k, pay: prin + i, prin, i, bal });
    }
    return { monthly: Math.round((P + interest) / n), interest, rows, first: rows[0].pay, last: rows[n - 1].pay };
  }
  // 원리금균등상환, 월 납입금은 원 미만 절사 (견적서와 일치)
  const monthly = r > 0 ? Math.floor(P * r * (1 + r) ** n / ((1 + r) ** n - 1)) : Math.floor(P / n);
  let bal = P, interest = 0;
  const rows = [];
  for (let k = 1; k <= n; k++) {
    const i = Math.round(bal * r);
    const prin = k === n ? bal : monthly - i;   // 마지막 회차에서 끝전 정산
    bal -= prin;
    interest += i;
    rows.push({ k, pay: prin + i, prin, i, bal });
  }
  return { monthly, interest, rows, first: monthly, last: rows[n - 1].pay };
}

// 직접 입력값은 그 값을 넣을 때의 기준(할부원금·금리·기간 / 총 판매금액·세율)이 그대로일 때만 사용
function loanKey(q) {
  return `${q.principal}|${q.rate}|${q.months}` + (q.method === 'principal' ? '|principal' : '');
}
function taxKey(q, totalSale) {
  return `${totalSale}|${q.acqRate}`;
}
function manualValue(q, f, key) {
  const m = q.manual?.[f];
  return m && m.key === key ? m.value : null;
}

function calc(q) {
  const pure = q.purePrice;
  const optionsSum = pure - q.basePrice;                                // 선택사양가격
  const reduce = q.discount + q.point + q.taxAdj;
  const totalSale = pure + q.delivery - reduce;
  // 취득세 = (탁송료 포함 총 판매금액 ÷ 1.1) × 세율, 10원 미만 절사
  const autoTax = Math.max(0, Math.floor(totalSale * 10 / 11 * q.acqRate / 100 / 10) * 10);
  const acqTax = manualValue(q, 'acqTax', taxKey(q, totalSale)) ?? autoTax;
  const regTotal = acqTax + q.bond + q.plate + q.stamp + q.agentFee;
  const auto = amortize(q.principal, q.rate, q.months, q.method);
  const lk = loanKey(q);
  const loan = {
    ...auto,
    monthly: manualValue(q, 'monthly', lk) ?? auto.monthly,
    interest: manualValue(q, 'interest', lk) ?? auto.interest,
  };
  const handover = q.handover;                                          // 인도금 (입력값, 할부와 연동하지 않음)
  const gap = q.deposit + handover + q.principal + q.evSubsidy - totalSale;   // 0이면 금액이 맞음
  const pay1 = q.deposit + handover + q.insurance;                      // Ⅰ. 출고전 납입
  const pay2 = pay1 + regTotal;                                         // Ⅱ. 등록비 포함 납입
  const tco = pay2 + q.principal + loan.interest;                       // 선납 + 할부 상환 총액
  return { optionsSum, pure, reduce, totalSale, acqTax, regTotal, loan, handover, gap, pay1, pay2, tco,
    auto: { acqTax: autoTax, monthly: auto.monthly, interest: auto.interest } };
}

// Ⅱ(등록비 포함 납입)가 목표액 이하가 되도록 할부원금을 10만원 단위로 올림
function principalForTarget(q, target) {
  const c = calc(q);
  const need = c.totalSale - q.evSubsidy + q.insurance + c.regTotal - target;
  return Math.max(0, Math.ceil(need / 100000) * 100000);
}

/* ---------- 표시 형식 ---------- */
const nf = new Intl.NumberFormat('ko-KR');
const fmt = (n) => nf.format(Math.round(+n || 0));
const won = (n) => fmt(n) + '원';
const man = (n) => {
  const v = Math.round(n / 1000) / 10;
  return nf.format(v) + '만원';
};
const signed = (n, f = won) => (n > 0 ? '+' : n < 0 ? '−' : '±') + f(Math.abs(n));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const optText = (q) => q.optionText?.trim() || '없음';
function today() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ======================================================================
 * 화면 상태
 * ==================================================================== */
const ui = {
  tab: 'list',
  sel: quotes[0]?.id ?? null,
  detailOpen: false,
  cmpIds: null,        // null = 전체 선택
  cmpView: 'price',    // 'price' | 'extras'
  baseId: null,
  schedOpen: false,
};
const wideMQ = matchMedia('(min-width: 1000px)');
const view = document.getElementById('view');
const byId = (id) => quotes.find((q) => q.id === id);

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function render() {
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === ui.tab));
  const titles = { list: '차량 견적 비교', compare: '견적 비교표', basis: '동일 기준 비교', analysis: '견적 분석', settings: '설정 · 설치' };
  document.getElementById('pageTitle').textContent = titles[ui.tab];
  if (ui.tab === 'list') view.innerHTML = renderListTab();
  else if (ui.tab === 'compare') view.innerHTML = renderCompare();
  else if (ui.tab === 'basis') view.innerHTML = renderBasis();
  else if (ui.tab === 'analysis') view.innerHTML = renderAnalysis();
  else view.innerHTML = renderSettings();
  updateDerived();
  const d = view.querySelector('.detail');
  if (d) fillPhotoCard(byId(d.dataset.qid));
}

/* ---------- 견적 목록 + 상세 ---------- */
function quoteCard(q) {
  const c = calc(q);
  const best = bestTcoId();
  return `<div class="card qcard ${q.id === ui.sel && wideMQ.matches ? 'sel' : ''}" data-act="open" data-id="${q.id}" role="button" tabindex="0">
    ${best === q.id && quotes.length > 1 ? '<span class="badge good tag">최저 총비용</span>' : ''}
    <p class="qtitle">${esc(q.title)}</p>
    <div class="qsub">${esc(q.trim)}${q.trim ? ' · ' : ''}${esc(q.extColor)}${q.intColor ? ' / ' + esc(q.intColor) : ''}<br>${esc(q.quoteDate)}</div>
    <div class="qgrid">
      <div><span>총 판매금액</span><b>${man(c.totalSale)}</b></div>
      <div><span>월 납입금 (${q.months}개월)</span><b>${won(c.loan.monthly)}</b></div>
      <div><span>등록비 포함 납입</span><b>${man(c.pay2)}</b></div>
      <div><span>총 소요비용</span><b>${man(c.tco)}</b></div>
    </div>
  </div>`;
}

function bestTcoId() {
  let best = null, min = Infinity;
  for (const q of quotes) {
    const t = calc(q).tco;
    if (t < min) { min = t; best = q.id; }
  }
  return best;
}

function renderListCol() {
  return `<div class="sec-title"><h2>견적 ${quotes.length}건</h2>
      <button class="btn small primary" data-act="add">＋ 새 견적</button></div>
    <div class="list-grid">${quotes.map(quoteCard).join('') || '<div class="empty">견적이 없습니다. ＋ 새 견적을 눌러 추가하세요.</div>'}</div>`;
}

function renderListTab() {
  const q = byId(ui.sel);
  if (wideMQ.matches) {
    return `<div class="split"><div class="list-col" id="listCol">${renderListCol()}</div>
      <div>${q ? renderDetail(q) : '<div class="card empty">왼쪽에서 견적을 선택하세요.</div>'}</div></div>`;
  }
  if (ui.detailOpen && q) return renderDetail(q);
  return renderListCol();
}

const hintSpan = (k, hint) => `<span class="hint" id="h-${k}">${hint}</span>`;
const field = {
  money: (q, k, label, hint = '') => `<div class="field"><label for="f-${k}">${label}</label>
    <div class="unit-wrap"><input id="f-${k}" class="inp num" inputmode="numeric" autocomplete="off" data-k="${k}" data-type="money" value="${fmt(q[k])}"><em>원</em></div>
    ${hintSpan(k, hint)}</div>`,
  num: (q, k, label, unit, type) => `<div class="field"><label for="f-${k}">${label}</label>
    <div class="unit-wrap"><input id="f-${k}" class="inp num" inputmode="${type === 'int' ? 'numeric' : 'decimal'}" autocomplete="off" data-k="${k}" data-type="${type}" value="${esc(q[k])}"><em>${unit}</em></div></div>`,
  text: (q, k, label, full = false, ph = '') => `<div class="field ${full ? 'full' : ''}"><label for="f-${k}">${label}</label>
    <input id="f-${k}" class="inp" autocomplete="off" data-k="${k}" data-type="text" value="${esc(q[k])}" placeholder="${esc(ph)}"></div>`,
  // 있음/없음 선택
  bool: (q, k, label) => `<div class="field"><label>${label}</label>
    <div class="seg" role="group" aria-label="${label}">
      <button type="button" class="${q[k] ? 'on' : ''}" data-act="extra-bool" data-f="${k}" data-v="1" aria-pressed="${!!q[k]}">있음</button>
      <button type="button" class="${q[k] ? '' : 'on'}" data-act="extra-bool" data-f="${k}" data-v="0" aria-pressed="${!q[k]}">없음</button>
    </div></div>`,
  // 여러 값 중 하나 선택
  choice: (q, k, label, opts) => `<div class="field"><label>${label}</label>
    <div class="seg" role="group" aria-label="${label}">${opts.map(([v, t]) =>
      `<button type="button" class="${q[k] === v ? 'on' : ''}" data-act="set-choice" data-f="${k}" data-v="${v}" aria-pressed="${q[k] === v}">${t}</button>`).join('')}</div></div>`,
  // 고정값: 입력 불가
  fixed: (label, value) => `<div class="field"><label>${label}</label>
    <div class="unit-wrap"><input class="inp num fixed" value="${fmt(value)}" readonly tabindex="-1" aria-label="${label} (고정)"><em>원</em></div>
    <span class="hint">고정</span></div>`,
  // 자동 계산되지만 견적서 값을 직접 입력할 수도 있는 칸 (월 납입금·이자총액·취득세)
  manual: (k, label, value) => `<div class="field"><label for="f-${k}">${label}</label>
    <div class="unit-wrap"><input id="f-${k}" class="inp num" inputmode="numeric" autocomplete="off" data-k="${k}" data-type="manual" value="${fmt(value)}"><em>원</em></div>
    <span class="hint" id="h-${k}"></span></div>`,
  // 계산 결과 표시 (입력 아님)
  out: (k, label) => `<div class="field"><label>${label}</label><div class="out-val" id="o-${k}"></div></div>`,
};

function renderDetail(q) {
  const back = wideMQ.matches ? '' : '<button class="btn small ghost" data-act="back" aria-label="목록으로">← 목록</button>';
  const c = calc(q);
  return `<section class="detail" data-qid="${q.id}">
    <div class="detail-head">${back}<h2 id="dTitle">${esc(q.title)}</h2>
      <div class="btn-row">
        <button class="btn small" data-act="share">공유</button>
        <button class="btn small" data-act="dup">복제</button>
        <button class="btn small danger" data-act="del">삭제</button>
      </div></div>
    <div class="card"><div class="kpis" id="dKpis"></div></div>
    ${photoCardHTML(q)}
    <div class="detail-grid">
      <div>
        <div class="card"><h3><span class="step">1</span>가격사항</h3><div class="form-grid">
          ${field.money(q, 'basePrice', '차량기본가격')}
          ${field.money(q, 'purePrice', '① 순수차량가격')}
          ${field.money(q, 'delivery', '② 탁송료', esc(q.deliveryRegion))}
          ${field.out('totalSale', '총 판매금액 (①+②−③)')}
        </div></div>

        <div class="card"><h3><span class="step">2</span>지불조건</h3><div class="form-grid">
          ${field.fixed('계약금', FIXED.deposit)}
          ${field.fixed('의무보험료', FIXED.insurance)}
          ${field.money(q, 'handover', '인도금')}
          ${field.out('pay1', 'Ⅰ. 출고전 납입하실 금액')}
        </div></div>

        <div class="card"><h3><span class="step">3</span>지불방법 (할부)</h3><div class="form-grid">
          ${field.money(q, 'principal', '할부원금')}
          ${field.manual('interest', '이자총액', c.loan.interest)}
          ${field.manual('monthly', '월 납입금', c.loan.monthly)}
          <div class="field"><label for="f-rate">금리 / 기간</label>
            <div class="pair">
              <div class="unit-wrap"><input id="f-rate" class="inp num" inputmode="decimal" autocomplete="off" data-k="rate" data-type="pct" value="${esc(q.rate)}" aria-label="금리"><em>%</em></div>
              <div class="unit-wrap"><input id="f-months" class="inp num" inputmode="numeric" autocomplete="off" data-k="months" data-type="int" value="${esc(q.months)}" aria-label="기간"><em>개월</em></div>
            </div></div>
          ${field.choice(q, 'method', '상환방식', [['annuity', '원리금균등'], ['principal', '원금균등']])}
          ${field.text(q, 'loanName', '할부 상품', false, '예: 자동차할부, 하나카드 오토할부')}
        </div>
        <div class="helper"><b>선납 목표액 참고</b>
          <div class="small muted">목표액에 맞추려면 할부원금이 얼마여야 하는지 보여 주기만 합니다. 입력값과 계산에는 반영되지 않습니다.</div>
          <div class="row"><div class="unit-wrap"><input id="targetPay" class="inp num" inputmode="numeric" value="25,000,000" aria-label="선납 목표액"><em>원</em></div></div>
          <div class="small" id="targetHint" style="margin-top:6px"></div>
        </div></div>

        <div class="card"><h3><span class="step">4</span>등록비용</h3><div class="form-grid">
          ${field.manual('acqTax', '취득세', c.acqTax)}
          ${field.money(q, 'plate', '번호판')}
          ${field.money(q, 'stamp', '증지대')}
          ${field.money(q, 'agentFee', '대행료')}
          ${field.out('regTotal', '등록비용 계')}
          ${field.out('pay2', 'Ⅱ. 등록비용포함 납입하실 금액')}
        </div></div>

        <div class="card"><h3><span class="step">5</span>옵션 (용품 · 서비스)</h3><div class="form-grid">
          ${field.text(q, 'tint', '썬팅', false, '제품명 · 농도 등 (없으면 비워 두기)')}
          ${field.text(q, 'blackbox', '블랙박스', false, '제품명 · 채널 등')}
          ${field.text(q, 'ppf', 'PPF 종류', true, '예: 생활보호 패키지, 전체 시공')}
          ${field.bool(q, 'glassCoat', '유리막코팅')}
          ${field.bool(q, 'waterCoat', '발수코팅')}
        </div></div>

        <details class="card"><summary>차량 정보 (트림 · 선택 품목 · 색상)</summary><div class="form-grid">
          ${field.text(q, 'title', '견적 이름', true)}
          ${field.text(q, 'model', '기본 품목(모델)', true)}
          ${field.text(q, 'trim', '트림')}
          ${field.text(q, 'optionText', '선택 품목')}
          ${field.text(q, 'extColor', '외장 색상')}
          ${field.text(q, 'intColor', '내장 색상')}
          ${field.text(q, 'code', '차량 코드')}
          ${field.text(q, 'quoteDate', '견적 일시')}
          ${field.text(q, 'quoteNo', '견적 번호')}
          ${field.text(q, 'dealer', '담당')}
        </div></details>

        <details class="card"><summary>기타 (할인 · 공채 · 세율 등, 보통 0원)</summary><div class="form-grid">
          ${field.money(q, 'discount', '③ 할인')}
          ${field.money(q, 'point', '포인트 (세이브오토 등)', '카드 포인트로 나중에 갚는 선할인')}
          ${field.money(q, 'cashback', '카드 캐시백 · 기타 혜택', '동일 기준 비교에서 비용에서 뺍니다')}
          ${field.money(q, 'taxAdj', '세금증감', '감액이면 양수로 입력')}
          ${field.money(q, 'evSubsidy', '전동차 지원금')}
          ${field.money(q, 'bond', `공채매입/할인 (${esc(q.bondRegion)})`)}
          ${field.num(q, 'acqRate', '취득세율', '%', 'pct')}
        </div></details>

        <div class="card"><h3>메모</h3>
          <textarea class="inp" data-k="memo" data-type="text" placeholder="상담 내용, 추가 조건 등">${esc(q.memo)}</textarea></div>
      </div>

      <div class="res">
        <div class="card"><h3>계산 내역</h3><div id="dCalc"></div></div>
        <div id="dVerify"></div>
        <details class="card" id="schedBox" ${ui.schedOpen ? 'open' : ''}><summary>월별 상환 스케줄</summary><div id="dSched"></div></details>
      </div>
    </div>
  </section>`;
}

function kpisHTML(q, c) {
  return `<div class="kpi"><span>총 판매금액</span><b>${won(c.totalSale)}</b><small>세금계산서 반영금액</small></div>
    <div class="kpi"><span>월 납입금${q.method === 'principal' ? ' (평균)' : ''}</span><b>${won(c.loan.monthly)}</b><small>${q.rate}% · ${q.months}개월${q.method === 'principal' ? ` · 원금균등<br>첫 회 ${won(c.loan.first)} → 마지막 ${won(c.loan.last)}` : ''}</small></div>
    <div class="kpi"><span>Ⅰ. 출고전 납입</span><b>${won(c.pay1)}</b><small>계약금+인도금+보험료</small></div>
    <div class="kpi hl"><span>Ⅱ. 등록비 포함 납입</span><b>${won(c.pay2)}</b><small>현금으로 필요한 돈</small></div>
    <div class="kpi"><span>총 소요비용</span><b>${won(c.tco)}</b><small>선납 + 할부 상환 총액</small></div>`;
}

function calcHTML(q, c) {
  const L = (label, val, cls = '') => `<div class="calc-line ${cls}"><span>${label}</span><b class="num">${val}</b></div>`;
  return [
    L('차량기본가격', won(q.basePrice)),
    L('+ 선택사양가격', won(c.optionsSum)),
    L('① 순수차량가격', won(c.pure)),
    L('② + 탁송료', won(q.delivery)),
    L('③ − 할인 · 포인트 · 세금증감', won(c.reduce)),
    L('총 판매금액 (①+②−③)', won(c.totalSale), 'total'),
    L('계약금', won(q.deposit)),
    L('+ 인도금', won(c.handover)),
    L('+ 의무보험료', won(q.insurance)),
    L('Ⅰ. 출고전 납입하실 금액', won(c.pay1), 'total'),
    L(`취득세 (총 판매금액÷1.1×${q.acqRate}%, 10원 절사)`, won(c.acqTax)),
    L('공채 + 번호판 + 증지 + 대행료', won(q.bond + q.plate + q.stamp + q.agentFee)),
    L('등록비용 계', won(c.regTotal)),
    L('Ⅱ. 등록비 포함 납입하실 금액', won(c.pay2), 'total'),
    L(`할부 상환 총액 (원금 ${won(q.principal)} + 이자 ${won(c.loan.interest)})`, won(q.principal + c.loan.interest)),
    L('총 소요비용 (Ⅱ + 할부 상환)', won(c.tco), 'total'),
  ].join('');
}

function verifyHTML(q, c) {
  const o = q.original;
  if (!o) return '';
  const items = [
    ['총 판매금액', c.totalSale, o.totalSale],
    ['월 납입금', c.loan.monthly, o.monthly],
    ['이자총액', c.loan.interest, o.interest, 100],
    ['취득세', c.acqTax, o.acqTax],
    ['등록비용 계', c.regTotal, o.regTotal],
    ['Ⅰ. 출고전 납입', c.pay1, o.pay1],
    ['Ⅱ. 등록비 포함 납입', c.pay2, o.pay2],
  ];
  const rows = items.filter(([, , doc]) => doc != null).map(([label, mine, doc, tol = 0]) => {
    const d = mine - doc;
    const st = d === 0 ? '<span class="chk-ok">✓ 일치</span>'
      : Math.abs(d) <= tol ? `<span class="chk-ok">≈ ${signed(d)}</span>`
        : `<span class="chk-ng">✗ ${signed(d)}</span>`;
    return `<tr><th>${label}</th><td class="n">${fmt(doc)}</td><td class="n">${fmt(mine)}</td><td>${st}</td></tr>`;
  }).join('');
  return `<div class="card"><h3>원본 견적서 대조</h3>
    <div class="table-wrap"><table><thead><tr><th>항목</th><th class="n">견적서</th><th class="n">앱 계산</th><th>결과</th></tr></thead>
    <tbody>${rows}</tbody></table></div>
    <p class="tiny muted" style="margin:8px 0 0">값을 바꾸면 견적서와의 차이가 표시됩니다. 이자총액은 캐피탈사 끝전 처리 방식에 따라 수 원 차이가 날 수 있습니다.</p></div>`;
}

function schedHTML(c) {
  if (!c.loan.rows.length) return '<p class="muted small">할부원금이 없습니다.</p>';
  const rows = c.loan.rows.map((r) => `<tr><td class="n">${r.k}</td><td class="n">${fmt(r.pay)}</td><td class="n">${fmt(r.prin)}</td><td class="n">${fmt(r.i)}</td><td class="n">${fmt(r.bal)}</td></tr>`).join('');
  return `<div class="table-wrap" style="max-height:420px"><table><thead><tr><th class="n">회차</th><th class="n">납입금</th><th class="n">원금</th><th class="n">이자</th><th class="n">잔액</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function updateDerived() {
  const box = view.querySelector('.detail');
  if (!box) return;
  const q = byId(box.dataset.qid);
  if (!q) return;
  const c = calc(q);
  box.querySelector('#dKpis').innerHTML = kpisHTML(q, c);
  box.querySelector('#dCalc').innerHTML = calcHTML(q, c);
  box.querySelector('#dVerify').innerHTML = verifyHTML(q, c);
  if (ui.schedOpen) box.querySelector('#dSched').innerHTML = schedHTML(c);
  updateTargetHint(q);
  // 서로 연동되는 칸 갱신 (입력 중인 칸은 건드리지 않음)
  const sync = [['f-purePrice', q.purePrice],
    ['f-monthly', c.loan.monthly], ['f-interest', c.loan.interest], ['f-acqTax', c.acqTax]];
  for (const [id, v] of sync) {
    const inp = document.getElementById(id);
    if (inp && inp !== document.activeElement) inp.value = fmt(v);
  }
  const out = { totalSale: c.totalSale, pay1: c.pay1, regTotal: c.regTotal, pay2: c.pay2 };
  for (const [k, v] of Object.entries(out)) {
    const el = document.getElementById('o-' + k);
    if (el) el.textContent = won(v);
  }
  const hh = document.getElementById('h-handover');
  if (hh) {
    hh.innerHTML = c.gap === 0
      ? '<span class="chk-ok">계약금 + 인도금 + 할부원금 = 총 판매금액 ✓</span>'
      : `<span class="chk-ng">계약금 + 인도금 + 할부원금이 총 판매금액보다 ${won(Math.abs(c.gap))} ${c.gap > 0 ? '많습니다' : '적습니다'}</span>`;
  }
  const hp = document.getElementById('h-purePrice');
  if (hp) hp.textContent = `선택사양가격 ${won(c.optionsSum)} (순수차량가격 − 기본가격)`;
  const keys = { monthly: loanKey(q), interest: loanKey(q), acqTax: taxKey(q, c.totalSale) };
  const vals = { monthly: c.loan.monthly, interest: c.loan.interest, acqTax: c.acqTax };
  for (const f of ['monthly', 'interest', 'acqTax']) {
    const el = document.getElementById('h-' + f);
    if (!el) continue;
    const a = c.auto[f];
    if (manualValue(q, f, keys[f]) == null) {
      el.innerHTML = '자동 계산 · 견적서 금액을 입력할 수 있습니다';
    } else {
      const d = vals[f] - a;
      el.innerHTML = `직접 입력 · 자동 계산 ${won(a)} ${d === 0 ? '<span class="chk-ok">일치 ✓</span>' : `<span class="${Math.abs(d) <= 100 ? 'chk-ok' : 'chk-ng'}">(차이 ${signed(d)})</span>`}
        <button type="button" class="linkbtn" data-act="auto" data-f="${f}">자동으로</button>`;
    }
  }
}

function updateTargetHint(q) {
  const inp = document.getElementById('targetPay');
  const hint = document.getElementById('targetHint');
  if (!inp || !hint) return;
  const target = parseMoney(inp.value);
  if (!target) { hint.textContent = ''; return; }
  const c = calc(q);
  const p = principalForTarget(q, target);
  const h = c.totalSale - q.deposit - q.evSubsidy - p;
  const d = c.pay2 - target;
  hint.innerHTML = `현재 Ⅱ ${won(c.pay2)} (목표보다 ${won(Math.abs(d))} ${d > 0 ? '많음' : d < 0 ? '적음' : '같음'})<br>
    참고: 할부원금 <b>${won(p)}</b> · 인도금 <b>${won(h)}</b>이면 Ⅱ ${won(q.deposit + h + q.insurance + c.regTotal)} · 월 ${won(amortize(p, q.rate, q.months).monthly)}`;
}

const parseMoney = (s) => {
  const n = parseInt(String(s).replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

/* ---------- 비교 ---------- */
const CMP_ROWS = [
  { g: '차량' },
  { l: '트림', v: (q) => esc(q.trim) },
  { l: '선택 품목', v: (q) => esc(optText(q)), wrap: true },
  { l: '색상 (외장 / 내장)', v: (q) => `${esc(q.extColor)}<br>${esc(q.intColor)}`, wrap: true },
  { l: '견적 일시', v: (q) => esc(q.quoteDate) },
  { g: '가격사항' },
  { l: '차량기본가격', n: (q) => q.basePrice, best: 1 },
  { l: '선택사양가격', n: (q, c) => c.optionsSum },
  { l: '탁송료', n: (q) => q.delivery },
  { l: '할인 · 포인트 · 세금증감', n: (q, c) => c.reduce },
  { l: '총 판매금액', n: (q, c) => c.totalSale, best: 1, strong: 1 },
  { g: '할부 (참고용)' },
  { l: '할부원금', n: (q) => q.principal },
  { l: '금리 / 기간', v: (q) => `${q.rate}% / ${q.months}개월${q.method === 'principal' ? '<br>원금균등' : ''}` },
  { l: '월 납입금', n: (q, c) => c.loan.monthly, best: 1, strong: 1 },
  { l: '이자총액', n: (q, c) => c.loan.interest, best: 1 },
  { g: '등록비용' },
  { l: '취득세', n: (q, c) => c.acqTax, best: 1 },
  { l: '등록비용 계', n: (q, c) => c.regTotal, best: 1 },
  { g: '납입' },
  { l: 'Ⅰ. 출고전 납입', n: (q, c) => c.pay1 },
  { l: 'Ⅱ. 등록비 포함 납입', n: (q, c) => c.pay2, strong: 1 },
  { g: '총 비용' },
  { l: '카드 캐시백 · 혜택', n: (q) => q.cashback },
  { l: '총 소요비용', n: (q, c) => c.tco, best: 1, strong: 1 },
];

function cmpSelection() {
  const ids = ui.cmpIds ?? quotes.map((q) => q.id);
  return quotes.filter((q) => ids.includes(q.id));
}

function renderCompare() {
  if (!quotes.length) return '<div class="card empty">비교할 견적이 없습니다.</div>';
  const sel = cmpSelection();
  if (!sel.some((q) => q.id === ui.baseId)) ui.baseId = sel[0]?.id ?? null;
  const base = byId(ui.baseId);
  const cs = new Map(sel.map((q) => [q.id, calc(q)]));
  const bc = base ? cs.get(base.id) : null;

  const chips = quotes.map((q) => `<button class="chip ${sel.includes(q) ? 'on' : ''}" data-act="cmp-toggle" data-id="${q.id}">${esc(q.title)}</button>`).join('');
  const head = `<tr><th>항목</th>${sel.map((q) => `<th class="n wrap-cell">${esc(q.title)}${q.id === ui.baseId ? '<br><span class="badge">기준</span>' : ''}</th>`).join('')}</tr>`;
  const body = CMP_ROWS.map((r) => {
    if (r.g) return `<tr class="group"><th colspan="${sel.length + 1}">${r.g}</th></tr>`;
    let min = Infinity;
    if (r.best && sel.length > 1) for (const q of sel) min = Math.min(min, r.n(q, cs.get(q.id)));
    const cells = sel.map((q) => {
      const c = cs.get(q.id);
      if (r.v) return `<td class="${r.wrap ? 'wrap-cell' : ''}">${r.v(q, c)}</td>`;
      const val = r.n(q, c);
      let diff = '';
      if (r.best && base && q.id !== base.id) {
        const d = val - r.n(base, bc);
        diff = `<span class="diff ${d < 0 ? 'good' : d > 0 ? 'bad' : 'muted'}">${signed(d)}</span>`;
      }
      return `<td class="n ${r.best && val === min && sel.length > 1 ? 'best' : ''}">${fmt(val)}${diff}</td>`;
    }).join('');
    return `<tr class="${r.strong ? 'strong' : ''}"><th>${r.l}</th>${cells}</tr>`;
  }).join('');

  const maxT = Math.max(...sel.map((q) => cs.get(q.id).tco), 1);
  const bars = sel.map((q) => {
    const c = cs.get(q.id);
    const seg = [[c.totalSale - q.evSubsidy, 'c1'], [c.loan.interest, 'c2'], [c.regTotal, 'c3'], [q.insurance, 'c4']];
    return `<div class="bar-row"><div class="bar-label"><span>${esc(q.title)}</span><b class="num">${man(c.tco)}</b></div>
      <div class="bar-track" style="width:${(c.tco / maxT * 100).toFixed(2)}%">${seg.map(([v, k]) => `<i class="${k}" style="width:${(v / c.tco * 100).toFixed(3)}%" title="${won(v)}"></i>`).join('')}</div></div>`;
  }).join('');
  const maxM = Math.max(...sel.map((q) => cs.get(q.id).loan.monthly), 1);
  const mbars = sel.map((q) => {
    const m = cs.get(q.id).loan.monthly;
    return `<div class="bar-row"><div class="bar-label"><span>${esc(q.title)}</span><b class="num">${won(m)}</b></div>
      <div class="bar-track"><i class="c1" style="width:${(m / maxM * 100).toFixed(2)}%"></i></div></div>`;
  }).join('');

  const isPrice = ui.cmpView === 'price';
  return `<div class="cmp-actions">
      <div class="seg wide" role="tablist">
        <button type="button" class="${isPrice ? 'on' : ''}" data-act="cmp-view" data-v="price" aria-selected="${isPrice}">가격 비교</button>
        <button type="button" class="${isPrice ? '' : 'on'}" data-act="cmp-view" data-v="extras" aria-selected="${!isPrice}">옵션 비교</button>
      </div>
      <button type="button" class="btn primary" data-act="ppt" ${sel.length ? '' : 'disabled'}>PPT 다운로드 (${sel.length}건)</button>
    </div>
    <div class="card"><div class="cmp-top">
      <div style="flex:1;min-width:240px"><div class="small muted" style="margin-bottom:6px">비교할 견적</div><div class="chips" style="margin:0">${chips}</div></div>
      ${isPrice ? `<div class="field"><label for="baseSel">차이 계산 기준</label>
        <select id="baseSel" class="inp">${sel.map((q) => `<option value="${q.id}" ${q.id === ui.baseId ? 'selected' : ''}>${esc(q.title)}</option>`).join('')}</select></div>` : ''}
    </div></div>
    ${!sel.length ? '<div class="card empty">위에서 비교할 견적을 선택하세요.</div>' : !isPrice ? extrasTable(sel) : `<div class="table-wrap" style="margin-bottom:14px"><table class="cmp" style="min-width:${120 + sel.length * 130}px">
      <colgroup><col style="width:${wideMQ.matches ? 170 : 120}px">${sel.map(() => '<col>').join('')}</colgroup>
      <thead>${head}</thead><tbody>${body}</tbody></table></div>
    <p class="tiny muted" style="margin:-6px 2px 14px">초록 칸 = 해당 항목 최저값 · 아래 작은 숫자 = 기준 견적 대비 차이</p>
    <div class="grid-2">
      <div class="card"><h3>총 소요비용 구성</h3><div class="bars">${bars}</div>
        <div class="legend"><span><i class="c1"></i>총 판매금액</span><span><i class="c2"></i>할부 이자</span><span><i class="c3"></i>등록비용</span><span><i class="c4"></i>의무보험료</span></div></div>
      <div class="card"><h3>월 납입금</h3><div class="bars">${mbars}</div></div>
    </div>`}`;
}

const EXTRA_ROWS = [
  { k: 'tint', l: '썬팅' },
  { k: 'blackbox', l: '블랙박스' },
  { k: 'ppf', l: 'PPF' },
  { k: 'glassCoat', l: '유리막코팅', bool: true },
  { k: 'waterCoat', l: '발수코팅', bool: true },
];
const hasExtra = (q, r) => (r.bool ? !!q[r.k] : !!String(q[r.k] ?? '').trim());

function extrasTable(sel) {
  const head = `<tr><th>옵션</th>${sel.map((q) => `<th class="wrap-cell">${esc(q.title)}</th>`).join('')}</tr>`;
  const body = EXTRA_ROWS.map((r) => `<tr><th>${r.l}</th>${sel.map((q) => {
    if (!hasExtra(q, r)) return '<td><span class="badge">없음</span></td>';
    return `<td>${r.bool ? '<span class="badge good">있음</span>' : esc(q[r.k])}</td>`;
  }).join('')}</tr>`).join('');
  const counts = sel.map((q) => EXTRA_ROWS.filter((r) => hasExtra(q, r)).length);
  const max = Math.max(...counts);
  const total = `<tr class="strong"><th>포함 항목 수</th>${counts.map((n) => `<td class="${n === max && n > 0 && sel.length > 1 ? 'best' : ''}">${n} / ${EXTRA_ROWS.length}</td>`).join('')}</tr>`;
  return `<div class="table-wrap" style="margin-bottom:8px"><table class="cmp" style="min-width:${120 + sel.length * 130}px">
      <colgroup><col style="width:${wideMQ.matches ? 170 : 120}px">${sel.map(() => '<col>').join('')}</colgroup>
      <thead>${head}</thead><tbody>${body}${total}</tbody></table></div>
    <p class="tiny muted" style="margin:0 2px 14px">옵션 내용은 각 견적 화면의 ⑤ 옵션 칸에서 입력합니다. 초록 칸 = 포함 항목이 가장 많은 견적</p>`;
}

/* ---------- 동일 기준 비교 ----------
 * 견적마다 다른 할부원금·금리·상환방식·탁송지·등록 대행료·카드 혜택을
 * 같은 조건으로 맞춰 "실질 총비용"을 다시 계산 (견적 입력값은 바꾸지 않음) */
const BASIS_DEFAULT = {
  base: 'cash',                         // cash: 선납 현금을 같게 | principal: 할부원금을 같게
  cash: null, unit: '10000',            // 맞출 선납 현금(null = 받은 견적의 중간값), 할부원금 단위
  principal: null, months: 60,          // null = 받은 견적의 중간값
  rateMode: 'own', rate: 4.4,           // own: 각 견적 금리 | same: 모두 같은 금리
  method: 'annuity',                    // annuity: 모두 원리금균등 | own: 각 견적 방식
  delivery: 'unify', deliveryFee: null, // null = 가장 많은 견적의 탁송료
  reg: 'unify', regFee: null,           // 번호판·증지·대행료(·공채) 합계, null = 받은 견적 중 최저
  save: 'exclude', cashback: 'include', options: 'exclude',
  trims: 'main',                        // main: 가장 많은 트림만 순위 | all: 모두
  v: 2,
};
const storedBasis = loadJSON(BASIS_KEY, {});
let basis = { ...BASIS_DEFAULT, ...storedBasis };
if (storedBasis.v !== 2) {
  // v2: 대행료 등은 받은 견적 중 최저값으로 통일, 할부원금은 1만원 단위가 기본
  basis = { ...basis, v: 2, reg: 'unify', regFee: null, unit: '10000' };
  saveJSON(BASIS_KEY, basis);
}
const saveBasis = () => saveJSON(BASIS_KEY, basis);

const median = (arr) => {
  const a = [...arr].sort((x, y) => x - y);
  return a.length ? a[Math.floor((a.length - 1) / 2)] : 0;
};
const mostCommon = (arr) => {
  const cnt = new Map();
  for (const v of arr) cnt.set(v, (cnt.get(v) || 0) + 1);
  return [...cnt.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? 0;
};
const regFeesOf = (q) => q.plate + q.stamp + q.agentFee + q.bond;

// 기준값 중 비워 둔 것은 견적들에서 자동으로 정함
function resolvedBasis(sel) {
  return {
    ...basis,
    principal: basis.principal ?? Math.round(median(sel.map((q) => q.principal)) / 100000) * 100000,
    cash: basis.cash ?? Math.round(median(sel.map((q) => calc(q).pay2)) / 100000) * 100000,
    deliveryFee: basis.deliveryFee ?? mostCommon(sel.map((q) => q.delivery)),
    regFee: basis.regFee ?? Math.min(...sel.map(regFeesOf)),
  };
}

function basisCalc(q, B) {
  const price = q.basePrice + (B.options === 'include' ? q.purePrice - q.basePrice : 0);
  const delivery = B.delivery === 'unify' ? B.deliveryFee : q.delivery;
  const save = B.save === 'include' ? q.point : 0;
  const discount = q.discount + q.taxAdj + save;
  const totalSale = price + delivery - discount;
  // 받은 견적서 3건 모두 세이브오토 30만원 중 15만원만 세금계산서(취득세 기준)에 반영됨
  const taxBase = totalSale + Math.round(save / 2);
  const acqTax = Math.max(0, Math.floor(taxBase * 10 / 11 * q.acqRate / 100 / 10) * 10);
  const regFees = B.reg === 'unify' ? B.regFee : regFeesOf(q);
  const reg = acqTax + regFees;
  const maxP = Math.max(0, totalSale - q.deposit);
  let P;
  if (B.base === 'cash') {
    // 선납 현금을 목표에 맞추는 할부원금을 견적서처럼 단위(10만원 등)로 반올림 → 목표와의 오차가 가장 작게
    const unit = Number(B.unit) || 1;
    P = Math.round((totalSale + q.insurance + reg - B.cash) / unit) * unit;
  } else {
    P = B.principal;
  }
  P = Math.min(Math.max(0, P), maxP);
  const rate = B.rateMode === 'same' ? B.rate : q.rate;
  const method = B.method === 'annuity' ? 'annuity' : q.method;
  const loan = amortize(P, rate, B.months, method);
  const cashback = B.cashback === 'include' ? q.cashback : 0;
  const cash = totalSale - P + q.insurance + reg;                        // 차 받을 때까지 현금
  const real = totalSale + reg + q.insurance + loan.interest - cashback; // 실질 총비용
  const cashErr = B.base === 'cash' ? cash - B.cash : 0;              // 목표 선납 현금과의 차이
  const handover = totalSale - P - q.deposit - q.evSubsidy;             // 기준 적용 인도금
  return { price, delivery, discount, totalSale, acqTax, regFees, reg, P, handover, rate, method, loan, cashback, cash, cashErr, real };
}

const methodText = (m) => (m === 'principal' ? '원금균등' : '원리금균등');

function basisChoice(k, label, opts, extra = '') {
  return `<div class="field"><label>${label}</label>
    <div class="seg" role="group" aria-label="${label}">${opts.map(([v, t]) =>
      `<button type="button" class="${basis[k] === v ? 'on' : ''}" data-act="basis-set" data-k="${k}" data-v="${v}" aria-pressed="${basis[k] === v}">${t}</button>`).join('')}</div>
    ${extra}</div>`;
}
const basisInput = (k, value, unit, hint = '', type = 'money') => `<div class="unit-wrap" style="margin-top:6px">
    <input class="inp num" inputmode="${type === 'pct' ? 'decimal' : 'numeric'}" autocomplete="off" data-basis="${k}" data-btype="${type}" value="${type === 'money' ? fmt(value) : esc(value)}" aria-label="${hint || k}"><em>${unit}</em></div>
    ${hint ? `<span class="hint">${hint}</span>` : ''}`;

function renderBasis() {
  if (!quotes.length) return '<div class="card empty">비교할 견적이 없습니다.</div>';
  const sel = cmpSelection();
  const B = resolvedBasis(sel.length ? sel : quotes);
  const chips = quotes.map((q) => `<button class="chip ${sel.includes(q) ? 'on' : ''}" data-act="cmp-toggle" data-id="${q.id}">${quoteLabel(q)}. ${esc(q.title)}</button>`).join('');
  const open = ui.basisOpen ?? wideMQ.matches;
  const unitText = { 100000: '10만원', 10000: '1만원', 1: '1원' }[B.unit] || '1만원';
  const summary = [B.base === 'cash' ? `선납 ${man(B.cash)} (원금 ${unitText} 단위)·${B.months}개월` : `할부 ${man(B.principal)}·${B.months}개월`, B.rateMode === 'same' ? `금리 ${B.rate}% 통일` : '각 견적 금리',
    B.method === 'annuity' ? '원리금균등' : '각 상환방식', B.delivery === 'unify' ? `탁송 ${fmt(B.deliveryFee)}원` : '탁송 그대로',
    B.reg === 'unify' ? `대행료 등 ${fmt(B.regFee)}원` : '대행료 그대로',
    `세이브오토 ${B.save === 'exclude' ? '제외' : '포함'}`, `캐시백 ${B.cashback === 'include' ? '포함' : '제외'}`].join(' · ');
  return `<details class="card" id="basisBox" ${open ? 'open' : ''}>
      <summary><span>비교 기준 <span class="small muted" style="font-weight:400">(눌러서 바꾸기)</span><br><span class="tiny muted" style="font-weight:400">${summary}</span></span></summary>
      <p class="small muted" style="margin:0 0 12px">모든 견적에 아래 조건을 똑같이 적용해 다시 계산합니다. 견적에 입력한 값은 바뀌지 않습니다.</p>
      <div class="form-grid basis-grid">
        ${basisChoice('base', '같게 맞출 기준', [['cash', '선납 현금 같게'], ['principal', '할부원금 같게']],
          B.base === 'cash' ? '<span class="hint">견적마다 할부원금을 자동으로 맞춤</span>' : '<span class="hint">견적마다 선납 현금이 조금씩 달라짐</span>')}
        ${B.base === 'cash' ? `<div class="field"><label>선납 현금 · 기간</label>
          <div class="pair">
            <div class="unit-wrap"><input class="inp num" inputmode="numeric" autocomplete="off" data-basis="cash" data-btype="money" value="${fmt(B.cash)}" aria-label="선납 현금"><em>원</em></div>
            <div class="unit-wrap"><input class="inp num" inputmode="numeric" autocomplete="off" data-basis="months" data-btype="int" value="${B.months}" aria-label="기간"><em>개월</em></div>
          </div>
          <span class="hint">계약금+인도금+보험료+등록비 합계 · 비워 두면 받은 견적의 중간값</span></div>
        ${basisChoice('unit', '할부원금 단위', [['100000', '10만원'], ['10000', '1만원'], ['1', '1원']],
          `<span class="hint">견적서처럼 10만원 단위 → 선납 현금 오차 ±${won((Number(B.unit) || 1) / 2)} 이내</span>`)}`
        : `<div class="field"><label>할부원금 · 기간</label>
          <div class="pair">
            <div class="unit-wrap"><input class="inp num" inputmode="numeric" autocomplete="off" data-basis="principal" data-btype="money" value="${fmt(B.principal)}" aria-label="할부원금"><em>원</em></div>
            <div class="unit-wrap"><input class="inp num" inputmode="numeric" autocomplete="off" data-basis="months" data-btype="int" value="${B.months}" aria-label="기간"><em>개월</em></div>
          </div>
          <span class="hint">비워 두면 받은 견적의 중간값 · 나머지는 선납 현금</span></div>`}
        ${basisChoice('rateMode', '금리', [['own', '각 견적 금리'], ['same', '모두 같은 금리']],
          B.rateMode === 'same' ? basisInput('rate', B.rate, '%', '금리 조건 차이를 빼고 차량·등록비만 비교', 'pct') : '<span class="hint">견적마다 다른 할부 금리를 그대로 비교</span>')}
        ${basisChoice('method', '상환방식', [['annuity', '모두 원리금균등'], ['own', '각 견적 방식']],
          '<span class="hint">원금균등은 같은 금리라도 이자가 적고 초기 납입금이 큼</span>')}
        ${basisChoice('delivery', '탁송료', [['unify', '하나로 통일'], ['own', '각 견적 그대로']],
          B.delivery === 'unify' ? basisInput('deliveryFee', B.deliveryFee, '원', '실제 받을 주소의 탁송료로 바꾸세요 (기본: 가장 많은 견적 값)') : '')}
        ${basisChoice('reg', '번호판 · 증지 · 대행료', [['unify', '최저값으로 통일'], ['own', '각 견적 그대로']],
          B.reg === 'unify' ? basisInput('regFee', B.regFee, '원', '합계 금액 · 기본: 받은 견적 중 최저') : '<span class="hint">대행료는 대리점마다 실제로 다른 비용</span>')}
        ${basisChoice('save', '세이브오토 · 포인트', [['exclude', '제외'], ['include', '할인으로 포함']],
          '<span class="hint">카드 포인트로 나중에 갚는 선할인 → 기본은 제외</span>')}
        ${basisChoice('cashback', '카드 캐시백 · 혜택', [['include', '포함'], ['exclude', '제외']])}
        ${basisChoice('options', '선택사양 · 유료 색상', [['exclude', '제외 (기본 사양)'], ['include', '포함']])}
        ${basisChoice('trims', '트림이 다른 견적', [['main', '순위에서 빼기'], ['all', '함께 순위']],
          '<span class="hint">트림이 다르면 차값부터 달라 공정한 비교가 아님</span>')}
      </div>
      <div class="small muted" style="margin:14px 0 6px">비교할 견적 (비교 탭과 같이 적용 · ${sel.length}/${quotes.length}건)</div><div class="chips" style="margin:0">${chips}</div>
      <div class="btn-row" style="margin-top:12px"><button class="btn small" data-act="basis-reset">기준 초기화</button></div>
    </details>
    <div id="basisResults">${basisResultsHTML(sel, B)}</div>`;
}

const trimKey = (q) => `${q.trim}|${q.basePrice}`;

function basisResultsHTML(all, B) {
  if (!all.length) return '<div class="card empty">위에서 비교할 견적을 선택하세요.</div>';
  // 가장 많은 트림(같은 기본가격)끼리만 순위를 매김
  const main = mostCommon(all.map(trimKey));
  const sel = B.trims === 'all' ? all : all.filter((q) => trimKey(q) === main);
  const others = all.filter((q) => !sel.includes(q));
  const rows = sel.map((q) => ({ q, r: basisCalc(q, B) })).sort((a, b) => a.r.real - b.r.real);
  const best = rows[0], worst = rows[rows.length - 1];
  const minOf = (f) => Math.min(...rows.map((x) => f(x.r)));
  const cellMin = (v, f) => (rows.length > 1 && v === minOf(f) ? 'best' : '');
  const name = (q) => `${quoteLabel(q)}. ${esc(q.title)}`;
  const minWidth = (cols) => `style="min-width:${cols}px"`;
  const nameCol = innerWidth < 700 ? 140 : 200;   // 휴대폰에서는 견적 이름 칸을 좁게

  const rank = rows.map(({ q, r }, i) => `<tr class="${i === 0 ? 'strong' : ''}">
      <th class="wrap-cell">${i + 1}. ${name(q)}</th>
      <td>${r.rate}%<br><span class="tiny muted">${methodText(r.method)}</span></td>
      <td>${fmt(r.P)}</td>
      <td class="${cellMin(r.cash, (x) => x.cash)}">${fmt(r.cash)}${B.base === 'cash' ? `<span class="diff ${r.cashErr ? 'muted' : 'good'}">목표 ${r.cashErr ? signed(r.cashErr) : '일치'}</span>` : ''}</td>
      <td class="${cellMin(r.loan.monthly, (x) => x.loan.monthly)}">${fmt(r.loan.monthly)}${r.method === 'principal' ? `<span class="diff muted">첫 회 ${fmt(r.loan.first)}</span>` : ''}</td>
      <td class="${cellMin(r.loan.interest, (x) => x.loan.interest)}">${fmt(r.loan.interest)}</td>
      <td class="${cellMin(r.reg, (x) => x.reg)}">${fmt(r.reg)}</td>
      <td>${r.cashback ? `<span class="good">−${fmt(r.cashback)}</span>` : '-'}</td>
      <td class="${i === 0 && rows.length > 1 ? 'best' : ''}"><b>${fmt(r.real)}</b></td>
      <td>${i === 0 ? '<span class="good">최저</span>' : `<span class="bad">+${fmt(r.real - best.r.real)}</span>`}</td>
    </tr>`).join('');

  const parts = [
    ['차량 · 옵션', (r) => r.price], ['탁송료', (r) => r.delivery], ['할인', (r) => -r.discount], ['취득세', (r) => r.acqTax],
    ['번호판·대행료', (r) => r.regFees], ['할부 이자', (r) => r.loan.interest], ['혜택', (r) => -r.cashback],
  ];
  const sd = (d) => (d === 0 ? '<span class="muted">0</span>' : `<span class="${d > 0 ? 'bad' : 'good'}">${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}</span>`);
  const why = rows.slice(1).map(({ q, r }) => `<tr><th class="wrap-cell">${name(q)}</th>
      ${parts.map(([, f]) => `<td>${sd(f(r) - f(best.r))}</td>`).join('')}<td><b>${sd(r.real - best.r.real)}</b></td></tr>`).join('');

  // 어떤 항목이 견적 사이 차이를 가장 크게 만드는지
  const spread = parts.map(([l, f]) => [l, Math.max(...rows.map((x) => f(x.r))) - Math.min(...rows.map((x) => f(x.r)))]).sort((a, b) => b[1] - a[1]);

  const otherNote = others.length ? `<div class="card warn-note small">트림이 다른 견적 <b>${others.map((q) => `${quoteLabel(q)}. ${esc(q.title)} (${esc(q.trim)})`).join(', ')}</b>은(는) 순위에서 뺐습니다. 위 기준에서 '함께 순위'를 고르면 포함됩니다.</div>` : '';
  return `${otherNote}<div class="card hero">
      <div class="small muted">같은 조건이면 가장 유리한 견적</div>
      <div class="hero-title">${name(best.q)}</div>
      <div class="hero-num">${won(best.r.real)}</div>
      <div class="small">${rows.length > 1 ? `가장 불리한 견적(${quoteLabel(worst.q)})보다 <b class="good">${won(worst.r.real - best.r.real)}</b> 적음 · ` : ''}월 ${won(best.r.loan.monthly)} · 선납 현금 ${won(best.r.cash)}</div>
      ${spread[0]?.[1] > 0 ? `<div class="small muted" style="margin-top:6px">차이가 가장 큰 항목: <b>${spread.filter(([, v]) => v > 0).slice(0, 3).map(([l, v]) => `${l}(최대 ${won(v)})`).join(', ')}</b></div>` : ''}
    </div>

    <h3 class="sec-h">실질 총비용 순위</h3>
    <div class="table-wrap" style="margin-bottom:6px"><table class="cmp" ${minWidth(1080)}>
      <colgroup><col style="width:${nameCol}px"><col style="width:90px"><col><col><col><col><col><col style="width:90px"><col><col style="width:100px"></colgroup>
      <thead><tr><th>견적</th><th>금리</th><th>할부원금</th><th>선납 현금</th><th>월 납입금</th><th>이자총액</th><th>등록비</th><th>혜택</th><th>실질 총비용</th><th>최저 대비</th></tr></thead>
      <tbody>${rank}</tbody></table></div>
    <p class="tiny muted" style="margin:0 2px 16px">실질 총비용 = 총 판매금액 + 등록비 + 의무보험료 + 할부 이자 − 카드 캐시백 · 초록 칸 = 항목별 최저</p>

    <h3 class="sec-h">견적서 값 → 기준 적용 값</h3>
    <div class="table-wrap" style="margin-bottom:6px"><table class="cmp" ${minWidth(900)}>
      <colgroup><col style="width:${nameCol}px"><col><col><col><col><col></colgroup>
      <thead><tr><th>견적</th><th>할부원금</th><th>인도금</th><th>선납 현금</th><th>월 납입금</th><th>이자총액</th></tr></thead>
      <tbody>${rows.map(({ q, r }) => {
        const c = calc(q);
        const ch = (from, to) => `<span class="tiny muted">${fmt(from)}</span><br>→ <b>${fmt(to)}</b>${to === from ? '' : `<span class="diff ${to > from ? 'bad' : 'good'}">${signed(to - from)}</span>`}`;
        return `<tr><th class="wrap-cell">${name(q)}</th><td>${ch(q.principal, r.P)}</td><td>${ch(c.handover, r.handover)}</td>
          <td>${ch(c.pay2, r.cash)}</td><td>${ch(c.loan.monthly, r.loan.monthly)}</td><td>${ch(c.loan.interest, r.loan.interest)}</td></tr>`;
      }).join('')}</tbody></table></div>
    <p class="tiny muted" style="margin:0 2px 16px">위 줄 = 견적서(입력값) · 아래 줄 = 기준비교에서만 다시 계산한 값. 견적에 입력한 값은 바뀌지 않습니다.</p>

    ${rows.length > 1 ? `<h3 class="sec-h">1위와 비교한 차이 원인</h3>
    <div class="table-wrap" style="margin-bottom:6px"><table class="cmp" ${minWidth(900)}>
      <colgroup><col style="width:${nameCol}px">${parts.map(() => '<col>').join('')}<col></colgroup>
      <thead><tr><th>견적</th>${parts.map(([l]) => `<th>${l}</th>`).join('')}<th>합계</th></tr></thead>
      <tbody>${why}</tbody></table></div>
    <p class="tiny muted" style="margin:0 2px 16px">+ 는 1위(${quoteLabel(best.q)})보다 더 내는 돈, − 는 덜 내는 돈</p>` : ''}

    <div class="card"><h2>왜 차이가 날까요?</h2>${basisInsights(sel, { ...B, principal: median(rows.map((x) => x.r.P)) }).map((t, i) => `<div class="insight"><span class="dot">${i + 1}</span><p>${t}</p></div>`).join('')}</div>`;
}

function basisInsights(sel, B) {
  const out = [];
  const bases = [...new Set(sel.map((q) => q.basePrice))];
  if (bases.length === 1) out.push(`차량 기본가격은 모든 견적이 <b>${won(bases[0])}</b>으로 같습니다. 현대차는 전국 동일 가격이라 <b>차값 자체의 차이는 없고</b>, 차이는 할부 조건·등록 대행료·카드 혜택에서 납니다.`);

  const rates = sel.map((q) => q.rate);
  const lo = Math.min(...rates), hi = Math.max(...rates);
  if (hi > lo) {
    const iLo = amortize(B.principal, lo, B.months).interest, iHi = amortize(B.principal, hi, B.months).interest;
    const step = amortize(B.principal, 4.4, B.months).interest - amortize(B.principal, 4.3, B.months).interest;
    out.push(`할부 금리가 <b>${lo}% ~ ${hi}%</b>로 다릅니다. 할부원금 ${man(B.principal)}·${B.months}개월이면 이자 차이가 최대 <b>${won(iHi - iLo)}</b>입니다 (금리 0.1%p ≈ ${won(step)}). 실제 승인 금리는 신용도에 따라 달라지니 낮은 금리 견적이 본인에게도 적용되는지 확인하세요.`);
  }

  const fees = sel.map(regFeesOf);
  if (Math.max(...fees) > Math.min(...fees)) out.push(`번호판·증지·대행료가 <b>${won(Math.min(...fees))} ~ ${won(Math.max(...fees))}</b>으로 다릅니다. 번호판·증지는 지자체 요금이고, 대행료는 대리점마다 다르며 직접 등록하면 아낄 수 있습니다. ${B.reg === 'unify' ? `비교에서는 <b>${won(B.regFee)}</b>으로 통일했습니다 (계약할 때 가장 낮은 대행료로 맞춰 달라고 요청해 볼 만합니다).` : ''}`);

  const dels = [...new Set(sel.map((q) => q.delivery))];
  if (dels.length > 1) out.push(`탁송료(${dels.map(fmt).join(' / ')}원)는 견적마다 배송지를 다르게 넣어서 생긴 차이입니다. 실제로는 받을 주소 기준으로 같은 금액이 나오므로 ${B.delivery === 'unify' ? `<b>${won(B.deliveryFee)}</b>으로 통일해 비교했습니다` : '통일해서 비교하는 것을 권합니다'}.`);

  const saves = sel.filter((q) => q.point > 0);
  if (saves.length) out.push(`${saves.map(quoteLabel).join('·')} 견적의 30만원 할인(포인트)은 <b>현대카드 세이브오토</b>입니다. 차값 일부를 카드사가 먼저 내주고, 이후 카드 사용 포인트로 갚아야 하며 못 갚으면 현금으로 상환하는 조건이라 ${B.save === 'exclude' ? '기본적으로 할인에서 <b>제외</b>했습니다' : '할인으로 포함해 계산했습니다'}. 해당 카드를 많이 쓴다면 '할인으로 포함'으로 바꿔 보세요.`);

  const cbs = sel.filter((q) => q.cashback > 0);
  if (cbs.length) out.push(`${cbs.map((q) => `${quoteLabel(q)} 견적의 캐시백 ${won(q.cashback)}`).join(', ')}은 할부·인도금을 카드로 결제하는 조건입니다. 실제로 받는 돈이라 ${B.cashback === 'include' ? '비용에서 뺐습니다' : '이번 계산에서는 뺐습니다(제외 선택)'}. 다른 대리점에서도 같은 카드 결제가 가능한지 물어볼 만합니다.`);

  const pm = sel.filter((q) => q.method === 'principal');
  if (pm.length) {
    const ex = amortize(B.principal, 4.4, B.months, 'principal');
    out.push(`${pm.map(quoteLabel).join('·')} 견적은 <b>원금균등</b> 상환입니다. 같은 금리라도 원금을 빨리 갚아 이자가 적지만, 첫 달 납입금이 큽니다 (${man(B.principal)}·4.4% 기준 첫 회 ${won(ex.first)} → 마지막 ${won(ex.last)}). ${B.method === 'annuity' ? '공정하게 비교하려고 모두 원리금균등으로 맞췄습니다' : '각 견적 방식 그대로 계산했습니다'}.`);
  }

  const opts = sel.filter((q) => q.purePrice !== q.basePrice);
  if (opts.length) out.push(`${opts.map((q) => `${quoteLabel(q)}(${esc(q.optionText || '선택사양')})`).join(', ')}는 선택사양·유료 색상이 들어 있어 사양이 다릅니다. ${B.options === 'exclude' ? '기본 사양 기준으로 맞추려고 금액을 뺐습니다' : '선택사양 금액을 포함해 계산했습니다'}.`);
  return out;
}

/* ---------- 분석 ---------- */
function insights(qs = quotes) {
  const out = [];
  if (qs.length < 2) return out;
  const list = qs.map((q) => ({ q, c: calc(q) })).sort((a, b) => a.c.tco - b.c.tco);
  const lo = list[0], hi = list.at(-1);
  out.push(['good', '1', `총 소요비용이 가장 낮은 견적은 <b>${esc(lo.q.title)}</b> (${won(lo.c.tco)})이며, 가장 높은 <b>${esc(hi.q.title)}</b>보다 <b class="good">${won(hi.c.tco - lo.c.tco)}</b> 적습니다.`]);

  const byM = [...list].sort((a, b) => a.c.loan.monthly - b.c.loan.monthly);
  out.push(['', '2', `월 납입금은 <b>${esc(byM[0].q.title)}</b>가 ${won(byM[0].c.loan.monthly)}으로 가장 낮고, 최고 견적과 월 ${won(byM.at(-1).c.loan.monthly - byM[0].c.loan.monthly)} 차이 (${byM[0].q.months}개월 기준)입니다.`]);

  const p2 = list.map((x) => x.c.pay2);
  const spread = Math.max(...p2) - Math.min(...p2);
  if (spread <= 100000) {
    const target = Math.round(Math.max(...p2) / 1000000) * 1000000;
    out.push(['', '3', `모든 견적의 등록비 포함 납입금(Ⅱ)이 ${man(Math.min(...p2))}~${man(Math.max(...p2))}으로 거의 같습니다. <b>선납 약 ${man(target)}</b>을 기준으로 할부원금을 10만원 단위로 조정해 만든 견적 구성입니다.`]);
  }

  // 같은 트림·기본가끼리 비교 → 옵션 1원이 실제로 얼마의 부담이 되는지
  let n = out.length;
  for (let i = 0; i < qs.length; i++) {
    for (let j = 0; j < qs.length; j++) {
      const a = qs[i], b = qs[j];
      if (i === j || a.basePrice !== b.basePrice || a.trim !== b.trim) continue;
      const ca = calc(a), cb = calc(b);
      const dOpt = cb.optionsSum - ca.optionsSum;
      if (dOpt <= 0) continue;
      const dT = cb.tco - ca.tco;
      out.push(['bad', String(++n), `<b>${esc(b.title)}</b>는 <b>${esc(a.title)}</b>에 옵션 ${won(dOpt)}을 더한 구성인데, 취득세·이자까지 포함하면 실제 부담은 <b class="bad">${signed(dT)}</b> (옵션가의 ${(dT / dOpt * 100).toFixed(0)}%)이고 월 ${signed(cb.loan.monthly - ca.loan.monthly)}입니다.`]);
    }
  }
  return out;
}

const CHECKLIST = [
  '이번 달 프로모션·재고 할인·제휴 포인트가 반영 가능한지 (견적서 할인·포인트 모두 0원)',
  '할부 4.2%는 "참고용" — 실제 캐피탈사 승인 금리와 고정/변동 여부, 중도상환수수료 확인',
  '익스클루시브 + 커넥트플러스와 인스퍼레이션의 사양 차이표 받아보기',
  '빌트인캠2플러스 견적의 내장색이 "브라운"으로 바뀐 것이 의도한 선택인지 확인',
  '출고 대기 기간과 출고 시점 가격·세금 변동 가능성 (견적서 안내사항)',
  '탁송 지역(경기/부천시(시흥))과 등록 지역(경기도)이 실제 주소와 맞는지',
  '대금은 현대자동차 명의 계좌 또는 고객 명의 카드로만 결제 (견적서 안내사항)',
  '임의 자동차보험은 견적에 없음 — 출고 전 별도 가입 (의무보험료 1,900원은 임시운행용으로 보임)',
];

function renderAnalysis() {
  const ins = insights();
  return `<div class="grid-2">
    <div>
      <div class="card"><h2>현재 견적 요약</h2>
        ${ins.length ? ins.map(([cls, k, t]) => `<div class="insight"><span class="dot ${cls}">${k}</span><p>${t}</p></div>`).join('') : '<p class="muted">견적이 2건 이상이면 비교 요약이 표시됩니다.</p>'}
        <p class="tiny muted" style="margin:10px 0 0">입력값을 바꾸면 이 요약도 자동으로 다시 계산됩니다.</p>
      </div>

      <div class="card"><h2>계약 전 확인 체크리스트</h2>
        ${CHECKLIST.map((t, i) => `<label class="check-item ${checks[i] ? 'done' : ''}"><input type="checkbox" data-check="${i}" ${checks[i] ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}
      </div>

      <div class="card"><h2>계산 방식 (원본 3장으로 검증)</h2>
        <ul class="plain small">
          <li>총 판매금액 = 순수차량가격(기본+선택사양+파츠/색상) + 탁송료 − 할인·포인트·세금증감</li>
          <li>취득세 = 총 판매금액 ÷ 1.1 × 7%, <b>10원 미만 절사</b> — 탁송료까지 포함한 공급가가 과세표준</li>
          <li>인도금 = 총 판매금액 − 할부원금 − 계약금 − 전동차 지원금</li>
          <li>Ⅰ. 출고전 납입 = 계약금 + 인도금 + 의무보험료 · Ⅱ = Ⅰ + 등록비용 계</li>
          <li>월 납입금 = 원리금균등 공식, <b>원 미만 절사</b> (3장 모두 일치)</li>
          <li>이자총액 = 회차별 이자 합계 (끝전 처리로 1~7원 차이 가능)</li>
          <li>총 소요비용 = Ⅱ + 할부 상환 총액(원금+이자) — 차를 받기까지 + 할부 종료까지 내는 돈 전체</li>
        </ul>
      </div>
    </div>

    <div>
      <div class="card"><h2>원본 견적서 3장 상세 분석</h2>
        <p class="small muted" style="margin-top:-6px">2026-10-25 발행 견적서 3장의 인쇄값 기준 (앱 계산값과는 이자 끝전 때문에 수 원 차이)</p>
        <h3>공통 사항</h3>
        <ul class="plain small">
          <li>견적번호 3장 모두 동일 → 한 상담 건에서 조건만 바꿔 출력 (14:27 → 16:04 → 16:13)</li>
          <li>담당: 역곡역 카마스터</li>
          <li>차종: 투싼 NX5 런칭 가솔린 1.6 터보 2WD A/T · 외장 에코트로닉 그레이펄</li>
          <li>할인 · 포인트 · 세금증감 <b>모두 0원</b> → 프로모션 미반영 정가 견적</li>
          <li>탁송료 343,000원 (경기/부천시(시흥)) · 계약금 100,000원 · 의무보험료 1,900원</li>
          <li>할부: 자동차할부(참고용) 4.2% / 60개월, 인지대·공증료 등 부대비용 0원</li>
          <li>등록: 경기도 · 공채매입 0원 · 번호판 43,000 / 증지 2,000 / 대행료 30,000원</li>
        </ul>
        <h3 style="margin-top:14px">견적별 차이</h3>
        <div class="table-wrap"><table>
          <thead><tr><th></th><th class="n">A 인스퍼</th><th class="n">B 인스퍼+캠</th><th class="n">C 익스클+커넥트</th></tr></thead>
          <tbody>
            <tr><th>작성</th><td class="n">16:04</td><td class="n">16:13</td><td class="n">14:27</td></tr>
            <tr><th>차량 코드</th><td class="n">TPT1 A01 /SOS</td><td class="n">TPT1 A17 /ISB</td><td class="n">TET1 AA1 /SOS</td></tr>
            <tr><th>기본가격</th><td class="n">37,900,000</td><td class="n">37,900,000</td><td class="n">35,300,000</td></tr>
            <tr><th>선택 품목</th><td class="n">없음</td><td class="n">빌트인캠2플러스 650,000</td><td class="n">커넥트플러스 950,000</td></tr>
            <tr><th>내장</th><td class="n">블랙/샌드베이지</td><td class="n">브라운</td><td class="n">블랙/샌드베이지</td></tr>
            <tr><th>총 판매금액</th><td class="n">38,243,000</td><td class="n">38,893,000</td><td class="n best">36,593,000</td></tr>
            <tr><th>할부원금</th><td class="n">15,800,000</td><td class="n">16,500,000</td><td class="n">14,000,000</td></tr>
            <tr><th>월 납입금</th><td class="n">292,409</td><td class="n">305,364</td><td class="n best">259,096</td></tr>
            <tr><th>이자총액</th><td class="n">1,744,555</td><td class="n">1,821,845</td><td class="n best">1,545,808</td></tr>
            <tr><th>취득세</th><td class="n">2,433,640</td><td class="n">2,475,000</td><td class="n best">2,328,640</td></tr>
            <tr><th>Ⅱ. 등록비 포함</th><td class="n">24,953,540</td><td class="n">24,944,900</td><td class="n">24,998,540</td></tr>
            <tr class="strong"><th>총 소요비용</th><td class="n">42,498,095</td><td class="n">43,266,745</td><td class="n best">40,544,348</td></tr>
          </tbody></table></div>
        <h3 style="margin-top:14px">해석</h3>
        <ul class="plain small">
          <li><b>선납 2,500만원 맞춤 구조</b>: 할부원금 = ⌈(총 판매금액 + 보험료 + 등록비 − 2,500만) ÷ 10만⌉ × 10만 으로 계산하면 1,580만 / 1,650만 / 1,400만원이 정확히 나옵니다.</li>
          <li><b>B − A</b>: 같은 트림에 빌트인캠2플러스 65만원 추가 → 취득세 +41,360 · 이자 +77,290 · 총 소요비용 <b class="bad">+768,650원</b>, 월 +12,955원. 내장색이 브라운으로 바뀌고 코드 끝자리가 SOS→ISB로 변경.</li>
          <li><b>C − A</b>: 익스클루시브는 기본가 260만원 낮고 커넥트플러스 95만원 추가 → 차량가 −165만원, 총 소요비용 <b class="good">−1,953,747원</b>, 월 −33,313원.</li>
          <li><b>C − B</b>: 총 소요비용 2,722,397원 차이 — 세 견적 중 최대 격차.</li>
          <li>차량 코드 <code>TP</code>(인스퍼레이션)/<code>TE</code>(익스클루시브)는 트림, <code>A01/A17/AA1</code>은 옵션 조합, <code>PE2</code>는 외장색, <code>SOS/ISB</code>는 내장색으로 보입니다 (추정).</li>
          <li>자동차세(참고): 1.6 터보(1,598cc)는 1,600cc 이하 구간(cc당 140원)으로 연 약 29만원(지방교육세 포함), 세 견적 동일.</li>
          <li>세 견적의 계산값은 모두 견적서 인쇄값과 일치합니다 (이자총액만 끝전 1~7원 차이).</li>
        </ul>
      </div>
    </div>
  </div>`;
}

/* ---------- 설정 ---------- */
let deferredPrompt = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function renderSettings() {
  return `<div class="grid-2"><div>
    <div class="card"><h2>앱 설치 (휴대폰 · 갤럭시 탭)</h2>
      <p class="small">${isStandalone() ? '<span class="badge good">설치된 앱으로 실행 중</span>' : '<span class="badge">브라우저에서 실행 중</span>'}</p>
      ${deferredPrompt ? '<button class="btn primary" data-act="install">지금 설치하기</button>' : ''}
      <h3 style="margin-top:14px">Samsung Internet</h3>
      <ul class="plain small"><li>주소창의 <b>설치(↓) 아이콘</b> 또는 하단 메뉴(≡) → <b>현재 페이지 추가 → 홈 화면</b></li></ul>
      <h3 style="margin-top:12px">Chrome</h3>
      <ul class="plain small"><li>우측 상단 ⋮ → <b>앱 설치</b> (또는 홈 화면에 추가)</li></ul>
      <h3 style="margin-top:12px">iPhone / iPad (Safari)</h3>
      <ul class="plain small"><li>공유(□↑) → <b>홈 화면에 추가</b></li></ul>
      <p class="tiny muted">설치 후에는 인터넷 없이도 실행됩니다. 태블릿 가로 화면에서는 목록과 상세가 나란히 표시됩니다.</p>
    </div>
  </div><div>
    <div class="card"><h2>데이터 관리</h2>
      <p class="small muted">견적은 이 기기 브라우저에만 저장됩니다. 기기를 바꾸거나 앱을 지우기 전에 백업하세요.</p>
      <div class="btn-row">
        <button class="btn" data-act="export">백업 파일 저장</button>
        <button class="btn" data-act="import">백업 불러오기</button>
        <button class="btn danger" data-act="reset">받은 견적 기본값으로 초기화</button>
      </div>
      <input type="file" id="importFile" accept="application/json,.json" hidden>
    </div>
    <div class="card"><h2>정보</h2>
      <p class="small">차량 견적 비교 v${APP_VERSION}<br><span class="muted">할부 계산은 참고용이며 실제 금리·세금은 계약 시점 조건을 따릅니다.</span></p>
    </div>
  </div></div>`;
}

/* ======================================================================
 * 이벤트
 * ==================================================================== */
function setTab(tab) {
  ui.tab = tab;
  ui.detailOpen = false;
  render();
  window.scrollTo(0, 0);
}

function openQuote(id) {
  ui.sel = id;
  if (!wideMQ.matches) {
    ui.detailOpen = true;
    history.pushState({ detail: id }, '');
  }
  render();
  window.scrollTo(0, 0);
}

function closeDetail() {
  if (history.state?.detail) history.back();
  else { ui.detailOpen = false; render(); }
}

document.querySelector('.tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tab]');
  if (b) setTab(b.dataset.tab);
});

addEventListener('popstate', () => {
  if (ui.detailOpen) { ui.detailOpen = false; render(); }
});

wideMQ.addEventListener('change', () => { ui.detailOpen = false; render(); });

view.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const q = byId(view.querySelector('.detail')?.dataset.qid);

  switch (act) {
    case 'open': openQuote(el.dataset.id); break;
    case 'back': closeDetail(); break;
    case 'add': {
      const nq = blankQuote();
      quotes.push(nq);
      persist();
      openQuote(nq.id);
      toast('새 견적을 만들었습니다');
      break;
    }
    case 'dup': {
      const copy = { ...structuredClone(q), id: 'q' + Date.now().toString(36), title: q.title + ' (복사)', original: null, userPhotos: [] };
      quotes.splice(quotes.indexOf(q) + 1, 0, copy);
      persist();
      if (history.state?.detail) history.replaceState({ detail: copy.id }, '');
      ui.sel = copy.id;
      render();
      toast('복제했습니다 — 조건을 바꿔 비교해 보세요');
      break;
    }
    case 'del': {
      if (!confirm(`"${q.title}" 견적을 삭제할까요?`)) return;
      quotes = quotes.filter((x) => x !== q);
      deleteUserPhotos(q.userPhotos || []);
      ui.sel = quotes[0]?.id ?? null;
      persist();
      closeDetail();
      if (wideMQ.matches) render();
      toast('삭제했습니다');
      break;
    }
    case 'share': await shareQuote(q); break;
    case 'photo-add': document.getElementById('photoFile').click(); break;
    case 'photo-open': if (slidePhotos.length) openViewer(+el.dataset.i || 0); break;
    case 'slide': slideTo(currentSlide() + Number(el.dataset.d)); break;
    case 'photo-del': {
      const p = slidePhotos[+el.dataset.i];
      if (!p?.key || !confirm('이 사진을 삭제할까요?')) return;
      q.userPhotos = q.userPhotos.filter((k) => k !== p.key);
      persist();
      await deleteUserPhotos([p.key]);
      fillPhotoCard(q);
      toast('사진을 삭제했습니다');
      break;
    }
    case 'extra-bool': {
      q[el.dataset.f] = el.dataset.v === '1';
      persist();
      for (const b of el.parentElement.children) {
        b.classList.toggle('on', b === el);
        b.setAttribute('aria-pressed', String(b === el));
      }
      break;
    }
    case 'set-choice': {
      q[el.dataset.f] = el.dataset.v;
      persist();
      for (const b of el.parentElement.children) {
        b.classList.toggle('on', b === el);
        b.setAttribute('aria-pressed', String(b === el));
      }
      updateDerived();
      break;
    }
    case 'basis-set': basis[el.dataset.k] = el.dataset.v; saveBasis(); render(); break;
    case 'basis-reset': basis = { ...BASIS_DEFAULT }; saveBasis(); render(); toast('비교 기준을 처음 값으로 되돌렸습니다'); break;
    case 'cmp-view': ui.cmpView = el.dataset.v; render(); break;
    case 'ppt': await exportPpt(el); break;
    case 'auto':
      delete q.manual[el.dataset.f];
      persist();
      updateDerived();
      break;
    case 'cmp-toggle': {
      const ids = new Set(ui.cmpIds ?? quotes.map((x) => x.id));
      ids.has(el.dataset.id) ? ids.delete(el.dataset.id) : ids.add(el.dataset.id);
      ui.cmpIds = [...ids];
      render();
      break;
    }
    case 'install':
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        updateInstallBtn();
        render();
      }
      break;
    case 'export': exportData(); break;
    case 'import': document.getElementById('importFile').click(); break;
    case 'reset':
      if (!confirm('입력한 견적을 모두 지우고 받은 견적서 기본값으로 되돌릴까요?')) return;
      deleteUserPhotos(quotes.flatMap((x) => x.userPhotos || []));
      quotes = canonicalQuotes();
      ui.sel = quotes[0].id;
      ui.cmpIds = null;
      persist();
      render();
      toast('받은 견적 기본값으로 초기화했습니다');
      break;
  }
});

view.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.qcard')) {
    e.preventDefault();
    openQuote(e.target.dataset.id);
  }
});

view.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.basis) {
    const v = t.dataset.btype === 'pct' ? parseFloat(t.value) : t.dataset.btype === 'int' ? parseInt(t.value, 10) : parseMoney(t.value);
    basis[t.dataset.basis] = t.value.trim() === '' || !Number.isFinite(v) ? BASIS_DEFAULT[t.dataset.basis] : v;
    if (t.dataset.basis === 'months' && !(basis.months > 0)) basis.months = 60;
    saveBasis();
    const sel = cmpSelection();
    document.getElementById('basisResults').innerHTML = basisResultsHTML(sel, resolvedBasis(sel.length ? sel : quotes));
    return;
  }
  if (t.id === 'targetPay') {
    const q = byId(view.querySelector('.detail')?.dataset.qid);
    if (q) updateTargetHint(q);
    return;
  }
  const q = byId(view.querySelector('.detail')?.dataset.qid);
  if (!q) return;
  if (t.dataset.k) {
    const k = t.dataset.k;
    // 인도금은 저장값이 아니라 할부원금으로 환산: 할부원금 = 총 판매금액 − 계약금 − 전동차 지원금 − 인도금
    if (t.dataset.type === 'manual') {
      // 비우면 자동 계산으로 돌아감
      const c = calc(q);
      if (t.value.trim() === '') delete q.manual[k];
      else q.manual[k] = { value: parseMoney(t.value), key: k === 'acqTax' ? taxKey(q, c.totalSale) : loanKey(q) };
    } else if (k === 'basePrice') {
      // 선택사양이 없던 견적이면 순수차량가격도 기본가격을 따라감
      const v = parseMoney(t.value);
      if (q.purePrice === q.basePrice) q.purePrice = v;
      q.basePrice = v;
    } else if (t.dataset.type === 'money') q[k] = parseMoney(t.value);
    else if (t.dataset.type === 'pct') q[k] = parseFloat(t.value) || 0;
    else if (t.dataset.type === 'int') q[k] = Math.max(0, parseInt(t.value, 10) || 0);
    else q[k] = t.value;
    if (k === 'title') document.getElementById('dTitle').textContent = t.value;
  } else return;
  persist();
  updateDerived();
  const listCol = document.getElementById('listCol');
  if (listCol) listCol.innerHTML = renderListCol();
});

// 금액 입력칸: 편집 중엔 숫자만, 벗어나면 천 단위 쉼표
view.addEventListener('focusin', (e) => {
  const t = e.target;
  if (t.matches('[data-type="money"], [data-type="manual"], [data-btype="money"], #targetPay')) {
    t.value = String(parseMoney(t.value) || '');
    requestAnimationFrame(() => t.select());
  }
});
view.addEventListener('focusout', (e) => {
  const t = e.target;
  if (t.matches('[data-type="money"], #targetPay')) t.value = fmt(parseMoney(t.value));
  else if (t.matches('[data-btype="money"]')) {
    const sel = cmpSelection();
    t.value = fmt(resolvedBasis(sel.length ? sel : quotes)[t.dataset.basis]);   // 비웠으면 자동값 표시
  }
  else if (t.matches('[data-type="manual"]')) setTimeout(updateDerived);   // 비웠으면 자동 계산값 표시
});

view.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'baseSel') { ui.baseId = t.value; render(); }
  else if (t.id === 'photoFile' && t.files.length) {
    const q = byId(view.querySelector('.detail')?.dataset.qid);
    if (!q) return;
    addUserPhotos(q, [...t.files])
      .then((n) => { toast(`사진 ${n}장을 추가했습니다 (이 기기에만 저장)`); fillPhotoCard(q).then(() => slideTo(slidePhotos.length - 1)); })
      .catch(() => toast('사진을 저장하지 못했습니다'))
      .finally(() => { t.value = ''; });
  }
  else if (t.dataset.check != null) {
    checks[t.dataset.check] = t.checked;
    saveJSON(CHECK_KEY, checks);
    t.closest('.check-item').classList.toggle('done', t.checked);
  } else if (t.id === 'importFile' && t.files[0]) importData(t.files[0]);
});

let slideRaf = 0;
view.addEventListener('scroll', (e) => {
  if (e.target.id !== 'photoSlider') return;
  cancelAnimationFrame(slideRaf);
  slideRaf = requestAnimationFrame(updatePhotoNav);
}, true);

view.addEventListener('toggle', (e) => {
  if (e.target.id === 'basisBox') { ui.basisOpen = e.target.open; return; }
  if (e.target.id !== 'schedBox') return;
  ui.schedOpen = e.target.open;
  if (ui.schedOpen) updateDerived();
}, true);

/* ---------- 견적서 사진 ----------
 * photos: 앱에 포함된 견적서 사진(개인정보 가림) · userPhotos: 이 기기에서 직접 추가한 사진(IndexedDB, 외부 전송 없음) */
const PHOTO_DB = 'quoteCompare.photos';
const photoUrls = new Map();   // IndexedDB 키 → 화면용 URL

function photoStore(mode, fn) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(PHOTO_DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore('photos');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction('photos', mode);
      const req = fn(tx.objectStore('photos'));
      tx.oncomplete = () => resolve(req?.result);
      tx.onerror = () => reject(tx.error);
    };
  });
}

async function userPhotoUrl(key) {
  if (!photoUrls.has(key)) {
    try {
      const blob = await photoStore('readonly', (s) => s.get(key));
      if (blob) photoUrls.set(key, URL.createObjectURL(blob));
    } catch { /* 사진 저장소를 못 열면 건너뜀 */ }
  }
  return photoUrls.get(key) || null;
}

// 휴대폰 사진은 크기가 커서 긴 변 1600px로 줄여 저장
async function shrinkPhoto(file) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas');
    cv.width = Math.round(bmp.width * k);
    cv.height = Math.round(bmp.height * k);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return await new Promise((res) => cv.toBlob((b) => res(b || file), 'image/jpeg', 0.85));
  } catch {
    return file;
  }
}

async function addUserPhotos(q, files) {
  let n = 0;
  for (const file of files) {
    const key = `${q.id}:${Date.now().toString(36)}${n}`;
    const blob = await shrinkPhoto(file);   // 줄인 다음 저장 (저장 트랜잭션 안에서는 기다리면 안 됨)
    await photoStore('readwrite', (s) => s.put(blob, key));
    q.userPhotos = [...(q.userPhotos || []), key];
    n++;
  }
  persist();
  return n;
}

async function deleteUserPhotos(keys) {
  for (const key of keys) {
    try { await photoStore('readwrite', (s) => s.delete(key)); } catch { /* 없으면 무시 */ }
    if (photoUrls.has(key)) URL.revokeObjectURL(photoUrls.get(key));
    photoUrls.delete(key);
  }
}

// 견적 한 건의 사진 목록 [{ src, key? }] — 직접 추가한 사진은 비동기로 불러옴
async function photoList(q) {
  const list = (q.photos || []).map((src) => ({ src }));
  for (const key of q.userPhotos || []) {
    const src = await userPhotoUrl(key);
    if (src) list.push({ src, key });
  }
  return list;
}

function photoCardHTML(q) {
  return `<div class="card photo-card"><div class="photo-head"><h3>견적서 사진 <span class="small muted" id="photoCount"></span></h3>
      <button class="btn small" data-act="photo-add">＋ 사진 추가</button></div>
    <div class="slider" id="photoSlider"><div class="empty small">사진을 불러오는 중…</div></div>
    <div class="slider-nav" id="photoNav"></div>
    <input type="file" id="photoFile" accept="image/*" multiple hidden></div>`;
}

let slidePhotos = [];
async function fillPhotoCard(q) {
  const slider = document.getElementById('photoSlider');
  if (!slider) return;
  slidePhotos = await photoList(q);
  if (document.querySelector('.detail')?.dataset.qid !== q.id) return;   // 그 사이 다른 견적을 연 경우
  document.getElementById('photoCount').textContent = slidePhotos.length ? `(${slidePhotos.length}장)` : '';
  slider.innerHTML = slidePhotos.length
    ? slidePhotos.map((p, i) => `<figure class="slide"><img src="${p.src}" alt="견적서 사진 ${i + 1}" loading="lazy" data-act="photo-open" data-i="${i}"></figure>`).join('')
    : '<div class="empty small">사진이 없습니다. ＋ 사진 추가로 견적서 사진을 넣어 보세요.</div>';
  updatePhotoNav();
}

function currentSlide() {
  const s = document.getElementById('photoSlider');
  return s && s.clientWidth ? Math.round(s.scrollLeft / s.clientWidth) : 0;
}

function updatePhotoNav() {
  const nav = document.getElementById('photoNav');
  if (!nav) return;
  const i = currentSlide(), n = slidePhotos.length;
  nav.innerHTML = n > 0 ? `${n > 1 ? `<button class="btn small" data-act="slide" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="이전 사진">‹</button>
      <span class="dots">${slidePhotos.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</span>
      <button class="btn small" data-act="slide" data-d="1" ${i === n - 1 ? 'disabled' : ''} aria-label="다음 사진">›</button>` : ''}
    <button class="btn small" data-act="photo-open" data-i="${i}">크게 보기</button>
    ${slidePhotos[i]?.key ? `<button class="btn small danger" data-act="photo-del" data-i="${i}">이 사진 삭제</button>` : ''}` : '';
}

function slideTo(i) {
  const s = document.getElementById('photoSlider');
  if (s) s.scrollTo({ left: i * s.clientWidth, behavior: 'smooth' });
}

// 전체 화면 보기: 좌우로 넘기고, 사진을 누르면 확대/축소
function openViewer(start) {
  let i = start;
  const v = document.createElement('div');
  v.className = 'viewer';
  v.setAttribute('role', 'dialog');
  v.setAttribute('aria-label', '견적서 사진 크게 보기');
  const draw = () => {
    v.innerHTML = `<div class="viewer-bar"><span>${i + 1} / ${slidePhotos.length}</span>
        <span class="tiny">사진을 누르면 확대 · 두 손가락으로도 확대</span>
        <button class="btn small" data-v="close" aria-label="닫기">✕ 닫기</button></div>
      <div class="viewer-body"><img src="${slidePhotos[i].src}" alt="견적서 사진 ${i + 1}"></div>
      ${slidePhotos.length > 1 ? `<button class="viewer-arrow left" data-v="-1" ${i === 0 ? 'disabled' : ''} aria-label="이전">‹</button>
      <button class="viewer-arrow right" data-v="1" ${i === slidePhotos.length - 1 ? 'disabled' : ''} aria-label="다음">›</button>` : ''}`;
  };
  const close = () => { v.remove(); document.removeEventListener('keydown', onKey); };
  const go = (d) => { const n = i + d; if (n >= 0 && n < slidePhotos.length) { i = n; draw(); } };
  const onKey = (e) => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); };
  v.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (b) return b.dataset.v === 'close' ? close() : go(+b.dataset.v);
    if (e.target.tagName === 'IMG') e.target.parentElement.classList.toggle('zoom');
  });
  let x0 = null;
  v.addEventListener('touchstart', (e) => { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  v.addEventListener('touchend', (e) => {
    if (x0 == null || v.querySelector('.zoom')) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  });
  document.addEventListener('keydown', onKey);
  draw();
  document.body.appendChild(v);
}

/* ---------- 공유 / 백업 ---------- */
async function shareQuote(q) {
  const c = calc(q);
  const text = [
    `[${q.title}]`,
    `${q.model} ${q.trim}`.trim(),
    `선택 품목: ${optText(q)}`,
    `색상: ${q.extColor} / ${q.intColor}`,
    `총 판매금액: ${won(c.totalSale)}`,
    `할부: ${won(q.principal)} · ${q.rate}% · ${q.months}개월 → 월 ${won(c.loan.monthly)}`,
    `등록비용: ${won(c.regTotal)} (취득세 ${won(c.acqTax)})`,
    `등록비 포함 납입: ${won(c.pay2)}`,
    `옵션: ${EXTRA_ROWS.map((r) => `${r.l} ${hasExtra(q, r) ? (r.bool ? '있음' : q[r.k]) : '없음'}`).join(' / ')}`,
    `총 소요비용: ${won(c.tco)}`,
  ].join('\n');
  try {
    if (navigator.share) { await navigator.share({ title: q.title, text }); return; }
    await navigator.clipboard.writeText(text);
    toast('견적 요약을 복사했습니다');
  } catch (err) {
    if (err?.name !== 'AbortError') toast('공유할 수 없습니다');
  }
}

function downloadBlob(blob, fileName) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

function exportData() {
  downloadBlob(new Blob([JSON.stringify({ app: 'quote-compare', version: 1, quotes }, null, 2)], { type: 'application/json' }), `차량견적_${today()}.json`);
  toast('백업 파일을 저장했습니다');
}

/* ---------- PPT 내보내기 (비교 탭에서 선택한 견적) ---------- */
const quoteLabel = (q) => {
  const i = quotes.indexOf(q);
  return i < 26 ? String.fromCharCode(65 + i) : String(i + 1);
};
const plain = (html) => {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent;
};

function deckData(sel) {
  const models = [...new Set(sel.map((q) => q.model.trim()).filter(Boolean))];
  return {
    title: '차량 견적 비교',
    subtitle: models.length === 1 ? models[0] : '견적 비교',
    date: today(),
    insights: insights(sel).map(([, , html]) => plain(html)),
    quotes: sel.map((q) => {
      const c = calc(q);
      return {
        label: quoteLabel(q), title: q.title, trim: q.trim, optionText: q.optionText,
        basePrice: q.basePrice, purePrice: q.purePrice, delivery: q.delivery, totalSale: c.totalSale,
        principal: q.principal, rate: q.rate, months: q.months, method: q.method, monthly: c.loan.monthly, interest: c.loan.interest,
        acqTax: c.acqTax, regTotal: c.regTotal, insurance: q.insurance, pay2: c.pay2, tco: c.tco,
        extras: { tint: q.tint, blackbox: q.blackbox, ppf: q.ppf, glassCoat: q.glassCoat, waterCoat: q.waterCoat },
      };
    }),
  };
}

const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = resolve;
  s.onerror = () => reject(new Error(src));
  document.head.appendChild(s);
});
let pptLibs = null;

async function exportPpt(btn) {
  const sel = cmpSelection();
  if (!sel.length) return;
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'PPT 만드는 중…';
  try {
    // 라이브러리는 처음 누를 때만 불러옴 (설치 후에는 오프라인에서도 동작)
    pptLibs ??= Promise.all([loadScript('vendor/pptxgen.bundle.js'), loadScript(`ppt.js?v=${APP_VERSION}`)]);
    await pptLibs;
    const zip = await buildQuoteDeck(PptxGenJS, deckData(sel)).write({ outputType: 'blob' });
    const blob = new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    downloadBlob(blob, `차량견적비교_${today()}.pptx`);
    toast('PPT를 다운로드했습니다');
  } catch (err) {
    pptLibs = null;
    console.error(err);
    toast('PPT를 만들지 못했습니다');
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}

async function importData(file) {
  try {
    const data = JSON.parse(await file.text());
    const list = Array.isArray(data) ? data : data.quotes;
    if (!Array.isArray(list) || !list.every((x) => x && typeof x.id === 'string' && typeof x.basePrice === 'number')) throw new Error('형식 오류');
    if (!confirm(`백업의 견적 ${list.length}건으로 현재 목록을 바꿀까요?`)) return;
    quotes = list.map(migrate);
    ui.sel = quotes[0]?.id ?? null;
    ui.cmpIds = null;
    persist();
    render();
    toast(`${list.length}건을 불러왔습니다`);
  } catch {
    toast('백업 파일을 읽을 수 없습니다');
  }
}

/* ---------- 설치 · 오프라인 ---------- */
const installBtn = document.getElementById('installBtn');
function updateInstallBtn() { installBtn.hidden = !deferredPrompt; }
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  updateInstallBtn();
  if (ui.tab === 'settings') render();
});
addEventListener('appinstalled', () => { deferredPrompt = null; updateInstallBtn(); toast('앱이 설치되었습니다'); });
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  updateInstallBtn();
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

render();
