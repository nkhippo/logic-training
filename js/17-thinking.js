/* =====================================================
   思考トレーニング メインロジック
   thinking.html 専用
   ===================================================== */

'use strict';

// ── 状態 ─────────────────────────────────────────────
const thinkingSt = {
  lang: localStorage.getItem('thinkgrindai_lang') || 'ja',
  diff: 0,
  level: 1,
  core: '',         // 選択された問いの核心（value）
  industry: '',     // 選択された業界
  problem: null,    // 現在の問題オブジェクト
  past: [],         // 過去問リスト
  busy: false,
};

// ── 問題オブジェクト構造 ──────────────────────────────
// {
//   id, core, diff, level, date, industry, lang,
//   situation,
//   questions: [{type, question, targetChars}],
//   extraInfo: string | null,
//   userCore: '',       // ユーザーが定義した問いの核心（レベル4）
//   finalQuestion: '',  // AIが動的生成した最終問いの文章
//   steps: [            // 各ステップの状態
//     { answer, score, pass, missing, logicIssues, feedback, revised }
//   ],
//   reflectionStep: 0,  // 0:未開始 1:D1完了 2:D2完了
//   finalAnswer: '',
//   finalScore: 0,
//   done: false,
// }


function loadThinkingPersona(){
  try{
    const raw=localStorage.getItem(PERSONA_KEY);
    if(!raw)return;
    const data=JSON.parse(raw);
    st.personas=data.personas||[];
    st.tenure=data.tenure||'';
  }catch(e){}
}
function buildThinkingPersonaNote(isEN){
  if(!st.personas.length&&!st.tenure)return '';
  const lang=isEN?'en':'ja';
  const tenureOptions=PERSONA_TENURE_OPTIONS[lang];
  const tenureLabel=tenureOptions.find(o=>o.value===st.tenure)?.label||'';
  const personaLines=st.personas.map(p=>`${p.industry}・${p.role}`).join('、');
  if(isEN){
    const lines=[];
    if(personaLines)lines.push(`Industry/Role: ${personaLines}`);
    if(tenureLabel)lines.push(`Years of experience: ${tenureLabel}`);
    if(!lines.length)return '';
    return `\n\n[Respondent background]\n${lines.join('\n')}\nGenerate the problem using topics and examples that fit this background. Do NOT change the difficulty level or scoring criteria based on this background.`;
  }
  const lines=[];
  if(personaLines)lines.push(`業界・職種：${personaLines}`);
  if(tenureLabel)lines.push(`勤続年数：${tenureLabel}`);
  if(!lines.length)return '';
  return `\n\n【回答者のバックグラウンド】\n${lines.join('\n')}\nこのバックグラウンドに沿った題材・事例・表現レベルで問題を生成すること。難易度・採点基準はバックグラウンドによって変えないこと。`;
}

// ── 初期化 ────────────────────────────────────────────
function initThinking() {
  loadThinkingPersona();
  applyThinkingLang(thinkingSt.lang);
  renderThinkingCoreRow();
  renderThinkingIndustryRow();
  renderThinkingLevelRow();
  loadThinkingPast();
}

// ── 言語設定 ──────────────────────────────────────────
function applyThinkingLang(lang) {
  thinkingSt.lang = lang;
  localStorage.setItem('thinkgrindai_lang', lang);
  document.documentElement.lang = lang;
  const l = L[lang];

  // ヘッダー
  const titleEl = document.getElementById('ui-thinking-title');
  if (titleEl) titleEl.textContent = l.thinkingAppTitle || '思考トレーニング';
  const linkLogic = document.getElementById('link-to-logic');
  if (linkLogic) linkLogic.textContent = l.thinkingLinkToLogic || '← 論理トレーニング';

  // UI各所
  const ids = [
    ['ui-thinking-core-lbl',     l.thinkingCoreLbl],
    ['ui-thinking-industry-lbl', l.industryLbl],
    ['ui-thinking-diff-lbl',     l.thinkingDiffLbl],
    ['ui-thinking-level-lbl',    l.thinkingLevelLbl],
    ['ui-thinking-gen-btn',      l.thinkingGenBtn],
    ['ui-thinking-gen-loading',  l.thinkingGenLoading],
    ['ui-thinking-situation-lbl',l.thinkingSituationLbl],
    ['ui-thinking-new',          l.thinkingNewLbl],
    ['ui-thinking-past',         l.thinkingPastLbl],
  ];
  ids.forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  });

  // 難易度ラベル
  for (let d = 1; d <= 5; d++) {
    const el = document.getElementById(`thd${d}`);
    if (el) el.textContent = l.dLabels?.[d - 1] || '';
  }

  // プリセット再描画
  renderThinkingCoreRow();
  renderThinkingIndustryRow();
  renderThinkingLevelRow();
  updateThinkingDiffDesc();

  // 言語ボタンの状態
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === (lang === 'ja' ? '日本語' : 'English'));
  });
}

// ── 問いの核心 UI ─────────────────────────────────────
function renderThinkingCoreRow() {
  const lang = thinkingSt.lang === 'en' ? 'en' : 'ja';
  const l = L[thinkingSt.lang];
  const cores = THINKING_CORES[lang];
  const row = document.getElementById('thinking-core-row');
  if (!row) return;
  const randomLabel = l.thinkingCoreRandom || 'ランダム';
  const btns = [
    `<button type="button" class="preset-btn${thinkingSt.core === '' ? ' sel' : ''}"
       data-core="" onclick="setThinkingCore('')">${esc(randomLabel)}</button>`,
    ...cores.map(c =>
      `<button type="button" class="preset-btn${thinkingSt.core === c.value ? ' sel' : ''}"
         data-core="${c.value}" onclick="setThinkingCore('${c.value}')"
         title="${esc(c.desc)}">${esc(c.label)}</button>`
    )
  ];
  row.innerHTML = btns.join('');
}

function setThinkingCore(value) {
  thinkingSt.core = value;
  document.querySelectorAll('#thinking-core-row .preset-btn')
    .forEach(b => b.classList.toggle('sel', (b.getAttribute('data-core') ?? '') === value));
}

// ── 業界 UI ──────────────────────────────────────────
function renderThinkingIndustryRow() {
  const lang = thinkingSt.lang === 'en' ? 'en' : 'ja';
  const l = L[thinkingSt.lang];
  const presets = INDUSTRY_PRESETS[lang];
  const row = document.getElementById('thinking-industry-row');
  if (!row) return;
  row.innerHTML = presets.map(p =>
    `<button type="button" class="preset-btn${p.value === thinkingSt.industry ? ' sel' : ''}"
       data-industry="${p.value}" onclick="setThinkingIndustry('${p.value}')">${esc(p.label)}</button>`
  ).join('');
}

function setThinkingIndustry(value) {
  thinkingSt.industry = value;
  document.querySelectorAll('#thinking-industry-row .preset-btn')
    .forEach(b => b.classList.toggle('sel', (b.getAttribute('data-industry') ?? '') === value));
}

