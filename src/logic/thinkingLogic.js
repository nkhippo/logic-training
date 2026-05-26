import {
  THINKING_CORES,
  THINKING_TYPES,
  THINKING_CORE_DEFAULT_USER_CORE,
  THINKING_SITUATION_PARAMS,
  THINKING_SCORE_CRITERIA,
  THINKING_FINAL_Q_CRITERIA,
  LOGIC_CHECK_MAP,
} from '../domain/thinking-domain.js';
import { ENABLE_REFLECTION } from '../domain/constants.js';
import { INDUSTRY_PRESETS } from '../domain/industry-persona.js';
import { callClaude, safeJSON } from '../services/api.js';
import { buildPersonaPromptNote } from '../services/persona.js';

/**
 * @param {number} level
 * @param {number} stepIdx
 * @returns {'answer'|'define'|'typeselect'|'define2'}
 */
export function getThinkingStepMode(level, stepIdx) {
  if (level === 4 && stepIdx === 0) return 'define';
  if ((level === 3 && stepIdx === 0) || (level === 4 && stepIdx === 1)) return 'typeselect';
  if (level === 2 && stepIdx === 0) return 'define2';
  return 'answer';
}

/**
 * @param {number} level
 * @returns {number}
 */
export function getThinkingStepCount(level) {
  if (level === 1) return 1;
  if (level === 4) return 3;
  return 2;
}

/**
 * @param {object} prob
 * @param {number} stepIdx
 * @param {string} mode
 * @returns {boolean}
 */
export function isLastAnswerStep(prob, stepIdx, mode) {
  return mode === 'answer';
}

/**
 * @param {string} coreValue
 * @param {number[]} typeIds
 * @param {boolean} isEN
 * @returns {string}
 */
export function buildLogicCheckPrompt(coreValue, typeIds, isEN) {
  const lang = isEN ? 'en' : 'ja';
  const checks = [
    ...(LOGIC_CHECK_MAP.common[lang] || []),
    ...(typeIds || []).flatMap((id) => LOGIC_CHECK_MAP.types[id]?.[lang] || []),
    ...(LOGIC_CHECK_MAP.cores[coreValue]?.[lang] || []),
  ];
  const unique = [...new Set(checks)];
  return unique.map((c, i) => `${i + 1}. ${c}`).join('\n');
}

/**
 * @param {object} opts
 * @returns {Promise<object>}
 */
export async function generateThinkingProblem(opts) {
  const { lang, diff, level, core, industry, personas, tenure } = opts;
  const isEN = lang === 'en';
  const langKey = isEN ? 'en' : 'ja';
  const coreValue =
    core || THINKING_CORES[langKey][Math.floor(Math.random() * THINKING_CORES[langKey].length)].value;
  const coreObj = THINKING_CORES[langKey].find((c) => c.value === coreValue);
  const params = THINKING_SITUATION_PARAMS[diff];
  const personaNote = buildPersonaPromptNote({ personas, tenure }, isEN);
  const industryNote = industry
    ? isEN
      ? ` Industry: ${INDUSTRY_PRESETS.en.find((p) => p.value === industry)?.label}.`
      : ` 業界：${INDUSTRY_PRESETS.ja.find((p) => p.value === industry)?.label}。`
    : '';
  const typeIds = coreObj.types;
  const typeDescs = typeIds.map((id) => THINKING_TYPES[langKey].find((t) => t.id === id));
  const sys = isEN
    ? 'You are an expert in business thinking training. Respond ONLY in valid JSON.'
    : 'あなたはビジネス思考トレーニングの専門家です。JSON形式のみで返答してください。';
  const ambiguityDesc = isEN
    ? { low: 'relatively clear', medium: 'some ambiguity', high: 'fragmented', very_high: 'highly fragmented' }[
        params.ambiguity
      ]
    : { low: '比較的明確', medium: '一部曖昧', high: '断片的', very_high: '高度に断片的' }[params.ambiguity];
  const prompt = isEN
    ? `Core: ${coreObj.label}. Difficulty ${diff}/5. ${ambiguityDesc}. ${params.minChars}-${params.maxChars} chars.${industryNote}${personaNote}\nTypes: ${typeDescs.map((t) => t.label).join(', ')}\nReturn JSON: {"theme":"...","situation":"...","extraInfo":null,"questions":[{"typeId":1,"question":"...","targetChars":200}]}`
    : `核心：${coreObj.label}。難易度${diff}/5。${ambiguityDesc}。${params.minChars}〜${params.maxChars}字。${industryNote}${personaNote}\nタイプ：${typeDescs.map((t) => t.label).join('、')}\nJSON: {"theme":"...","situation":"...","extraInfo":null,"questions":[{"typeId":1,"question":"...","targetChars":200}]}`;
  const beProblemHolder = {};
  const raw = await callClaude(prompt, sys, 2000, 0.9, {
    mode: 'generate',
    service: 'thinking',
    thinking_type: 'type1',
    level,
    theme: coreObj.label,
    onProblemId: (id) => {
      beProblemHolder.id = id;
    },
  });
  if (!raw) throw new Error('Empty response');
  const p = safeJSON(raw);
  if (!p.situation) throw new Error('Invalid JSON');
  return {
    id: Date.now(),
    beProblemId: beProblemHolder.id || null,
    core: coreValue,
    diff,
    level,
    date: new Date().toISOString(),
    industry: industry || '',
    lang,
    situation: p.situation,
    theme: p.theme || coreObj.label,
    questions: p.questions || [],
    extraInfo: p.extraInfo || null,
    userCore: THINKING_CORE_DEFAULT_USER_CORE[langKey][coreValue] || '',
    finalQuestion: '',
    finalAnswer: '',
    finalScore: 0,
    finalRetried: false,
    steps: [],
    currentStepIdx: 0,
    reflectionStep: 0,
    done: false,
    phase: 'steps',
    feedback: null,
  };
}

