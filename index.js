const http = require('http');
const url = require('url');

// =================================================================
// 1. 한국 표준시(KST) 및 정통 명리학(만세력) 데이터베이스
// =================================================================
function getKSTDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (9 * 60 * 60 * 1000));
}

const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const OHENG = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토',
  '경': '금', '신': '금', '임': '수', '계': '수',
  '인': '목', '묘': '목', '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금', '해': '수', '자': '수'
};

const YANG_CHEONGAN = ['갑', '병', '무', '경', '임'];

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
    jobs: '스타트업 창업가, 총괄 기획 디렉터, 건축·엔지니어링, 교육 기관장, 정책 연구원',
    spouseMale: '나의 자존심을 묵묵히 세워주고 안정적인 내조와 지혜를 갖춘 단아한 인상',
    spouseFemale: '나를 든든하게 지지하며 함께 큰 뜻을 도모할 수 있는 믿음직하고 능력 있는 인상',
    mbti: ['ENTJ (통솔자)', 'ENFJ (선도자)', 'INTJ (전략가)'],
    celebs: ['송중기 (갑목형)', '아이유 (갑목형)', '손흥민 (갑목형)'],
    goodOheng: '임수(壬水), 병화(丙火)',
    goodZodiac: '돼지띠, 토끼띠, 양띠',
    item: '생목 화분, 목재 수제 가구, 원목 만년필',
    color: '포레스트 그린, 올리브, 민트',
    nearJobs: '소프트웨어 개발자, 데이터 기획자, 세무사',
    nameChar: '동(東), 근(根), 림(林), 빈(彬)'
  },
  '을': {
    title: '유연한 담쟁이 (乙木)',
    summary: '비바람에도 꺾이지 않는 넝쿨처럼 탁월한 환경 적응력과 친화력, 위기 속에서 활로를 찾는 생활력을 자랑합니다.',
    jobs: '브랜드 마케팅 총괄, 콘텐츠 크리에이터, 디자인/패션 디렉터, 심리 상담사, 헬스케어 기획자',
    spouseMale: '현실적인 경제 관념이 뚜렷하고 내조와 살림을 알뜰히 꾸리는 다정하고 지혜로운 인상',
    spouseFemale: '결단력이 빠르고 바위처럼 든든하여 내가 기댈 수 있는 듬직한 현실주의자 인상',
    mbti: ['INFJ (옹호자)', 'ENFP (활동가)', 'ISFP (예술가)'],
    celebs: ['지드래곤 (을목형)', '김수현 (을목형)', '수지 (을목형)'],
    goodOheng: '병화(丙火), 계수(癸水)',
    goodZodiac: '호랑이띠, 말띠, 개띠',
    item: '실크 머플러, 플라워 패턴 다이어리, 허브 화분',
    color: '파스텔 그린, 에메랄드, 애플 민트',
    nearJobs: '영업 전문가, 홍보 PR 디렉터, 외교관',
    nameChar: '초(草), 란(蘭), 연(蓮), 서(舒)'
  },
  '병': {
    title: '타오르는 태양 (丙火)',
    summary: '온 세상을 비추는 태양처럼 정열적이고 화통하며, 숨김없는 솔직함과 대중을 압도하는 카리스마를 발휘합니다.',
    jobs: '엔터테인먼트 대표, 방송/미디어 연출, 외식 프랜차이즈 오너, 글로벌 무역 세일즈, 대외 협력 임원',
    spouseMale: '나의 급한 성정을 차분히 다스려주고 냉철한 조언을 건넬 수 있는 지적이고 사려 깊은 인상',
    spouseFemale: '넓은 도량으로 나의 활동적인 면모를 존중하며 함께 미래를 설계하는 온화한 리더형 인상',
    mbti: ['ESTP (사업가)', 'ENTP (변론가)', 'ESFP (연예인)'],
    celebs: ['이정재 (병화형)', '차승원 (병화형)', '유재석 (병화형)'],
    goodOheng: '임수(壬水), 갑목(甲木)',
    goodZodiac: '말띠, 호랑이띠, 개띠',
    item: '고급 선글라스, 레드 포인트 가죽 지갑, 감각적인 조명',
    color: '스칼렛 레드, 웜 오렌지, 코랄 핑크',
    nearJobs: '투자 심사역(VC), 전략 컨설턴트, 자산운용가',
    nameChar: '현(炫), 엽(燁), 욱(旭), 훈(勳)'
  },
  '정': {
    title: '온기를 품은 등불 (丁火)',
    summary: '어둠을 밝히는 촛불처럼 은은하지만 내면에 응축된 강한 집중력과 타인을 꿰뚫어보는 직관적 통찰력을 지녔습니다.',
    jobs: '금융 자산 분석가, AI 연구원, 시나리오/웹툰 작가, 정밀 의료인, 하이테크 하드웨어 엔지니어',
    spouseMale: '말씨가 부드럽고 가정을 아늑하게 만들어주며 내 마음을 편안하게 감싸주는 온유한 인상',
    spouseFemale: '사회적 신망이 두텁고 한결같은 신의로 중심을 지켜주는 믿음직한 전문직형 인상',
    mbti: ['INTJ (전략가)', 'INTP (논리술사)', 'ISTJ (현실주의자)'],
    celebs: ['정우성 (정화형)', '한소희 (정화형)', '박보검 (정화형)'],
    goodOheng: '갑목(甲木), 경금(庚金)',
    goodZodiac: '닭띠, 소띠, 뱀띠',
    item: '아로마 캔들 워머, 천연 에센셜 오일, 클래식 만년필',
    color: '와인 버건디, 딥 오렌지, 초콜릿 브라운',
    nearJobs: '공인회계사, 데이터 아키텍트, 변리사',
    nameChar: '희(熙), 령(煐), 찬(燦), 솔(率)'
  },
  '무': {
    title: '광활한 대산 (戊土)',
    summary: '높은 산맥처럼 중후하고 흔들림이 없으며, 비밀과 신의를 철저히 지켜 조직 내 최고의 조언자이자 중심축이 됩니다.',
    jobs: '부동산 자산개발 디벨로퍼, 공공 행정 관리자, 물류/유통 총괄 오너, 대규모 인프라 설계자',
    spouseMale: '눈치가 빠르고 쾌활하여 나의 진중하고 무거운 분위기를 유쾌하게 전환해 주는 센스 있는 인상',
    spouseFemale: '뚝심과 포용력이 있으며 사회적으로 큰 그릇을 인정받는 듬직하고 호방한 인상',
    mbti: ['ESTJ (경영자)', 'ISTJ (청렴결백형)', 'ENFJ (선도자)'],
    celebs: ['공유 (무토형)', '조인성 (무토형)', '마동석 (무토형)'],
    goodOheng: '계수(癸水), 갑목(甲木)',
    goodZodiac: '원숭이띠, 쥐띠, 용띠',
    item: '도자기 소품, 황토 온열 매트, 천연 가죽 벨트',
    color: '머스타드 옐로우, 테라코타, 샌드 베이지',
    nearJobs: '감정평가사, 건축 시공 총괄, 관세사',
    nameChar: '기(基), 균(均), 배(培), 곤(坤)'
  },
  '기': {
    title: '비옥한 전답 (己土)',
    summary: '만물을 길러내는 밭처럼 부드럽고 섬세하며, 속 깊은 정과 알짜 실속을 챙기는 실천형 설계자입니다.',
    jobs: '자산 관리 PB, 교육/복지 디렉터, 요식업 브랜드 기획자, 인테리어 코디네이터, 세무 전문직',
    spouseMale: '생활력이 강하고 나를 믿고 의지하며 가정에 헌신하는 따뜻하고 야무진 인상',
    spouseFemale: '한결같은 신뢰를 주며 비바람이 불어도 가족을 지켜내는 뚝심 있는 기둥 같은 인상',
    mbti: ['ISFJ (수호자)', 'ESFJ (친선도모형)', 'INFJ (옹호자)'],
    celebs: ['원빈 (기토형)', '김연아 (기토형)', '송강호 (기토형)'],
    goodOheng: '병화(丙火), 갑목(甲木)',
    goodZodiac: '말띠, 돼지띠, 양띠',
    item: '가죽 바인더 플래너, 원예 분재, 포근한 패브릭 쿠션',
    color: '내추럴 베이지, 크림 아이보리, 카멜',
    nearJobs: '초중등 교육자, 영양 연구원, 수의사',
    nameChar: '원(園), 규(奎), 연(廷), 재(載)'
  },
  '경': {
    title: '강인한 무쇠 (庚金)',
    summary: '용광로에서 제련된 칼날처럼 과감한 결단력과 의리가 돋보이며, 목표가 정해지면 망설임 없이 정면 돌파합니다.',
    jobs: '검경/법조인, 외과 전문의, 기계·자동차·방산 엔지니어, 대형 물류 대표, 금속 공학 전문가',
    spouseMale: '말투가 다정다감하고 나를 지혜롭게 어루만져 나의 강한 성정을 누그러뜨리는 차분한 인상',
    spouseFemale: '자기 분야에서 뚜렷한 리더십을 갖추고 나를 존중하며 보폭을 맞춰주는 멋진 인상',
    mbti: ['ENTJ (통솔자)', 'ESTP (사업가)', 'ISTP (장인)'],
    celebs: ['이병헌 (경금형)', '전지현 (경금형)', '최민식 (경금형)'],
    goodOheng: '정화(丁火), 임수(壬水)',
    goodZodiac: '소띠, 뱀띠, 용띠',
    item: '스테인리스 텀블러, 정밀 메탈 시계, 프리미엄 만년필',
    color: '스노우 화이트, 실버 메탈릭, 플래티넘',
    nearJobs: '정밀 엔지니어, 변호사, 항공기 파일럿',
    nameChar: '진(鎭), 호(鎬), 현(鉉), 종(鐘)'
  },
  '신': {
    title: '정교한 보석 (辛金)',
    summary: '완벽하게 세공된 다이아몬드처럼 깔끔하고 날카로운 심미안을 지녔으며, 자기 기준이 엄격한 완벽주의자입니다.',
    jobs: '정밀 IT 보안 아키텍트, 럭셔리 보석/아트 큐레이터, 피부/성형외과 전문의, 프리미엄 브랜드 총괄 디자이너',
    spouseMale: '단정하고 세련된 미적 감각을 지녔으며 예의 바르고 배려심 넘치는 지성형 인상',
    spouseFemale: '사회적 능력과 세련된 안목을 겸비하여 함께 품격을 높여갈 수 있는 지적이고 멋스러운 인상',
    mbti: ['INTP (논리술사)', 'ISTJ (현실주의자)', 'ISFP (예술가)'],
    celebs: ['현빈 (신금형)', '손예진 (신금형)', '차은우 (신금형)'],
    goodOheng: '임수(壬水), 병화(丙火)',
    goodZodiac: '용띠, 원숭이띠, 쥐띠',
    item: '화이트골드 주얼리, 미니멀리즘 거울, 티타늄 안경',
    color: '퓨어 화이트, 샴페인 골드, 아이스 그레이',
    nearJobs: '소프트웨어 보안관, 갤러리스트, 전문 에디터',
    nameChar: '은(銀), 서(瑞), 유(鍮), 선(銑)'
  },
  '임': {
    title: '거대한 큰 바다 (壬水)',
    summary: '대양처럼 드넓은 도량과 깊은 지혜를 갖추었으며, 경계를 두지 않는 유연한 사고로 큰 부를 창출해 냅니다.',
    jobs: '글로벌 무역 총괄, 해운 물류 대기업 임원, 빅데이터 플랫폼 설계자, 헤지펀드 투자 매니저, 외교 전략가',
    spouseMale: '나의 큰 스케일을 이해하고 지지해 주며 흔들리지 않고 가정을 굳건히 지키는 현숙한 인상',
    spouseFemale: '주관이 뚜렷하고 깊은 그릇을 지녀 나와 인생의 큰 비전을 대화할 수 있는 어른스러운 인상',
    mbti: ['ENTP (변론가)', 'INFP (중재자)', 'ENFP (활동가)'],
    celebs: ['봉준호 (임수형)', '유재석 (임수형)', 'BTS RM (임수형)'],
    goodOheng: '무토(戊土), 병화(丙火)',
    goodZodiac: '호랑이띠, 말띠, 개띠',
    item: '실내 스마트 가습기, 블랙 가죽 백팩, 오션 디퓨저',
    color: '딥 오션 네이비, 제트 블랙, 인디고 블루',
    nearJobs: '글로벌 펀드매니저, 데이터 과학자, 해양 플랜트 전문가',
    nameChar: '호(浩), 택(澤), 원(源), 태(泰)'
  },
  '계': {
    title: '생명을 살리는 빗물 (癸水)',
    summary: '봄비처럼 은밀하고 세심하게 스며드는 감수성과 총명함을 지녔으며, 직관력과 기획력이 매우 뛰어납니다.',
    jobs: '심리 치료/정신건강의, 작사/작곡가, 인터랙티브 UI/UX 기획자, 웰니스 스파 대표, 전략 정보 분석관',
    spouseMale: '바위처럼 든든하고 신뢰감이 두터워 나의 여린 감정을 안전하게 지켜주는 믿음직한 인상',
    spouseFemale: '포용력이 넓고 나의 예민한 직관을 존중하며 현실적인 안정을 제공해 주는 듬직한 인상',
    mbti: ['INFJ (옹호자)', 'INFP (중재자)', 'ISFJ (수호자)'],
    celebs: ['조승우 (계수형)', '김태리 (계수형)', '박해일 (계수형)'],
    goodOheng: '신금(辛金), 갑목(甲木)',
    goodZodiac: '소띠, 토끼띠, 돼지띠',
    item: '고급 크리스털 텀블러, 명상 싱잉볼, 프리미엄 티 세트',
    color: '스카이 블루, 미드나잇 블루, 투명 크리스털',
    nearJobs: '심리 상담 슈퍼바이저, 방송 작가, 핀테크 기획자',
    nameChar: '청(淸), 윤(潤), 수(洙), 린(潾)'
  }
};