// ── 難易度 UI ─────────────────────────────────────────
function setThinkingDiff(d) {
  thinkingSt.diff = d;
  document.querySelectorAll('#thinking-diff-row .diff-btn')
    .forEach(b => b.classList.toggle('sel', parseInt(b.dataset.d) === d));
  updateThinkingDiffDesc();
  const levelBlock = document.getElementById('thinking-level-block');
  if (levelBlock) levelBlock.style.display = d >= 3 ? '' : 'none';
  if (d < 3) thinkingSt.level = 1;
  else renderThinkingLevelRow();
}

function updateThinkingDiffDesc() {
  const el = document.getElementById('thinking-diff-desc');
  if (!el) return;
  const l = L[thinkingSt.lang];
  el.textContent = thinkingSt.diff > 0
    ? (l.thinkingDescs?.[thinkingSt.level - 1] || '') : '';
}

// ── レベル UI ─────────────────────────────────────────
function renderThinkingLevelRow() {
  const lang = thinkingSt.lang === 'en' ? 'en' : 'ja';
  const levels = THINKING_LEVELS[lang];
  const row = document.getElementById('thinking-level-row');
  if (!row) return;
  row.innerHTML = levels.map(lv =>
    `<button type="button" class="preset-btn${thinkingSt.level === lv.id ? ' sel' : ''}"
       data-level="${lv.id}" onclick="setThinkingLevel(${lv.id})">${esc(lv.label)}</button>`
  ).join('');
}

function setThinkingLevel(id) {
  thinkingSt.level = id;
  document.querySelectorAll('#thinking-level-row .preset-btn')
    .forEach(b => b.classList.toggle('sel', parseInt(b.dataset.level) === id));
  const lang = thinkingSt.lang === 'en' ? 'en' : 'ja';
  const desc = THINKING_LEVELS[lang].find(lv => lv.id === id)?.desc || '';
  const el = document.getElementById('thinking-level-desc');
  if (el) el.textContent = desc;
}

// ── 問題生成 ─────────────────────────────────────────
async function generateThinking() {
  if (thinkingSt.busy) return;
  if (!thinkingSt.diff) {
    showThinkingToast(L[thinkingSt.lang].diffRequired || '難易度を選択してください');
    return;
  }
  const key = getKey();
  if (!key) return;

  thinkingSt.busy = true;
  document.getElementById('thinking-gen-btn').disabled = true;
  document.getElementById('thinking-gen-loading').style.display = '';
  document.getElementById('thinking-result').style.display = 'none';

  const isEN = thinkingSt.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const diff = thinkingSt.diff;
  const level = thinkingSt.level;
  const coreValue = thinkingSt.core || THINKING_CORES[lang][Math.floor(Math.random() * THINKING_CORES[lang].length)].value;
  const coreObj = THINKING_CORES[lang].find(c => c.value === coreValue);
  const params = THINKING_SITUATION_PARAMS[diff];
  const personaNote = buildThinkingPersonaNote(isEN);
  const industryNote = thinkingSt.industry
    ? (isEN ? ` Industry context: ${INDUSTRY_PRESETS.en.find(p=>p.value===thinkingSt.industry)?.label}.`
             : ` 業界：${INDUSTRY_PRESETS.ja.find(p=>p.value===thinkingSt.industry)?.label}。`)
    : '';

  const typeIds = coreObj.types;
  const typeDescs = typeIds.map(id => THINKING_TYPES[lang].find(t => t.id === id));

  const sys = isEN
    ? `You are an expert in business thinking training. Generate a realistic business situation and questions. 
       CRITICAL: Do NOT reveal the question type or core in the situation text. 
       Present only facts and context. The reader must determine what to solve.
       Respond ONLY in valid JSON. No markdown fences.`
    : `あなたはビジネス思考トレーニングの専門家です。リアルなビジネス状況と設問を生成してください。
       重要：状況文に「問いの核心」や「思考タイプ」を直接表現しないこと。
       事実と文脈のみを記述し、何を解くべきかは読み手が判断できる構造にすること。
       必ず指定されたJSON形式のみで返答してください。`;

  const ambiguityDesc = isEN
    ? { low: 'relatively clear information', medium: 'some ambiguous or conflicting information', high: 'fragmented and ambiguous information', very_high: 'highly fragmented information with intentional contradictions' }[params.ambiguity]
    : { low: '比較的明確な情報', medium: '一部に曖昧または矛盾する情報', high: '断片的・曖昧な情報', very_high: '高度に断片的で意図的な矛盾を含む情報' }[params.ambiguity];

  const prompt = isEN
    ? `Generate a business thinking training problem with the following specifications:

Core question type: ${coreObj.label} — "${coreObj.desc}"
Difficulty: ${diff}/5
Information style: ${ambiguityDesc}
Character count: ${params.minChars}–${params.maxChars} characters
Industry context: ${industryNote || 'any business context'}
${personaNote}

Thinking types to address: ${typeDescs.map(t => `${t.label}: ${t.desc}`).join(', ')}

${level === 1 ? `Generate ${typeIds.length} specific questions, one per thinking type.
Each question should be concrete and reference specific details from the situation.` : ''}
${level >= 2 ? 'For Level 2+, questions are simpler prompts for each type (the user defines what to examine).' : ''}

Return ONLY this JSON:
{
  "theme": "situation title ≤15 chars",
  "situation": "situation text",
  "extraInfo": ${params.extraInfo ? '"additional information that challenges initial hypothesis"' : 'null'},
  "questions": [
    {"typeId": <number 1-6>, "question": "specific question text referencing the situation", "targetChars": <200-400>}
  ]
}`
    : `以下の仕様でビジネス思考トレーニングの問題を生成してください。

問いの核心：${coreObj.label}——「${coreObj.desc}」
難易度：${diff}/5
情報の性質：${ambiguityDesc}
文字数：${params.minChars}〜${params.maxChars}字
業界文脈：${industryNote || '業界不問・一般的なビジネス状況'}
${personaNote}

扱う思考タイプ：${typeDescs.map(t => `${t.label}：${t.desc}`).join('、')}

${level === 1 ? `各思考タイプに対して1問ずつ、計${typeIds.length}問の設問を生成する。
設問は状況文の具体的な人物・数値・発言を使った問いかけにする。` : ''}
${level >= 2 ? 'レベル2以上では、各タイプへのシンプルな問いかけのみを生成する（何を確認するかはユーザーが定義する）。' : ''}

返答はJSONのみ：
{
  "theme": "状況のタイトル15字以内",
  "situation": "状況テキスト",
  "extraInfo": ${params.extraInfo ? '"仮説を揺さぶる追加情報"' : 'null'},
  "questions": [
    {"typeId": <1〜6の数値>, "question": "状況文の具体的な内容を踏まえた設問テキスト", "targetChars": <200〜400>}
  ]
}`;

  try {
    const raw = await callClaude(prompt, sys, 2000, 0.9);
    if (!raw) throw new Error('empty response');
    const p = safeJSON(raw);
    if (!p.situation) throw new Error('invalid JSON');

    thinkingSt.problem = {
      id: Date.now(),
      core: coreValue,
      diff,
      level,
      date: new Date().toISOString(),
      industry: thinkingSt.industry || '',
      lang: thinkingSt.lang,
      situation: p.situation,
      theme: p.theme || coreObj.label,
      questions: p.questions || [],
      extraInfo: p.extraInfo || null,
      userCore: THINKING_CORE_DEFAULT_USER_CORE[lang][coreValue] || '',
      finalQuestion: '',
      steps: [],
      currentStepIdx: 0,
      reflectionStep: 0,
      finalAnswer: '',
      finalScore: 0,
      done: false,
    };

    renderThinkingProblem(thinkingSt.problem);
    await syncThinkingPast(thinkingSt.problem);
  } catch (e) {
    showThinkingToast((L[thinkingSt.lang].thinkingGenFailed || '生成に失敗しました。') + ' ' + e.message);
  } finally {
    thinkingSt.busy = false;
    document.getElementById('thinking-gen-btn').disabled = false;
    document.getElementById('thinking-gen-loading').style.display = 'none';
  }
}

