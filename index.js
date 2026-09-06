const http = require('http');
const url = require('url');

// 1. 천간/지지/오행 정의
const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const OHENG = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토',
  '경': '금', '신': '금', '임': '수', '계': '수',
  '인': '목', '묘': '목', '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금', '해': '수', '자': '수'
};

// 12시진 레이블 정의
const TIME_SLOTS = [
  { value: 'unknown', label: '태어난 시간 모름' },
  { value: '0', label: '자시 (23:30 ~ 01:29)' },
  { value: '1', label: '축시 (01:30 ~ 03:29)' },
  { value: '2', label: '인시 (03:30 ~ 05:29)' },
  { value: '3', label: '묘시 (05:30 ~ 07:29)' },
  { value: '4', label: '진시 (07:30 ~ 09:29)' },
  { value: '5', label: '사시 (09:30 ~ 11:29)' },
  { value: '6', label: '오시 (11:30 ~ 13:29)' },
  { value: '7', label: '미시 (13:30 ~ 15:29)' },
  { value: '8', label: '신시 (15:30 ~ 17:29)' },
  { value: '9', label: '유시 (17:30 ~ 19:29)' },
  { value: '10', label: '술시 (19:30 ~ 21:29)' },
  { value: '11', label: '해시 (21:30 ~ 23:29)' }
];

const ILGAN_DETAILS = {
  '갑': { title: '푸른 거목(甲木)', desc: '우뚝 솟은 큰 나무처럼 명예와 자존심이 높으며 리더십과 뚝심이 뛰어납니다.' },
  '을': { title: '유연한 담쟁이(乙木)', desc: '어떠한 환경에서도 끈질기게 적응하는 생활력과 친화력을 갖추고 있습니다.' },
  '병': { title: '타오르는 태양(丙火)', desc: '솔직하고 열정적이며 자신을 숨김없이 표현하는 당당함과 추진력이 있습니다.' },
  '정': { title: '온기를 품은 등불(丁火)', desc: '차분해 보이지만 내면에 강한 집중력과 따뜻한 통찰력을 간직한 현실주의자입니다.' },
  '무': { title: '광활한 대산(戊土)', desc: '넓은 대지나 산처럼 묵직하며, 신뢰와 포용력을 바탕으로 중심을 지킵니다.' },
  '기': { title: '비옥한 정원(己土)', desc: '곡식을 길러내는 흙처럼 섬세하고 다정다감하며 계획적이고 실속을 중시합니다.' },
  '경': { title: '강인한 무쇠(庚金)', desc: '의리와 결단력이 돋보이며 한번 결정한 일은 망설임 없이 밀어붙이는 돌파력이 있습니다.' },
  '신': { title: '정교한 보석(辛金)', desc: '날카로운 감각과 완벽주의를 가졌으며 자기만의 기준과 미적 감각이 매우 뛰어납니다.' },
  '임': { title: '거대한 큰 바다(壬水)', desc: '끝없이 흐르는 큰 물처럼 유연한 사고방식, 지혜, 넓은 시야를 지니고 있습니다.' },
  '계': { title: '생명을 살리는 빗물(癸水)', desc: '조용히 주변에 스며드는 감수성과 뛰어난 기획력, 남다른 촉과 직관을 가집니다.' }
};

const OHENG_PRESCRIPTIONS = {
  '목': { keyword: '시작과 추진력 보강', detail: '작은 일부터 주저 없이 실행에 옮기세요.', luckyColor: '초록색, 민트색', luckyItem: '식물 화분, 원목 소품', luckyDir: '동쪽' },
  '화': { keyword: '열정과 표현력 활성화', detail: '자신의 생각을 외부로 당당히 표현하세요.', luckyColor: '빨간색, 다홍색', luckyItem: '밝은 조명, 유산소 운동', luckyDir: '남쪽' },
  '토': { keyword: '안정감과 신용 축적', detail: '규칙적인 생활 패턴과 원칙을 지키세요.', luckyColor: '노란색, 베이지, 브라운', luckyItem: '도자기 소품, 규칙적 식사', luckyDir: '중앙' },
  '금': { keyword: '결단력과 정리정돈', detail: '불필요한 관계나 미련을 과감히 덜어내세요.', luckyColor: '흰색, 은색, 메탈릭', luckyItem: '금속 액세서리, 메모 습관', luckyDir: '서쪽' },
  '수': { keyword: '유연성과 여유 충전', detail: '잠시 멈추어 명상하고 재충전하는 시간을 가지세요.', luckyColor: '검정색, 네이비', luckyItem: '충분한 수분 섭취, 반신욕', luckyDir: '북쪽' }
};

