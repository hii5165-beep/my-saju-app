const http = require('http');
const url = require('url');

// =================================================================
// 1. 한국 표준시(KST, UTC+9) 기준 시간 산출 엔진
// =================================================================
function getKSTDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (9 * 60 * 60 * 1000));
}

// =================================================================
// 2. 정통 명리학(만세력) & 10간 일간별 심층 메타데이터
// =================================================================
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

const ILGAN_MASTER = {
  '갑': {
    title: '푸른 거목 (甲木)',
    summary: '우뚝 솟은 거목처럼 자존심과 명예심이 강하며, 타인을 이끄는 우두머리 기질과 불굴의 추진력을 지녔습니다.',
    jobs: '스타트업 창업가, 총괄 기획 디렉터, 건축·도시공학 엔지니어, 교육 기관장, 정책 입안자',
    spouse: '내 주장을 묵묵히 받쳐주고 든든한 안식처가 되어주는 온화하고 차분한 인상',
    mbti: ['ENTJ (통솔자)', 'ENFJ (선도자)', 'INTJ (전략가)'],
    celebs: ['송중기 (갑신일주)', '아이유 (갑목형)', '손흥민 (갑목형)'],
    goodOheng: '임수(壬水), 병화(丙火)',
    goodZodiac: '돼지띠, 토끼띠, 양띠',
    item: '생목 화분, 목재 수제 가구, 천연 원목 펜',
    color: '포레스트 그린, 올리브, 민트',
    nearJobs: '소프트웨어 개발자, 데이터 기획자, 세무사',
    nameChar: '동(東), 근(根), 림(林), 빈(彬) 등 나무 목(木) 부수 계열'
  },
  '을': {
    title: '유연한 담쟁이 (乙木)',
    summary: '비바람에도 꺾이지 않는 넝쿨처럼 탁월한 환경 적응력과 친화력, 위기 속에서 활로를 찾는 생활력을 자랑합니다.',
    jobs: '브랜드 마케팅 총괄, 콘텐츠 크리에이터, 인테리어/패션 디자이너, 심리 상담사, 헬스케어 기획자',
    spouse: '결단력이 빠르고 현실적인 경제 관념이 뚜렷하여 실속을 지켜주는 듬직한 인상',
    mbti: ['INFJ (옹호자)', 'ENFP (활동가)', 'ISFP (예술가)'],
    celebs: ['지드래곤 (을목형)', '김수현 (을유일주)', '수지 (을사일주)'],
    goodOheng: '병화(丙火), 계수(癸水)',
    goodZodiac: '호랑이띠, 말띠, 개띠',
    item: '실크 머플러, 플라워 패턴 다이어리, 허브 식물',
    color: '파스텔 그린, 에메랄드, 애플 민트',
    nearJobs: '영업 전문가, 홍보 PR 디렉터, 외교관',
    nameChar: '초(草), 란(蘭), 연(蓮), 서(舒) 등 부드러운 생명력의 한자'
  },
  '병': {
    title: '타오르는 태양 (丙火)',
    summary: '온 세상을 비추는 태양처럼 정열적이고 화통하며, 숨김없는 솔직함과 대중을 압도하는 카리스마를 발휘합니다.',
    jobs: '엔터테인먼트 대표, 방송/미디어 연출, 외식 프랜차이즈 오너, 글로벌 무역 세일즈, 대외 협력 임원',
    spouse: '깊은 지혜와 포용력으로 나의 급한 불을 다스리고 냉철한 조언을 해주는 지적인 인상',
    mbti: ['ESTP (사업가)', 'ENTP (변론가)', 'ESFP (연예인)'],
    celebs: ['이정재 (병화형)', '차승원 (병진일주)', '유재석 (병화형)'],
    goodOheng: '임수(壬水), 갑목(甲木)',
    goodZodiac: '말띠, 호랑이띠, 개띠',
    item: '고급 선글라스, 레드 포인트 가죽 지갑, 감각적인 조명',
    color: '스칼렛 레드, 웜 오렌지, 코랄 핑크',
    nearJobs: '투자 심사역(VC), 전략 컨설턴트, 자산운용가',
    nameChar: '현(炫), 엽(燁), 욱(旭), 훈(勳) 등 불 화(火) 및 빛 계열'
  },
  '정': {
    title: '온기를 품은 등불 (丁火)',
    summary: '어둠을 밝히는 촛불처럼 은은하지만 내면에 응축된 강한 집중력과 타인을 꿰뚫어보는 직관적 통찰력을 지녔습니다.',
    jobs: '금융 자산 분석가, 인공지능 연구원, 시나리오/웹툰 작가, 정밀 의료인, 하이테크 하드웨어 엔지니어',
    spouse: '언행이 단정하고 예의 바르며 사회적으로 전문성을 굳건히 인정받는 신뢰형 인상',
    mbti: ['INTJ (전략가)', 'INTP (논리술사)', 'ISTJ (현실주의자)'],
    celebs: ['정우성 (정미일주)', '한소희 (정사일주)', '박보검 (정화형)'],
    goodOheng: '갑목(甲木), 경금(庚金)',
    goodZodiac: '닭띠, 소띠, 뱀띠',
    item: '아로마 캔들 워머, 천연 에센셜 오일, 클래식 만년필',
    color: '와인 버건디, 딥 오렌지, 초콜릿 브라운',
    nearJobs: '공인회계사, 데이터 아키텍트, 변리사',
    nameChar: '희(熙), 령(煐), 찬(燦), 솔(率) 등 정밀하고 빛나는 한자'
  },
  '무': {
    title: '광활한 대산 (戊土)',
    summary: '높은 산맥처럼 중후하고 흔들림이 없으며, 비밀과 신의를 철저히 지켜 조직 내 최고의 조언자이자 중심축이 됩니다.',
    jobs: '부동산 자산개발 디벨로퍼, 국가 행정 고위직, 종합 물류 총괄 책임자, 농식품 유통 오너, 대규모 인프라 설계자',
    spouse: '센스 있고 쾌활하며 나의 무거운 분위기를 유쾌하게 전환해 주는 발랄한 인상',
    mbti: ['ESTJ (경영자)', 'ISTJ (청렴결백형)', 'ENFJ (선도자)'],
    celebs: ['공유 (무술일주)', '조인성 (무토형)', '마동석 (무토형)'],
    goodOheng: '계수(癸水), 갑목(甲木)',
    goodZodiac: '원숭이띠, 쥐띠, 용띠',
    item: '도자기 소품, 황토 온열 매트, 천연 가죽 벨트',
    color: '머스타드 옐로우, 테라코타, 샌드 베이지',
    nearJobs: '감정평가사, 건축 시공 총괄, 관세사',
    nameChar: '기(基), 균(均), 배(培), 곤(坤) 등 흙 토(土) 기반 한자'
  },
  '기': {
    title: '비옥한 전답 (己土)',
    summary: '만물을 길러내는 밭처럼 부드럽고 섬세하며, 속 깊은 정과 알짜 실속을 챙기는 실천형 설계자입니다.',
    jobs: '자산 관리 PB, 아동/복지 전문 디렉터, 요식업 브랜드 기획자, 인테리어 코디네이터, 세무 전문직',
    spouse: '뚝심 있고 생활력이 확고하여 어떤 풍파가 와도 가정을 지켜내는 믿음직한 인상',
    mbti: ['ISFJ (수호자)', 'ESFJ (친선도모형)', 'INFJ (옹호자)'],
    celebs: ['원빈 (기축일주)', '김연아 (기유일주)', '송강호 (기토형)'],
    goodOheng: '병화(丙火), 갑목(甲木)',
    goodZodiac: '말띠, 돼지띠, 양띠',
    item: '가죽 바인더 플래너, 원예 분재, 포근한 패브릭 쿠션',
    color: '내추럴 베이지, 크림 아이보리, 카멜',
    nearJobs: '초중등 교육자, 영양 연구원, 수의사',
    nameChar: '원(園), 규(奎), 연(廷), 재(載) 등 포용과 결실의 한자'
  },
  '경': {
    title: '강인한 무쇠 (庚金)',
    summary: '용광로에서 제련된 칼날처럼 과감한 결단력과 의리가 돋보이며, 목표가 정해지면 망설임 없이 정면 돌파합니다.',
    jobs: '검경/법조인, 외과 전문의, 기계·자동차·방산 엔지니어, 대형 물류 대표, 금속 공학 전문가',
    spouse: '말투가 다정다감하고 나를 지혜롭게 어루만져 주는 부드럽고 고운 인상',
    mbti: ['ENTJ (통솔자)', 'ESTP (사업가)', 'ISTP (장인)'],
    celebs: ['이병헌 (경자일주)', '전지현 (경금형)', '최민식 (경금형)'],
    goodOheng: '정화(丁火), 임수(壬水)',
    goodZodiac: '소띠, 뱀띠, 용띠',
    item: '스테인리스 텀블러, 정밀 메탈 시계, 프리미엄 만년필',
    color: '스노우 화이트, 실버 메탈릭, 플래티넘',
    nearJobs: '정밀 엔지니어, 변호사, 항공기 파일럿',
    nameChar: '진(鎭), 호(鎬), 현(鉉), 종(鐘) 등 쇠 금(金) 부수 한자'
  },
  '신': {
    title: '정교한 보석 (辛金)',
    summary: '완벽하게 세공된 다이아몬드처럼 깔끔하고 날카로운 심미안을 지녔으며, 자기 기준이 엄격한 완벽주의자입니다.',
    jobs: '정밀 IT 보안 아키텍트, 럭셔리 보석/아트 큐레이터, 피부/성형외과 전문의, 프리미엄 브랜드 총괄 디자이너',
    spouse: '단정하고 세련된 스타일을 지녔으며 사리분별이 명확한 지성파 인상',
    mbti: ['INTP (논리술사)', 'ISTJ (현실주의자)', 'ISFP (예술가)'],
    celebs: ['현빈 (신해일주)', '손예진 (신금형)', '차은우 (신금형)'],
    goodOheng: '임수(壬水), 병화(丙火)',
    goodZodiac: '용띠, 원숭이띠, 쥐띠',
    item: '화이트골드 주얼리, 미니멀리즘 거울, 세련된 티타늄 안경',
    color: '퓨어 화이트, 샴페인 골드, 아이스 그레이',
    nearJobs: '소프트웨어 보안관, 갤러리스트, 전문 에디터',
    nameChar: '은(銀), 서(瑞), 유(鍮), 선(銑) 등 맑고 단단한 보석 한자'
  },
  '임': {
    title: '거대한 큰 바다 (壬水)',
    summary: '대양처럼 드넓은 도량과 깊은 지혜를 갖추었으며, 경계를 두지 않는 유연한 사고로 큰 부를 창출해 냅니다.',
    jobs: '글로벌 무역 총괄, 해운 물류 대기업 임원, 빅데이터 플랫폼 설계자, 헤지펀드 투자 매니저, 외교 전략가',
    spouse: '자신의 주관이 확실하고 든든하게 가정의 중심을 잡아주는 어른스러운 인상',
    mbti: ['ENTP (변론가)', 'INFP (중재자)', 'ENFP (활동가)'],
    celebs: ['봉준호 (임수형)', '유재석 (임인일주)', 'BTS RM (임수형)'],
    goodOheng: '무토(戊土), 병화(丙火)',
    goodZodiac: '호랑이띠, 말띠, 개띠',
    item: '실내 스마트 가습기, 블랙 가죽 오피스 백팩, 아쿠아 오션 디퓨저',
    color: '딥 오션 네이비, 제트 블랙, 인디고 블루',
    nearJobs: '글로벌 펀드매니저, 데이터 과학자, 해양 플랜트 전문가',
    nameChar: '호(浩), 택(澤), 원(源), 태(泰) 등 큰 물 수(水) 부수 한자'
  },
  '계': {
    title: '생명을 살리는 빗물 (癸水)',
    summary: '봄비처럼 은밀하고 세심하게 스며드는 감수성과 총명함을 지녔으며, 직관력과 기획력이 매우 뛰어납니다.',
    jobs: '심리 치료/정신건강의, 작사/작곡가, 인터랙티브 UI/UX 기획자, 웰니스 스파 대표, 전략 정보 분석관',
    spouse: '바위처럼 든든하고 신뢰감이 두터워 나의 여린 감정을 안전하게 지켜주는 인상',
    mbti: ['INFJ (옹호자)', 'INFP (중재자)', 'ISFJ (수호자)'],
    celebs: ['조승우 (계수형)', '김태리 (계유일주)', '박해일 (계수형)'],
    goodOheng: '신금(辛金), 갑목(甲木)',
    goodZodiac: '소띠, 토끼띠, 돼지띠',
    item: '고급 크리스털 텀블러, 명상 싱잉볼, 프리미엄 티 세트',
    color: '스카이 블루, 미드나잇 블루, 투명 크리스털',
    nearJobs: '심리 상담 슈퍼바이저, 방송 작가, 핀테크 기획자',
    nameChar: '청(淸), 윤(潤), 수(洙), 린(潾) 등 맑은 시냇물 계열 한자'
  }
};