// ── 問題表示 ─────────────────────────────────────────
function renderThinkingProblem(prob) {
  const l = L[prob.lang];
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';

  // メタ行
  const coreObj = THINKING_CORES[lang].find(c => c.value === prob.core);
  const industryObj = prob.industry ? INDUSTRY_PRESETS[lang].find(p => p.value === prob.industry) : null;
  const metaRow = document.getElementById('thinking-meta-row');
  if (metaRow) {
    metaRow.innerHTML = [
      `<span class="tag">${esc(prob.theme)}</span>`,
      industryObj ? `<span class="tag">${esc(industryObj.label)}</span>` : '',
      `<span class="diff-badge diff${prob.diff}">★${prob.diff} ${l.dLabels?.[prob.diff-1]||''}</span>`,
      `<span class="tag">${esc(THINKING_LEVELS[lang].find(lv=>lv.id===prob.level)?.label||'')}</span>`,
    ].filter(Boolean).join('');
  }

  // 状況文
  document.getElementById('thinking-situation').textContent = prob.situation;

  // ステップエリアをクリア
  document.getElementById('thinking-steps').innerHTML = '';
  document.getElementById('thinking-feedback').innerHTML = '';
  document.getElementById('thinking-reflection').style.display = 'none';
  document.getElementById('thinking-reflection').innerHTML = '';

  document.getElementById('thinking-result').style.display = 'block';

  // レベルに応じた最初のステップを表示
  appendThinkingStep(prob, 0);
  document.getElementById('thinking-result').scrollIntoView({behavior:'smooth', block:'start'});
}

// ── ステップの表示 ────────────────────────────────────
function appendThinkingStep(prob, stepIdx) {
  const l = L[prob.lang];
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const container = document.getElementById('thinking-steps');
  const level = prob.level;

  let html = `<div class="ta-step-block" data-step="${stepIdx}">`;

  if (level === 4 && stepIdx === 0) {
    // レベル4 step0: 問いを定義
    html += `<div class="ta-step-lbl">${isEN ? 'Define your question' : '問いを定義する'}</div>
      <div class="ta-qa-block">
        <p class="ta-q-lbl">${esc(l.thinkingDefineQuestionLbl || 'この状況で、あなたが解くべき「問い」を定義してください。')}</p>
        <textarea class="sum-ta" id="th-ans-${stepIdx}-define" style="min-height:100px;" data-target="150" placeholder=""></textarea>
      </div>
      <div class="action-bar no-print" id="th-step-btn-${stepIdx}">
        <button class="btn" onclick="submitThinkingStep(${stepIdx}, 'define')">
          <span>${esc(l.thinkingSubmitBtn || '回答を送信する')}</span>
        </button>
      </div>`;

  } else if ((level === 3 && stepIdx === 0) || (level === 4 && stepIdx === 1)) {
    // レベル3 / レベル4 step1: タイプ選択と順序
    const types = THINKING_TYPES[lang];
    html += `<div class="ta-step-lbl">${isEN ? 'Choose your approach' : '解き方を選ぶ'}</div>
      <div class="ta-qa-block">
        <p class="ta-q-lbl">${esc(l.thinkingTypeSelectLbl || 'どの思考タイプを使うかを選んでください')}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;" id="th-type-checks-${stepIdx}">
          ${types.map(t => `
            <label style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;">
              <input type="checkbox" data-typeid="${t.id}" value="${t.id}">
              <span>${esc(t.label)}</span>
            </label>`).join('')}
        </div>
        <p class="ta-q-lbl" style="margin-top:8px;">${esc(l.thinkingTypeOrderLbl || 'この順序で解く理由')}</p>
        <textarea class="sum-ta" id="th-ans-${stepIdx}-order" style="min-height:80px;" data-target="100" placeholder=""></textarea>
      </div>
      <div class="action-bar no-print" id="th-step-btn-${stepIdx}">
        <button class="btn" onclick="submitThinkingStep(${stepIdx}, 'typeselect')">
          <span>${esc(l.thinkingSubmitBtn || '回答を送信する')}</span>
        </button>
      </div>`;

  } else if (level === 2 && stepIdx === 0) {
    // レベル2 step0: 切り口を定義
    const typeIds = prob.questions.map(q => q.typeId);
    const typeObjs = typeIds.map(id => THINKING_TYPES[lang].find(t => t.id === id));
    html += typeObjs.map((t, i) => `
      <div class="ta-qa-block">
        <p class="ta-q-lbl"><strong>${esc(t.label)}</strong></p>
        <p class="ta-q-lbl" style="color:var(--text2);font-size:12px;">${esc(t.desc)}</p>
        <p class="ta-q-lbl">${esc(l.thinkingDefineCheckLbl || 'このタイプで確認する内容を定義してください')}</p>
        <textarea class="sum-ta" id="th-ans-${stepIdx}-def-${i}" style="min-height:80px;" data-target="100" placeholder=""></textarea>
      </div>`).join('');
    html += `<div class="action-bar no-print" id="th-step-btn-${stepIdx}">
      <button class="btn" onclick="submitThinkingStep(${stepIdx}, 'define2')">
        <span>${esc(l.thinkingSubmitBtn || '回答を送信する')}</span>
      </button>
    </div>`;

  } else {
    // レベル1: 設問に答える
    const questions = prob.questions || [];
    html += questions.map((q, i) => {
      const typeObj = THINKING_TYPES[lang].find(t => t.id === q.typeId);
      return `<div class="ta-qa-block">
        <p class="ta-q-lbl"><strong>${typeObj ? esc(typeObj.label) : ''}</strong></p>
        <p class="ta-q-lbl">${esc(q.question)}</p>
        <textarea class="sum-ta" id="th-ans-${stepIdx}-q${i}" style="min-height:120px;" data-target="${q.targetChars||200}" placeholder=""></textarea>
      </div>`;
    }).join('');
    html += `<div class="action-bar no-print" id="th-step-btn-${stepIdx}">
      <button class="btn" onclick="submitThinkingStep(${stepIdx}, 'answer')">
        <span>${esc(l.thinkingSubmitBtn || '回答を送信する')}</span>
      </button>
    </div>`;
  }

  html += `<div id="th-step-fb-${stepIdx}" style="display:none;"></div>
  </div>`;

  container.insertAdjacentHTML('beforeend', html);
}