const PRONUNCIATION_OHENG = {
  'ㄱ': '목', 'ㅋ': '목', 'ㄴ': '화', 'ㄷ': '화', 'ㄹ': '화', 'ㅌ': '화',
  'ㅇ': '토', 'ㅎ': '토', 'ㅅ': '금', 'ㅈ': '금', 'ㅊ': '금',
  'ㅁ': '수', 'ㅂ': '수', 'ㅍ': '수'
};

const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

function getChosung(char) {
  const code = char.charCodeAt(0) - 44032;
  if (code < 0 || code > 11171) return null;
  return CHOSUNG_LIST[Math.floor(code / 588)];
}

function analyzeName(name) {
  const nameOheng = [];
  for (let char of name) {
    const cho = getChosung(char);
    let baseCho = cho;
    if (cho === 'ㄲ') baseCho = 'ㄱ';
    if (cho === 'ㄸ') baseCho = 'ㄷ';
    if (cho === 'ㅃ') baseCho = 'ㅂ';
    if (cho === 'ㅆ') baseCho = 'ㅅ';
    if (cho === 'ㅉ') baseCho = 'ㅈ';

    const elem = PRONUNCIATION_OHENG[baseCho] || '기타';
    nameOheng.push({ char, cho, oheng: elem });
  }
  return nameOheng;
}

// 사주 4주 계산 (시두법 적용)
function getFullSaju(year, month, day, timeIdx) {
  // 연주
  const yearDiff = year - 1984;
  const yearCheongan = CHEONGAN[((yearDiff % 10) + 10) % 10];
  const yearJiji = JIJI[((yearDiff % 12) + 12) % 12];
  const yearPillar = `${yearCheongan}${yearJiji}`;

  // 일주
  const baseDate = new Date(Date.UTC(1900, 0, 1));
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  const dayIndex = ((diffDays + 10) % 60 + 60) % 60;
  const dayCheongan = CHEONGAN[dayIndex % 10];
  const dayJiji = JIJI[dayIndex % 12];
  const dayPillar = `${dayCheongan}${dayJiji}`;

  // 월주
  const monthJijiIndex = (month + 1) % 12;
  const yearCheonganIdx = CHEONGAN.indexOf(yearCheongan);
  const startMonthCheongan = (yearCheonganIdx % 5) * 2 + 2;
  const monthCheongan = CHEONGAN[(startMonthCheongan + (month - 2 + 12) % 12) % 10];
  const monthPillar = `${monthCheongan}${JIJI[monthJijiIndex]}`;

  // 시주 계산 (시두법: 日干 기준)
  let hourPillar = null;
  if (timeIdx !== 'unknown' && timeIdx !== '' && timeIdx !== null && timeIdx !== undefined) {
    const tIdx = parseInt(timeIdx, 10);
    const dayCheonganIdx = CHEONGAN.indexOf(dayCheongan);
    const startHourCheongan = (dayCheonganIdx % 5) * 2;
    const hourCheongan = CHEONGAN[(startHourCheongan + tIdx) % 10];
    const hourJiji = JIJI[tIdx];
    hourPillar = `${hourCheongan}${hourJiji}`;
  }

  return { yearPillar, monthPillar, dayPillar, hourPillar };
}