// 성명학 발음오행 변환 규칙
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
  const list = [];
  for (let char of name) {
    const cho = getChosung(char);
    let baseCho = cho;
    if (cho === 'ㄲ') baseCho = 'ㄱ';
    if (cho === 'ㄸ') baseCho = 'ㄷ';
    if (cho === 'ㅃ') baseCho = 'ㅂ';
    if (cho === 'ㅆ') baseCho = 'ㅅ';
    if (cho === 'ㅉ') baseCho = 'ㅈ';

    const elem = PRONUNCIATION_OHENG[baseCho] || '기타';
    list.push({ char, cho, oheng: elem });
  }
  return list;
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
  const meta = ILGAN_MASTER[ilgan] || ILGAN_MASTER['갑'];

  return { saju, counts, lackingElement, nameAnalysis, nameElements, isCovered, meta, ilgan };
}

// =================================================================
// 3. 12간지 동물별 3세대(36개 연도) 일일 운세 자동 생성 엔진
// =================================================================
const ZODIAC_DEFS = [
  { name: '쥐띠', emoji: '🐭', years: [1996, 1984, 1972] },
  { name: '소띠', emoji: '🐮', years: [1997, 1985, 1973] },
  { name: '호랑이띠', emoji: '🐯', years: [1998, 1986, 1974] },
  { name: '토끼띠', emoji: '🐰', years: [1999, 1987, 1975] },
  { name: '용띠', emoji: '🐲', years: [2000, 1988, 1976] },
  { name: '뱀띠', emoji: '🐍', years: [2001, 1989, 1977] },
  { name: '말띠', emoji: '🐴', years: [2002, 1990, 1978] },
  { name: '양띠', emoji: '🐑', years: [2003, 1991, 1979] },
  { name: '원숭이띠', emoji: '🐵', years: [2004, 1992, 1980] },
  { name: '닭띠', emoji: '🐔', years: [2005, 1993, 1981] },
  { name: '개띠', emoji: '🐶', years: [2006, 1994, 1982] },
  { name: '돼지띠', emoji: '🐷', years: [2007, 1995, 1983] }
];