// ── ステップ回答の送信と採点 ───────────────────────────
async function submitThinkingStep(stepIdx, mode) {
  if (thinkingSt.busy) return;
  const prob = thinkingSt.problem;
  if (!prob) return;
  const key = getKey();
  if (!key) return;

  const btn = document.getElementById(`th-step-btn-${stepIdx}`);
  if (btn) btn.style.display = 'none';

  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';

  // 回答を収集
  let answer = '';
  if (mode === 'define') {
    answer = document.getElementById(`th-ans-${stepIdx}-define`)?.value.trim() || '';
  } else if (mode === 'typeselect') {
    const checked = [...document.querySelectorAll(`#th-type-checks-${stepIdx} input[type=checkbox]:checked`)]
      .map(c => parseInt(c.value));
    const orderText = document.getElementById(`th-ans-${stepIdx}-order`)?.value.trim() || '';
    answer = JSON.stringify({ selectedTypes: checked, orderReason: orderText });
  } else if (mode === 'define2') {
    const defs = prob.questions.map((_, i) =>
      document.getElementById(`th-ans-${stepIdx}-def-${i}`)?.value.trim() || ''
    );
    answer = defs.join('\n---\n');
  } else {
    const answers = prob.questions.map((_, i) =>
      document.getElementById(`th-ans-${stepIdx}-q${i}`)?.value.trim() || ''
    );
    answer = answers.join('\n---\n');
  }

  if (!answer || answer === '{}') {
    if (btn) btn.style.display = '';
    showThinkingToast(L[prob.lang].overWarn || '回答を入力してください');
    return;
  }

  thinkingSt.busy = true;
  const fbEl = document.getElementById(`th-step-fb-${stepIdx}`);
  if (fbEl) {
    fbEl.style.display = 'block';
    fbEl.innerHTML = `<p class="loading"><span class="dots">...</span></p>`;
  }

  try {
    const result = await gradeThinkingStep(prob, stepIdx, mode, answer);
    if (!result) throw new Error('no result');

    // 結果を保存
    if (!prob.steps[stepIdx]) prob.steps[stepIdx] = {};
    prob.steps[stepIdx] = { ...prob.steps[stepIdx], mode, answer, ...result };

    // user_coreの更新（レベル4の定義ステップから）
    if (mode === 'define' && result.userCore) {
      prob.userCore = result.userCore;
    }

    // フィードバック表示
    if (fbEl) {
      fbEl.innerHTML = buildThinkingStepFeedback(result, prob.lang, mode);
    }

    // 次のステップへの遷移判定
    await handleThinkingStepResult(prob, stepIdx, mode, result);

  } catch (e) {
    if (fbEl) fbEl.innerHTML = `<p class="err">${e.message}</p>`;
    if (btn) btn.style.display = '';
  } finally {
    thinkingSt.busy = false;
  }
}

// ── ステップ採点プロンプト（役割A） ──────────────────
async function gradeThinkingStep(prob, stepIdx, mode, answer) {
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const coreObj = THINKING_CORES[lang].find(c => c.value === prob.core);
  const level = prob.level;

  // 評価基準を構築
  const criteriaKey = `level${level}`;
  const criteria = THINKING_SCORE_CRITERIA[criteriaKey]?.[lang];
  const logicChecks = buildLogicCheckPrompt(prob.core, prob.questions.map(q=>q.typeId), isEN);

  const sys = isEN
    ? 'You are a strict but constructive business thinking evaluator. Evaluate the response and return ONLY valid JSON. No markdown.'
    : 'あなたは厳格かつ建設的なビジネス思考の採点者です。回答を評価し、必ず指定されたJSON形式のみで返答してください。';

  const prompt = isEN
    ? `Evaluate this response for a business thinking training exercise.

Situation: ${prob.situation}
Question core: ${coreObj?.label} — "${coreObj?.desc}"
Level: ${level}
Mode: ${mode}
User's answer: ${answer}

Evaluation criteria (required items, 20pts each, max 60pts):
${criteria?.required?.map((c,i) => `${i+1}. ${c}`).join('\n') || ''}

Bonus criteria (20pts each, max 40pts):
${criteria?.bonus?.map((c,i) => `${i+1}. ${c}`).join('\n') || ''}

Logic checks:
${logicChecks}

${mode === 'define' ? 'Also extract the user\'s intended question in one sentence for "userCore".' : ''}
${mode === 'typeselect' ? 'Evaluate whether the selected types and order are appropriate for this question core.' : ''}

Return ONLY this JSON:
{
  "score": <0-100>,
  "pass": <true if score>=80>,
  "missing": ["thinking type labels that were missing or insufficient"],
  "logicIssues": ["specific logic problems found"],
  "reason": "1-2 sentence evaluation summary",
  "userCore": "${mode === 'define' ? 'user defined question in one sentence' : ''}"
}`
    : `ビジネス思考トレーニングの回答を採点してください。

状況：${prob.situation}
問いの核心：${coreObj?.label}——「${coreObj?.desc}」
レベル：${level}
モード：${mode}
ユーザーの回答：${answer}

必須項目（各20点・計60点）：
${criteria?.required?.map((c,i) => `${i+1}. ${c}`).join('\n') || ''}

加点項目（各20点・計40点）：
${criteria?.bonus?.map((c,i) => `${i+1}. ${c}`).join('\n') || ''}

論理整合性チェック：
${logicChecks}

${mode === 'define' ? '回答者が定義した問いを1文で抽出して "userCore" に入れてください。' : ''}
${mode === 'typeselect' ? '選択したタイプと順序が問いの核心に対して適切かを評価してください。' : ''}

返答はJSONのみ：
{
  "score": <0〜100>,
  "pass": <80点以上ならtrue>,
  "missing": ["不足していた・不十分だった思考タイプのラベル"],
  "logicIssues": ["見つかった論理の問題を具体的に"],
  "reason": "判定理由を1〜2文で",
  "userCore": "${mode === 'define' ? 'ユーザーが定義した問いを1文で' : ''}"
}`;

  const raw = await callClaude(prompt, sys, 600, 0.3);
  return safeJSON(raw);
}