/**
 * @param {object} prob
 * @param {number} stepIdx
 * @param {string} mode
 * @param {string} answer
 * @returns {Promise<object>}
 */
export async function gradeThinkingStep(prob, stepIdx, mode, answer) {
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const coreObj = THINKING_CORES[lang].find((c) => c.value === prob.core);
  const level = prob.level;
  const criteriaKey = `level${level}`;
  const criteria = THINKING_SCORE_CRITERIA[criteriaKey]?.[lang];
  const logicChecks = buildLogicCheckPrompt(prob.core, prob.questions.map((q) => q.typeId), isEN);

  const userCoreInstruction = (() => {
    if (level === 1) return '';
    if (mode === 'define' && level === 4) {
      return isEN
        ? '\nExtract the user-defined question in one sentence and return it as "userCore".'
        : '\n回答者が定義した問いを1文で抽出して "userCore" に入れてください。';
    }
    if (mode === 'typeselect' && level === 3) {
      return isEN
        ? '\nFrom the user\'s selection rationale, summarize the question they appear to be solving in one sentence as "userCore".'
        : '\n回答者の選択理由から、解こうとしている問いを1文に要約して "userCore" に入れてください。';
    }
    if (mode === 'define2' && level === 2) {
      return isEN
        ? '\nFrom the user\'s definitions, summarize the underlying question they are solving in one sentence as "userCore".'
        : '\n回答者の定義から、解こうとしている問いを1文に要約して "userCore" に入れてください。';
    }
    return '';
  })();

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
${criteria?.required?.map((c, i) => `${i + 1}. ${c}`).join('\n') || ''}

Bonus criteria (20pts each, max 40pts):
${criteria?.bonus?.map((c, i) => `${i + 1}. ${c}`).join('\n') || ''}

Logic checks:
${logicChecks}
${userCoreInstruction}
${mode === 'typeselect' ? 'Evaluate whether the selected types and order are appropriate for this question core.' : ''}

Return ONLY this JSON:
{
  "score": <0-100>,
  "pass": <true if score>=80>,
  "missing": ["thinking type labels that were missing or insufficient"],
  "logicIssues": ["specific logic problems found"],
  "reason": "1-2 sentence evaluation summary",
  "userCore": ""
}`
    : `ビジネス思考トレーニングの回答を採点してください。

状況：${prob.situation}
問いの核心：${coreObj?.label}——「${coreObj?.desc}」
レベル：${level}
モード：${mode}
ユーザーの回答：${answer}

必須項目（各20点・計60点）：
${criteria?.required?.map((c, i) => `${i + 1}. ${c}`).join('\n') || ''}

加点項目（各20点・計40点）：
${criteria?.bonus?.map((c, i) => `${i + 1}. ${c}`).join('\n') || ''}

論理整合性チェック：
${logicChecks}
${userCoreInstruction}
${mode === 'typeselect' ? '選択したタイプと順序が問いの核心に対して適切かを評価してください。' : ''}

返答はJSONのみ：
{
  "score": <0〜100>,
  "pass": <80点以上ならtrue>,
  "missing": ["不足していた・不十分だった思考タイプのラベル"],
  "logicIssues": ["見つかった論理の問題を具体的に"],
  "reason": "判定理由を1〜2文で",
  "userCore": ""
}`;

  const raw = await callClaude(prompt, sys, 600, 0.3, {
    mode: 'score',
    service: 'thinking',
    problem_id: prob.beProblemId || null,
    thinking_type: 'type1',
    level,
    user_answer: answer,
    context: {
      original_problem: prob.situation,
      thinking_type: 'type1',
      level,
    },
    jsonResponse: true,
  });
  return safeJSON(raw);
}

/**
 * @param {object} prob
 * @param {object} result
 * @param {'soft'|'strong'} strength
 * @returns {Promise<string>}
 */
export async function generateThinkingFollowup(prob, result, strength) {
  const isEN = prob.lang === 'en';
  const missingType = result.missing?.[0] || '';
  const logicIssue = result.logicIssues?.[0] || '';
  const stepAnswer = prob.steps[prob.currentStepIdx]?.answer || '';

  const sys = isEN
    ? 'You are a manager reviewing a subordinate\'s analysis. Give one focused follow-up question. Do NOT give the answer. 2-3 sentences max.'
    : 'あなたは部下の分析をレビューする上司です。答えは教えず、1点だけ的を絞った問い返しをしてください。2〜3文以内で返してください。';

  const prompt = isEN
    ? `Situation: ${prob.situation}
User's response: ${stepAnswer}
Missing/weak area: ${missingType || logicIssue}
Strength of follow-up: ${strength === 'strong' ? 'Direct and pressing' : 'Gentle nudge'}
Generate one focused question to help the user realize what they missed.`
    : `状況：${prob.situation}
ユーザーの回答：${stepAnswer}
不足・弱い点：${missingType || logicIssue}
問い返しの強さ：${strength === 'strong' ? '直接的・明確に' : '穏やかに'}
見落としに気づかせるための問い返しを1つ生成してください。`;

  return callClaude(prompt, sys, 300, 0.7);
}

/**
 * @param {object} prob
 * @param {number} stepIdx
 * @returns {Promise<string>}
 */
export async function generateThinkingClosingFeedback(prob, stepIdx) {
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const coreObj = THINKING_CORES[lang].find((c) => c.value === prob.core);
  const step = prob.steps[stepIdx];

  const sys = isEN
    ? 'You are a business thinking coach. Provide constructive closing feedback. Use markdown.'
    : 'あなたはビジネス思考のコーチです。前向きな打ち切りフィードバックを提供してください。マークダウンを使ってください。';

  const prompt = isEN
    ? `The user was unable to reach 80 points after 2 attempts.

Situation: ${prob.situation}
Core question: ${coreObj?.label}
User's responses: ${JSON.stringify(prob.steps.map((s) => s?.answer))}
Missing areas: ${JSON.stringify(step?.missing)}

Provide feedback with:
## What was solid
## What was missing and why it matters
## One thing to focus on next time`
    : `ユーザーが2回の試みで80点に達しませんでした。

状況：${prob.situation}
問いの核心：${coreObj?.label}
ユーザーの回答：${JSON.stringify(prob.steps.map((s) => s?.answer))}
不足していた点：${JSON.stringify(step?.missing)}

以下の構成でフィードバックしてください：
## できていたこと
## 不足していた点とその理由
## 次回意識すべき1点`;

  return callClaude(prompt, sys, 800, 0.3, { markdownResponse: true });
}

