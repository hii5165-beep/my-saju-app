const http = require('http');
const url = require('url');

// ==========================================
// 1. 기존 사주 & 성명학 엔진 로직
// ==========================================
const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const OHENG = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토',
  '경': '금', '신': '금', '임': '수', '계': '수',
  '인': '목', '묘': '목', '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금', '해': '수', '자': '수'
};

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

function getFullSaju(year, month, day, timeIdx) {
  const yearDiff = year - 1984;
  const yearCheongan = CHEONGAN[((yearDiff % 10) + 10) % 10];
  const yearJiji = JIJI[((yearDiff % 12) + 12) % 12];
  const yearPillar = `${yearCheongan}${yearJiji}`;

  const baseDate = new Date(Date.UTC(1900, 0, 1));
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  const dayIndex = ((diffDays + 10) % 60 + 60) % 60;
  const dayCheongan = CHEONGAN[dayIndex % 10];
  const dayJiji = JIJI[dayIndex % 12];
  const dayPillar = `${dayCheongan}${dayJiji}`;

  const monthJijiIndex = (month + 1) % 12;
  const yearCheonganIdx = CHEONGAN.indexOf(yearCheongan);
  const startMonthCheongan = (yearCheonganIdx % 5) * 2 + 2;
  const monthCheongan = CHEONGAN[(startMonthCheongan + (month - 2 + 12) % 12) % 10];
  const monthPillar = `${monthCheongan}${JIJI[monthJijiIndex]}`;

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

function analyzeSaju(name, year, month, day, timeIdx) {
  const saju = getFullSaju(year, month, day, timeIdx);
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

// ==========================================
// 2. 통합 웹 서버
// ==========================================
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let sajuResultHtml = '';

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

      const r = analyzeSaju(name, y, m, d, qTime);
      const totalChars = r.saju.hourPillar ? 8 : 6;

      sajuResultHtml = `
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
      <title>운명 연구소 - 사주 x 관상</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; display: flex; justify-content: center; padding: 25px 15px; margin: 0; }
        .card { background: #151d2f; padding: 24px; border-radius: 20px; width: 100%; max-width: 500px; box-shadow: 0 15px 35px rgba(0,0,0,0.6); border: 1px solid #1e293b; }
        
        /* 탭 내비게이션 메뉴 */
        .tab-menu { display: flex; gap: 8px; margin-bottom: 22px; background: #090d16; padding: 5px; border-radius: 12px; }
        .tab-btn { flex: 1; padding: 12px; border: none; border-radius: 8px; background: transparent; color: #94a3b8; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .tab-btn.active { background: #0284c7; color: #ffffff; box-shadow: 0 4px 12px rgba(2,132,199,0.3); }

        .tab-content { display: none; }
        .tab-content.active { display: block; }

        h1 { font-size: 20px; text-align: center; margin-bottom: 18px; color: #38bdf8; font-weight: 700; }
        .input-group { margin-bottom: 14px; }
        label { display: block; font-size: 13px; margin-bottom: 5px; color: #94a3b8; font-weight: 600; }
        input, select { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #090d16; color: #fff; box-sizing: border-box; font-size: 15px; }
        input:focus, select:focus { outline: 2px solid #38bdf8; }
        
        .btn-primary { width: 100%; padding: 14px; border-radius: 8px; border: none; background: #0284c7; color: #ffffff; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 10px; transition: 0.2s; }
        .btn-primary:hover { background: #0369a1; }
        
        /* 관상 업로드 & 카메라 영역 */
        .upload-container { border: 2px dashed #334155; border-radius: 12px; padding: 24px 15px; text-align: center; background: #090d16; cursor: pointer; transition: 0.2s; margin-bottom: 14px; }
        .upload-container:hover { border-color: #38bdf8; }
        .upload-icon { font-size: 32px; margin-bottom: 8px; }
        .upload-text { font-size: 14px; color: #cbd5e1; margin-bottom: 4px; }
        .upload-sub { font-size: 12px; color: #64748b; }
        #imagePreview { max-width: 100%; max-height: 240px; border-radius: 10px; margin-top: 12px; display: none; margin-left: auto; margin-right: auto; object-fit: cover; }
        
        .btn-row { display: flex; gap: 8px; margin-bottom: 14px; }
        .btn-sub { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-sub:hover { background: #334155; }

        /* 결과 리포트 공통 카드 */
        .result-box { margin-top: 24px; animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .result-box h2 { font-size: 18px; color: #38bdf8; margin: 0 0 12px 0; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
        .summary-line { display: flex; justify-content: space-between; font-size: 13px; color: #94a3b8; margin-bottom: 14px; }
        
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

        /* 관상 결과 전용 배지 및 유명인 카드 */
        .celeb-card { background: #082f49; border: 1px solid #0284c7; padding: 14px; border-radius: 10px; margin-bottom: 12px; text-align: center; }
        .celeb-title { font-size: 12px; color: #7dd3fc; margin-bottom: 4px; }
        .celeb-name { font-size: 18px; font-weight: bold; color: #38bdf8; }
        .celeb-desc { font-size: 13px; color: #e0f2fe; margin-top: 6px; }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .feature-item { background: #090d16; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; }
        .feature-item b { font-size: 13px; color: #38bdf8; display: block; margin-bottom: 4px; }
        .feature-item span { font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <!-- 상단 탭 메뉴 -->
        <div class="tab-menu">
          <button type="button" class="tab-btn ${sajuResultHtml ? 'active' : (!sajuResultHtml ? 'active' : '')}" id="tabBtnSaju" onclick="switchTab('saju')">📜 사주 x 성명학</button>
          <button type="button" class="tab-btn" id="tabBtnFace" onclick="switchTab('face')">👁️ AI 관상 분석</button>
        </div>

        <!-- 1번 탭: 사주 x 성명학 분석 -->
        <div id="tabSaju" class="tab-content ${sajuResultHtml ? 'active' : (!sajuResultHtml ? 'active' : '')}">
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
            <button type="submit" class="btn-primary">정밀 4주 8자 분석하기</button>
          </form>
          ${sajuResultHtml}
        </div>

        <!-- 2번 탭: 관상 분석 -->
        <div id="tabFace" class="tab-content">
          <h1>👁️ AI 관상 x 닮은꼴 분석</h1>
          
          <div class="btn-row">
            <button type="button" class="btn-sub" onclick="document.getElementById('cameraInput').click()">📸 카메라로 촬영</button>
            <button type="button" class="btn-sub" onclick="document.getElementById('fileInput').click()">🖼️ 앨범에서 선택</button>
          </div>

          <!-- 숨겨진 파일 및 카메라 입력 태그 -->
          <input type="file" id="cameraInput" accept="image/*" capture="user" style="display:none;" onchange="handleImage(this)">
          <input type="file" id="fileInput" accept="image/*" style="display:none;" onchange="handleImage(this)">

          <div class="upload-container" onclick="document.getElementById('fileInput').click()">
            <div class="upload-icon">📷</div>
            <div class="upload-text" id="uploadLabel">정면 얼굴 사진을 찍거나 올려주세요</div>
            <div class="upload-sub">이마, 눈썹, 코, 턱이 잘 보이는 정면 사진이 좋습니다</div>
            <img id="imagePreview" alt="얼굴 미리보기">
          </div>

          <button type="button" class="btn-primary" id="btnAnalyzeFace" onclick="runFaceAnalysis()" disabled>관상 & 닮은꼴 분석 시작</button>

          <!-- 관상 분석 결과 렌더링 영역 -->
          <div id="faceResultArea"></div>
        </div>
      </div>

      <script>
        // 탭 전환 기능
        function switchTab(type) {
          const tabSaju = document.getElementById('tabSaju');
          const tabFace = document.getElementById('tabFace');
          const tabBtnSaju = document.getElementById('tabBtnSaju');
          const tabBtnFace = document.getElementById('tabBtnFace');

          if (type === 'saju') {
            tabSaju.classList.add('active');
            tabFace.classList.remove('active');
            tabBtnSaju.classList.add('active');
            tabBtnFace.classList.remove('active');
          } else {
            tabSaju.classList.remove('active');
            tabFace.classList.add('active');
            tabBtnSaju.classList.remove('active');
            tabBtnFace.classList.add('active');
          }
        }

        // 이미지 파일 처리 및 미리보기
        let loadedImgElement = null;

        function handleImage(input) {
          if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
              const preview = document.getElementById('imagePreview');
              preview.src = e.target.result;
              preview.style.display = 'block';
              document.getElementById('uploadLabel').innerText = '사진이 등록되었습니다. 아래 분석 버튼을 누르세요.';
              document.getElementById('btnAnalyzeFace').removeAttribute('disabled');

              loadedImgElement = new Image();
              loadedImgElement.src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
          }
        }

        // 닮은꼴 유명인 및 관상 데이터베이스
        const CELEB_PROFILES = [
          {
            celeb: '유재석 상 (성실 번영형)',
            type: '청수형(淸秀形) - 총명함과 깊은 신뢰감',
            desc: '이마에서 턱까지 균형이 단정하며 입매가 다부져 사람들의 마음을 얻고 장기적인 재물운을 모으는 관상입니다.',
            forehead: '넓고 반듯함 $\\rightarrow$ 뛰어난 순발력과 대중적 소통 능력',
            eyes: '눈꼬리가 차분함 $\\rightarrow$ 상대를 배려하며 신중한 처세술',
            nose: '콧날이 곧고 바름 $\\rightarrow$ 정직한 재물 축적과 끈기',
            mouth: '입꼬리가 단단히 닫힘 $\\rightarrow$ 말실수가 적고 강한 책임감'
          },
          {
            celeb: '이정재 상 (카리스마 대권형)',
            type: '위맹형(威猛形) - 당당한 기백과 리더십',
            desc: '눈빛에 중심이 서 있고 하악(턱)이 묵직하여 큰 무대나 조직에서 주도권을 잡고 큰 성공을 거머쥐는 관상입니다.',
            forehead: '이마 양옆이 시원함 $\\rightarrow$ 명예운과 거침없는 실행력',
            eyes: '눈빛이 깊고 강함 $\\rightarrow$ 강한 통찰력과 결단력',
            nose: '콧방울(준두)이 도톰함 $\\rightarrow$ 큰 자금을 굴리는 재물복',
            mouth: '입술 윤곽이 뚜렷함 $\\rightarrow$ 사람을 이끄는 설득력'
          },
          {
            celeb: '아이유 상 (예술적 귀인형)',
            type: '수려형(秀麗形) - 풍부한 감수성과 대중 복록',
            desc: '이목구비의 조화가 부드럽고 눈망울이 맑아 대인 관계에서 귀인의 도움을 끊임없이 불러들이는 관상입니다.',
            forehead: '이마가 둥글고 깨끗함 $\\rightarrow$ 창의적인 감각과 높은 총명함',
            eyes: '흑백이 분명한 맑은 눈 $\\rightarrow$ 예술적 감각과 남다른 직관력',
            nose: '코끝이 단아하고 가지런함 $\\rightarrow$ 실속 있는 재물 관리',
            mouth: '도톰하고 온화한 입술 $\\rightarrow$ 말 한마디로 복을 짓는 귀인운'
          },
          {
            celeb: '손흥민 상 (돌파 질주형)',
            type: '용맹형(勇猛形) - 불굴의 의지와 세계적 성취',
            desc: '눈썹과 눈 사이(전택궁)가 팽팽하며 광대와 턱의 탄력이 뛰어나 시련을 기회로 바꾸고 정상에 오르는 관상입니다.',
            forehead: '이마 중앙이 솟아오름 $\\rightarrow$ 강한 승부욕과 목표 집념',
            eyes: '집중력이 넘치는 눈매 $\\rightarrow$ 순간적인 기회를 낚아채는 동물적 감각',
            nose: '콧대가 굵고 흔들림 없음 $\\rightarrow$ 강인한 체력과 돌파력',
            mouth: '야무지게 다문 입 $\\rightarrow$ 극한의 훈련과 절제력'
          }
        ];

        // 이미지 픽셀/비율 기반 관상 판독
        function runFaceAnalysis() {
          if (!loadedImgElement) return;

          const btn = document.getElementById('btnAnalyzeFace');
          btn.innerText = '인공지능 관상 판독 중...';
          btn.disabled = true;

          setTimeout(() => {
            // 이미지 크기와 비율을 바탕으로 시드 생성
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 30;
            canvas.height = 30;
            ctx.drawImage(loadedImgElement, 0, 0, 30, 30);
            
            const pData = ctx.getImageData(0, 0, 30, 30).data;
            let sum = 0;
            for (let i = 0; i < pData.length; i += 4) {
              sum += pData[i] + pData[i+1] + pData[i+2];
            }

            const profileIdx = sum % CELEB_PROFILES.length;
            const p = CELEB_PROFILES[profileIdx];

            const resultHtml = \`
              <div class="result-box">
                <h2>👁️ AI 관상 판독 리포트</h2>
                
                <div class="celeb-card">
                  <div class="celeb-title">가장 닮은 관상 유형의 유명인</div>
                  <div class="celeb-name">\${p.celeb}</div>
                  <div class="celeb-desc">\${p.type}</div>
                </div>

                <div class="section-card">
                  <h4>💡 총평 풀이</h4>
                  <p>\${p.desc}</p>
                </div>

                <div class="section-card">
                  <h4>🔍 부위별 이목구비 정밀 분석</h4>
                  <div class="feature-grid">
                    <div class="feature-item">
                      <b>상정 (이마/눈썹)</b>
                      <span>\${p.forehead}</span>
                    </div>
                    <div class="feature-item">
                      <b>중정 (눈빛/시선)</b>
                      <span>\${p.eyes}</span>
                    </div>
                    <div class="feature-item">
                      <b>재백궁 (코/콧망울)</b>
                      <span>\${p.nose}</span>
                    </div>
                    <div class="feature-item">
                      <b>하정 (입매/턱)</b>
                      <span>\${p.mouth}</span>
                    </div>
                  </div>
                </div>

                <div class="section-card prescription">
                  <h4>✨ 관상을 틔우는 개운 팁</h4>
                  <p>눈썹 사이(명궁)를 늘 깔끔하게 정돈하고, 입꼬리를 살짝 올려 미소를 유지하면 재물과 귀인운이 더욱 강하게 들어옵니다.</p>
                </div>
              </div>
            \`;

            document.getElementById('faceResultArea').innerHTML = resultHtml;
            btn.innerText = '관상 & 닮은꼴 분석 다시하기';
            btn.disabled = false;
          }, 700);
        }
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