// ── ステップ結果に応じた遷移 ─────────────────────────
async function handleThinkingStepResult(prob, stepIdx, mode, result) {
  const l = L[prob.lang];
  const fbEl = document.getElementById(`th-step-fb-${stepIdx}`);
  const isEN = prob.lang === 'en';

  if (result.score >= 95) {
    // 95点以上：問答無用で次へ
    await proceedToNextThinkingStep(prob, stepIdx, mode);

  } else if (result.score >= 80) {
    // 80〜95点：指摘1つ＋選択肢
    const followupHtml = await generateThinkingFollowup(prob, result, 'soft');
    if (fbEl) {
      fbEl.innerHTML += `<div class="ta-boss-reply-block" style="margin-top:12px;">
        <p class="slabel no-print">${isEN ? 'One point to consider' : '1点だけ確認'}</p>
        <div class="problem-box" style="background:var(--bg2);border-left:3px solid var(--amber);">${esc(followupHtml)}</div>
        <div class="action-bar no-print" style="margin-top:8px;gap:8px;">
          <button class="btn btn-sm" onclick="proceedToNextThinkingStep(thinkingSt.problem, ${stepIdx}, '${mode}')">
            ${isEN ? 'Continue as is' : 'このまま次へ進む'}
          </button>
          <button class="btn btn-sm" style="background:var(--bg2);color:var(--text);"
                  onclick="showThinkingReviseArea(${stepIdx}, '${mode}')">
            ${isEN ? 'Revise' : '修正する'}
          </button>
        </div>
      </div>`;
    }

  } else {
    // 80点未満
    const prevStep = prob.steps[stepIdx];
    if (!prevStep.retryCount) prevStep.retryCount = 0;

    if (prevStep.retryCount >= 1) {
      // 2回目の80点未満：打ち切り
      const closingFb = await generateThinkingClosingFeedback(prob, stepIdx);
      if (fbEl) {
        fbEl.innerHTML += `<div class="ta-section-block" style="margin-top:12px;">
          ${md2h(closingFb)}
        </div>`;
      }
      prob.done = true;
    } else {
      // 1回目の80点未満：問い返し
      prevStep.retryCount = 1;
      const followupHtml = await generateThinkingFollowup(prob, result, 'strong');
      if (fbEl) {
        fbEl.innerHTML += `<div class="ta-boss-reply-block" style="margin-top:12px;">
          <p class="slabel no-print">${isEN ? 'Please reconsider' : 'もう一度考えてみてください'}</p>
          <div class="problem-box" style="background:var(--bg2);border-left:3px solid var(--purple);">${esc(followupHtml)}</div>
        </div>`;
      }
      // 再回答欄を再表示
      const btn = document.getElementById(`th-step-btn-${stepIdx}`);
      if (btn) btn.style.display = '';
    }
  }
}

// ── 次のステップへ進む ────────────────────────────────
async function proceedToNextThinkingStep(prob, stepIdx, mode) {
  const isLastAnswerStep = checkIsLastAnswerStep(prob, stepIdx, mode);

  if (isLastAnswerStep) {
    // 最終ステップが完了→最終問いへ
    await showThinkingFinalQuestion(prob);
  } else {
    // 次のステップへ
    const nextIdx = stepIdx + 1;
    prob.currentStepIdx = nextIdx;
    appendThinkingStep(prob, nextIdx);
    document.querySelector(`[data-step="${nextIdx}"]`)?.scrollIntoView({behavior:'smooth', block:'start'});
  }
}

function checkIsLastAnswerStep(prob, stepIdx, mode) {
  const level = prob.level;
  if (level === 1) return mode === 'answer';
  if (level === 2) return mode === 'answer';
  if (level === 3) return mode === 'answer';
  if (level === 4) return mode === 'answer';
  return mode === 'answer';
}

// ── 問い返し生成（役割B） ────────────────────────────
async function generateThinkingFollowup(prob, result, strength) {
  const isEN = prob.lang === 'en';
  const missingType = result.missing?.[0] || '';
  const logicIssue = result.logicIssues?.[0] || '';

  const sys = isEN
    ? 'You are a manager reviewing a subordinate\'s analysis. Give one focused follow-up question. Do NOT give the answer. 2-3 sentences max.'
    : 'あなたは部下の分析をレビューする上司です。答えは教えず、1点だけ的を絞った問い返しをしてください。2〜3文以内で返してください。';

  const prompt = isEN
    ? `Situation: ${prob.situation}
User's response: ${prob.steps[prob.currentStepIdx]?.answer || ''}
Missing/weak area: ${missingType || logicIssue}
Strength of follow-up: ${strength === 'strong' ? 'Direct and pressing' : 'Gentle nudge'}
Generate one focused question to help the user realize what they missed.`
    : `状況：${prob.situation}
ユーザーの回答：${prob.steps[prob.currentStepIdx]?.answer || ''}
不足・弱い点：${missingType || logicIssue}
問い返しの強さ：${strength === 'strong' ? '直接的・明確に' : '穏やかに'}
見落としに気づかせるための問い返しを1つ生成してください。`;

  return await callClaude(prompt, sys, 300, 0.7);
}

// ── 打ち切りフィードバック ────────────────────────────
async function generateThinkingClosingFeedback(prob, stepIdx) {
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const coreObj = THINKING_CORES[lang].find(c => c.value === prob.core);
  const step = prob.steps[stepIdx];

  const sys = isEN
    ? 'You are a business thinking coach. Provide constructive closing feedback. Use markdown.'
    : 'あなたはビジネス思考のコーチです。前向きな打ち切りフィードバックを提供してください。マークダウンを使ってください。';

  const prompt = isEN
    ? `The user was unable to reach 80 points after 2 attempts.

Situation: ${prob.situation}
Core question: ${coreObj?.label}
User's responses: ${JSON.stringify(prob.steps.map(s => s.answer))}
Missing areas: ${JSON.stringify(step.missing)}

Provide feedback with:
## What was solid
## What was missing and why it matters
## One thing to focus on next time`
    : `ユーザーが2回の試みで80点に達しませんでした。

状況：${prob.situation}
問いの核心：${coreObj?.label}
ユーザーの回答：${JSON.stringify(prob.steps.map(s => s.answer))}
不足していた点：${JSON.stringify(step.missing)}

以下の構成でフィードバックしてください：
## できていたこと
## 不足していた点とその理由
## 次回意識すべき1点`;

  return await callClaude(prompt, sys, 800, 0.3);
}

// ── 最終問いの表示 ────────────────────────────────────
async function showThinkingFinalQuestion(prob) {
  if (prob.diff < 2) {
    // 難易度1は最終フィードバックへ直行
    await showThinkingFinalFeedback(prob);
    return;
  }

  const isEN = prob.lang === 'en';
  const l = L[prob.lang];

  // 最終問いの文章をAIが動的生成
  const finalQ = await generateThinkingFinalQuestion(prob);
  prob.finalQuestion = finalQ;

  const fbArea = document.getElementById('thinking-feedback');
  fbArea.innerHTML = `
    <div class="ta-section-block" style="margin-top:1rem;">
      <p class="slabel no-print" id="ui-thinking-final-q-lbl">${esc(l.thinkingFinalQLbl || 'まとめの問い')}</p>
      <p class="ta-q-lbl">${esc(finalQ)}</p>
      <p style="font-size:12px;color:var(--text2);margin-bottom:8px;">
        ${isEN ? '2 sentences or less, 100 characters or less' : '2文以内・100字以内'}
      </p>
      <textarea class="sum-ta" id="th-final-ans" style="min-height:100px;" data-target="100" placeholder=""></textarea>
      <div class="action-bar no-print" style="margin-top:8px;" id="th-final-btn">
        <button class="btn" onclick="submitThinkingFinalAnswer()">
          <span>${esc(l.thinkingSubmitFinalBtn || '最終回答を送信する')}</span>
        </button>
      </div>
    </div>`;
}

