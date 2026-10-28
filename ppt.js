/* 견적 비교 PPT 만들기 (PptxGenJS)
 * 견적이 늘어나도 한눈에 보이도록 표·차트를 쪽으로 나눔:
 *   요약 순위표·차트·옵션표는 한 쪽에 8건, 가격 상세표는 한 쪽에 4건 */
(function (root) {
  'use strict';

  const FONT = 'Malgun Gothic';
  const COLOR = {
    navy: '1D3F73', navySoft: '2B5AA0', ice: 'CADCFC', teal: '17A39A',
    text: '17223A', muted: '5D6B84', line: 'DBE2EE', card: 'F3F6FB', head: 'E8EEF7',
    good: '11865A', goodBg: 'E3F5EC', bad: 'C0392B', white: 'FFFFFF', amber: 'F0A43A',
  };
  const W = 13.333, MX = 0.6, CW = W - MX * 2;   // 와이드 16:9, 좌우 여백
  const ROWS_PER_PAGE = 8, COLS_PER_PAGE = 4;

  const nf = new Intl.NumberFormat('ko-KR');
  const fmt = (n) => nf.format(Math.round(n));
  const won = (n) => fmt(n) + '원';
  const man = (n) => nf.format(Math.round(n / 1000) / 10) + '만원';
  const signedMan = (n) => (n > 0 ? '+' : n < 0 ? '−' : '±') + man(Math.abs(n));
  const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const name = (q) => `${q.label}. ${q.title}`;

  function buildQuoteDeck(PptxGenJS, data) {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = data.title;
    pptx.author = '차량 견적 비교 앱';
    pptx.theme = { headFontFace: FONT, bodyFontFace: FONT };

    const qs = data.quotes;
    const ranked = [...qs].sort((a, b) => a.tco - b.tco);
    const best = ranked[0], worst = ranked[ranked.length - 1];
    const minOf = (k) => Math.min(...qs.map((q) => q[k]));

    const text = (slide, t, o) => slide.addText(t, { fontFace: FONT, isTextBox: true, margin: 0, ...o });
    const footer = (slide, dark) => {
      text(slide, `${data.title} · ${data.date} 기준`, { x: MX, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: dark ? COLOR.ice : COLOR.muted });
      slide.slideNumber = { x: W - MX - 0.6, y: 7.0, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 10, color: dark ? COLOR.ice : COLOR.muted, align: 'right' };
    };
    const header = (slide, title, sub, page, pages) => {
      text(slide, title + (pages > 1 ? `  (${page}/${pages})` : ''), { x: MX, y: 0.4, w: CW, h: 0.6, fontSize: 28, bold: true, color: COLOR.navy });
      if (sub) text(slide, sub, { x: MX, y: 1.0, w: CW, h: 0.35, fontSize: 14, color: COLOR.muted });
      footer(slide, false);
    };
    const cell = (t, o = {}) => ({ text: String(t), options: o });
    const tableOpts = (y, colW, rowH) => ({
      x: MX, y, w: colW.reduce((s, v) => s + v, 0), colW, rowH,
      fontFace: FONT, fontSize: 13, color: COLOR.text, align: 'center', valign: 'middle', margin: 0.05,
      border: { type: 'solid', pt: 0.75, color: COLOR.line },
    });
    const HEAD = { bold: true, fill: { color: COLOR.head }, color: COLOR.navy };

    /* 1. 표지 */
    {
      const s = pptx.addSlide();
      s.background = { color: COLOR.navy };
      text(s, '차량 견적 비교', { x: MX, y: 0.9, w: CW, h: 0.4, fontSize: 18, bold: true, color: COLOR.ice });
      text(s, data.subtitle, { x: MX, y: 1.4, w: CW, h: 1.15, fontSize: 32, bold: true, color: COLOR.white, valign: 'top' });
      text(s, `견적 ${qs.length}건 · ${data.date} 기준`, { x: MX, y: 2.7, w: CW, h: 0.4, fontSize: 16, color: COLOR.ice });

      s.addShape(pptx.ShapeType.roundRect, { x: MX, y: 3.6, w: 7.2, h: 2.7, fill: { color: COLOR.white }, line: { color: COLOR.white }, rectRadius: 0.12 });
      text(s, '총 소요비용이 가장 낮은 견적', { x: MX + 0.4, y: 3.85, w: 6.4, h: 0.35, fontSize: 14, color: COLOR.muted });
      text(s, cut(name(best), 30), { x: MX + 0.4, y: 4.25, w: 6.4, h: 0.5, fontSize: 22, bold: true, color: COLOR.navy });
      text(s, man(best.tco), { x: MX + 0.4, y: 4.8, w: 6.4, h: 0.85, fontSize: 44, bold: true, color: COLOR.teal });
      text(s, qs.length > 1 ? `가장 높은 견적(${worst.label})보다 ${man(worst.tco - best.tco)} 적음 · 월 ${won(best.monthly)}` : `월 ${won(best.monthly)}`,
        { x: MX + 0.4, y: 5.7, w: 6.4, h: 0.35, fontSize: 14, color: COLOR.text });

      text(s, [
        { text: '총 소요비용', options: { bold: true, breakLine: true } },
        { text: '차를 받을 때까지 내는 현금(Ⅱ)과 할부 원금·이자를 모두 합한 금액', options: { breakLine: true } },
        { text: ' ', options: { breakLine: true } },
        { text: '현금 필요(Ⅱ)', options: { bold: true, breakLine: true } },
        { text: '할부원금을 뺀 계약금·인도금·보험료·등록비용 합계' },
      ], { x: 8.4, y: 3.7, w: 4.3, h: 2.5, fontSize: 14, color: COLOR.ice, valign: 'top' });
      footer(s, true);
    }

    /* 2. 한눈에 보기 — 총 소요비용 순위 */
    chunk(ranked, ROWS_PER_PAGE).forEach((page, pi, pages) => {
      const s = pptx.addSlide();
      header(s, '한눈에 보기', '총 소요비용이 낮은 순서 · 초록 칸 = 항목별 최저', pi + 1, pages.length);
      const colW = [0.7, 3.2, 1.75, 1.6, 1.75, 1.75, 1.38];
      const minM = minOf('monthly'), minP = minOf('pay2'), minS = minOf('totalSale');
      const rows = [[
        cell('순위', HEAD), cell('견적', HEAD), cell('총 판매금액', HEAD), cell('월 납입금', HEAD),
        cell('현금 필요(Ⅱ)', HEAD), cell('총 소요비용', HEAD), cell('최저 대비', HEAD),
      ]];
      page.forEach((q, i) => {
        const rank = pi * ROWS_PER_PAGE + i + 1;
        const top = q === best;
        const hl = (on) => (on ? { fill: { color: COLOR.goodBg }, color: COLOR.good, bold: true } : {});
        rows.push([
          cell(rank, { bold: true, color: top ? COLOR.good : COLOR.text }),
          cell(cut(name(q), 21), { align: 'left', bold: top }),
          cell(man(q.totalSale), hl(q.totalSale === minS)),
          cell(won(q.monthly), hl(q.monthly === minM)),
          cell(man(q.pay2), hl(q.pay2 === minP)),
          cell(man(q.tco), { ...hl(top), bold: true }),
          cell(top ? '최저' : signedMan(q.tco - best.tco), { color: top ? COLOR.good : COLOR.bad, fontSize: 12 }),
        ]);
      });
      s.addTable(rows, tableOpts(1.55, colW, 0.56));
    });

    /* 3. 총 소요비용 구성 + 월 납입금 차트 */
    chunk(ranked, ROWS_PER_PAGE).forEach((page, pi, pages) => {
      const s = pptx.addSlide();
      header(s, '비용 구성 비교', '단위: 만원 · 총 소요비용이 낮은 순서', pi + 1, pages.length);
      const labels = page.map((q) => cut(name(q), 22));
      const toMan = (v) => Math.round(v / 10000);
      const axis = { fontFace: FONT, color: COLOR.muted };
      s.addChart(pptx.ChartType.bar, [
        { name: '총 판매금액', labels, values: page.map((q) => toMan(q.totalSale)) },
        { name: '할부 이자', labels, values: page.map((q) => toMan(q.interest)) },
        { name: '등록비용·보험', labels, values: page.map((q) => toMan(q.regTotal + q.insurance)) },
      ], {
        x: MX, y: 1.5, w: 7.9, h: 5.3, barDir: 'bar', barGrouping: 'stacked', barGapWidthPct: 60,
        chartColors: [COLOR.navySoft, COLOR.amber, COLOR.teal],
        catAxisOrientation: 'maxMin', catAxisLabelFontFace: axis.fontFace, catAxisLabelFontSize: 12, catAxisLabelColor: COLOR.text,
        valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
        showValue: true, dataLabelPosition: 'ctr', dataLabelFontFace: FONT, dataLabelFontSize: 11, dataLabelColor: COLOR.white, dataLabelFormatCode: '#,##0',
        showLegend: true, legendPos: 'b', legendFontFace: FONT, legendFontSize: 12, legendColor: COLOR.text,
        showTitle: true, title: '총 소요비용 구성', titleFontFace: FONT, titleFontSize: 14, titleColor: COLOR.navy,
      });
      s.addChart(pptx.ChartType.bar, [
        { name: '월 납입금', labels: page.map((q) => q.label), values: page.map((q) => q.monthly) },
      ], {
        x: 8.8, y: 1.5, w: 3.9, h: 5.3, barDir: 'bar', barGapWidthPct: 60, chartColors: [COLOR.navy],
        valAxisMinVal: 0, valAxisMaxVal: Math.ceil(Math.max(...page.map((q) => q.monthly)) * 1.45 / 10000) * 10000,   // 값 라벨 자리 확보
        catAxisOrientation: 'maxMin', catAxisLabelFontFace: axis.fontFace, catAxisLabelFontSize: 12, catAxisLabelColor: COLOR.text,
        valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
        showValue: true, dataLabelPosition: 'outEnd', dataLabelFontFace: FONT, dataLabelFontSize: 11, dataLabelColor: COLOR.text, dataLabelFormatCode: '#,##0"원"',
        showLegend: false, showTitle: true, title: '월 납입금', titleFontFace: FONT, titleFontSize: 14, titleColor: COLOR.navy,
      });
    });

    /* 4. 가격 상세 비교 — 견적이 열, 한 쪽에 4건 */
    const DETAIL = [
      { l: '트림', v: (q) => cut(q.trim || '-', 16) },
      { l: '선택 품목', v: (q) => cut(q.optionText || '없음', 22), small: true },
      { l: '차량기본가격', k: 'basePrice', min: true },
      { l: '순수차량가격', k: 'purePrice', min: true },
      { l: '탁송료', k: 'delivery' },
      { l: '총 판매금액', k: 'totalSale', min: true, strong: true },
      { l: '할부원금', k: 'principal' },
      { l: '금리 / 기간', v: (q) => `${q.rate}% / ${q.months}개월${q.method === 'principal' ? ' · 원금균등' : ''}` },
      { l: '월 납입금', k: 'monthly', min: true, strong: true },
      { l: '이자총액', k: 'interest', min: true },
      { l: '취득세', k: 'acqTax', min: true },
      { l: '등록비용 계', k: 'regTotal', min: true },
      { l: '현금 필요(Ⅱ)', k: 'pay2', strong: true },
      { l: '총 소요비용', k: 'tco', min: true, strong: true },
    ];
    chunk(qs, COLS_PER_PAGE).forEach((page, pi, pages) => {
      const s = pptx.addSlide();
      header(s, '가격 상세 비교', '견적서 금액 그대로 (단위: 원) · 초록 칸 = 전체 견적 중 최저', pi + 1, pages.length);
      const colW = [2.3, ...page.map(() => (CW - 2.3) / page.length)];
      const rows = [[cell('항목', HEAD), ...page.map((q) => cell(cut(name(q), page.length <= 2 ? 40 : 30), HEAD))]];
      for (const r of DETAIL) {
        const min = r.min && qs.length > 1 ? minOf(r.k) : null;
        rows.push([
          cell(r.l, { bold: true, color: r.strong ? COLOR.navy : COLOR.muted, fill: { color: COLOR.card } }),
          ...page.map((q) => {
            if (r.v) return cell(r.v(q), { fontSize: r.small ? 11 : 13 });
            const on = min != null && q[r.k] === min;
            return cell(fmt(q[r.k]), { bold: !!r.strong || on, ...(on ? { fill: { color: COLOR.goodBg }, color: COLOR.good } : {}) });
          }),
        ]);
      }
      s.addTable(rows, tableOpts(1.45, colW, [0.55, ...DETAIL.map(() => 0.34)]));
    });

    /* 5. 옵션 비교 — 견적이 행, 한 쪽에 8건 */
    const OPT = [
      { l: '썬팅', k: 'tint' }, { l: '블랙박스', k: 'blackbox' }, { l: 'PPF', k: 'ppf' },
      { l: '유리막코팅', k: 'glassCoat', bool: true }, { l: '발수코팅', k: 'waterCoat', bool: true },
    ];
    const has = (q, o) => (o.bool ? !!q.extras[o.k] : !!String(q.extras[o.k] || '').trim());
    const counts = new Map(qs.map((q) => [q, OPT.filter((o) => has(q, o)).length]));
    const maxCount = Math.max(...counts.values());
    chunk(qs, ROWS_PER_PAGE).forEach((page, pi, pages) => {
      const s = pptx.addSlide();
      header(s, '옵션 비교', maxCount ? '용품 · 서비스 포함 여부 · 초록 칸 = 포함 항목이 가장 많은 견적' : '아직 입력된 옵션이 없습니다 — 앱의 견적 화면 ⑤ 옵션에서 입력하세요', pi + 1, pages.length);
      const colW = [2.9, 2.0, 2.0, 2.0, 1.3, 1.3, 0];
      colW[6] = CW - colW.reduce((a, b) => a + b, 0);
      const rows = [[cell('견적', HEAD), ...OPT.map((o) => cell(o.l, HEAD)), cell('포함', HEAD)]];
      for (const q of page) {
        const n = counts.get(q);
        rows.push([
          cell(cut(name(q), 19), { align: 'left' }),
          ...OPT.map((o) => {
            if (!has(q, o)) return cell('없음', { color: COLOR.muted, fontSize: 12 });
            return o.bool ? cell('있음', { bold: true, color: COLOR.good, fill: { color: COLOR.goodBg } })
              : cell(cut(String(q.extras[o.k]), 24), { fontSize: 12 });
          }),
          cell(`${n}/${OPT.length}`, n === maxCount && n > 0 && qs.length > 1 ? { bold: true, color: COLOR.good, fill: { color: COLOR.goodBg } } : { bold: true }),
        ]);
      }
      s.addTable(rows, tableOpts(1.55, colW, 0.56));
    });

    /* 6. 정리 */
    {
      const s = pptx.addSlide();
      s.background = { color: COLOR.navy };
      text(s, '정리', { x: MX, y: 0.6, w: CW, h: 0.7, fontSize: 32, bold: true, color: COLOR.white });
      const items = data.insights.slice(0, 5);
      text(s, items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 10 } })),
        { x: MX, y: 1.6, w: 7.6, h: 4.9, fontSize: 16, color: COLOR.white, valign: 'top' });
      s.addShape(pptx.ShapeType.roundRect, { x: 8.7, y: 1.6, w: 4.0, h: 2.5, fill: { color: COLOR.navySoft }, line: { color: COLOR.navySoft }, rectRadius: 0.12 });
      text(s, [
        { text: '실제로 준비할 현금', options: { bold: true, fontSize: 16, breakLine: true } },
        { text: ' ', options: { fontSize: 8, breakLine: true } },
        { text: '현금 필요(Ⅱ)', options: { breakLine: true } },
        { text: '+ 자동차보험(임의보험)', options: { breakLine: true } },
        { text: '+ 썬팅·블랙박스 등 용품비', options: { breakLine: true } },
        { text: ' ', options: { fontSize: 8, breakLine: true } },
        { text: '할부 금리는 견적서상 참고용 — 실제 승인 금리 확인', options: { fontSize: 12, color: COLOR.ice } },
      ], { x: 9.0, y: 1.85, w: 3.4, h: 2.1, fontSize: 14, color: COLOR.white, valign: 'top' });
      footer(s, true);
    }

    return pptx;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = buildQuoteDeck;
  else root.buildQuoteDeck = buildQuoteDeck;
})(typeof self !== 'undefined' ? self : this);