// =================================================================
// 2. 12간지 동물별 3세대(36개 연도) 일일 운세 생성기
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
// 3. HTTP 서버 및 통합 렌더러
// =================================================================
const server = http.createServer((req, res) => {
  const kstNow = getKSTDate();
  const curY = kstNow.getFullYear();
  const curM = kstNow.getMonth() + 1;
  const curD = kstNow.getDate();
  const dayKo = ['일', '월', '화', '수', '목', '금', '토'][kstNow.getDay()];
  const kstDateLabel = `${curY}년 ${curM}월 ${curD}일 (${dayKo})`;

  const zodiacData = generateDailyZodiacCards(kstNow);

  const timeOptionsHtml = TIME_SLOTS.map(t => {
    return `<option value="${t.value}">${t.label}</option>`;
  }).join('');

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>운명 포털 - 사주 x 관상 x 타로</title>
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

        /* 폼 요소 공통 */
        .form-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 16px; }
        .input-group { margin-bottom: 13px; }
        label { display: block; font-size: 13px; margin-bottom: 6px; color: #475569; font-weight: 700; }
        input[type="text"], select { width: 100%; padding: 13px; border-radius: 12px; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; font-size: 15px; font-weight: 500; }
        input:focus, select:focus { outline: 2px solid #0284c7; }

        /* 성별 선택 토글 버튼 */
        .gender-group { display: flex; gap: 8px; margin-top: 4px; }
        .gender-btn { flex: 1; padding: 12px; border: 1px solid #cbd5e1; border-radius: 12px; background: #ffffff; color: #64748b; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .gender-btn.active { background: #0284c7; color: #ffffff; border-color: #0284c7; box-shadow: 0 4px 10px rgba(2,132,199,0.25); }

        .btn-primary { width: 100%; padding: 15px; border-radius: 14px; border: none; background: #0284c7; color: #ffffff; font-size: 16px; font-weight: 800; cursor: pointer; margin-top: 6px; box-shadow: 0 4px 12px rgba(2,132,199,0.25); transition: 0.15s; }
        .btn-primary:active { transform: scale(0.98); }

        /* 하단 고정 5대 네비게이션 바 (점신 스타일) */
        .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; height: 68px; background: #ffffff; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-around; align-items: center; z-index: 1000; box-shadow: 0 -4px 16px rgba(0,0,0,0.04); }
        .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 11px; font-weight: 700; gap: 4px; padding: 0; }
        .nav-item.active { color: #0284c7; }
        .nav-icon { font-size: 20px; }

        /* 12간지 띠별 카드 */
        .zodiac-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        .zodiac-header { display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
        .year-row { background: #f8fafc; border-radius: 10px; padding: 12px; margin-bottom: 8px; border: 1px solid #e2e8f0; }
        .year-badge { font-size: 13px; font-weight: 800; color: #0284c7; margin-bottom: 4px; }
        .year-phrase { font-size: 13.5px; color: #334155; line-height: 1.5; margin-bottom: 6px; }
        .year-tags { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: #64748b; }
        .year-tags b { color: #0f172a; }

        /* 결과 리포트 공통 카드 */
        .result-box { margin-top: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .res-badge { display: inline-block; background: #e0f2fe; color: #0284c7; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }
        .res-badge.premium { background: #fae8ff; color: #a21caf; }
        .res-badge.tarot { background: #ede9fe; color: #7c3aed; }
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
        .plus-lock-banner.premium { background: linear-gradient(135deg, #4a044e 0%, #1e1b4b 100%); }
        .plus-lock-banner.tarot { background: linear-gradient(135deg, #2e1065 0%, #1e1b4b 100%); }
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

        /* 사진 업로드 */
        .upload-container { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px 14px; text-align: center; background: #ffffff; cursor: pointer; margin-bottom: 12px; }
        .upload-icon { font-size: 32px; margin-bottom: 6px; }
        .img-preview { max-width: 100%; max-height: 200px; border-radius: 12px; margin-top: 12px; display: none; margin-left: auto; margin-right: auto; object-fit: cover; }
        
        /* 프리미엄 배너 */
        .premium-hero { background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border: 1px solid #f0abfc; border-radius: 18px; padding: 18px; margin-bottom: 16px; }
        .premium-badge { display: inline-block; background: #c026d3; color: #ffffff; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px; margin-bottom: 6px; }
        .price-line { font-size: 14px; margin-top: 8px; color: #701a75; }
        .price-line s { color: #94a3b8; }
        .price-line b { font-size: 20px; color: #a21caf; }

        /* ============================================== */
        /* 🃏 타로 인터랙티브 3D 카드 덱 스타일 */
        /* ============================================== */
        .tarot-topic-group { display: flex; gap: 6px; margin-bottom: 14px; }
        .tarot-topic-btn { flex: 1; padding: 11px 4px; border-radius: 12px; border: 1px solid #cbd5e1; background: #ffffff; color: #64748b; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .tarot-topic-btn.active { background: #7c3aed; color: #ffffff; border-color: #7c3aed; box-shadow: 0 4px 12px rgba(124,58,237,0.25); }

        .deck-scroll-wrapper { width: 100%; overflow-x: auto; padding: 15px 4px; scrollbar-width: none; }
        .deck-scroll-wrapper::-webkit-scrollbar { display: none; }
        .tarot-deck-container { display: flex; gap: 12px; width: max-content; perspective: 1000px; padding: 5px; }

        .tarot-card-item { width: 95px; height: 155px; position: relative; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .tarot-card-item:hover { transform: translateY(-8px); }
        .tarot-card-item.flipped { transform: rotateY(180deg) scale(1.05); }

        .card-face { position: absolute; width: 100%; height: 100%; border-radius: 12px; backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.12); border: 2px solid #e2e8f0; }
        
        /* 카드 뒷면 (미지의 신비로운 보랏빛) */
        .card-back { background: linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%); border-color: #c084fc; color: #e9d5ff; }
        .back-pattern { width: 75px; height: 135px; border: 1px dashed #a855f7; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .back-rune { font-size: 26px; }

        /* 카드 앞면 (공개된 타로 심볼) */
        .card-front { background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%); border-color: #8b5cf6; transform: rotateY(180deg); color: #1e1b4b; padding: 8px; text-align: center; }
        .front-num { font-size: 11px; font-weight: 800; color: #7c3aed; }
        .front-symbol { font-size: 38px; margin: 4px 0; }
        .front-name { font-size: 12px; font-weight: 800; color: #1e293b; line-height: 1.2; }
      </style>
    </head>
    <body>
      <div class="app-container">
        
        <!-- 상단 헤더 -->
        <div class="app-header">
          <div class="app-logo">운명<span>포털</span></div>
          <div class="header-date">📅 ${kstDateLabel}</div>
        </div>

        <!-- ============================================== -->
        <!-- 1. ☀️ 오늘의 운세 -->
        <!-- ============================================== -->
        <div id="tabToday" class="tab-content active">
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

        <!-- ============================================== -->
        <!-- 2. 📜 정밀 사주 x 성명학 -->
        <!-- ============================================== -->
        <div id="tabSaju" class="tab-content">
          <h2 style="font-size:18px; font-weight:800; margin-bottom:14px; color:#0f172a;">📜 정통 사주 x 성명학 분석</h2>
          
          <div class="form-card">
            <div class="input-group">
              <label>이름 (한글)</label>
              <input type="text" id="sajuName" placeholder="예: 홍길동">
            </div>
            
            <div class="input-group">
              <label>성별 선택</label>
              <div class="gender-group">
                <button type="button" class="gender-btn active" id="sajuMaleBtn" onclick="selectGender('saju', 'male')">🙋‍♂️ 남성</button>
                <button type="button" class="gender-btn" id="sajuFemaleBtn" onclick="selectGender('saju', 'female')">🙋‍♀️ 여성</button>
              </div>
              <input type="hidden" id="sajuGender" value="male">
            </div>

            <div class="input-group">
              <label>생년월일 8자리</label>
              <input type="text" id="sajuBirth" placeholder="예: 19920924" maxlength="8">
            </div>

            <div class="input-group">
              <label>태어난 시간 (시주)</label>
              <select id="sajuTime">${timeOptionsHtml}</select>
            </div>

            <button type="button" class="btn-primary" onclick="runSajuAnalysis()">정밀 4주 8자 분석하기</button>
          </div>

          <div id="sajuResultArea"></div>
        </div>

        <!-- ============================================== -->
        <!-- 3. 👁️ AI 관상 분석 -->
        <!-- ============================================== -->
        <div id="tabFace" class="tab-content">
          <h2 style="font-size:18px; font-weight:800; margin-bottom:14px; color:#0f172a;">👁️ AI 관상 x 닮은꼴 분석</h2>
          
          <div class="form-card">
            <div style="display:flex; gap:8px; margin-bottom:12px;">
              <button type="button" class="btn-primary" style="flex:1; padding:11px; font-size:13px; background:#475569;" onclick="document.getElementById('faceCameraInput').click()">📸 카메라 촬영</button>
              <button type="button" class="btn-primary" style="flex:1; padding:11px; font-size:13px; background:#475569;" onclick="document.getElementById('faceFileInput').click()">🖼️ 앨범 선택</button>
            </div>

            <input type="file" id="faceCameraInput" accept="image/*" capture="user" style="display:none;" onchange="handleImage(this, 'facePreview', 'faceUploadLabel', 'faceRunBtn', 'face')">
            <input type="file" id="faceFileInput" accept="image/*" style="display:none;" onchange="handleImage(this, 'facePreview', 'faceUploadLabel', 'faceRunBtn', 'face')">

            <div class="upload-container" onclick="document.getElementById('faceFileInput').click()">
              <div class="upload-icon">📷</div>
              <div id="faceUploadLabel" style="font-size:14px; font-weight:700; color:#334155;">얼굴 사진을 등록하거나 촬영하세요</div>
              <div style="font-size:12px; color:#94a3b8; margin-top:4px;">정면 이목구비(이마·눈썹·코·턱)가 잘 보일수록 정확합니다</div>
              <img id="facePreview" class="img-preview" alt="미리보기">
            </div>

            <button type="button" class="btn-primary" id="faceRunBtn" onclick="runSingleFaceAnalysis()" disabled>관상 & 닮은꼴 분석 시작</button>
          </div>

          <div id="faceResultArea"></div>
        </div>

        <!-- ============================================== -->
        <!-- 4. 🔮 사주+관상 올인원 프리미엄 결합 메뉴 -->
        <!-- ============================================== -->
        <div id="tabCross" class="tab-content">
          <div class="premium-hero">
            <span class="premium-badge">👑 최고 인기 올인원 결합 패키지</span>
            <h2 style="font-size:20px; font-weight:900; color:#701a75; margin:6px 0;">🔮 사주 x 관상 융합 종합 비책</h2>
            <p style="font-size:13.5px; color:#86198f; line-height:1.5;">사주 원국(선천운)의 빈틈을 얼굴 관상(후천운)이 어떻게 보완하는지 한 화면에서 입체 분석하는 독점 프리미엄 리포트입니다.</p>
            <div class="price-line">
              <s>단품가 5,800원</s> $\rightarrow$ <b>특별 할인가 3,400원 (테스트 무료)</b>
            </div>
          </div>

          <div class="form-card" style="border-color:#f0abfc; background:#fdf4ff;">
            <h3 style="font-size:15px; font-weight:800; color:#701a75; margin:0 0 12px 0;">1. 기본 인적사항 입력</h3>
            
            <div class="input-group">
              <label>이름 (한글)</label>
              <input type="text" id="crossName" placeholder="예: 홍길동">
            </div>

            <div class="input-group">
              <label>성별 선택</label>
              <div class="gender-group">
                <button type="button" class="gender-btn active" id="crossMaleBtn" onclick="selectGender('cross', 'male')">🙋‍♂️ 남성</button>
                <button type="button" class="gender-btn" id="crossFemaleBtn" onclick="selectGender('cross', 'female')">🙋‍♀️ 여성</button>
              </div>
              <input type="hidden" id="crossGender" value="male">
            </div>

            <div class="input-group">
              <label>생년월일 8자리</label>
              <input type="text" id="crossBirth" placeholder="예: 19920924" maxlength="8">
            </div>

            <div class="input-group">
              <label>태어난 시간 (시주)</label>
              <select id="crossTime">${timeOptionsHtml}</select>
            </div>

            <h3 style="font-size:15px; font-weight:800; color:#701a75; margin:16px 0 12px 0;">2. 정면 얼굴 사진 등록</h3>
            
            <div style="display:flex; gap:8px; margin-bottom:12px;">
              <button type="button" class="btn-primary" style="flex:1; padding:11px; font-size:13px; background:#86198f;" onclick="document.getElementById('crossCameraInput').click()">📸 카메라 촬영</button>
              <button type="button" class="btn-primary" style="flex:1; padding:11px; font-size:13px; background:#86198f;" onclick="document.getElementById('crossFileInput').click()">🖼️ 앨범 선택</button>
            </div>

            <input type="file" id="crossCameraInput" accept="image/*" capture="user" style="display:none;" onchange="handleImage(this, 'crossPreview', 'crossUploadLabel', 'crossRunBtn', 'cross')">
            <input type="file" id="crossFileInput" accept="image/*" style="display:none;" onchange="handleImage(this, 'crossPreview', 'crossUploadLabel', 'crossRunBtn', 'cross')">

            <div class="upload-container" onclick="document.getElementById('crossFileInput').click()">
              <div class="upload-icon">📷</div>
              <div id="crossUploadLabel" style="font-size:14px; font-weight:700; color:#334155;">얼굴 사진을 등록해 주세요</div>
              <div style="font-size:12px; color:#94a3b8; margin-top:4px;">사주와 얼굴 데이터를 결합하여 정밀 분석합니다</div>
              <img id="crossPreview" class="img-preview" alt="미리보기">
            </div>

            <button type="button" class="btn-primary" id="crossRunBtn" style="background:#a21caf;" onclick="runCrossAnalysis()">👑 사주+관상 프리미엄 올인원 분석 시작</button>
          </div>

          <div id="crossResultArea"></div>
        </div>

        <!-- ============================================== -->
        <!-- 5. 🃏 AI 3D 인터랙티브 타로 탭 (신규 완성) -->
        <!-- ============================================== -->
        <div id="tabTarot" class="tab-content">
          <div style="background:linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border:1px solid #c4b5fd; border-radius:18px; padding:18px; margin-bottom:16px;">
            <span class="res-badge tarot">정통 메이저 아르카나 22장</span>
            <h2 style="font-size:20px; font-weight:900; color:#5b21b6; margin:6px 0;">🃏 AI 심층 인터랙티브 타로</h2>
            <p style="font-size:13px; color:#6d28d9; line-height:1.5;">마음을 가다듬고 고민 주제를 고른 뒤, 가장 강하게 끌리는 운명의 카드를 직접 터치해 보세요.</p>
          </div>

          <!-- 주제 선택 버튼 -->
          <div class="tarot-topic-group">
            <button type="button" class="tarot-topic-btn active" id="topicMoney" onclick="selectTarotTopic('money')">💰 금전·이직</button>
            <button type="button" class="tarot-topic-btn" id="topicLove" onclick="selectTarotTopic('love')">❤️ 연애·재회</button>
            <button type="button" class="tarot-topic-btn" id="topicToday" onclick="selectTarotTopic('today')">☀️ 오늘 조언</button>
          </div>

          <!-- 가로 스크롤 카드 덱 (7장 셔플) -->
          <div class="deck-scroll-wrapper">
            <div class="tarot-deck-container" id="tarotDeckBox">
              <!-- JS로 7장의 셔플 카드 렌더링 -->
            </div>
          </div>
          <div style="text-align:center; font-size:12px; color:#94a3b8; margin:6px 0 16px 0;">👈 카드를 좌우로 넘겨보고 한 장을 톡 터치하세요 👉</div>

          <!-- 타로 결과 리포트 출력 영역 -->
          <div id="tarotResultArea"></div>
        </div>

      </div>

      <!-- 하단 고정 5대 네비게이션 바 -->
      <nav class="bottom-nav">
        <button type="button" class="nav-item active" id="navToday" onclick="switchNav('today')">
          <span class="nav-icon">☀️</span>
          <span>오늘운세</span>
        </button>
        <button type="button" class="nav-item" id="navSaju" onclick="switchNav('saju')">
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
        // 클라이언트 엔진 메타데이터
        const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
        const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
        const YANG_CHEONGAN = ['갑', '병', '무', '경', '임'];
        const OHENG = {
          '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토',
          '경': '금', '신': '금', '임': '수', '계': '수',
          '인': '목', '묘': '목', '사': '화', '오': '화',
          '진': '토', '술': '토', '축': '토', '미': '토',
          '신': '금', '유': '금', '해': '수', '자': '수'
        };

        const PRON_OHENG = {
          'ㄱ': '목', 'ㅋ': '목', 'ㄴ': '화', 'ㄷ': '화', 'ㄹ': '화', 'ㅌ': '화',
          'ㅇ': '토', 'ㅎ': '토', 'ㅅ': '금', 'ㅈ': '금', 'ㅊ': '금',
          'ㅁ': '수', 'ㅂ': '수', 'ㅍ': '수'
        };
        const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

        const ILGAN_MASTER = ${JSON.stringify(ILGAN_MASTER)};

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

        // ==============================================
        // 🃏 메이저 아르카나 22장 정밀 타로 데이터베이스
        // ==============================================
        const TAROT_MASTER = [
          { num: '0', roman: '0. THE FOOL', name: '바보 (The Fool)', emoji: '🃏', key: '새로운 시작 · 모험 · 순수함',
            money: '미지의 분야나 새로운 투자 제안에 과감히 발을 디딜 때입니다. 직관을 믿으세요.',
            love: '조건 없이 마음이 이끌리는 설레는 인연이 찾아옵니다. 과거의 미련은 내려놓으세요.',
            today: '틀에 얽매이지 않고 자유롭게 생각을 펼칠 때 뜻밖의 영감이 번뜩입니다.',
            pastFuture: '과거의 방황이 끝나고, 3개월 뒤 전혀 새로운 영역에서 큰 활로가 열립니다.',
            mind: '순수한 호기심과 설렘으로 가득 차 있으며, 계산하지 않는 진심을 원합니다.',
            taboo: '지나친 계산과 타인의 눈치를 보며 주저하는 태도',
            timing: '이달 말부터 새로운 달의 첫째 주 사이'
          },
          { num: 'I', roman: 'I. THE MAGICIAN', name: '마법사 (The Magician)', emoji: '🪄', key: '재능 발휘 · 기회 포착 · 창조',
            money: '준비해 온 기술과 기획이 빛을 발합니다. 계약이나 면접에서 주도권을 잡습니다.',
            love: '자신의 매력을 적극적으로 어필할 타이밍입니다. 상대방의 시선을 사로잡습니다.',
            today: '자신감을 가지고 첫 단추를 꿰세요. 모든 도구와 자원이 손안에 있습니다.',
            pastFuture: '다양한 시도가 마침내 구체적인 수익 모델로 완성되어 2개월 내 성과를 냅니다.',
            mind: '당신에게 큰 매력과 호기심을 느끼고 있으며 대화를 리드하고 싶어 합니다.',
            taboo: '자신의 역량을 의심하거나 뒤로 숨는 소극적인 행동',
            timing: '당장 이번 주부터 10일 이내'
          },
          { num: 'II', roman: 'II. THE HIGH PRIESTESS', name: '여사제 (The High Priestess)', emoji: '📜', key: '깊은 통찰 · 직관 · 비밀',
            money: '겉으로 드러난 정보보다 숨겨진 내막을 파악해야 합니다. 문서 검토에 집중하세요.',
            love: '겉으로는 차분해 보이지만 내면에 깊은 감정을 품고 있습니다. 시간을 두고 다가가세요.',
            today: '말을 아끼고 주변 상황을 관찰할 때 통찰력 있는 정답을 찾아냅니다.',
            pastFuture: '물밑에서 준비해 온 내공이 인정받아, 조만간 결정적 조언자로 등극합니다.',
            mind: '신중하게 당신을 지켜보고 있으며, 가벼운 관계가 아닌 신뢰를 원합니다.',
            taboo: '경솔한 언행이나 비밀을 섣불리 발설하는 것',
            timing: '보름달이 차오르는 중순 무렵'
          },
          { num: 'III', roman: 'III. THE EMPRESS', name: '여황제 (The Empress)', emoji: '👑', key: '풍요 · 결실 · 안정적 번영',
            money: '그동안의 노력이 풍성한 금전적 결실로 돌아옵니다. 안정적인 수입이 보장됩니다.',
            love: '서로를 아끼고 보살피는 따뜻한 온기가 가득합니다. 혼인이나 깊은 결합에 유리합니다.',
            today: '마음의 여유를 누리고 자신에게 맛있는 음식과 휴식을 선물하기 좋은 날입니다.',
            pastFuture: '뿌려둔 씨앗이 싹터 3개월 뒤 가장 풍요로운 금전적 수확을 거둡니다.',
            mind: '당신과 함께할 때 큰 편안함과 모성애/포용력을 느끼고 있습니다.',
            taboo: '불안에 사로잡혀 인색하게 굴거나 상대를 의심하는 것',
            timing: '다음 달 초순의 길일'
          },
          { num: 'IV', roman: 'IV. THE EMPEROR', name: '황제 (The Emperor)', emoji: '🏛️', key: '권위 · 리더십 · 확고한 기반',
            money: '흔들리지 않는 뚝심으로 조직이나 사업의 기틀을 굳건히 다집니다. 승진운 상승.',
            love: '표현은 서툴지만 책임감만큼은 확실합니다. 신뢰할 수 있는 든든한 관계입니다.',
            today: '원칙과 규칙을 지키며 카리스마 있게 추진할 때 주변이 따릅니다.',
            pastFuture: '혼란기를 딛고 확고한 주도권을 쥐게 되며, 장기적 권위를 확립합니다.',
            mind: '당신과의 관계에서 책임감을 강하게 느끼고 중심을 잡으려 합니다.',
            taboo: '감정적인 충동에 휘둘려 원칙을 깨뜨리는 일',
            timing: '숫자 4가 들어가는 날짜 전후'
          },
          { num: 'V', roman: 'V. THE HIEROPHANT', name: '교황 (The Hierophant)', emoji: '🕊️', key: '귀인의 조언 · 신뢰 · 계약',
            money: '경험 많은 멘토나 전문가의 조언을 따를 때 자산 손실을 완벽히 방어합니다.',
            love: '주변 사람들의 축복을 받는 안정적인 관계입니다. 소개팅이나 중매운이 매우 길합니다.',
            today: '혼자 고민하지 말고 믿을 수 있는 선배나 지인에게 의논을 구하세요.',
            pastFuture: '뜻밖의 귀인을 만나 법적/계약적 문제나 취업 관문이 단번에 해결됩니다.',
            mind: '당신을 도덕적이고 존경할 만한 사람으로 바라보며 조언을 구하고 싶어 합니다.',
            taboo: '편법을 쓰거나 정통 경로를 무시하는 행위',
            timing: '목요일 또는 주말 공공 행사 시기'
          },
          { num: 'VI', roman: 'VI. THE LOVERS', name: '연인 (The Lovers)', emoji: '💕', key: '운명적 선택 · 깊은 조화 · 파트너십',
            money: '손발이 척척 맞는 최상의 파트너와 동업하거나 협력 계약을 맺기에 최적기입니다.',
            love: '가슴을 울리는 강렬한 호감과 케미스트리가 폭발합니다. 연인 발전 확률 95%.',
            today: '망설이던 중요한 두 가지 갈림길에서 가슴이 진정 원하는 길을 선택하세요.',
            pastFuture: '진심 어린 선택을 내린 후 1개월 내 완벽한 조화를 이루는 안정을 맞이합니다.',
            mind: '당신에게 완전히 빠져 있으며 미래를 함께 그리고 싶어 합니다.',
            taboo: '우유부단하게 양다리를 걸치거나 결정을 미루는 태도',
            timing: '향후 6일 이내'
          },
          { num: 'VII', roman: 'VII. THE CHARIOT', name: '전차 (The Chariot)', emoji: '🏇', key: '돌파력 · 승리 · 목표 질주',
            money: '장애물을 뚫고 경쟁에서 압도적 승리를 거머쥡니다. 이직 및 계약 쟁취운 최상.',
            love: '망설이지 말고 돌직구로 직진해야 인연을 쟁취합니다. 주도권을 쥐세요.',
            today: '뒤돌아보지 말고 오직 목표만을 향해 질주하세요. 승리의 기운이 함께합니다.',
            pastFuture: '치열했던 경쟁이 끝나고, 귀하가 최후의 승자가 되어 보상을 독식합니다.',
            mind: '승부욕과 열정이 불타오르고 있으며 적극적으로 다가오고 싶어 합니다.',
            taboo: '좌우를 살피며 갈팡질팡 집중력을 잃는 것',
            timing: '화요일 또는 오전 이른 시간'
          },
          { num: 'VIII', roman: 'VIII. STRENGTH', name: '힘 (Strength)', emoji: '🦁', key: '외유내강 · 인내 · 부드러운 통제',
            money: '거친 파도를 부드러운 처세술로 잠재웁니다. 장기적인 자산 방어에 성공합니다.',
            love: '상대의 까다로운 성격을 따뜻한 포용력으로 감싸 안아 내 사람으로 만듭니다.',
            today: '힘으로 억누르지 말고 미소와 부드러운 말 한마디로 상대를 설득하세요.',
            pastFuture: '묵묵히 버텨온 인내가 마침내 큰 신뢰로 치환되어 든든한 결실을 맺습니다.',
            mind: '당신의 깊은 도량과 참을성에 깊이 감사하고 신뢰하고 있습니다.',
            taboo: '욱하는 감정에 못 이겨 언성을 높이는 행동',
            timing: '이달 말경 차분히 다가옴'
          },
          { num: 'IX', roman: 'IX. THE HERMIT', name: '은둔자 (The Hermit)', emoji: '🏮', key: '진리 탐구 · 사색 · 때를 기다림',
            money: '지출을 최소화하고 자격증 취득이나 전문 지식을 쌓으며 내실을 다질 때입니다.',
            love: '혼자만의 시간이 필요한 타이밍입니다. 조급하게 상대를 재촉하지 마세요.',
            today: '소음에서 벗어나 조용한 공간에서 내면의 목소리에 집중해 보세요.',
            pastFuture: '고독했던 배움의 시간이 끝나고, 등불처럼 세상을 밝히는 전문가로 우뚝 섭니다.',
            mind: '자신의 생각을 차분히 정리 중이며 혼자만의 공간이 필요합니다.',
            taboo: '외로움에 지쳐 무의미한 사람들과 어울리며 낭비하는 것',
            timing: '깊은 밤 혹은 주말 저녁'
          },
          { num: 'X', roman: 'X. WHEEL OF FORTUNE', name: '운명의 수레바퀴 (Wheel of Fortune)', emoji: '🎡', key: '급격한 행운 · 전환점 · 운명적 타이밍',
            money: '정체되었던 자금의 흐름이 급물살을 타며 상승세로 반전됩니다. 뜻밖의 기회 도래.',
            love: '우연한 만남이 필연적인 인연으로 발전합니다. 재회운과 새 인연운이 동시에 열립니다.',
            today: '운명의 바람이 불어오고 있으니 변화를 두려워하지 말고 흐름에 몸을 맡기세요.',
            pastFuture: '오랜 불운의 고리가 끊어지고, 완전히 새로운 황금 사이클로 진입합니다.',
            mind: '당신과의 만남이 단순한 우연이 아닌 특별한 운명이라 느끼기 시작했습니다.',
            taboo: '지나간 옛 방식에 집착하며 흐름을 거스르는 태도',
            timing: '10일 주기 혹은 계절이 바뀌는 길목'
          },
          { num: 'XI', roman: 'XI. JUSTICE', name: '정의 (Justice)', emoji: '⚖️', key: '공정한 보상 · 균형 · 냉철한 판단',
            money: '투자한 만큼 정직한 수익을 거둡니다. 계약서 서명이나 법적 조율에 매우 유리.',
            love: '감정에 치우치지 않고 서로에게 바라는 기준을 명확히 대화로 풀기 좋습니다.',
            today: '사리분별을 똑 부러지게 하고 원인과 결과를 냉정히 분석하세요.',
            pastFuture: '억울했던 일에 대한 진실이 밝혀지고 정당한 보상과 명예를 되찾습니다.',
            mind: '당신이 공정하고 신뢰할 수 있는 사람인지 이성적으로 가늠하고 있습니다.',
            taboo: '편파적인 태도나 감정적인 편들기',
            timing: '문서가 오가는 평일 업무 시간'
          },
          { num: 'XII', roman: 'XII. THE HANGED MAN', name: '매달린 사람 (The Hanged Man)', emoji: '⏳', key: '새로운 시각 · 인내 · 의미 있는 정체',
            money: '지금 당장은 손발이 묶인 듯 보이나, 시각을 180도 바꾸면 틈새 기회가 보입니다.',
            love: '당장 결판을 내기보다 잠시 상황을 묵묵히 관조하는 인내심이 필요합니다.',
            today: '발버둥 치기보다는 남들이 보지 못하는 새로운 관점으로 판을 뒤집어보세요.',
            pastFuture: '지금의 희생이 헛되지 않아, 조만간 상상치 못했던 반전의 기쁨을 맞이합니다.',
            mind: '상황의 압박 속에서 참고 견디고 있으며 당신을 배려하려 애쓰고 있습니다.',
            taboo: '조급한 마음에 무리수를 두어 상황을 억지로 바꾸려는 것',
            timing: '충분한 휴식 후 약 2~3주 뒤'
          },
          { num: 'XIII', roman: 'XIII. DEATH', name: '죽음 (Death)', emoji: '🌅', key: '새로운 재생 · 종결 · 완전한 탈바꿈',
            money: '수익이 안 나는 낡은 사업이나 미련을 과감히 정리할 때 새로운 재물이 들어옵니다.',
            love: '끝날 인연은 정리되고, 상처를 치유해 줄 완전히 새로운 인연이 문을 두드립니다.',
            today: '미련을 버리고 비워내세요. 비워낸 자리에만 새로운 복이 채워집니다.',
            pastFuture: '낡은 껍질을 완전히 벗어던지고 환골탈태하여 새 인생을 시작합니다.',
            mind: '과거의 방식을 버리고 완전히 새롭게 관계를 리셋하고 싶어 합니다.',
            taboo: '가망 없는 미련에 매달려 시간을 낭비하는 행동',
            timing: '새벽 동틀 녘 혹은 월말 정기 정산일'
          },
          { num: 'XIV', roman: 'XIV. TEMPERANCE', name: '절제 (Temperance)', emoji: '🏺', key: '조화 · 밸런스 · 상생과 치유',
            money: '수입과 지출의 균형이 완벽히 맞아떨어집니다. 분산 투자와 안정적 저축에 최적.',
            love: '서로의 다름을 인정하고 자연스럽게 융화되는 평화로운 안식처 같은 관계입니다.',
            today: '과유불급. 극단을 피하고 중용의 지혜로 양쪽의 의견을 조율해 보세요.',
            pastFuture: '갈등이 눈 녹듯 사라지며 안정된 삶의 평온을 회복하게 됩니다.',
            mind: '당신과 함께할 때 마음의 상처가 치유되고 차분한 평화를 느낍니다.',
            taboo: '감정 기복을 여과 없이 표출하거나 한쪽에 치우치는 것',
            timing: '물과 관련된 장소 혹은 주말 오후'
          },
          { num: 'XV', roman: 'XV. THE DEVIL', name: '악마 (The Devil)', emoji: '⛓️', key: '치명적 매력 · 유혹 경계 · 집착 탈피',
            money: '달콤하지만 위험한 투자 제안을 경계하세요. 단기 투기보다 안전자산 사수.',
            love: '헤어 나오기 힘든 치명적인 매력에 빠집니다. 집착과 질투를 경계해야 길합니다.',
            today: '나를 옭아매는 게으름이나 불필요한 스마트폰 중독의 사슬을 과감히 끊으세요.',
            pastFuture: '유혹의 늪에서 벗어나 주체적인 자유와 경제적 독립을 쟁취합니다.',
            mind: '당신에게 강렬하게 끌리고 있으나 구속받고 싶지 않은 이중적 심리입니다.',
            taboo: '순간의 쾌락이나 달콤한 유혹에 넘어가 약속을 어기는 것',
            timing: '늦은 밤 술자리 혹은 유흥 분위기 속'
          },
          { num: 'XVI', roman: 'XVI. THE TOWER', name: '탑 (The Tower)', emoji: '⚡', key: '예상 밖 반전 · 환상 붕괴 · 진실 규명',
            money: '기존의 틀이 깨지는 급격한 변화가 옵니다. 안전벨트를 매고 리스크를 관리하세요.',
            love: '숨겨졌던 진실이 드러나며 충격이 올 수 있으나, 위기를 넘기면 단단해집니다.',
            today: '피할 수 없는 변화라면 의연하게 맞이하세요. 낡은 탑이 무너져야 새 궁전을 짓습니다.',
            pastFuture: '거짓된 껍데기가 부서진 자리에 가장 튼튼한 진실의 기둥을 다시 세웁니다.',
            mind: '큰 충격을 받고 혼란스러워하며 현실을 직시하려 애쓰고 있습니다.',
            taboo: '현실을 외면한 채 모래성 위에 집을 지으려 하는 것',
            timing: '번개 치듯 갑작스러운 사건 직후'
          },
          { num: 'XVII', roman: 'XVII. THE STAR', name: '별 (The Star)', emoji: '⭐', key: '희망 · 밝은 비전 · 영감의 샘',
            money: '오랫동안 염원하던 꿈이 실현되기 시작합니다. 예술/크리에이티브 분야 대길.',
            love: '서로에게 이상형이자 희망이 되어주는 맑고 순수한 인연입니다.',
            today: '긍정적인 확언을 하세요. 당신이 꿈꾸는 미래가 우주의 응원을 받고 있습니다.',
            pastFuture: '어둠의 터널이 끝나고, 눈부신 스타처럼 대중의 주목과 명예를 얻습니다.',
            mind: '당신을 동경하고 있으며 미래의 빛이자 희망으로 생각하고 있습니다.',
            taboo: '지레 겁을 먹고 스스로를 깎아내리는 자조적인 생각',
            timing: '맑은 밤하늘 별이 보일 무렵'
          },
          { num: 'XVIII', roman: 'XVIII. THE MOON', name: '달 (The Moon)', emoji: '🌙', key: '직관 주의 · 안개 속 혼란 · 감수성',
            money: '계약 조건이 불투명하니 서두르지 마세요. 안개가 걷힐 때까지 관망이 유리합니다.',
            love: '작은 오해로 불안감이 커질 수 있습니다. 혼자 소설 쓰지 말고 솔직히 대화하세요.',
            today: '불안은 환상일 뿐입니다. 눈앞의 실체에 집중하고 마음에 평온을 찾으세요.',
            pastFuture: '답답했던 의문들이 말끔히 해소되며 명쾌한 진실의 아침을 맞이합니다.',
            mind: '속마음을 온전히 드러내지 못하고 혼자 불안해하며 당신을 그리워합니다.',
            taboo: '확인되지 않은 루머나 막연한 불안감에 휘둘려 결정을 내리는 것',
            timing: '월초 초승달이 뜰 무렵'
          },
          { num: 'XIX', roman: 'XIX. THE SUN', name: '태양 (The Sun)', emoji: '☀️', key: '최고의 성공 · 활력 · 명예와 번영',
            money: '모든 막힘이 뚫리고 최고의 금전운과 성공이 보장됩니다. 투자/사업 결실 만개.',
            love: '숨김없이 투명하고 밝은 사랑입니다. 결혼, 출산, 경사스러운 소식 도래.',
            today: '환한 미소를 지으세요. 당신의 긍정적인 에너지가 모든 행운을 자석처럼 끌어당깁니다.',
            pastFuture: '인생 최고의 황금기를 맞이하여 세상의 모든 축복과 스포트라이트를 받습니다.',
            mind: '당신과 함께 있을 때 세상에서 가장 행복하고 따뜻하다고 느낍니다.',
            taboo: '지나친 자만심으로 주변 사람들의 공로를 무시하는 것',
            timing: '정오(오후 12시~1시) 햇살이 가장 밝을 때'
          },
          { num: 'XX', roman: 'XX. JUDGEMENT', name: '심판 (Judgement)', emoji: '🎺', key: '부활 · 결정적 기회 · 정당한 보상',
            money: '포기했던 프로젝트나 막혔던 돈이 되살아납니다. 재도전, 이직 통과에 최상.',
            love: '재회운이 강력하게 작동합니다. 풀리지 않던 오해가 풀리고 인연이 회복됩니다.',
            today: '하늘의 나팔소리가 울렸습니다. 과거의 후회를 털고 기회를 낚아채세요.',
            pastFuture: '기나긴 심판의 시간을 거쳐, 최고의 합격과 승리의 소식을 품에 안습니다.',
            mind: '당신과의 관계를 되살리고 싶어 하며 결정적인 연락을 망설이고 있습니다.',
            taboo: '기회가 왔음에도 과거의 두려움 때문에 응답하지 않는 것',
            timing: '오랜 침묵을 깨는 기쁜 소식이 올 때'
          },
          { num: 'XXI', roman: 'XXI. THE WORLD', name: '세계 (The World)', emoji: '🌍', key: '완성과 대단원 · 최고의 성취 · 새로운 도약',
            money: '한 챕터가 완벽한 성공으로 마무리됩니다. 글로벌 진출이나 자산 규모의 대폭 확장.',
            love: '더할 나위 없는 최고의 결실. 평생을 함께할 완벽한 반려자 인연입니다.',
            today: '당신은 해냈습니다. 성취감을 만끽하고 더 넓은 세상을 향해 날개를 펴세요.',
            pastFuture: '하나의 큰 목표를 완성하고, 한 차원 더 높은 글로벌 무대로 도약합니다.',
            mind: '당신이야말로 자신의 세계를 완성해 줄 완벽한 사람이라 믿고 있습니다.',
            taboo: '우물 안 개구리에 안주하여 다음 도전을 게을리하는 것',
            timing: '올해 연말 혹은 프로젝트 최종 종결일'
          }
        ];

        // 탭 전환
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

        // 성별 선택 버튼 제어
        function selectGender(prefix, gender) {
          const maleBtn = document.getElementById(prefix + 'MaleBtn');
          const femaleBtn = document.getElementById(prefix + 'FemaleBtn');
          const input = document.getElementById(prefix + 'Gender');

          input.value = gender;
          if (gender === 'male') {
            maleBtn.classList.add('active');
            femaleBtn.classList.remove('active');
          } else {
            femaleBtn.classList.add('active');
            maleBtn.classList.remove('active');
          }
        }

        // 토글 버튼 제어
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

        // 이미지 처리 객체
        const loadedImages = { face: null, cross: null };

        function handleImage(input, previewId, labelId, btnId, type) {
          if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
              const preview = document.getElementById(previewId);
              preview.src = e.target.result;
              preview.style.display = 'block';
              document.getElementById(labelId).innerText = '사진 등록 완료!';
              if (btnId) document.getElementById(btnId).removeAttribute('disabled');

              const img = new Image();
              img.src = e.target.result;
              loadedImages[type] = img;
            };
            reader.readAsDataURL(input.files[0]);
          }
        }

        // 사주 계산 알고리즘
        function calculateSajuCore(name, birth, timeIdx, gender) {
          const y = parseInt(birth.substring(0, 4), 10);
          const m = parseInt(birth.substring(4, 6), 10);
          const d = parseInt(birth.substring(6, 8), 10);

          const yearDiff = y - 1984;
          const yearCheongan = CHEONGAN[((yearDiff % 10) + 10) % 10];
          const yearJiji = JIJI[((yearDiff % 12) + 12) % 12];
          const yearPillar = yearCheongan + yearJiji;

          const baseDate = new Date(Date.UTC(1900, 0, 1));
          const targetDate = new Date(Date.UTC(y, m - 1, d));
          const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
          const dayIndex = ((diffDays + 10) % 60 + 60) % 60;
          const dayCheongan = CHEONGAN[dayIndex % 10];
          const dayJiji = JIJI[dayIndex % 12];
          const dayPillar = dayCheongan + dayJiji;

          const monthJijiIndex = (m + 1) % 12;
          const yearCheonganIdx = CHEONGAN.indexOf(yearCheongan);
          const startMonthCheongan = (yearCheonganIdx % 5) * 2 + 2;
          const monthCheongan = CHEONGAN[(startMonthCheongan + (m - 2 + 12) % 12) % 10];
          const monthPillar = monthCheongan + JIJI[monthJijiIndex];

          let hourPillar = null;
          if (timeIdx !== 'unknown' && timeIdx !== '') {
            const tIdx = parseInt(timeIdx, 10);
            const dayCheonganIdx = CHEONGAN.indexOf(dayCheongan);
            const startHourCheongan = (dayCheonganIdx % 5) * 2;
            const hourCheongan = CHEONGAN[(startHourCheongan + tIdx) % 10];
            hourPillar = hourCheongan + JIJI[tIdx];
          }

          const activePillars = [yearPillar, monthPillar, dayPillar];
          if (hourPillar) activePillars.push(hourPillar);

          const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
          activePillars.forEach(p => {
            for (let char of p) if (OHENG[char]) counts[OHENG[char]]++;
          });

          let lackingElement = null;
          for (const [elem, count] of Object.entries(counts)) {
            if (count === 0) { lackingElement = elem; break; }
          }

          const nameList = [];
          for (let char of name) {
            const code = char.charCodeAt(0) - 44032;
            let cho = (code >= 0 && code <= 11171) ? CHOSUNG[Math.floor(code / 588)] : null;
            let baseCho = cho;
            if (cho === 'ㄲ') baseCho = 'ㄱ';
            if (cho === 'ㄸ') baseCho = 'ㄷ';
            if (cho === 'ㅃ') baseCho = 'ㅂ';
            if (cho === 'ㅆ') baseCho = 'ㅅ';
            if (cho === 'ㅉ') baseCho = 'ㅈ';
            nameList.push({ char, cho, oheng: PRON_OHENG[baseCho] || '기타' });
          }
          const nameElements = nameList.map(n => n.oheng);
          const isCovered = lackingElement ? nameElements.includes(lackingElement) : false;

          const isYangYear = YANG_CHEONGAN.includes(yearCheongan);
          let daeunText = '';
          if (gender === 'male') {
            daeunText = isYangYear ? '양남(陽男) - 대운 순행 (10년 대운이 미래로 순조롭게 흐름)' : '음남(陰男) - 대운 역행 (내실을 다지며 신중하게 펼쳐지는 흐름)';
          } else {
            daeunText = isYangYear ? '양녀(陽女) - 대운 역행 (안정적인 기반 위에서 결실을 맺는 흐름)' : '음녀(陰女) - 대운 순행 (10년 대운이 진취적으로 미래를 향해 흐름)';
          }

          const meta = ILGAN_MASTER[dayCheongan] || ILGAN_MASTER['갑'];
          return { y, m, d, gender, yearPillar, monthPillar, dayPillar, hourPillar, counts, lackingElement, nameList, nameElements, isCovered, daeunText, meta, dayCheongan };
        }

        function calculateFaceCore(imgElement) {
          if (!imgElement) return CELEB_PROFILES[0];
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 30;
          canvas.height = 30;
          ctx.drawImage(imgElement, 0, 0, 30, 30);
          const pData = ctx.getImageData(0, 0, 30, 30).data;
          let sum = 0;
          for (let i = 0; i < pData.length; i += 4) sum += pData[i] + pData[i+1] + pData[i+2];
          return CELEB_PROFILES[sum % CELEB_PROFILES.length];
        }

        // 2번 탭: 사주 분석 실행
        function runSajuAnalysis() {
          const name = document.getElementById('sajuName').value.trim();
          const birth = document.getElementById('sajuBirth').value.trim();
          const time = document.getElementById('sajuTime').value;
          const gender = document.getElementById('sajuGender').value;

          if (!name || birth.length !== 8 || isNaN(birth)) {
            alert('이름과 생년월일 8자리를 정확히 입력해 주세요.');
            return;
          }

          const r = calculateSajuCore(name, birth, time, gender);
          const totalChars = r.hourPillar ? 8 : 6;
          const spouseDesc = (gender === 'male') ? r.meta.spouseMale : r.meta.spouseFemale;

          const html = \`
            <div class="result-box">
              <div class="res-badge">기본 무료 핵심 요약</div>
              <h2 class="res-title">🔮 \${name} 님의 사주 리포트</h2>

              <div class="summary-line">
                <span>성별: <b>\${gender === 'male' ? '남성' : '여성'}</b> | 생년월일: <b>\${r.y}.\${r.m}.\${r.d}</b></span>
                <span>분석: <b>\${totalChars}자</b></span>
              </div>

              <div class="pillar-board">
                <div class="pillar-col"><span class="p-title">시주(時)</span><span class="p-val">\${r.hourPillar || '미상'}</span></div>
                <div class="pillar-col active"><span class="p-title">일주(日)</span><span class="p-val">\${r.dayPillar}</span></div>
                <div class="pillar-col"><span class="p-title">월주(月)</span><span class="p-val">\${r.monthPillar}</span></div>
                <div class="pillar-col"><span class="p-title">연주(年)</span><span class="p-val">\${r.yearPillar}</span></div>
              </div>

              <div class="section-card">
                <h4>🌟 대운 흐름 및 본질: \${r.meta.title}</h4>
                <p style="font-size:12.5px; color:#0284c7; font-weight:700; margin-bottom:6px;">🧭 \${r.daeunText}</p>
                <p class="card-desc">\${r.meta.summary}</p>
              </div>

              <div class="section-card">
                <h4>⚖️ 오행 밸런스 (\${totalChars}자 기준)</h4>
                <div class="oheng-bar">
                  <span>목: <b>\${r.counts.목}</b></span>
                  <span>화: <b>\${r.counts.화}</b></span>
                  <span>토: <b>\${r.counts.토}</b></span>
                  <span>금: <b>\${r.counts.금}</b></span>
                  <span>수: <b>\${r.counts.수}</b></span>
                </div>
              </div>

              <div class="section-card">
                <h4>🏷️ 성명학 발음오행 조화</h4>
                <p style="font-size:13px; color:#64748b;">\${r.nameList.map(n => \`\${n.char}(\${n.cho}) $\\rightarrow$ <b>\${n.oheng}</b>\`).join(' | ')}</p>
                <p style="font-size:13px; font-weight:700; color:#0284c7; margin-top:6px;">\${
                  r.isCovered ? \`✅ 부족한 [\${r.lackingElement}] 기운을 이름이 완벽히 방어 중입니다.\` :
                  (!r.lackingElement ? '✅ 오행이 고루 분포되어 있어 이름과도 자연스러운 상생을 이룹니다.' :
                  \`ℹ️ 사주의 [\${r.lackingElement}] 기운이 비어 있으나 이름의 [\${r.nameElements.join(', ')}] 기운이 새로운 활로를 열어줍니다.\`)
                }</p>
              </div>

              <div class="plus-lock-banner">
                <div class="plus-tag">✨ 프리미엄 심층 비책 (테스트 무료 공개)</div>
                <div class="plus-title">미래 직업 · 맞춤 배우자 복 · 찰떡 MBTI · 연예인 사주</div>
                <div class="plus-desc">기존 요약 내용의 3~4배 이상 디테일하게 풀어낸 인생 개운 솔루션입니다.</div>
                <button type="button" class="btn-toggle" onclick="togglePlus('sajuPlusBox', this)">🔒 플러스 심층 리포트 열기/닫기</button>
              </div>

              <div id="sajuPlusBox" class="plus-content-box" style="display:none;">
                <div class="section-card plus-item">
                  <h4>💼 내 사주로 본 미래 천직 & 최적 직무군</h4>
                  <p><b>추천 분야:</b> \${r.meta.jobs}</p>
                  <p class="sub-tip">💡 이 업종에 종사할 때 본인의 잠재력과 재물운이 가장 빠르게 발현됩니다.</p>
                </div>

                <div class="section-card plus-item">
                  <h4>💍 \${gender === 'male' ? '남성 기준 배우자 인연운' : '여성 기준 배우자 인연운'}</h4>
                  <p><b>배필의 분위기:</b> \${spouseDesc}</p>
                  <p class="sub-tip">💡 상호 존중과 신뢰를 바탕으로 함께 경제적 성취를 이룰 수 있는 최적의 배필입니다.</p>
                </div>

                <div class="section-card plus-item">
                  <h4>🧩 사주 오행과 시너지가 폭발하는 찰떡 MBTI</h4>
                  <div class="pill-tags">\${r.meta.mbti.map(m => \`<span class="pill-mbti">\${m}</span>\`).join('')}</div>
                </div>

                <div class="section-card plus-item">
                  <h4>⭐ 나와 같은 일주를 지닌 유명인 3인</h4>
                  <div class="pill-tags">\${r.meta.celebs.map(c => \`<span class="pill-celeb">\${c}</span>\`).join('')}</div>
                </div>

                <div class="section-card plus-item">
                  <h4>🤝 귀인으로 들어오는 찰떡 띠 & 상생 오행</h4>
                  <p><b>나를 돕는 오행:</b> <span style="color:#0284c7; font-weight:800;">\${r.meta.goodOheng}</span></p>
                  <p><b>곁에 두면 복이 오는 띠:</b> <span style="color:#0284c7; font-weight:800;">\${r.meta.goodZodiac}</span></p>
                </div>

                <div class="section-card plus-item" style="border-left:4px solid #0284c7;">
                  <h4>🍀 맞춤 개운 비책 (이름 보완 & 행운 솔루션)</h4>
                  <p><b>행운의 소품:</b> \${r.meta.item}</p>
                  <p><b>행운의 색상:</b> \${r.meta.color}</p>
                  <p><b>기운을 살리는 직업군:</b> \${r.meta.nearJobs}</p>
                  <p><b>이름 추천 보완 글자:</b> <span style="color:#0284c7; font-weight:800;">\${r.meta.nameChar}</span></p>
                </div>
              </div>
            </div>
          \`;

          document.getElementById('sajuResultArea').innerHTML = html;
        }

        // 3번 탭: 관상 분석 실행
        function runSingleFaceAnalysis() {
          if (!loadedImages.face) return;
          const p = calculateFaceCore(loadedImages.face);

          const html = \`
            <div class="result-box">
              <div class="res-badge">관상 무료 기본 요약</div>
              <h2 class="res-title">👁️ 닮은꼴 관상: \${p.celeb}</h2>

              <div class="section-card">
                <h4>💡 총평 풀이</h4>
                <p class="card-desc">\${p.desc}</p>
              </div>

              <div class="section-card">
                <h4>🔍 이목구비 부위별 요약</h4>
                <p style="font-size:13px; color:#475569; margin-bottom:4px;">• <b>이마/상정:</b> \${p.forehead}</p>
                <p style="font-size:13px; color:#475569; margin-bottom:4px;">• <b>눈빛/중정:</b> \${p.eyes}</p>
                <p style="font-size:13px; color:#475569; margin-bottom:4px;">• <b>코/재백궁:</b> \${p.nose}</p>
                <p style="font-size:13px; color:#475569;">• <b>입매/하정:</b> \${p.mouth}</p>
              </div>

              <div class="plus-lock-banner">
                <div class="plus-tag">✨ 관상 프리미엄 심층 비책 (테스트 무료)</div>
                <div class="plus-title">인생 전성기 · 천직 스타일 · 얼굴 개운법</div>
                <div class="plus-desc">성형 없이 인상을 바꾸어 재물운을 터뜨리는 관상학적 비책입니다.</div>
                <button type="button" class="btn-toggle" onclick="togglePlus('facePlusBox', this)">🔒 관상 플러스 심층 리포트 열기/닫기</button>
              </div>

              <div id="facePlusBox" class="plus-content-box" style="display:none;">
                <div class="section-card plus-item">
                  <h4>⏳ 관상으로 본 인생 황금 전성기</h4>
                  <p style="font-size:14px; color:#0284c7; font-weight:bold;">\${p.peak}</p>
                </div>

                <div class="section-card plus-item">
                  <h4>💼 관상학적 비즈니스 & 리더십 유형</h4>
                  <p style="font-size:14px; color:#475569;">\${p.style}</p>
                </div>

                <div class="section-card plus-item">
                  <h4>💍 인연을 부르는 배우자 관상 & 찰떡 MBTI</h4>
                  <p style="font-size:13.5px; color:#475569;">• <b>배필 인상:</b> \${p.mate}</p>
                  <p style="font-size:13.5px; color:#475569; margin-top:4px;">• <b>상성 MBTI:</b> <span style="color:#0284c7; font-weight:bold;">\${p.mbti}</span></p>
                </div>

                <div class="section-card plus-item" style="border-left:4px solid #0284c7;">
                  <h4>✨ 얼굴 개운 비책 (성형 없이 운 틔우기)</h4>
                  <p style="font-size:13px; color:#475569; line-height:1.5;">미간(명궁) 사이에 잔털을 깨끗이 정리해 빛이 나게 유지하고, 평소 입꼬리를 의식적으로 살짝 올리고 말하면 들어오는 재물이 흩어지지 않고 모입니다.</p>
                </div>
              </div>
            </div>
          \`;

          document.getElementById('faceResultArea').innerHTML = html;
        }

        // 4번 탭: 사주+관상 결합 분석 실행
        function runCrossAnalysis() {
          const name = document.getElementById('crossName').value.trim();
          const birth = document.getElementById('crossBirth').value.trim();
          const time = document.getElementById('crossTime').value;
          const gender = document.getElementById('crossGender').value;

          if (!name || birth.length !== 8 || isNaN(birth)) {
            alert('인적사항에서 이름과 생년월일 8자리를 입력해 주세요.');
            return;
          }

          if (!loadedImages.cross) {
            alert('정면 얼굴 사진을 먼저 촬영하거나 등록해 주세요.');
            return;
          }

          const r = calculateSajuCore(name, birth, time, gender);
          const p = calculateFaceCore(loadedImages.cross);
          const spouseDesc = (gender === 'male') ? r.meta.spouseMale : r.meta.spouseFemale;

          const html = \`
            <div class="result-box" style="border-color:#f0abfc;">
              <div class="res-badge premium">👑 사주 x 관상 프리미엄 올인원 리포트</div>
              <h2 class="res-title" style="color:#701a75;">🔮 \${name} 님의 사주 x 관상 융합 진단</h2>

              <div class="summary-line">
                <span>성별: <b>\${gender === 'male' ? '남성' : '여성'}</b> | 본질: <b>\${r.meta.title}</b></span>
                <span>닮은꼴: <b>\${p.celeb}</b></span>
              </div>

              <div class="section-card">
                <h4>📜 [1단계] 사주 4주 8자 & 기운</h4>
                <div class="pillar-board" style="margin-top:8px;">
                  <div class="pillar-col"><span class="p-title">시주</span><span class="p-val">\${r.hourPillar || '미상'}</span></div>
                  <div class="pillar-col active"><span class="p-title">일주</span><span class="p-val">\${r.dayPillar}</span></div>
                  <div class="pillar-col"><span class="p-title">월주</span><span class="p-val">\${r.monthPillar}</span></div>
                  <div class="pillar-col"><span class="p-title">연주</span><span class="p-val">\${r.yearPillar}</span></div>
                </div>
                <p style="font-size:13px; color:#64748b; margin:4px 0 0 0;">• 대운: <b>\${r.daeunText}</b></p>
                <p style="font-size:13px; color:#64748b; margin:2px 0 0 0;">• 취약 오행: <b style="color:#e11d48;">\${r.lackingElement ? r.lackingElement + ' (0개 고갈)' : '오행 균형 완비'}</b></p>
              </div>

              <div class="section-card">
                <h4>👁️ [2단계] 관상 이목구비 정밀 스캔</h4>
                <p style="font-size:13.5px; color:#475569; line-height:1.5;">\${p.desc}</p>
                <div style="background:#ffffff; padding:8px; border-radius:8px; border:1px solid #e2e8f0; font-size:12.5px; margin-top:6px; color:#64748b;">
                  • <b>이마:</b> \${p.forehead} | • <b>코:</b> \${p.nose} | • <b>입:</b> \${p.mouth}
                </div>
              </div>

              <div class="plus-lock-banner premium">
                <div class="plus-tag" style="color:#f0abfc;">👑 프리미엄 융합 리포트 (테스트 무료 열람)</div>
                <div class="plus-title">사주 원국과 얼굴 관상의 입체 보완 비책</div>
                <div class="plus-desc">사주의 빈틈을 얼굴이 어떻게 채우고 있는지 풀어내는 독점 결합 풀이입니다.</div>
                <button type="button" class="btn-toggle" style="background:#f0abfc; color:#4a044e;" onclick="togglePlus('crossPlusBox', this)">🔓 사주+관상 융합 비책 열기/닫기</button>
              </div>

              <div id="crossPlusBox" class="plus-content-box" style="display:none;">
                <div class="section-card plus-item" style="border-left:4px solid #a21caf;">
                  <h4>🎯 [크로스오버 1] 사주 오행과 관상의 상호 보완 작용</h4>
                  <p style="font-size:13.5px; color:#334155; line-height:1.6;">
                    \${r.lackingElement ? \`사주 원국에 부족한 [\${r.lackingElement}] 기운으로 인해 일시적인 불안감이나 망설임이 올 수 있으나, <b>\${p.celeb}</b> 특유의 굳건한 콧날과 단단한 입매 관상이 재물이 새는 것을 완벽하게 방어해 주고 있습니다.\` : '사주 5행이 고루 갖추어진 명식에 이목구비의 균형이 조화를 이루어, 30대 이후 큰 시련 없이 꾸준한 재물을 축적하는 복록의 상입니다.'}
                  </p>
                </div>

                <div class="section-card plus-item" style="border-left:4px solid #a21caf;">
                  <h4>⏳ [크로스오버 2] 인생 3대 황금기 & 대운 매칭</h4>
                  <p style="font-size:13.5px; color:#334155; line-height:1.6;">
                    관상에서 나타나는 황금 전성기(<b>\${p.peak}</b>)와 사주의 대운 전환기가 일치하는 시기에 가장 공격적인 투자와 독립, 사업 확장을 감행할 때 성공 확률이 극대화됩니다.
                  </p>
                </div>

                <div class="section-card plus-item" style="border-left:4px solid #a21caf;">
                  <h4>💍 [크로스오버 3] \${gender === 'male' ? '남성 기준' : '여성 기준'} 평생 배필 & 찰떡 MBTI</h4>
                  <p style="font-size:13.5px; color:#334155; line-height:1.6;">
                    • <b>이상적 배필상:</b> \${spouseDesc}<br>
                    • <b>시너지 MBTI:</b> <span style="color:#0284c7; font-weight:800;">\${r.meta.mbti.join(', ')}</span><br>
                    • <b>귀인 띠:</b> <span style="color:#0284c7; font-weight:800;">\${r.meta.goodZodiac}</span>
                  </p>
                </div>

                <div class="section-card plus-item" style="border-left:4px solid #a21caf;">
                  <h4>✨ [크로스오버 4] 사주 x 관상 종합 개운 솔루션</h4>
                  <p style="font-size:13px; color:#475569; line-height:1.5;">
                    • <b>행운의 색상/아이템:</b> \${r.meta.color} / \${r.meta.item}<br>
                    • <b>이름 추천 보완 글자:</b> \${r.meta.nameChar}<br>
                    • <b>얼굴 개운법:</b> 미간을 환하게 유지하고 밝은 미소로 입꼬리를 올리면 부족한 기운이 즉시 충전됩니다.
                  </p>
                </div>
              </div>
            </div>
          \`;

          document.getElementById('crossResultArea').innerHTML = html;
        }

        // ==============================================
        // 🃏 5번 탭: 타로 인터랙티브 엔진 로직
        // ==============================================
        let currentTarotTopic = 'money';
        let isTarotFlipped = false;

        function selectTarotTopic(topic) {
          currentTarotTopic = topic;
          ['money', 'love', 'today'].forEach(t => {
            const btn = document.getElementById('topic' + t.charAt(0).toUpperCase() + t.slice(1));
            if (t === topic) btn.classList.add('active');
            else btn.classList.remove('active');
          });
          resetTarotDeck();
        }

        // 7장의 카드 덱 렌더링
        function renderTarotDeck() {
          const box = document.getElementById('tarotDeckBox');
          if (!box) return;
          let cardsHtml = '';
          for (let i = 0; i < 7; i++) {
            cardsHtml += \`
              <div class="tarot-card-item" id="tarotCard\${i}" onclick="drawTarotCard(\${i})">
                <div class="card-face card-back">
                  <div class="back-pattern">
                    <span class="back-rune">🔮</span>
                    <span style="font-size:10px; font-weight:800; margin-top:4px;">TAROT</span>
                  </div>
                </div>
                <div class="card-face card-front" id="cardFront\${i}">
                  <!-- 선택 시 앞면 데이터 주입 -->
                </div>
              </div>
            \`;
          }
          box.innerHTML = cardsHtml;
        }

        function resetTarotDeck() {
          isTarotFlipped = false;
          renderTarotDeck();
          document.getElementById('tarotResultArea').innerHTML = '';
        }

        // 카드 1장 뽑기 및 3D 플립 애니메이션
        function drawTarotCard(clickedIdx) {
          if (isTarotFlipped) return;
          isTarotFlipped = true;

          // 22장 중 무작위 1장 선정
          const randomIdx = Math.floor(Math.random() * TAROT_MASTER.length);
          const t = TAROT_MASTER[randomIdx];

          const cardFront = document.getElementById('cardFront' + clickedIdx);
          cardFront.innerHTML = \`
            <div class="front-num">\${t.roman}</div>
            <div class="front-symbol">\${t.emoji}</div>
            <div class="front-name">\${t.name}</div>
          \`;

          const cardItem = document.getElementById('tarotCard' + clickedIdx);
          cardItem.classList.add('flipped');

          // 0.6초 플립 완료 후 리포트 노출
          setTimeout(() => {
            let topicText = '';
            let topicSummary = '';
            if (currentTarotTopic === 'money') {
              topicText = '💰 금전 · 직업 · 이직운';
              topicSummary = t.money;
            } else if (currentTarotTopic === 'love') {
              topicText = '❤️ 연애 · 애정 · 재회운';
              topicSummary = t.love;
            } else {
              topicText = '☀️ 오늘 하루의 총체적 조언';
              topicSummary = t.today;
            }

            const html = \`
              <div class="result-box" style="border-color:#c4b5fd; animation:fadeIn 0.4s ease-out;">
                <div class="res-badge tarot">뽑힌 카드: \${t.name}</div>
                <h2 class="res-title" style="color:#5b21b6;">🃏 \${t.name}</h2>

                <div class="summary-line">
                  <span>질문 테마: <b>\${topicText}</b></span>
                  <span>상징: <b>\${t.key}</b></span>
                </div>

                <div class="section-card" style="background:#f5f3ff; border-color:#ddd6fe;">
                  <h4>💡 타로의 명쾌한 해답</h4>
                  <p style="font-size:14px; color:#4c1d95; line-height:1.6; font-weight:600;">\${topicSummary}</p>
                </div>

                <!-- 플러스 심층 토글 배너 -->
                <div class="plus-lock-banner tarot">
                  <div class="plus-tag" style="color:#c4b5fd;">✨ 타로 프리미엄 심층 비책 (테스트 무료)</div>
                  <div class="plus-title">3단계 미래 타임라인 · 상대방 속마음 · 금기 행동</div>
                  <div class="plus-desc">뽑으신 카드가 가리키는 3개월 후 결말과 운이 열리는 골든 타이밍입니다.</div>
                  <button type="button" class="btn-toggle" style="background:#a78bfa; color:#2e1065;" onclick="togglePlus('tarotPlusBox', this)">🔓 타로 플러스 심층 리포트 열기/닫기</button>
                </div>

                <div id="tarotPlusBox" class="plus-content-box" style="display:none;">
                  <div class="section-card plus-item" style="border-left:4px solid #7c3aed;">
                    <h4>⏳ [타임라인] 과거의 원인과 3개월 뒤 최종 결말</h4>
                    <p style="font-size:13.5px; color:#334155; line-height:1.6;">\${t.pastFuture}</p>
                  </div>

                  <div class="section-card plus-item" style="border-left:4px solid #7c3aed;">
                    <h4>💭 [심리 투시] 상대방의 진짜 속마음 & 무의식</h4>
                    <p style="font-size:13.5px; color:#334155; line-height:1.6;">\${t.mind}</p>
                  </div>

                  <div class="section-card plus-item" style="border-left:4px solid #7c3aed;">
                    <h4>⚠️ [금기 사항] 이번 달 절대 하지 말아야 할 행동</h4>
                    <p style="font-size:13.5px; color:#e11d48; line-height:1.6; font-weight:700;">• \${t.taboo}</p>
                  </div>

                  <div class="section-card plus-item" style="border-left:4px solid #7c3aed;">
                    <h4>🍀 [행운의 타이밍] 운의 문이 열리는 골든 타임</h4>
                    <p style="font-size:13.5px; color:#5b21b6; line-height:1.6; font-weight:700;">• \${t.timing}</p>
                  </div>
                </div>

                <button type="button" class="btn-primary" style="background:#6d28d9; margin-top:14px;" onclick="resetTarotDeck()">🔄 다시 셔플하고 새로 뽑기</button>
              </div>
            \`;

            document.getElementById('tarotResultArea').innerHTML = html;
            document.getElementById('tarotResultArea').scrollIntoView({ behavior: 'smooth' });
          }, 600);
        }

        // 초기 실행
        renderTarotDeck();
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 정상 실행 중입니다.`);
});