// ── 最終問いのAI動的生成 ──────────────────────────────
async function generateThinkingFinalQuestion(prob) {
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const userCore = prob.userCore || THINKING_CORE_DEFAULT_USER_CORE[lang][prob.core] || '';

  const sys = isEN
    ? 'Generate a concise summary question based on the user\'s defined question. Return ONLY the question text, nothing else.'
    : '回答者が定義した問いをもとに、まとめの質問文を生成してください。質問文のみを返してください。';

  const prompt = isEN
    ? `User's question: "${userCore}"
Theme: ${prob.theme}
Generate a natural summary question asking them to state: (1) what the core issue is and why, and (2) what should be done next. Keep it to 1-2 sentences.`
    : `回答者の問い：「${userCore}」
題材テーマ：${prob.theme}
この問いに対して「なぜそう判断したか・次に何をすべきか」を2文・100字以内で述べさせる質問文を1〜2文で生成してください。`;

  const raw = await callClaude(prompt, sys, 200, 0.5);
  return raw?.trim() || (isEN
    ? `Based on your analysis, what is the core issue and what should be done next? (2 sentences or less, 100 characters)`
    : `ここまでの分析を踏まえて、この状況の本質は何か・次に何をすべきかを2文・100字以内でまとめてください。`);
}

// ── 最終回答の送信 ────────────────────────────────────
async function submitThinkingFinalAnswer() {
  if (thinkingSt.busy) return;
  const prob = thinkingSt.problem;
  if (!prob) return;
  const key = getKey();
  if (!key) return;

  const finalAns = document.getElementById('th-final-ans')?.value.trim() || '';
  if (!finalAns) {
    showThinkingToast(L[prob.lang].overWarn || '回答を入力してください');
    return;
  }

  prob.finalAnswer = finalAns;
  document.getElementById('th-final-btn').style.display = 'none';
  thinkingSt.busy = true;

  const loadEl = document.createElement('p');
  loadEl.className = 'loading';
  loadEl.innerHTML = '<span class="dots">...</span>';
  document.getElementById('thinking-feedback').appendChild(loadEl);

  try {
    const result = await gradeThinkingFinalAnswer(prob);
    if (!result) throw new Error('no result');
    prob.finalScore = result.score;

    loadEl.remove();

    if (result.score >= 90) {
      await showThinkingFinalFeedback(prob, result);
    } else if (!prob.finalRetried) {
      // 90点未満1回目：問い返し
      prob.finalRetried = true;
      const fbArea = document.getElementById('thinking-feedback');
      fbArea.insertAdjacentHTML('beforeend', `
        <div class="ta-boss-reply-block" style="margin-top:12px;">
          <p class="slabel no-print">${prob.lang === 'en' ? 'Please be more specific' : 'もう少し具体的に'}</p>
          <div class="problem-box" style="background:var(--bg2);border-left:3px solid var(--purple);">
            ${esc(result.feedback || '')}
          </div>
          <textarea class="sum-ta" id="th-final-ans-2" style="min-height:100px;margin-top:8px;" data-target="100" placeholder=""></textarea>
          <div class="action-bar no-print" style="margin-top:8px;">
            <button class="btn" onclick="submitThinkingFinalAnswer2()">
              ${prob.lang === 'en' ? 'Resubmit' : '再送信する'}
            </button>
          </div>
        </div>`);
    } else {
      // 90点未満2回目：最終フィードバックへ
      await showThinkingFinalFeedback(prob, result);
    }
  } catch (e) {
    loadEl.remove();
    showThinkingToast(e.message);
  } finally {
    thinkingSt.busy = false;
  }
}

async function submitThinkingFinalAnswer2() {
  const prob = thinkingSt.problem;
  if (!prob) return;
  const ans2 = document.getElementById('th-final-ans-2')?.value.trim() || '';
  if (ans2) prob.finalAnswer = ans2;
  await showThinkingFinalFeedback(prob, null);
}

// ── 最終回答の採点（役割A：90点ルール） ──────────────
async function gradeThinkingFinalAnswer(prob) {
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const criteria = THINKING_FINAL_Q_CRITERIA[lang];

  const sys = isEN
    ? 'Evaluate the final summary answer. Return ONLY valid JSON.'
    : '最終まとめ回答を採点してください。JSONのみで返答してください。';

  const prompt = isEN
    ? `Final question: ${prob.finalQuestion}
User's answer: ${prob.finalAnswer}
Core question: ${prob.userCore}

Evaluate:
Required (20pts each): ${criteria.required.join(' | ')}
Bonus (20pts): ${criteria.bonus[0]}

Return: {"score": <0-100>, "pass": <true if >=90>, "feedback": "1-sentence hint if <90"}`
    : `まとめの問い：${prob.finalQuestion}
回答：${prob.finalAnswer}
問いの核心：${prob.userCore}

採点基準：
必須（各20点）：${criteria.required.join(' / ')}
加点（20点）：${criteria.bonus[0]}

返答：{"score": <0〜100>, "pass": <90点以上ならtrue>, "feedback": "90点未満の場合のヒント1文"}`;

  const raw = await callClaude(prompt, sys, 300, 0.3);
  return safeJSON(raw);
}