const DAILY_THEMES = [
  '정체되었던 기운이 트이며 노력에 대한 공정한 보상이 약속되는 길일입니다.',
  '새로운 프로젝트나 거래처 제안이 들어오니 과감히 소통할수록 길합니다.',
  '뜻밖의 귀인이 나타나 복잡했던 문제의 열쇠를 건네주는 형국입니다.',
  '재물과 문서 운이 왕성하게 순환하니 자산 관리 계획을 세우기 좋습니다.',
  '속도를 내기보다는 기본기를 점검하며 내실을 다질 때 실속이 커집니다.',
  '동료나 파트너의 조력을 통해 까다로운 난관을 손쉽게 돌파하는 날입니다.',
  '언행에 품격을 지키고 서두르지 않으면 오후 늦게 좋은 소식이 당도합니다.'
];

const WEALTH_FLOW = [
  '최상 (기대 이상의 보너스나 계약 체결)',
  '원활 (노력한 만큼 정직한 수입 창출)',
  '안정 (불필요한 지출이 방어되는 흐름)',
  '신중 (충동적 지출이나 묻지마 투자 금지)',
  '상승 (작은 이익이 모여 목돈이 됨)'
];

const WARNING_POINTS = [
  '성급한 계약 체결 및 구두 약속',
  '감정적인 언쟁 및 사소한 시비',
  '늦은 귀가로 인한 컨디션 난조',
  '검증되지 않은 투자 제안',
  '무리한 야근과 과로'
];

function generateDailyZodiacCards(kstDate) {
  const y = kstDate.getFullYear();
  const m = kstDate.getMonth() + 1;
  const d = kstDate.getDate();
  const dateSeed = y * 10000 + m * 100 + d;

  return ZODIAC_DEFS.map((zodiac, zIdx) => {
    const yearItems = zodiac.years.map((birthYear, bIdx) => {
      const cellSeed = (dateSeed * 29 + zIdx * 19 + bIdx * 11 + (birthYear % 100)) % 10007;
      const currentAge = y - birthYear + 1;
      const theme = DAILY_THEMES[cellSeed % DAILY_THEMES.length];
      const wealth = WEALTH_FLOW[(cellSeed * 3) % WEALTH_FLOW.length];
      const warn = WARNING_POINTS[(cellSeed * 7) % WARNING_POINTS.length];
      return { birthYear, currentAge, theme, wealth, warn };
    });
    return { name: zodiac.name, emoji: zodiac.emoji, yearItems };
  });
}

