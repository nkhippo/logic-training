import {
  THINKING_CORES,
  THINKING_TYPES,
  THINKING_CORE_DEFAULT_USER_CORE,
  THINKING_SITUATION_PARAMS,
} from '../domain/thinking-domain.js';
import { INDUSTRY_PRESETS } from '../domain/industry-persona.js';
import { callClaude, safeJSON } from '../services/api.js';
import { buildPersonaPromptNote } from '../services/persona.js';

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
    steps: [],
    currentStepIdx: 0,
    reflectionStep: 0,
    finalAnswer: '',
    finalScore: 0,
    done: false,
    feedback: null,
  };
}

/**
 * @param {object} prob
 * @param {number} stepIdx
 * @param {string} answer
 * @returns {Promise<string>}
 */
export async function gradeThinkingStep(prob, stepIdx, answer) {
  const isEN = prob.lang === 'en';
  const sys = isEN
    ? 'You are a thinking skills coach. Give structured markdown feedback in English.'
    : 'あなたは思考スキルのコーチです。マークダウンで日本語フィードバックしてください。';
  const q = prob.questions?.[stepIdx];
  const prompt = isEN
    ? `Grade this thinking step answer.\nSituation: ${prob.situation}\nQuestion: ${q?.question || ''}\nAnswer: ${answer}\nStart with 【Score: XX/100】`
    : `思考ステップの回答を採点してください。\n状況: ${prob.situation}\n設問: ${q?.question || ''}\n回答: ${answer}\n最初の行に【スコア：XX/100】`;
  return callClaude(prompt, sys, 2000, 0.3, {
    mode: 'score',
    service: 'thinking',
    problem_id: prob.beProblemId || null,
    user_answer: answer,
    context: { tab: 'thinking', step: stepIdx },
    markdownResponse: true,
  });
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