// ── 最終フィードバック（役割C＋D1） ──────────────────
async function showThinkingFinalFeedback(prob, finalResult) {
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const l = L[prob.lang];
  const coreObj = THINKING_CORES[lang].find(c => c.value === prob.core);

  const allMissing = [...new Set(prob.steps.flatMap(s => s?.missing || []))];
  const allLogicIssues = [...new Set(prob.steps.flatMap(s => s?.logicIssues || []))];

  const sys = isEN
    ? 'You are a business thinking coach. Provide structured final feedback. Use markdown.'
    : 'あなたはビジネス思考のコーチです。構造的な最終フィードバックを提供してください。マークダウンを使ってください。';

  const reflectionInstruction = ENABLE_REFLECTION ? (isEN
    ? `\n\n## Reflection question\nBased on the response patterns, generate 1-2 questions using one of these patterns:
- Pattern X (missed/confused): "In [step], [specific issue happened]. Looking back, what was your reasoning?"
- Pattern Y (self-critique): "Which moment made you most uncertain about whether you were on the right track?"
- Pattern Z (assumption): "In [step], you proceeded without checking [assumption]. Why didn't you question it?"`
    : `\n\n## 振り返り\n回答パターンをもとに、以下のいずれかのパターンで1〜2問を生成してください：
- パターンX（省略・混同）：「[ステップ]で[具体的な問題]がありました。そのときの判断の根拠を振り返ってみてください。」
- パターンY（自己批判）：「今回の回答全体で、最も「本当にこれで良いか」と迷った場面はどこですか？」
- パターンZ（思い込み）：「[ステップ]で[前提]を確認せずに進んだ場面がありました。なぜそこを疑わなかったと思いますか？」`) : '';

  const prompt = isEN
    ? `Provide final feedback for this thinking training session.

Situation: ${prob.situation}
Core question: ${coreObj?.label} — "${coreObj?.desc}"
Level: ${prob.level}
Missing thinking areas: ${allMissing.join(', ') || 'none'}
Logic issues: ${allLogicIssues.join(', ') || 'none'}
Final answer: ${prob.finalAnswer}
Final answer score: ${finalResult?.score || prob.finalScore}

## What was solid
## What was missing and why it matters (with specific impact)
## Logic issues to address
## Alternative perspective worth considering
## Final answer evaluation${reflectionInstruction}`
    : `この思考トレーニングセッションの最終フィードバックを提供してください。

状況：${prob.situation}
問いの核心：${coreObj?.label}——「${coreObj?.desc}」
レベル：${prob.level}
不足していた思考タイプ：${allMissing.join('、') || 'なし'}
論理の問題：${allLogicIssues.join('、') || 'なし'}
最終回答：${prob.finalAnswer}
最終回答スコア：${finalResult?.score || prob.finalScore}

## できていたこと
## 不足していた視点とその影響（具体的に）
## 論理の整合性への指摘
## 別の考え方の提示
## まとめの問いへの評価${reflectionInstruction}`;

  thinkingSt.busy = true;
  const fbArea = document.getElementById('thinking-feedback');
  fbArea.insertAdjacentHTML('beforeend', `<div id="th-final-fb" class="ta-section-block" style="margin-top:1rem;"><p class="loading"><span class="dots">...</span></p></div>`);

  try {
    const fb = await callClaude(prompt, sys, 2000, 0.3);
    const fbEl = document.getElementById('th-final-fb');
    if (fbEl) fbEl.innerHTML = md2h(fb || '');

    prob.done = true;

    // 振り返りエリアの表示（ENABLE_REFLECTION=true の場合）
    if (ENABLE_REFLECTION) {
      showThinkingReflectionArea(prob);
    }
  } catch (e) {
    const fbEl = document.getElementById('th-final-fb');
    if (fbEl) fbEl.innerHTML = `<p class="err">${e.message}</p>`;
  } finally {
    thinkingSt.busy = false;
  }
}

// ── 振り返り機能（役割D2・D3） ────────────────────────
function showThinkingReflectionArea(prob) {
  const l = L[prob.lang];
  const isEN = prob.lang === 'en';
  const reflectionEl = document.getElementById('thinking-reflection');

  reflectionEl.style.display = '';
  reflectionEl.innerHTML = `
    <div class="ta-section-block" style="margin-top:1.5rem;border-left:3px solid var(--purple);">
      <p class="slabel">${esc(l.thinkingReflectLbl || '振り返り')}</p>
      <p style="font-size:13px;color:var(--text2);margin-bottom:12px;">
        ${isEN
          ? 'The questions below are to help you reflect on your thinking process. Answering is optional.'
          : '以下の問いかけは、あなた自身の思考のプロセスを振り返るためのものです。回答は任意です。'}
      </p>
      <div id="reflection-q-area"></div>
    </div>`;

  // 振り返りの問いかけ部分はfeedbackのD1セクションから取得済み
  // ユーザーの回答欄を表示
  const qArea = document.getElementById('reflection-q-area');
  qArea.innerHTML = `
    <textarea class="sum-ta" id="reflection-ans-1" style="min-height:100px;" placeholder="${isEN ? 'Your reflection...' : '振り返りを入力...'}" data-target="300"></textarea>
    <div class="action-bar no-print" style="margin-top:8px;gap:8px;">
      <button class="btn" onclick="submitThinkingReflection(1)">
        ${esc(l.thinkingReflectReplyBtn || '振り返りに回答する')}
      </button>
      <button class="btn btn-sm" style="background:var(--bg2);color:var(--text2);"
              onclick="document.getElementById('thinking-reflection').style.display='none'">
        ${esc(l.thinkingReflectSkipBtn || 'スキップして終了')}
      </button>
    </div>`;
}

async function submitThinkingReflection(round) {
  if (thinkingSt.busy) return;
  const prob = thinkingSt.problem;
  if (!prob) return;
  const key = getKey();
  if (!key) return;

  const ans = document.getElementById(`reflection-ans-${round}`)?.value.trim() || '';
  if (!ans) return;

  prob.reflectionStep = round;
  thinkingSt.busy = true;

  const isEN = prob.lang === 'en';
  const l = L[prob.lang];
  const isFinal = round >= 2;

  const sys = isEN
    ? `You are a business thinking coach. ${isFinal ? 'Provide closing reflection feedback without asking more questions.' : 'Provide feedback and one deeper follow-up question. Always end with a question.'}`
    : `あなたはビジネス思考のコーチです。${isFinal ? 'これ以上問い返しをせず、まとめのアドバイスを提供してください。' : 'フィードバックと1つの深掘り問いかけを提供してください。必ず問いかけで締めてください。'}`;

  // ユーザーの回答に質問が含まれているかを判定（AIに任せる）
  const prompt = isEN
    ? `User's reflection response: "${ans}"

Situation context: ${prob.situation}
Core question: ${prob.userCore}

${isFinal
  ? 'Provide closing feedback with one key insight they can take away from this session. No more questions.'
  : `Determine if the user is asking a question. If yes, answer it and add a deeper follow-up question.
     If no, give feedback on their reflection and add a deeper follow-up question.
     End with a question.`}`
    : `振り返りへの回答：「${ans}」

状況：${prob.situation}
問いの核心：${prob.userCore}

${isFinal
  ? 'このセッションを通じて持ち帰れる気づきを1つ示して締めくくってください。問い返しはしません。'
  : `回答に質問が含まれているかを判断してください。含まれている場合は答えた上で深掘り問いかけを追加。
     含まれていない場合は振り返りへのフィードバックと深掘り問いかけを提供。
     必ず問いかけで締めてください。`}`;

  const qArea = document.getElementById('reflection-q-area');
  qArea.insertAdjacentHTML('beforeend', `<div id="reflection-fb-${round}" class="ta-section-block" style="margin-top:12px;"><p class="loading"><span class="dots">...</span></p></div>`);

  try {
    const fb = await callClaude(prompt, sys, 500, 0.7);
    const fbEl = document.getElementById(`reflection-fb-${round}`);
    if (fbEl) fbEl.innerHTML = md2h(fb || '');

    if (!isFinal) {
      // 次の振り返り回答欄を表示
      qArea.insertAdjacentHTML('beforeend', `
        <textarea class="sum-ta" id="reflection-ans-${round + 1}" style="min-height:100px;margin-top:12px;"
                  placeholder="${isEN ? 'Continue the reflection...' : 'さらに振り返りを...'}" data-target="300"></textarea>
        <div class="action-bar no-print" style="margin-top:8px;">
          <button class="btn" onclick="submitThinkingReflection(${round + 1})">
            ${esc(l.thinkingReflectReply2Btn || 'さらに回答する')}
          </button>
        </div>`);
    }
  } catch (e) {
    const fbEl = document.getElementById(`reflection-fb-${round}`);
    if (fbEl) fbEl.innerHTML = `<p class="err">${e.message}</p>`;
  } finally {
    thinkingSt.busy = false;
  }
}