/**
 * @param {object} prob
 * @returns {Promise<string>}
 */
export async function generateThinkingFinalQuestion(prob) {
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
  return (
    raw?.trim() ||
    (isEN
      ? 'Based on your analysis, what is the core issue and what should be done next? (2 sentences or less, 100 characters)'
      : 'ここまでの分析を踏まえて、この状況の本質は何か・次に何をすべきかを2文・100字以内でまとめてください。')
  );
}

/**
 * @param {object} prob
 * @returns {Promise<object>}
 */
export async function gradeThinkingFinalAnswer(prob) {
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

  const raw = await callClaude(prompt, sys, 300, 0.3, { jsonResponse: true });
  return safeJSON(raw);
}

/**
 * @param {object} prob
 * @param {object|null} finalResult
 * @returns {Promise<string>}
 */
export async function generateThinkingFinalFeedback(prob, finalResult) {
  const isEN = prob.lang === 'en';
  const lang = isEN ? 'en' : 'ja';
  const coreObj = THINKING_CORES[lang].find((c) => c.value === prob.core);
  const allMissing = [...new Set(prob.steps.flatMap((s) => s?.missing || []))];
  const allLogicIssues = [...new Set(prob.steps.flatMap((s) => s?.logicIssues || []))];

  const reflectionInstruction = ENABLE_REFLECTION
    ? isEN
      ? `\n\n## Reflection question\nBased on the response patterns, generate 1-2 questions using one of these patterns:
- Pattern X (missed/confused): "In [step], [specific issue happened]. Looking back, what was your reasoning?"
- Pattern Y (self-critique): "Which moment made you most uncertain about whether you were on the right track?"
- Pattern Z (assumption): "In [step], you proceeded without checking [assumption]. Why didn't you question it?"`
      : `\n\n## 振り返り\n回答パターンをもとに、以下のいずれかのパターンで1〜2問を生成してください：
- パターンX（省略・混同）：「[ステップ]で[具体的な問題]がありました。そのときの判断の根拠を振り返ってみてください。」
- パターンY（自己批判）：「今回の回答全体で、最も「本当にこれで良いか」と迷った場面はどこですか？」
- パターンZ（思い込み）：「[ステップ]で[前提]を確認せずに進んだ場面がありました。なぜそこを疑わなかったと思いますか？」`
    : '';

  const sys = isEN
    ? 'You are a business thinking coach. Provide structured final feedback. Use markdown.'
    : 'あなたはビジネス思考のコーチです。構造的な最終フィードバックを提供してください。マークダウンを使ってください。';

  const prompt = isEN
    ? `Provide final feedback for this thinking training session.

Situation: ${prob.situation}
Core question: ${coreObj?.label} — "${coreObj?.desc}"
Level: ${prob.level}
Missing thinking areas: ${allMissing.join(', ') || 'none'}
Logic issues: ${allLogicIssues.join(', ') || 'none'}
Final answer: ${prob.finalAnswer || '(skipped)'}
Final answer score: ${finalResult?.score || prob.finalScore || 'N/A'}

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
最終回答：${prob.finalAnswer || '（スキップ）'}
最終回答スコア：${finalResult?.score || prob.finalScore || 'N/A'}

## できていたこと
## 不足していた視点とその影響（具体的に）
## 論理の整合性への指摘
## 別の考え方の提示
## まとめの問いへの評価${reflectionInstruction}`;

  return callClaude(prompt, sys, 2000, 0.3, { markdownResponse: true });
}

