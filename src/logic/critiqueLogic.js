import { C_TEXT_LENGTH, addIndustryConstraintToPrompts } from '../domain/logic-domain.js';
import { callClaude, safeJSON } from '../services/api.js';
import { buildPersonaPromptNote } from '../services/persona.js';
import { buildThemeInFromDocType } from './themeHelpers.js';

function getCritiquePrompts(lang) {
  const ja = {
    1: '難易度1・B形式: 短い論証3つ。設問は平易な言葉で。',
    2: '難易度2・B形式: 論証3つ。ビジネス状況。',
    3: '難易度3・A形式: 約400字のビジネス文書1本。設問4つ。',
    4: '難易度4・A形式: 分析レポート一節。設問5つ。',
    5: '難易度5・A形式: 経営戦略文書。設問5つ。',
  };
  const en = {
    1: 'Difficulty 1 Form B: 3 short arguments.',
    2: 'Difficulty 2 Form B: 3 arguments.',
    3: 'Difficulty 3 Form A: ~400 char business document.',
    4: 'Difficulty 4 Form A: analysis report excerpt.',
    5: 'Difficulty 5 Form A: strategy document.',
  };
  return addIndustryConstraintToPrompts(lang === 'ja' ? ja : en, lang);
}

/**
 * @param {object} state
 * @returns {Promise<object>}
 */
export async function generateCritiqueProblem(state) {
  const isEN = state.lang === 'en';
  const themeIn = buildThemeInFromDocType(state, 'c', isEN);
  const diff = state.cDiff;
  const form = diff >= 3 ? 'A' : 'B';
  const sys = isEN
    ? 'You are an expert in critical reading. Respond ONLY in valid JSON.'
    : 'あなたは批判読みの専門家です。JSON形式のみで返答してください。';
  const jsonInst =
    form === 'A'
      ? isEN
        ? `{"theme":"...","text":"~${C_TEXT_LENGTH} chars","form":"A","questions":[{"id":1,"type":"...","question":"...","targetChars":120}]}`
        : `{"theme":"...","text":"約${C_TEXT_LENGTH}字","form":"A","questions":[{"id":1,"type":"話の流れの整理","question":"...","targetChars":150}]}`
      : isEN
        ? `{"theme":"...","form":"B","questions":[{"id":1,"argument":"...","question":"...","targetChars":100}]}`
        : `{"theme":"...","form":"B","questions":[{"id":1,"argument":"短い論証","question":"...","targetChars":100}]}`;
  const beProblemHolder = {};
  const raw = await callClaude(
    `${getCritiquePrompts(state.lang)[diff]}\nTheme: ${themeIn || 'auto'}\n${jsonInst}${buildPersonaPromptNote(state, isEN)}`,
    sys,
    2000,
    0.9,
    {
      mode: 'generate',
      service: 'logic',
      tab: 'critique',
      theme: themeIn || 'auto',
      onProblemId: (id) => {
        beProblemHolder.id = id;
      },
    }
  );
  if (!raw) throw new Error('Empty response');
  const p = safeJSON(raw);
  const questions = Array.isArray(p.questions) ? p.questions : [];
  if (!questions.length) throw new Error('Invalid JSON');
  return {
    id: Date.now(),
    beProblemId: beProblemHolder.id || null,
    theme: p.theme || themeIn?.slice(0, 20) || '—',
    diff,
    date: new Date().toISOString(),
    industry: state.industry || '',
    text: p.text || '',
    questions,
    form: p.form || form,
    feedback: null,
    lang: state.lang,
  };
}

/**
 * @param {object} prob
 * @param {string} answersText
 * @returns {Promise<string>}
 */
export async function gradeCritiqueProblem(prob, answersText) {
  const isEN = prob.lang === 'en';
  const sys = isEN
    ? 'You are an expert educator. Give markdown feedback in English. Start with 【Score: XX/100】'
    : 'あなたは教育専門家です。マークダウンで日本語フィードバック。最初の行に【スコア：XX/100】';
  const prompt = isEN
    ? `Grade critical reading answers.\nDocument: ${prob.text || prob.questions?.map((q) => q.argument || q.question).join('\n')}\nAnswers:\n${answersText}`
    : `批判読みの回答を採点。\n${prob.text || ''}\n回答:\n${answersText}`;
  return callClaude(prompt, sys, 3750, 0.3, {
    mode: 'score',
    service: 'logic',
    problem_id: prob.beProblemId || null,
    user_answer: answersText,
    context: { tab: 'critique' },
    markdownResponse: true,
  });
}

export function buildCritiquePastEntry(prob) {
  return {
    id: prob.id || Date.now(),
    sheet: 'critique',
    theme: prob.theme || '—',
    diff: prob.diff,
    date: prob.date,
    industry: prob.industry || '',
    text: prob.text || '',
    questions: JSON.stringify(prob.questions || []),
    form: prob.form || 'B',
    lang: prob.lang,
  };
}
