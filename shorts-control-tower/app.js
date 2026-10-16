(() => {
  'use strict';

  const STORAGE_KEY = 'shorts-control-tower-checks-v1';
  const desktopQuery = window.matchMedia('(min-width: 1024px)');

  const STEPS = [
    {
      id: 1,
      title: '대본 및 장면 계획',
      summary: '주제, 장면 수, 톤 규칙을 정하고 장면별 설명과 길이를 작성합니다.',
      files: ['files/scene-plan.md', 'tone-rules.md'],
      checklist: [
        '주제와 대상 시청자가 한 문장으로 정리되어 있다',
        '장면 수와 장면별 목표 길이(초)가 정해져 있다',
        '톤 규칙의 금지 표현이 대본에 없다',
        '장면마다 이미지 설명이 한 줄 이상 적혀 있다',
      ],
      errors: [
        '장면 합계 길이가 목표 길이와 다르면 files/scene-plan.md의 장면별 초 단위를 다시 계산하세요.',
        '금지 표현이 남아 있으면 tone-rules.md 기준으로 해당 문장을 고친 뒤 다시 체크하세요.',
      ],
    },
    {
      id: 2,
      title: '음성 및 오디오 싱크',
      summary: '대본을 음성으로 만들고 장면별 시작·끝 시간을 맞춥니다.',
      files: ['files/audio-sync.md'],
      checklist: [
        '장면별 음성 파일이 모두 생성되어 있다',
        '장면별 시작·끝 시간이 기록되어 있다',
        '자막 타이밍이 음성과 어긋나지 않는다',
        '음량이 기준 범위 안에 있다',
      ],
      errors: [
        '음성 파일이 없으면 음성 생성 도구의 작업 기록에서 실패한 장면 번호를 확인하세요.',
        '자막이 밀리면 files/audio-sync.md의 장면별 시작 시간을 먼저 고치세요.',
      ],
    },
    {
      id: 3,
      title: '이미지 생성 및 검수',
      summary: '장면별 이미지를 만들고 인물, 글자, 비율을 확인합니다.',
      files: ['files/image-review.md'],
      checklist: [
        '장면별 이미지가 모두 생성되어 있다',
        '인물과 글자가 깨지지 않았다',
        '세로형 9:16 비율로 만들어졌다',
        '재생성이 필요한 장면을 기록했다',
      ],
      errors: [
        '글자가 깨진 이미지는 재생성하고, 해당 장면 번호를 files/image-review.md에 남기세요.',
        '비율이 맞지 않으면 생성 설정의 가로세로 비율을 9:16으로 바꾸세요.',
      ],
    },
    {
      id: 4,
      title: '영상화 및 생성 결과 검수',
      summary: '이미지를 짧은 영상 클립으로 만들고 움직임과 길이를 확인합니다.',
      files: ['files/video-review.md'],
      checklist: [
        '장면별 영상 클립이 모두 생성되어 있다',
        '움직임이 어색한 클립을 찾아 기록했다',
        '클립 길이가 장면 길이와 맞다',
        '실패한 클립의 재생성을 마쳤다',
      ],
      errors: [
        '클립 길이가 짧으면 장면 길이 기준으로 다시 생성하세요.',
        '같은 장면에서 실패가 반복되면 이미지 설명을 더 단순하게 바꾸세요.',
      ],
    },
    {
      id: 5,
      title: '모션그래픽 조립 및 편집',
      summary: '클립, 음성, 자막, 전환 효과를 한 타임라인에 조립합니다.',
      files: ['files/motion-edit.md'],
      checklist: [
        '자막 스타일이 전체 장면에 같게 적용되어 있다',
        '장면 전환 효과가 적용되어 있다',
        '배경 음악과 음성의 음량 차이가 적절하다',
        '편집 타임라인을 저장했다',
      ],
      errors: [
        '음성이 묻히면 배경 음악 음량을 낮추고 다시 들어 보세요.',
        '타임라인이 저장되지 않으면 편집 도구의 저장 기능과 저장 위치를 확인하세요.',
      ],
    },
    {
      id: 6,
      title: '최종 렌더링 및 출력 검수',
      summary: '최종 파일을 렌더링하고 끝까지 재생해 출력 품질을 확인합니다.',
      files: ['files/render-check.md', 'examples/good-output.md'],
      checklist: [
        '해상도와 비율이 세로형 1080×1920이다',
        '영상을 처음부터 끝까지 재생해 보았다',
        '자막이 화면 안에서 읽힌다',
        '출력 파일명과 저장 위치를 기록했다',
      ],
      errors: [
        '렌더링이 실패하면 저장 공간과 출력 설정을 먼저 확인하세요.',
        '결과가 기준 예시와 다르면 examples/good-output.md와 나란히 비교하세요.',
      ],
    },
  ];

  const TREE = [
    { type: 'file', name: 'SKILL.md', path: 'SKILL.md', desc: '제작 규칙과 6단계 진행 순서를 정리한 기준 문서입니다.' },
    {
      type: 'folder',
      name: 'files/',
      children: [
        { type: 'file', name: 'INDEX.md', path: 'files/INDEX.md', desc: '단계별 산출물을 찾는 색인입니다.' },
        { type: 'file', name: 'scene-plan.md', path: 'files/scene-plan.md', desc: '장면 목록과 장면별 길이를 적습니다.' },
        { type: 'file', name: 'audio-sync.md', path: 'files/audio-sync.md', desc: '장면별 음성 파일과 시작·끝 시간을 기록합니다.' },
        { type: 'file', name: 'image-review.md', path: 'files/image-review.md', desc: '이미지 검수 결과와 재생성 장면을 기록합니다.' },
        { type: 'file', name: 'video-review.md', path: 'files/video-review.md', desc: '영상 클립 검수 결과를 기록합니다.' },
        { type: 'file', name: 'motion-edit.md', path: 'files/motion-edit.md', desc: '자막, 전환, 음량 편집 내역을 기록합니다.' },
        { type: 'file', name: 'render-check.md', path: 'files/render-check.md', desc: '최종 렌더링과 출력 검수 내역을 기록합니다.' },
      ],
    },
    {
      type: 'folder',
      name: 'examples/',
      children: [
        { type: 'file', name: 'good-output.md', path: 'examples/good-output.md', desc: '통과한 결과물의 기준 예시입니다.' },
      ],
    },
    { type: 'file', name: 'tone-rules.md', path: 'tone-rules.md', desc: '말투, 금지 표현, 자막 톤 기준입니다.' },
  ];

  const ALL_FILES = [];
  (function collectFiles(nodes) {
    nodes.forEach((node) => {
      if (node.type === 'folder') {
        collectFiles(node.children);
      } else {
        ALL_FILES.push(node);
      }
    });
  })(TREE);

  const $ = (id) => document.getElementById(id);

  let checks = {};
  let folderFiles = null; // 선택한 폴더 안의 상대 경로 Set. 폴더를 고르지 않았으면 null
  let selectedStepId = 1;
  let selectedPath = 'SKILL.md';
  let dialogStepId = null;
  const openFolders = new Set(['files/', 'examples/']);
  let connectorFrame = 0;

  /* ---------- 오류 안내 ---------- */

  function showError(message, error, hint, level = 'error') {
    const detail = error && error.message ? error.message : (error ? String(error) : '');
    const parts = [message];
    if (detail) parts.push(`(${detail})`);
    if (hint) parts.push(`확인: ${hint}`);
    $('errorText').textContent = parts.join(' ');
    $('errorBanner').className = `error-banner ${level}`;
    $('errorBanner').hidden = false;
  }

  $('errorClose').addEventListener('click', () => {
    $('errorBanner').hidden = true;
  });

  window.addEventListener('error', (event) => {
    showError(
      '화면 스크립트에서 오류가 발생했습니다.',
      event.error || event.message,
      '새로고침 후에도 같으면 브라우저 개발자 도구(F12)의 Console 메시지를 확인하세요.'
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    showError(
      '처리되지 않은 작업 오류가 발생했습니다.',
      event.reason,
      '새로고침 후에도 같으면 Console 메시지를 확인하세요.'
    );
  });

  /* ---------- 체크 상태 저장 ---------- */

  function loadChecks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      showError(
        '저장된 체크 상태를 읽지 못해 빈 상태로 시작합니다.',
        error,
        '브라우저의 사이트 데이터 설정과 비공개 탐색 모드 여부를 확인하세요.',
        'warn'
      );
      return {};
    }
  }

  function saveChecks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
    } catch (error) {
      showError(
        '체크 상태를 저장하지 못했습니다. 새로고침하면 변경 내용이 사라집니다.',
        error,
        '저장 공간이 가득 찼는지, 사이트 데이터 저장이 차단되었는지 확인하세요.',
        'warn'
      );
    }
  }

  function getFlags(step) {
    const saved = Array.isArray(checks[step.id]) ? checks[step.id] : [];
    return step.checklist.map((_, index) => saved[index] === true);
  }

  function setFlag(step, index, value) {
    const flags = getFlags(step);
    flags[index] = value;
    checks[step.id] = flags;
    saveChecks();
  }

  /* ---------- 상태 계산 ---------- */

  function fileState(path) {
    if (folderFiles === null) return { key: 'unknown', label: '미확인' };
    return folderFiles.has(path)
      ? { key: 'found', label: '확인됨' }
      : { key: 'missing', label: '없음' };
  }

  function stepForPath(path) {
    return STEPS.find((step) => step.files.includes(path)) || null;
  }

  function stepInfo(step) {
    const flags = getFlags(step);
    const done = flags.filter(Boolean).length;
    const total = flags.length;
    const files = step.files.map(fileState);
    const filesFound = files.filter((file) => file.key === 'found').length;

    let key = 'todo';
    let label = '대기';
    if (done === total) {
      key = 'done';
      label = '완료';
    } else if (done > 0) {
      key = 'doing';
      label = '진행 중';
    }

    let note = '';
    if (key === 'done' && filesFound < files.length) {
      note = folderFiles === null
        ? '체크리스트는 끝났지만 파일 경로는 아직 미확인입니다. 작업 폴더를 선택해 확인하세요.'
        : '체크리스트는 끝났지만 선택한 폴더에서 일부 파일을 찾지 못했습니다.';
    }

    return {
      flags,
      done,
      total,
      key,
      label,
      files,
      filesFound,
      note,
      percent: total ? Math.round((done / total) * 100) : 0,
    };
  }

  /* ---------- 렌더링 ---------- */

  function renderSummary() {
    const completed = STEPS.filter((step) => stepInfo(step).key === 'done').length;
    $('readyCount').textContent = `${completed} / ${STEPS.length} 단계 완료`;
    $('detailCount').textContent = `${completed} / ${STEPS.length} READY`;
  }

  function renderConnections() {
    const folderRow = folderFiles === null
      ? { name: '작업 폴더', cls: 'wait', text: '선택 안 됨', note: '폴더를 고르면 파일 경로를 확인합니다.' }
      : { name: '작업 폴더', cls: 'on', text: '확인됨', note: `${folderFiles.size}개 파일의 이름과 경로를 읽었습니다. 파일 내용은 읽지 않습니다.` };

    const rows = [
      { name: 'Google Flow', cls: 'off', text: '미연결', note: '이 화면은 Google Flow를 호출하지 않습니다.' },
      { name: 'CapCut', cls: 'off', text: '미연결', note: '이 화면은 CapCut을 제어하지 않습니다.' },
      folderRow,
    ];

    $('connections').innerHTML = rows.map((row) => `
      <li>
        <div>
          <strong>${row.name}</strong>
          <span class="conn-note">${row.note}</span>
        </div>
        <span class="state ${row.cls}">${row.text}</span>
      </li>`).join('');
  }

  function treeHtml(nodes) {
    return nodes.map((node) => {
      if (node.type === 'folder') {
        const open = openFolders.has(node.name);
        return `
          <li>
            <button type="button" class="tree-btn" data-folder="${node.name}" aria-expanded="${open}">
              <span class="caret" aria-hidden="true">▼</span>
              <span>${node.name}</span>
            </button>
            ${open ? `<ul>${treeHtml(node.children)}</ul>` : ''}
          </li>`;
      }

      const step = stepForPath(node.path);
      const state = fileState(node.path);
      const current = selectedPath === node.path ? ' aria-current="true"' : '';
      return `
        <li>
          <button type="button" class="tree-btn" data-file="${node.path}"${current}>
            <span class="dot ${state.key}" aria-hidden="true"></span>
            <span>${node.name}</span>
            ${step ? `<span class="tag">${step.id}단계</span>` : ''}
          </button>
        </li>`;
    }).join('');
  }

  function renderTree() {
    $('tree').innerHTML = treeHtml(TREE);
  }

  function renderFileInfo() {
    const box = $('fileInfo');
    const node = ALL_FILES.find((file) => file.path === selectedPath);
    if (!node) {
      box.innerHTML = '<p>파일을 선택하면 설명과 연결된 검수 단계가 표시됩니다.</p>';
      return;
    }

    const state = fileState(node.path);
    const step = stepForPath(node.path);
    const link = step
      ? `<button type="button" class="link-btn" data-open-step="${step.id}">${step.id}단계 · ${step.title}</button>`
      : '연결된 검수 단계가 없습니다.';

    box.innerHTML = `
      <strong>${node.path}</strong>
      <p>${node.desc}</p>
      <p>파일 상태: <span class="file-state ${state.key}">${state.label}</span></p>
      <p>연결 단계: ${link}</p>`;
  }

  function renderPipeline() {
    $('pipeline').innerHTML = STEPS.map((step) => {
      const info = stepInfo(step);
      const selected = selectedStepId === step.id ? ' is-selected' : '';
      return `
        <li>
          <button type="button" class="node ${info.key}${selected}" data-step="${step.id}"
            aria-label="${step.id}단계 ${step.title}, ${info.label}, 체크 ${info.done}/${info.total}">
            <span class="node-num" aria-hidden="true">${step.id}</span>
            <span class="node-body">
              <span class="node-title">${step.title}</span>
              <span class="node-meta">${info.label} · 체크 ${info.done}/${info.total} · 파일 확인 ${info.filesFound}/${info.files.length}</span>
              <span class="bar"><span style="width: ${info.percent}%"></span></span>
            </span>
          </button>
        </li>`;
    }).join('');
  }

  function renderCards() {
    $('cards').innerHTML = STEPS.map((step) => {
      const info = stepInfo(step);
      const selected = selectedStepId === step.id ? ' is-selected' : '';
      const note = info.note ? `<p class="card-note">${info.note}</p>` : '';
      const files = step.files.map((path, index) => `
        <li>
          <span>${path}</span>
          <span class="file-state ${info.files[index].key}">${info.files[index].label}</span>
        </li>`).join('');

      return `
        <article class="card ${info.key}${selected}" id="card-${step.id}" data-card="${step.id}">
          <div class="card-head">
            <span class="card-badge" aria-hidden="true">${String(step.id).padStart(2, '0')}</span>
            <span class="status-pill ${info.key}">${info.label}</span>
          </div>
          <h3>${step.title}</h3>
          <p class="card-summary">${step.summary}</p>
          <div class="bar"><span style="width: ${info.percent}%"></span></div>
          <p class="card-meta">체크 ${info.done}/${info.total} · 파일 확인 ${info.filesFound}/${info.files.length}</p>
          ${note}
          <ul class="card-files">${files}</ul>
          <button type="button" class="detail-btn" data-step="${step.id}">세부보기</button>
        </article>`;
    }).join('');
  }

  function renderAll() {
    renderSummary();
    renderConnections();
    renderTree();
    renderFileInfo();
    renderPipeline();
    renderCards();
    drawConnector();
  }

  /* ---------- 연결선 ---------- */

  function drawConnector() {
    const svg = $('connector');
    svg.replaceChildren();
    if (!desktopQuery.matches) return;

    const node = $('pipeline').querySelector(`[data-step="${selectedStepId}"]`);
    const card = document.getElementById(`card-${selectedStepId}`);
    if (!node || !card) return;

    const cardRect = card.getBoundingClientRect();
    if (cardRect.bottom < 0 || cardRect.top > window.innerHeight) return;

    const box = $('layout').getBoundingClientRect();
    const from = node.getBoundingClientRect();
    const to = cardRect;
    const x1 = from.right - box.left;
    const y1 = from.top + from.height / 2 - box.top;
    const x2 = to.left - box.left;
    const y2 = to.top + to.height / 2 - box.top;
    const curve = Math.max(40, (x2 - x1) / 2);

    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = `
      <path d="M${x1} ${y1} C${x1 + curve} ${y1} ${x2 - curve} ${y2} ${x2} ${y2}"></path>
      <circle cx="${x1}" cy="${y1}" r="4"></circle>
      <circle cx="${x2}" cy="${y2}" r="4"></circle>`;
  }

  function scheduleConnector() {
    cancelAnimationFrame(connectorFrame);
    connectorFrame = requestAnimationFrame(drawConnector);
  }

  /* ---------- 상세 창 ---------- */

  const dialog = $('detailDialog');

  function refreshDialog(step) {
    const info = stepInfo(step);
    $('dialogKicker').textContent = `${step.id}단계 · ${info.label}`;
    $('dialogProgress').textContent = `체크 ${info.done}/${info.total} · 파일 확인 ${info.filesFound}/${info.files.length}`;
    $('dialogNote').textContent = info.note;
    $('dialogNote').hidden = !info.note;
    $('dialogFiles').innerHTML = step.files.map((path, index) => `
      <li>
        <span>${path}</span>
        <span class="file-state ${info.files[index].key}">${info.files[index].label}</span>
      </li>`).join('');
  }

  function renderDialog(step) {
    const info = stepInfo(step);
    $('dialogTitle').textContent = step.title;
    $('dialogSummary').textContent = step.summary;
    $('dialogChecklist').innerHTML = step.checklist.map((text, index) => {
      const checked = info.flags[index];
      return `
        <li>
          <label class="${checked ? 'checked' : ''}">
            <input type="checkbox" data-index="${index}"${checked ? ' checked' : ''}>
            <span>${text}</span>
          </label>
        </li>`;
    }).join('');
    $('dialogErrors').innerHTML = step.errors.map((text) => `<li>${text}</li>`).join('');
    refreshDialog(step);
  }

  function openDetail(stepId) {
    const step = STEPS.find((item) => item.id === stepId);
    if (!step) return;

    selectedStepId = stepId;
    dialogStepId = stepId;
    renderDialog(step);

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    renderAll();
  }

  function closeDialog() {
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
    dialogStepId = null;
  }

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.closest('[data-close]')) {
      closeDialog();
    }
  });

  $('dialogChecklist').addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;

    const step = STEPS.find((item) => item.id === dialogStepId);
    if (!step) return;

    setFlag(step, Number(input.dataset.index), input.checked);
    input.closest('label').classList.toggle('checked', input.checked);
    refreshDialog(step);
    renderAll();
  });

  /* ---------- 이벤트 연결 ---------- */

  $('pipeline').addEventListener('click', (event) => {
    const button = event.target.closest('[data-step]');
    if (button) openDetail(Number(button.dataset.step));
  });

  $('cards').addEventListener('click', (event) => {
    const detailBtn = event.target.closest('.detail-btn');
    if (detailBtn) {
      openDetail(Number(detailBtn.dataset.step));
      return;
    }

    const card = event.target.closest('[data-card]');
    if (card) {
      selectedStepId = Number(card.dataset.card);
      renderAll();
    }
  });

  $('tree').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.folder) {
      const name = button.dataset.folder;
      if (openFolders.has(name)) {
        openFolders.delete(name);
      } else {
        openFolders.add(name);
      }
      renderTree();
      $('tree').querySelector(`[data-folder="${name}"]`)?.focus({ preventScroll: true });
      return;
    }

    if (button.dataset.file) {
      selectedPath = button.dataset.file;
      renderTree();
      renderFileInfo();
      $('tree').querySelector(`[data-file="${selectedPath}"]`)?.focus({ preventScroll: true });
    }
  });

  $('fileInfo').addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-step]');
    if (button) openDetail(Number(button.dataset.openStep));
  });

  $('folderInput').addEventListener('change', (event) => {
    const files = Array.from(event.target.files || []);
    folderFiles = files.length === 0 ? null : new Set(files.map(relativePath));

    $('folderStatus').textContent = folderFiles === null
      ? '선택 전: 모든 파일 경로가 미확인 상태입니다.'
      : `${folderFiles.size}개 파일 이름을 읽었습니다. 선택한 폴더 안의 경로만 비교합니다.`;

    renderAll();
  });

  // 선택한 폴더 이름(최상위)을 뺀 경로로 비교합니다. 예: 작업폴더/files/scene-plan.md → files/scene-plan.md
  function relativePath(file) {
    if (!file.webkitRelativePath) return file.name;
    return file.webkitRelativePath.split('/').slice(1).join('/');
  }

  window.addEventListener('scroll', scheduleConnector, { passive: true });
  window.addEventListener('resize', scheduleConnector);
  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', drawConnector);
  }

  /* ---------- 오프라인 실행 ---------- */

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    const secure = location.protocol === 'https:'
      || location.hostname === 'localhost'
      || location.hostname === '127.0.0.1';
    if (!secure) return;

    navigator.serviceWorker.register('sw.js').catch((error) => {
      showError(
        '오프라인 기능을 등록하지 못했습니다.',
        error,
        'HTTPS 주소로 열었는지, sw.js가 index.html과 같은 폴더에 있는지 확인하세요.',
        'warn'
      );
    });
  }

  /* ---------- 시작 ---------- */

  checks = loadChecks();
  renderAll();

  if (location.protocol === 'file:') {
    showError(
      '파일로 직접 열었습니다. 오프라인 실행과 앱 설치는 HTTPS 주소 또는 localhost에서만 동작합니다.',
      null,
      'README.md의 실행 방법을 참고하세요.',
      'warn'
    );
  }

  registerServiceWorker();
})();