// =================================================================
// 4. HTTP 서버 및 통합 렌더러
// =================================================================
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const kstNow = getKSTDate();
  const curY = kstNow.getFullYear();
  const curM = kstNow.getMonth() + 1;
  const curD = kstNow.getDate();
  const dayKo = ['일', '월', '화', '수', '목', '금', '토'][kstNow.getDay()];
  const kstDateLabel = `${curY}년 ${curM}월 ${curD}일 (${dayKo})`;

  const zodiacData = generateDailyZodiacCards(kstNow);

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
      const meta = r.meta;

      sajuResultHtml = `
        <div class="result-box">
          <div class="res-badge">기본 무료 핵심 요약</div>
          <h2 class="res-title">🔮 ${name} 님의 사주 원국 리포트</h2>
          
          <div class="summary-line">
            <span>생년월일: <b>${y}.${m}.${d}</b></span>
            <span>분석 기준: <b>${totalChars === 8 ? '4주 8자 (시주 포함 완전체)' : '3주 6자 (시간 미포함)'}</b></span>
          </div>

          <div class="pillar-board">
            <div class="pillar-col"><span class="p-title">시주(時)</span><span class="p-val">${r.saju.hourPillar || '미상'}</span></div>
            <div class="pillar-col active"><span class="p-title">일주(日)</span><span class="p-val">${r.saju.dayPillar}</span></div>
            <div class="pillar-col"><span class="p-title">월주(月)</span><span class="p-val">${r.saju.monthPillar}</span></div>
            <div class="pillar-col"><span class="p-title">연주(年)</span><span class="p-val">${r.saju.yearPillar}</span></div>
          </div>

          <div class="section-card">
            <h4>🌟 타고난 본질: ${meta.title}</h4>
            <p class="card-desc">${meta.summary}</p>
          </div>

          <div class="section-card">
            <h4>⚖️ 내 사주의 오행 밸런스 (${totalChars}자)</h4>
            <div class="oheng-bar">
              <span>목: <b>${r.counts.목}</b></span>
              <span>화: <b>${r.counts.화}</b></span>
              <span>토: <b>${r.counts.토}</b></span>
              <span>금: <b>${r.counts.금}</b></span>
              <span>수: <b>${r.counts.수}</b></span>
            </div>
          </div>

          <div class="section-card">
            <h4>🏷️ 성명학 발음오행 조화도</h4>
            <p style="font-size:13px; color:#64748b;">${r.nameAnalysis.map(item => `${item.char}(${item.cho}) $\\rightarrow$ <b>${item.oheng}</b>`).join(' | ')}</p>
            <p style="font-size:13px; font-weight:700; color:#0284c7; margin-top:8px;">${
              r.isCovered 
                ? `✅ 사주에 고갈되었던 [${r.lackingElement}] 기운을 이름('${name}')이 완벽히 방어하고 있습니다.` 
                : !r.lackingElement 
                ? `✅ 사주 5행이 고루 분포되어 있어 이름과도 최상의 상생 조화를 이룹니다.`
                : `ℹ️ 사주의 [${r.lackingElement}] 기운이 비어 있으나 이름의 [${r.nameElements.join(', ')}] 기운이 새로운 활로를 열어줍니다.`
            }</p>
          </div>

          <!-- 플러스 3~4배 심층 리포트 토글 배너 -->
          <div class="plus-lock-banner">
            <div class="plus-tag">✨ 프리미엄 심층 비책 (테스트 무료 공개)</div>
            <div class="plus-title">미래 직업 · 배우자 복 · 찰떡 MBTI · 연예인 사주</div>
            <div class="plus-desc">기존 요약 내용의 3~4배 이상 디테일하게 풀어낸 인생 개운 솔루션입니다.</div>
            <button type="button" class="btn-toggle" onclick="togglePlus('sajuPlusArea', this)">🔒 플러스 심층 리포트 열기/닫기</button>
          </div>

          <!-- 플러스 심층 컨텐츠 -->
          <div id="sajuPlusArea" class="plus-content-box" style="display:none;">
            <div class="section-card plus-item">
              <h4>💼 내 사주로 본 미래 천직 & 최적 직무군</h4>
              <p><b>추천 분야:</b> ${meta.jobs}</p>
              <p class="sub-tip">💡 이 업종에 집중할 때 본인의 잠재력과 재물운이 가장 빠르게 발현되며 주변의 압박을 이겨내는 추진력이 극대화됩니다.</p>
            </div>

            <div class="section-card plus-item">
              <h4>💍 배우자 인연운 & 이상적인 배필 성향</h4>
              <p><b>인연의 분위기:</b> ${meta.spouse}</p>
              <p class="sub-tip">💡 나를 일방적으로 억압하지 않고 상호 존중과 신뢰를 바탕으로 함께 성장할 수 있는 현실적 지략가형 배필이 들어옵니다.</p>
            </div>

            <div class="section-card plus-item">
              <h4>🧩 사주 오행과 시너지가 폭발하는 찰떡 MBTI</h4>
              <div class="pill-tags">
                ${meta.mbti.map(m => `<span class="pill-mbti">${m}</span>`).join(' ')}
              </div>
              <p class="sub-tip">💡 내 일간의 결단력과 이 MBTI 유형들의 체계적 사고가 결합될 때 비즈니스나 연애에서 시너지가 극대화됩니다.</p>
            </div>

            <div class="section-card plus-item">
              <h4>⭐ 나와 같은 일주를 지닌 유명인 3인</h4>
              <div class="pill-tags">
                ${meta.celebs.map(c => `<span class="pill-celeb">${c}</span>`).join(' ')}
              </div>
              <p class="sub-tip">💡 이 인물들이 보여주는 뚝심과 처세술을 벤치마킹하면 인생의 결정적 위기에서 성공 확률을 크게 높일 수 있습니다.</p>
            </div>

            <div class="section-card plus-item">
              <h4>🤝 귀인으로 들어오는 찰떡 띠 & 상생 오행</h4>
              <p><b>나를 살리는 상생 오행:</b> <span style="color:#0284c7; font-weight:800;">${meta.goodOheng}</span></p>
              <p><b>곁에 두면 복이 오는 띠:</b> <span style="color:#0284c7; font-weight:800;">${meta.goodZodiac}</span></p>
            </div>

            <div class="section-card plus-item" style="border-left: 4px solid #0284c7;">
              <h4>🍀 맞춤 개운 비책 (이름 보완 & 행운 솔루션)</h4>
              <p><b>행운의 소품(아이템):</b> ${meta.item}</p>
              <p><b>행운을 부르는 색상:</b> ${meta.color}</p>
              <p><b>기운을 살려주는 주변 직업군:</b> ${meta.nearJobs}</p>
              <p><b>이름에 추천하는 보완 글자:</b> <span style="color:#0284c7; font-weight:800;">${meta.nameChar}</span></p>
              <p class="sub-tip">${
                r.lackingElement 
                  ? `💡 사주에 [${r.lackingElement}] 기운이 고갈되어 있으므로, 닉네임이나 아호(이름)에 '${r.lackingElement}' 계열 글자를 쓰면 재물 손실을 든든하게 막아줍니다.` 
                  : '💡 사주 오행이 고루 갖추어져 있으므로 무리한 개명보다는 현재의 생활 밸런스를 지키는 것이 최상의 개운법입니다.'
              }</p>
            </div>
          </div>
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>점신 스타일 운명 포털</title>
      <style>
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo", Roboto, sans-serif; background: #f1f5f9; color: #1e293b; margin: 0; padding: 0 0 85px 0; display: flex; justify-content: center; }
        .app-container { width: 100%; max-width: 480px; background: #ffffff; min-height: 100vh; box-shadow: 0 0 25px rgba(0,0,0,0.06); padding: 18px 16px; }
        
        /* 상단 헤더 */
        .app-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; margin-bottom: 14px; }
        .app-logo { font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
        .app-logo span { color: #0284c7; }
        .header-date { font-size: 13px; color: #64748b; font-weight: 700; background: #f8fafc; padding: 4px 10px; border-radius: 20px; border: 1px solid #e2e8f0; }

        /* 히어로 배너 */
        .hero-banner { background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%); border-radius: 18px; padding: 18px; margin-bottom: 18px; border: 1px solid #fde047; }
        .hero-tag { display: inline-block; background: #0f172a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 20px; margin-bottom: 8px; }
        .hero-title { font-size: 18px; font-weight: 800; color: #854d0e; line-height: 1.35; margin-bottom: 6px; }
        .hero-desc { font-size: 13px; color: #a16207; font-weight: 500; }

        /* 탭 컨텐츠 */
        .tab-content { display: none; }
        .tab-content.active { display: block; animation: fadeIn 0.25s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        /* 폼 요소 */
        .input-group { margin-bottom: 13px; }
        label { display: block; font-size: 13px; margin-bottom: 6px; color: #475569; font-weight: 700; }
        input, select { width: 100%; padding: 13px; border-radius: 12px; border: 1px solid #cbd5e1; background: #f8fafc; color: #1e293b; font-size: 15px; font-weight: 500; }
        input:focus, select:focus { outline: 2px solid #0284c7; background: #ffffff; }

        .btn-primary { width: 100%; padding: 15px; border-radius: 14px; border: none; background: #0284c7; color: #ffffff; font-size: 16px; font-weight: 800; cursor: pointer; margin-top: 6px; box-shadow: 0 4px 12px rgba(2,132,199,0.25); }
        .btn-primary:active { transform: scale(0.98); }

        /* 하단 고정 5대 네비게이션 바 (점신 스타일) */
        .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; height: 68px; background: #ffffff; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-around; align-items: center; z-index: 1000; box-shadow: 0 -4px 16px rgba(0,0,0,0.04); }
        .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 11px; font-weight: 700; gap: 4px; padding: 0; }
        .nav-item.active { color: #0284c7; }
        .nav-icon { font-size: 20px; }

        /* 12간지 띠별 카드 목록 */
        .zodiac-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        .zodiac-header { display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
        .year-row { background: #f8fafc; border-radius: 10px; padding: 12px; margin-bottom: 8px; border: 1px solid #e2e8f0; }
        .year-badge { font-size: 13px; font-weight: 800; color: #0284c7; margin-bottom: 4px; }
        .year-phrase { font-size: 13.5px; color: #334155; line-height: 1.5; margin-bottom: 6px; }
        .year-tags { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: #64748b; }
        .year-tags b { color: #0f172a; }

        /* 사주 & 관상 리포트 카드 */
        .result-box { margin-top: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .res-badge { display: inline-block; background: #e0f2fe; color: #0284c7; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }
        .res-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 8px 0 14px 0; }
        .summary-line { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 14px; }
        
        .pillar-board { display: flex; gap: 8px; margin-bottom: 16px; }
        .pillar-col { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 4px; text-align: center; }
        .pillar-col.active { border-color: #0284c7; background: #f0f9ff; }
        .p-title { display: block; font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: 600; }
        .p-val { font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: 1px; }

        .section-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        .section-card h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #0f172a; }
        .card-desc { color: #475569; font-size: 14px; line-height: 1.6; margin: 0; }
        .oheng-bar { display: flex; justify-content: space-around; background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; margin-top: 6px; }
        .oheng-bar b { color: #0284c7; font-weight: 800; }

        /* 플러스 토글 배너 */
        .plus-lock-banner { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; padding: 18px; text-align: center; color: #ffffff; margin-top: 18px; box-shadow: 0 6px 16px rgba(15,23,42,0.15); }
        .plus-tag { font-size: 12px; color: #38bdf8; font-weight: 800; margin-bottom: 6px; }
        .plus-title { font-size: 17px; font-weight: 800; margin-bottom: 6px; }
        .plus-desc { font-size: 12.5px; color: #94a3b8; line-height: 1.4; margin-bottom: 14px; }
        .btn-toggle { width: 100%; padding: 13px; border-radius: 10px; border: none; background: #38bdf8; color: #0f172a; font-size: 15px; font-weight: 800; cursor: pointer; }
        
        .plus-content-box { margin-top: 16px; }
        .plus-item { background: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        .pill-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .pill-mbti { background: #e0f2fe; color: #0284c7; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }
        .pill-celeb { background: #fef08a; color: #854d0e; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }
        .sub-tip { margin-top: 6px; font-size: 13px; color: #64748b; line-height: 1.5; }

        /* 관상 사진 업로드 */
        .upload-container { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 22px 14px; text-align: center; background: #f8fafc; cursor: pointer; margin-bottom: 12px; }
        .upload-icon { font-size: 32px; margin-bottom: 6px; }
        #imagePreview { max-width: 100%; max-height: 220px; border-radius: 12px; margin-top: 12px; display: none; margin-left: auto; margin-right: auto; object-fit: cover; }
        
        /* 타로 및 사주+관상 패키지 카드 */
        .discount-card { background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border: 1px solid #f0abfc; border-radius: 18px; padding: 20px; text-align: center; margin-top: 14px; }
        .discount-badge { display: inline-block; background: #c026d3; color: #ffffff; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px; }
        .price-line { font-size: 15px; margin: 10px 0; }
        .price-line s { color: #94a3b8; }
        .price-line b { font-size: 22px; color: #a21caf; }
      </style>
    </head>
    <body>
      <div class="app-container">
        
        <!-- 상단 헤더 -->
        <div class="app-header">
          <div class="app-logo">운명<span>포털</span></div>
          <div class="header-date">📅 ${kstDateLabel}</div>
        </div>

        <!-- 1. ☀️ 오늘의 운세 -->
        <div id="tabToday" class="tab-content ${sajuResultHtml ? '' : 'active'}">
          <div class="hero-banner">
            <span class="hero-tag">KST 00:00 자정 자동 갱신</span>
            <div class="hero-title">12간지 띠별 오늘의 운세</div>
            <div class="hero-desc">한국 표준시 기준으로 정밀 계산된 오늘 하루 기운입니다.</div>
          </div>

          <!-- 12개 띠 카드 렌더링 -->
          ${zodiacData.map(z => `
            <div class="zodiac-card">
              <div class="zodiac-header">
                <span>${z.emoji}</span>
                <span>${z.name} 운세</span>
              </div>
              ${z.yearItems.map(it => `
                <div class="year-row">
                  <div class="year-badge">${it.birthYear}년생 (${it.currentAge}세)</div>
                  <div class="year-phrase">${it.theme}</div>
                  <div class="year-tags">
                    <span>💰 재물: <b>${it.wealth}</b></span>
                    <span>⚠️ 주의: <b style="color:#e11d48;">${it.warn}</b></span>
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>

        <!-- 2. 📜 정밀 사주 x 성명학 -->
        <div id="tabSaju" class="tab-content ${sajuResultHtml ? 'active' : ''}">
          <h2 style="font-size:18px; font-weight:800; margin-bottom:14px; color:#0f172a;">📜 정통 사주 x 성명학 분석</h2>
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
              <select name="time">${timeOptionsHtml}</select>
            </div>
            <button type="submit" class="btn-primary">정밀 4주 8자 분석하기</button>
          </form>
          ${sajuResultHtml}
        </div>

        <!-- 3. 👁️ AI 관상 분석 -->
        <div id="tabFace" class="tab-content">
          <h2 style="font-size:18px; font-weight:800; margin-bottom:14px; color:#0f172a;">👁️ AI 관상 x 닮은꼴 분석</h2>
          
          <div style="display:flex; gap:8px; margin-bottom:12px;">
            <button type="button" class="btn-primary" style="flex:1; padding:11px; font-size:13px; background:#475569;" onclick="document.getElementById('cameraInput').click()">📸 카메라 촬영</button>
            <button type="button" class="btn-primary" style="flex:1; padding:11px; font-size:13px; background:#475569;" onclick="document.getElementById('fileInput').click()">🖼️ 앨범 선택</button>
          </div>

          <input type="file" id="cameraInput" accept="image/*" capture="user" style="display:none;" onchange="handleImage(this)">
          <input type="file" id="fileInput" accept="image/*" style="display:none;" onchange="handleImage(this)">

          <div class="upload-container" onclick="document.getElementById('fileInput').click()">
            <div class="upload-icon">📷</div>
            <div id="uploadLabel" style="font-size:14px; font-weight:700; color:#334155;">얼굴 사진을 등록하거나 촬영하세요</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">이마, 눈썹, 코, 턱이 잘 보이는 정면이 가장 정확합니다</div>
            <img id="imagePreview" alt="미리보기">
          </div>

          <button type="button" class="btn-primary" id="btnAnalyzeFace" onclick="runFaceAnalysis()" disabled>관상 & 닮은꼴 분석 시작</button>

          <div id="faceResultArea"></div>
        </div>

        <!-- 4. 🔮 사주+관상 크로스 패키지 -->
        <div id="tabCross" class="tab-content">
          <div class="discount-card">
            <span class="discount-badge">인기 결합 패키지 40% OFF</span>
            <h2 style="font-size:20px; font-weight:900; color:#701a75; margin:6px 0;">🔮 사주 x 관상 융합 종합 비책</h2>
            <p style="font-size:13.5px; color:#86198f; line-height:1.5;">사주 원국의 부족한 오행을 얼굴 관상이 어떻게 채우고 있는지 입체 분석하는 독점 결합 리포트입니다.</p>
            
            <div class="price-line">
              <s>정가 5,800원</s> $\rightarrow$ <b>특별 할인가 3,400원</b>
            </div>

            <button type="button" class="btn-primary" style="background:#a21caf;" onclick="togglePlus('crossDetailBox', this)">🔓 사주+관상 종합 비책 열기/닫기 (테스트)</button>
          </div>

          <div id="crossDetailBox" style="display:none; margin-top:16px;">
            <div class="section-card plus-item">
              <h4>🎯 사주 x 관상 상호보완 융합 리포트</h4>
              <p style="font-size:14px; color:#334155; line-height:1.6;">사주에 불(火) 기운이 약해 결단력이 주춤할 수 있으나, 귀하의 눈매와 콧방울 관상이 이를 뒷받침하여 30대 중반 이후 폭발적인 재물 운을 끌어모으는 대기만성형 형국입니다.</p>
            </div>
            <div class="section-card plus-item">
              <h4>🛡️ 결정적 위기를 피하는 10년 종합 비책</h4>
              <p style="font-size:14px; color:#334155; line-height:1.6;">동업이나 주요 계약을 맺을 때는 금(金) 기운이 강한 사주나 턱이 다부진 인상의 파트너와 함께할 때 사업 리스크를 최소화할 수 있습니다.</p>
            </div>
          </div>
        </div>

        <!-- 5. 🃏 타로 탭 (준비 중) -->
        <div id="tabTarot" class="tab-content">
          <div style="background:#faf5ff; border:1px dashed #d8b4fe; border-radius:18px; padding:32px 18px; text-align:center; margin-top:20px;">
            <div style="font-size:44px; margin-bottom:12px;">🃏</div>
            <h2 style="font-size:19px; font-weight:800; color:#581c87; margin-bottom:6px;">AI 3D 타로 상담소</h2>
            <p style="font-size:13.5px; color:#7e22ce; line-height:1.5;">감각적인 78장 타로 카드 덱과 인터랙티브 셔플 기능을 탑재 중입니다.<br>다음 업데이트에서 공개됩니다!</p>
            <button type="button" class="btn-primary" style="background:#9333ea; max-width:200px; margin-top:14px; font-size:14px;" onclick="alert('오픈 알림 예약이 완료되었습니다!')">🔔 오픈 알림 신청</button>
          </div>
        </div>

      </div>

      <!-- 하단 고정 5대 네비게이션 바 -->
      <nav class="bottom-nav">
        <button type="button" class="nav-item ${sajuResultHtml ? '' : 'active'}" id="navToday" onclick="switchNav('today')">
          <span class="nav-icon">☀️</span>
          <span>오늘운세</span>
        </button>
        <button type="button" class="nav-item ${sajuResultHtml ? 'active' : ''}" id="navSaju" onclick="switchNav('saju')">
          <span class="nav-icon">📜</span>
          <span>정밀사주</span>
        </button>
        <button type="button" class="nav-item" id="navFace" onclick="switchNav('face')">
          <span class="nav-icon">👁️</span>
          <span>AI관상</span>
        </button>
        <button type="button" class="nav-item" id="navCross" onclick="switchNav('cross')">
          <span class="nav-icon">🔮</span>
          <span>사주+관상</span>
        </button>
        <button type="button" class="nav-item" id="navTarot" onclick="switchNav('tarot')">
          <span class="nav-icon">🃏</span>
          <span>타로</span>
        </button>
      </nav>

      <script>
        // 네비게이션 탭 전환
        function switchNav(type) {
          const list = ['today', 'saju', 'face', 'cross', 'tarot'];
          list.forEach(item => {
            const content = document.getElementById('tab' + item.charAt(0).toUpperCase() + item.slice(1));
            const nav = document.getElementById('nav' + item.charAt(0).toUpperCase() + item.slice(1));
            if (item === type) {
              content.classList.add('active');
              nav.classList.add('active');
            } else {
              content.classList.remove('active');
              nav.classList.remove('active');
            }
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 플러스 심층 열기/닫기 토글
        function togglePlus(boxId, btn) {
          const box = document.getElementById(boxId);
          if (box.style.display === 'none' || box.style.display === '') {
            box.style.display = 'block';
            if (btn) btn.innerText = '🔓 플러스 심층 리포트 닫기';
          } else {
            box.style.display = 'none';
            if (btn) btn.innerText = '🔒 플러스 심층 리포트 열기/닫기';
          }
        }

        // 이미지 로딩 및 관상 분석
        let loadedImgElement = null;
        function handleImage(input) {
          if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
              const preview = document.getElementById('imagePreview');
              preview.src = e.target.result;
              preview.style.display = 'block';
              document.getElementById('uploadLabel').innerText = '사진 등록 완료! 아래 버튼을 누르세요.';
              document.getElementById('btnAnalyzeFace').removeAttribute('disabled');

              loadedImgElement = new Image();
              loadedImgElement.src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
          }
        }

        const CELEB_PROFILES = [
          {
            celeb: '유재석 상 (성실 번영형)',
            type: '청수형(淸秀形) - 총명함과 깊은 신뢰감',
            desc: '이마에서 턱까지 균형이 단정하며 입매가 다부져 대중의 신뢰를 얻고 장기적인 재물을 모으는 관상입니다.',
            forehead: '넓고 반듯함 $\\\\rightarrow$ 뛰어난 순발력과 소통 능력',
            eyes: '눈꼬리가 차분함 $\\\\rightarrow$ 신중하고 배려심 넘치는 처세술',
            nose: '콧날이 곧고 바름 $\\\\rightarrow$ 정직한 재물 축적과 끈기',
            mouth: '입꼬리가 단단히 닫힘 $\\\\rightarrow$ 높은 책임감',
            peak: '40대 중반 ~ 60대까지 긴 전성기 유지',
            style: '조직을 조율하고 팀워크를 이끄는 온화한 리더십',
            mate: '말씨가 부드럽고 차분한 현모양처/조력자형 인상',
            mbti: 'ISFJ, ENFJ, ESFJ'
          },
          {
            celeb: '이정재 상 (카리스마 대권형)',
            type: '위맹형(威猛形) - 당당한 기백과 리더십',
            desc: '눈빛에 중심이 서 있고 턱이 묵직하여 큰 무대나 조직에서 주도권을 잡고 큰 성공을 거머쥐는 관상입니다.',
            forehead: '이마 양옆이 시원함 $\\\\rightarrow$ 명예운과 결단력',
            eyes: '눈빛이 깊고 강함 $\\\\rightarrow$ 예리한 통찰력',
            nose: '콧방울이 도톰함 $\\\\rightarrow$ 큰 자금을 굴리는 재물복',
            mouth: '입술 윤곽이 뚜렷함 $\\\\rightarrow$ 강한 설득력',
            peak: '30대 후반부터 말년까지 연속적인 대운',
            style: '돌파력이 뛰어나며 독자적인 사업/프로젝트를 이끄는 스타일',
            mate: '지적이고 센스 넘치는 스타일리시한 배필',
            mbti: 'ENTJ, ESTP, INTJ'
          },
          {
            celeb: '아이유 상 (예술적 귀인형)',
            type: '수려형(秀麗形) - 풍부한 감수성과 대중 복록',
            desc: '이목구비의 조화가 부드럽고 눈망울이 맑아 주변의 귀인을 끌어당기며 재물이 마르지 않는 관상입니다.',
            forehead: '이마가 둥글고 깨끗함 $\\\\rightarrow$ 높은 창의성과 총명함',
            eyes: '흑백이 분명한 맑은 눈 $\\\\rightarrow$ 예술적 감각',
            nose: '코끝이 단아함 $\\\\rightarrow$ 실속 있는 자산 관리',
            mouth: '온화하고 도톰한 입술 $\\\\rightarrow$ 귀인 복록',
            peak: '20대 초반부터 일찍 발복하여 말년까지 번영',
            style: '자기만의 독창적인 콘텐츠로 승부하는 창의형',
            mate: '듬직하고 묵묵히 멘토가 되어주는 배필',
            mbti: 'INFJ, INFP, ENFP'
          },
          {
            celeb: '손흥민 상 (돌파 질주형)',
            type: '용맹형(勇猛形) - 불굴의 의지와 세계적 성취',
            desc: '눈썹 뼈와 광대의 탄력이 뛰어나 시련을 기회로 바꾸고 정상에 오르는 강인한 승부사의 관상입니다.',
            forehead: '이마 중앙이 탄탄함 $\\\\rightarrow$ 강한 승부욕',
            eyes: '집중력이 넘치는 눈매 $\\\\rightarrow$ 기회를 낚아채는 동물적 감각',
            nose: '콧대가 굵고 흔들림 없음 $\\\\rightarrow$ 강인한 돌파력',
            mouth: '야무지게 다문 입 $\\\\rightarrow$ 극한의 절제력',
            peak: '20대 후반 ~ 40대까지 체력과 명예운 폭발',
            style: '글로벌 무대나 경쟁이 치열한 분야에서 최고를 찍는 스타일',
            mate: '내조와 헌신으로 컨디션을 지켜주는 배필',
            mbti: 'ESTJ, ISTP, ENTJ'
          }
        ];

        function runFaceAnalysis() {
          if (!loadedImgElement) return;

          const btn = document.getElementById('btnAnalyzeFace');
          btn.innerText = '인공지능 관상 정밀 판독 중...';
          btn.disabled = true;

          setTimeout(() => {
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

            const p = CELEB_PROFILES[sum % CELEB_PROFILES.length];

            const resultHtml = '' +
              '<div class="result-box">' +
                '<div class="res-badge">관상 무료 기본 요약</div>' +
                '<h2 class="res-title">👁️ 닮은꼴 관상: ' + p.celeb + '</h2>' +

                '<div class="section-card">' +
                  '<h4>💡 총평 풀이</h4>' +
                  '<p class="card-desc">' + p.desc + '</p>' +
                '</div>' +

                '<div class="section-card">' +
                  '<h4>🔍 이목구비 부위별 요약</h4>' +
                  '<p style="font-size:13px; color:#475569; margin-bottom:4px;">• <b>이마/눈썹:</b> ' + p.forehead + '</p>' +
                  '<p style="font-size:13px; color:#475569; margin-bottom:4px;">• <b>눈빛/시선:</b> ' + p.eyes + '</p>' +
                  '<p style="font-size:13px; color:#475569; margin-bottom:4px;">• <b>코/재백궁:</b> ' + p.nose + '</p>' +
                  '<p style="font-size:13px; color:#475569;">• <b>입매/하정:</b> ' + p.mouth + '</p>' +
                '</div>' +

                '<div class="plus-lock-banner">' +
                  '<div class="plus-tag">✨ 관상 프리미엄 심층 비책 (테스트 무료)</div>' +
                  '<div class="plus-title">인생 전성기 · 천직 스타일 · 얼굴 개운법</div>' +
                  '<div class="plus-desc">성형 없이 인상을 바꾸어 재물운을 터뜨리는 관상학적 비책입니다.</div>' +
                  '<button type="button" class="btn-toggle" onclick="togglePlus(\\'facePlusArea\\', this)">🔒 관상 플러스 심층 리포트 열기/닫기</button>' +
                '</div>' +

                '<div id="facePlusArea" class="plus-content-box" style="display:none;">' +
                  '<div class="section-card plus-item">' +
                    '<h4>⏳ 관상으로 본 인생 황금 전성기</h4>' +
                    '<p style="font-size:14px; color:#0284c7; font-weight:bold;">' + p.peak + '</p>' +
                  '</div>' +

                  '<div class="section-card plus-item">' +
                    '<h4>💼 관상학적 비즈니스 & 리더십 유형</h4>' +
                    '<p style="font-size:14px; color:#475569;">' + p.style + '</p>' +
                  '</div>' +

                  '<div class="section-card plus-item">' +
                    '<h4>💍 인연을 부르는 배우자 관상 & 찰떡 MBTI</h4>' +
                    '<p style="font-size:13.5px; color:#475569;">• <b>배필 인상:</b> ' + p.mate + '</p>' +
                    '<p style="font-size:13.5px; color:#475569; margin-top:4px;">• <b>상성 MBTI:</b> <span style="color:#0284c7; font-weight:bold;">' + p.mbti + '</span></p>' +
                  '</div>' +

                  '<div class="section-card plus-item" style="border-left:4px solid #0284c7;">' +
                    '<h4>✨ 얼굴 개운 비책 (성형 없이 운 틔우기)</h4>' +
                    '<p style="font-size:13px; color:#475569; line-height:1.5;">미간(명궁) 사이에 잔털을 깨끗이 정리해 빛이 나게 유지하고, 평소 입꼬리를 의식적으로 살짝 올리고 말하면 들어오는 재물이 흩어지지 않고 모입니다.</p>' +
                  '</div>' +
                '</div>' +
              '</div>';

            document.getElementById('faceResultArea').innerHTML = resultHtml;
            btn.innerText = '관상 & 닮은꼴 분석 다시하기';
            btn.disabled = false;
          }, 600);
        }
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 정상 실행 중입니다.`);
});