function analyze(name, year, month, day, timeIdx) {
  const saju = getFullSaju(year, month, day, timeIdx);

  // 오행 카운트
  const activePillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar];
  if (saju.hourPillar) activePillars.push(saju.hourPillar);

  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  activePillars.forEach(p => {
    for (let char of p) if (OHENG[char]) counts[OHENG[char]]++;
  });

  let lackingElement = null;
  for (const [elem, count] of Object.entries(counts)) {
    if (count === 0) {
      lackingElement = elem;
      break;
    }
  }

  const nameAnalysis = analyzeName(name);
  const nameElements = nameAnalysis.map(item => item.oheng);
  const isCovered = lackingElement ? nameElements.includes(lackingElement) : false;

  const ilgan = saju.dayPillar[0];
  const ilganInfo = ILGAN_DETAILS[ilgan] || { title: '미지의 본질', desc: '독창적인 재능을 가졌습니다.' };
  const prescription = lackingElement ? OHENG_PRESCRIPTIONS[lackingElement] : null;

  return { saju, counts, lackingElement, nameAnalysis, nameElements, isCovered, ilganInfo, prescription };
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let resultHtml = '';

  const qName = parsedUrl.query.name;
  const qBirth = parsedUrl.query.birth;
  const qTime = parsedUrl.query.time || 'unknown';

  if (qName && qBirth) {
    const name = qName.trim();
    const birth = qBirth.trim();

    if (birth.length === 8 && !isNaN(birth)) {
      const y = parseInt(birth.substring(0, 4), 10);
      const m = parseInt(birth.substring(4, 6), 10);
      const d = parseInt(birth.substring(6, 8), 10);

      const r = analyze(name, y, m, d, qTime);
      const totalChars = r.saju.hourPillar ? 8 : 6;

      resultHtml = `
        <div class="result-box">
          <h2>🔮 ${name} 님의 정밀 사주 리포트</h2>
          <div class="summary-line">
            <span><strong>생년월일:</strong> ${y}.${m}.${d}</span>
            <span><strong>분석 단위:</strong> ${totalChars === 8 ? '4주 8자(완전체)' : '3주 6자(시간미포함)'}</span>
          </div>

          <div class="pillar-board">
            <div class="pillar-col">
              <span class="p-title">시주(時)</span>
              <span class="p-val">${r.saju.hourPillar || '미상'}</span>
            </div>
            <div class="pillar-col active">
              <span class="p-title">일주(日)</span>
              <span class="p-val">${r.saju.dayPillar}</span>
            </div>
            <div class="pillar-col">
              <span class="p-title">월주(月)</span>
              <span class="p-val">${r.saju.monthPillar}</span>
            </div>
            <div class="pillar-col">
              <span class="p-title">연주(年)</span>
              <span class="p-val">${r.saju.yearPillar}</span>
            </div>
          </div>

          <div class="section-card">
            <h4>🌟 타고난 본질: ${r.ilganInfo.title}</h4>
            <p>${r.ilganInfo.desc}</p>
          </div>

          <div class="section-card">
            <h4>⚖️ 오행 분포 (${totalChars}자 기준)</h4>
            <div class="oheng-bar">
              <span>목: <b>${r.counts.목}</b></span>
              <span>화: <b>${r.counts.화}</b></span>
              <span>토: <b>${r.counts.토}</b></span>
              <span>금: <b>${r.counts.금}</b></span>
              <span>수: <b>${r.counts.수}</b></span>
            </div>
          </div>

          <div class="section-card">
            <h4>🏷️ 성명학 발음오행 조화</h4>
            <p>${r.nameAnalysis.map(item => `${item.char}(${item.cho}) $\\rightarrow$ <b>${item.oheng}</b>`).join(' | ')}</p>
            <p class="synergy-highlight">${
              r.isCovered 
                ? `✅ 사주에 부족했던 [${r.lackingElement}] 기운을 이름('${name}')이 완벽하게 보완합니다.` 
                : !r.lackingElement 
                ? `✅ 사주 오행이 고루 분포되어 있어 이름과도 조화롭습니다.`
                : `ℹ️ 사주의 [${r.lackingElement}] 기운이 비어 있으나 이름의 [${r.nameElements.join(', ')}] 기운이 새로운 기회를 엽니다.`
            }</p>
          </div>

          ${r.prescription ? `
          <div class="section-card prescription">
            <h4>🍀 부족한 [${r.lackingElement}] 기운 보강 처방</h4>
            <p><strong>행동 지침:</strong> ${r.prescription.keyword} - ${r.prescription.detail}</p>
            <p><strong>행운의 색상:</strong> ${r.prescription.luckyColor}</p>
            <p><strong>행운의 소품:</strong> ${r.prescription.luckyItem}</p>
            <p><strong>유리한 방위:</strong> ${r.prescription.luckyDir}</p>
          </div>
          ` : `
          <div class="section-card prescription">
            <h4>🍀 맞춤 처방</h4>
            <p>오행의 조화가 갖추어져 있습니다. 현재의 일상 패턴을 유지하는 것이 최고의 개운법입니다.</p>
          </div>
          `}
        </div>
      `;
    }
  }

  // 드롭다운 옵션 HTML 생성
  const timeOptionsHtml = TIME_SLOTS.map(t => {
    const selected = qTime === t.value ? 'selected' : '';
    return `<option value="${t.value}" ${selected}>${t.label}</option>`;
  }).join('');

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>사주 x 성명학 전문 분석기</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; display: flex; justify-content: center; padding: 30px 15px; margin: 0; }
        .card { background: #151d2f; padding: 28px; border-radius: 18px; width: 100%; max-width: 500px; box-shadow: 0 15px 35px rgba(0,0,0,0.6); border: 1px solid #1e293b; }
        h1 { font-size: 22px; text-align: center; margin-bottom: 20px; color: #38bdf8; font-weight: 700; }
        .input-group { margin-bottom: 14px; }
        label { display: block; font-size: 13px; margin-bottom: 5px; color: #94a3b8; font-weight: 600; }
        input, select { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #090d16; color: #fff; box-sizing: border-box; font-size: 15px; }
        input:focus, select:focus { outline: 2px solid #38bdf8; }
        button { width: 100%; padding: 14px; border-radius: 8px; border: none; background: #0284c7; color: #ffffff; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 10px; }
        button:hover { background: #0369a1; }
        .result-box { margin-top: 26px; }
        .result-box h2 { font-size: 18px; color: #38bdf8; margin: 0 0 12px 0; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
        .summary-line { display: flex; justify-content: space-between; font-size: 13px; color: #94a3b8; margin-bottom: 14px; }
        
        /* 4주 팔자 간지 전광판 UI */
        .pillar-board { display: flex; gap: 8px; margin-bottom: 16px; }
        .pillar-col { flex: 1; background: #090d16; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 4px; text-align: center; }
        .pillar-col.active { border-color: #38bdf8; background: #0c1f36; }
        .p-title { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
        .p-val { font-size: 16px; font-weight: bold; color: #f8fafc; letter-spacing: 2px; }

        .section-card { background: #090d16; padding: 14px; border-radius: 10px; border: 1px solid #1e293b; margin-bottom: 12px; }
        .section-card h4 { margin: 0 0 6px 0; font-size: 14px; color: #e2e8f0; }
        .section-card p { margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.5; }
        .oheng-bar { display: flex; justify-content: space-around; background: #151d2f; padding: 8px; border-radius: 6px; margin-top: 6px; font-size: 13px; }
        .oheng-bar b { color: #38bdf8; }
        .synergy-highlight { margin-top: 8px !important; color: #38bdf8 !important; }
        .prescription { border-color: #0284c7; background: #0c1e33; }
        .prescription h4 { color: #38bdf8; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🔮 AI 사주 x 성명학 연구소</h1>
        <form method="GET">
          <div class="input-group">
            <label>이름 (한글)</label>
            <input type="text" name="name" placeholder="예: 홍길동" required value="${qName || ''}">
          </div>
          <div class="input-group">
            <label>생년월일 8자리</label>
            <input type="text" name="birth" placeholder="예: 19920924" maxlength="8" required value="${qBirth || ''}">
          </div>
          <div class="input-group">
            <label>태어난 시간 (시주)</label>
            <select name="time">
              ${timeOptionsHtml}
            </select>
          </div>
          <button type="submit">정밀 4주 8자 분석하기</button>
        </form>
        ${resultHtml}
      </div>
    </body>
    </html>
  `);
});

server.listen(3000, () => {
  console.log('9단계(4주 8자 완성) 서버가 시작되었습니다! 브라우저(http://localhost:3000)를 새로고침하세요.');
});