// ── ステップフィードバックの表示HTML生成 ─────────────
function buildThinkingStepFeedback(result, lang, mode) {
  const isEN = lang === 'en';
  if (!result) return '';
  const parts = [];
  if (result.reason) {
    parts.push(`<p style="font-size:13px;color:var(--text2);margin-top:8px;">${esc(result.reason)}</p>`);
  }
  return parts.join('');
}

// ── 論理整合性チェックプロンプトの生成 ──────────────
function buildLogicCheckPrompt(coreValue, typeIds, isEN) {
  const lang = isEN ? 'en' : 'ja';
  const checks = [
    ...(LOGIC_CHECK_MAP.common[lang] || []),
    ...(typeIds || []).flatMap(id => LOGIC_CHECK_MAP.types[id]?.[lang] || []),
    ...(LOGIC_CHECK_MAP.cores[coreValue]?.[lang] || []),
  ];
  const unique = [...new Set(checks)];
  return isEN
    ? unique.map((c, i) => `${i + 1}. ${c}`).join('\n')
    : unique.map((c, i) => `${i + 1}. ${c}`).join('\n');
}


function updateThinkingPastSync(cls, msg) {
  const dot = document.getElementById('thinking-past-dot');
  const lbl = document.getElementById('thinking-past-lbl');
  if (dot) dot.className = 'sdot' + (cls ? ' ' + cls : '');
  if (lbl) lbl.textContent = msg;
}

function showThinkingReviseArea(stepIdx, mode) {
  const btn = document.getElementById(`th-step-btn-${stepIdx}`);
  if (btn) btn.style.display = '';
}

// ── ガイド ────────────────────────────────────────────
function openThinkingGuide() {
  const overlay = document.getElementById('thinking-guide-overlay');
  if (overlay) overlay.classList.add('show');
  // ガイドMarkdownの読み込み
  fetch(`guide/thinking-overview.md`)
    .then(r => r.text())
    .then(text => {
      const body = document.getElementById('thinking-guide-body');
      if (body) body.innerHTML = md2h(text);
    })
    .catch(() => {
      const body = document.getElementById('thinking-guide-body');
      if (body) body.innerHTML = '<p>ガイドを読み込めませんでした。</p>';
    });
}

function closeThinkingGuide() {
  const overlay = document.getElementById('thinking-guide-overlay');
  if (overlay) overlay.classList.remove('show');
}

// ── サブタブ切り替え ─────────────────────────────────
function switchThinkingSub(tab) {
  document.getElementById('thinking-new-area').style.display = tab === 'new' ? '' : 'none';
  document.getElementById('thinking-past-area').style.display = tab === 'past' ? '' : 'none';
  document.getElementById('thinking-sub-new').classList.toggle('active', tab === 'new');
  document.getElementById('thinking-sub-past').classList.toggle('active', tab === 'past');
  if (tab === 'past') renderThinkingPastList();
}

// ── 過去問 ────────────────────────────────────────────
async function loadThinkingPast() {
  if (!await ensureGasV3()) return;
  try {
    const res = await fetch(`${GAS_URL}?sheet=thinking`);
    const data = await res.json();
    if (Array.isArray(data)) {
      thinkingSt.past = data.map(row => {
        if (row && typeof row === 'object' && !Array.isArray(row)) return row;
        const obj = {};
        THINKING_COLS.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
      });
    }
    updateThinkingPastSync('ok', `${thinkingSt.past.length}件`);
  } catch (e) {
    updateThinkingPastSync('err', 'sync failed');
  }
}

function renderThinkingPastList() {
  const listEl = document.getElementById('thinking-past-list');
  if (!listEl) return;
  if (!thinkingSt.past.length) {
    listEl.innerHTML = `<p style="color:var(--text2);font-size:13px;padding:1rem 0;">まだ過去問がありません。</p>`;
    return;
  }
  listEl.innerHTML = thinkingSt.past.map((p, i) => {
    const lang = p.lang || 'ja';
    const cores = THINKING_CORES[lang === 'en' ? 'en' : 'ja'];
    const coreObj = cores.find(c => c.value === p.core);
    const levels = THINKING_LEVELS[lang === 'en' ? 'en' : 'ja'];
    const levelObj = levels.find(lv => lv.id === parseInt(p.level));
    return `<div class="pitem" onclick="openThinkingPast(${i})" style="cursor:pointer;">
      <div style="font-size:13px;font-weight:500;">${esc(p.theme || coreObj?.label || '—')}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:2px;">
        ${esc(coreObj?.label || '')} · ★${p.diff} · ${esc(levelObj?.label || '')} · ${new Date(p.date).toLocaleDateString()}
      </div>
    </div>`;
  }).join('');
}

function openThinkingPast(idx) {
  const p = thinkingSt.past[idx];
  if (!p) return;
  document.getElementById('thinking-past-list-view').style.display = 'none';
  document.getElementById('thinking-past-play').style.display = '';
  const content = document.getElementById('thinking-past-content');
  const lang = p.lang || 'ja';
  const isEN = lang === 'en';
  const l = L[lang];
  const cores = THINKING_CORES[isEN ? 'en' : 'ja'];
  const coreObj = cores.find(c => c.value === p.core);
  const questions = (() => {
    try { return JSON.parse(p.questions || '[]'); } catch { return []; }
  })();

  content.innerHTML = `
    <p class="slabel">${esc(l.thinkingSituationLbl || '状況')}</p>
    <div class="problem-box">${esc(p.situation || '')}</div>
    ${questions.length ? `
    <p class="slabel" style="margin-top:1rem;">${esc(l.thinkingQuestionsLbl || '設問')}</p>
    <div class="problem-box">
      ${questions.map((q, i) => `<p style="margin-bottom:8px;"><strong>${i + 1}.</strong> ${esc(q.question || '')}</p>`).join('')}
    </div>` : ''}`;
}

function closeThinkingPast() {
  document.getElementById('thinking-past-list-view').style.display = '';
  document.getElementById('thinking-past-play').style.display = 'none';
}

// ── GAS保存 ──────────────────────────────────────────
async function syncThinkingPast(prob) {
  if (!await ensureGasV3()) return;
  const entry = {
    id: prob.id,
    sheet: 'thinking',
    core: prob.core,
    diff: prob.diff,
    level: prob.level,
    date: prob.date,
    industry: prob.industry || '',
    situation: prob.situation,
    questions: JSON.stringify(prob.questions),
    lang: prob.lang,
  };
  try {
    await gasPost(entry);
    const existIdx = thinkingSt.past.findIndex(p => String(p.id) === String(prob.id));
    if (existIdx >= 0) thinkingSt.past[existIdx] = entry;
    else thinkingSt.past.unshift(entry);
  } catch (e) {
    console.error('sync failed', e);
  }
}

// ── トースト ─────────────────────────────────────────
function showThinkingToast(msg) {
  const el = document.getElementById('thinking-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ── 言語切り替え（thinking.html用） ─────────────────
function setLang(lang) {
  applyThinkingLang(lang);
}

// ── DOMContentLoaded ──────────────────────────────────
document.addEventListener('DOMContentLoaded', initThinking);