/**
 * @param {object} prob
 * @param {number} round
 * @param {string} answer
 * @returns {Promise<string>}
 */
export async function generateThinkingReflectionFeedback(prob, round, answer) {
  const isEN = prob.lang === 'en';
  const isFinal = round >= 2;

  const sys = isEN
    ? `You are a business thinking coach. ${isFinal ? 'Provide closing reflection feedback without asking more questions.' : 'Provide feedback and one deeper follow-up question. Always end with a question.'}`
    : `あなたはビジネス思考のコーチです。${isFinal ? 'これ以上問い返しをせず、まとめのアドバイスを提供してください。' : 'フィードバックと1つの深掘り問いかけを提供してください。必ず問いかけで締めてください。'}`;

  const prompt = isEN
    ? `User's reflection response: "${answer}"

Situation context: ${prob.situation}
Core question: ${prob.userCore}

${
  isFinal
    ? 'Provide closing feedback with one key insight they can take away from this session. No more questions.'
    : `Determine if the user is asking a question. If yes, answer it and add a deeper follow-up question.
     If no, give feedback on their reflection and add a deeper follow-up question.
     End with a question.`
}`
    : `振り返りへの回答：「${answer}」

状況：${prob.situation}
問いの核心：${prob.userCore}

${
  isFinal
    ? 'このセッションを通じて持ち帰れる気づきを1つ示して締めくくってください。問い返しはしません。'
    : `回答に質問が含まれているかを判断してください。含まれている場合は答えた上で深掘り問いかけを追加。
     含まれていない場合は振り返りへのフィードバックと深掘り問いかけを提供。
     必ず問いかけで締めてください。`
}`;

  return callClaude(prompt, sys, 500, 0.7, { markdownResponse: true });
}

/**
 * @param {string} feedback
 * @param {string} lang
 * @returns {string}
 */
export function extractReflectionPrompt(feedback, lang) {
  if (!feedback) return '';
  const isEN = lang === 'en';
  const pattern = isEN
    ? /##\s*Reflection[^\n]*\n([\s\S]*?)(?=\n##|$)/i
    : /##\s*振り返り[^\n]*\n([\s\S]*?)(?=\n##|$)/i;
  const match = feedback.match(pattern);
  return match ? match[1].trim() : '';
}

export function buildThinkingPastEntry(prob) {
  return {
    id: prob.id,
    sheet: 'thinking',
    core: prob.core,
    diff: prob.diff,
    level: prob.level,
    date: prob.date,
    industry: prob.industry || '',
    situation: prob.situation,
    questions: JSON.stringify(prob.questions || []),
    theme: prob.theme || '',
    lang: prob.lang,
  };
}
