import { A_ARTICLE_LENGTH, addIndustryConstraintToPrompts } from '../domain/logic-domain.js';
import { callClaude, normalizeAmeFromModel, safeJSON } from '../services/api.js';
import { buildPersonaPromptNote } from '../services/persona.js';
import { buildThemeInFromDocType } from './themeHelpers.js';

function getAmePrompts(lang) {
  const ja = {
    1: '難易度1・帰納型: 事実のみ300-400字。設問：雨・傘2問。',
    2: '難易度2: 事実のみ。空・雨・傘3問。',
    3: '難易度3: 事実と解釈混在。空・雨・傘。',
    4: '難易度4: 演繹または帰納。5問構成。',
    5: '難易度5: 高度な演繹/帰納。5問。',
  };
  const en = {
    1: 'Difficulty 1 inductive: facts only 300-400 chars. Rain + Umbrella.',
    2: 'Difficulty 2: Sky, Rain, Umbrella.',
    3: 'Difficulty 3: mixed facts and interpretations.',
    4: 'Difficulty 4: deductive or inductive.',
    5: 'Difficulty 5: advanced.',
  };
  return addIndustryConstraintToPrompts(lang === 'ja' ? ja : en);
}

/**
 * @param {object} state
 * @returns {Promise<object>}
 */
export async function generateAmeProblem(state) {
  const isEN = state.lang === 'en';
  const themeIn = buildThemeInFromDocType(state, 'a', isEN);
  const diff = state.aDiff;
  const sys = isEN
    ? 'You are an expert in structured thinking (AME). Respond ONLY in valid JSON.'
    : 'あなたは空雨傘思考の専門家です。JSON形式のみで返答してください。';
  const jsonInst = isEN
    ? `{"theme":"...","article":"~${A_ARTICLE_LENGTH} chars","law":null,"constraint":null,"questions":[{"type":"Rain","question":"...","targetChars":150}]}`
    : `{"theme":"...","article":"約${A_ARTICLE_LENGTH}字","law":null,"constraint":null,"questions":[{"type":"雨","question":"...","targetChars":150}]}`;
  const beProblemHolder = {};
  const raw = await callClaude(
    `${getAmePrompts(state.lang)[diff]}\nTheme: ${themeIn || 'auto'}\n${jsonInst}${buildPersonaPromptNote(state, isEN)}`,
    sys,
    2000,
    0.9,
    {
      mode: 'generate',
      service: 'logic',
      tab: 'ame',
      theme: themeIn || 'auto',
      onProblemId: (id) => {
        beProblemHolder.id = id;
      },
    }
  );
  if (!raw) throw new Error('Empty response');
  const p = normalizeAmeFromModel(safeJSON(raw));
  if (!p.article || !p.questions?.length) throw new Error('Invalid JSON');
  return {
    ...p,
    id: Date.now(),
    beProblemId: beProblemHolder.id || null,
    theme: p.theme || themeIn?.slice(0, 20) || '—',
    diff,
    date: new Date().toISOString(),
    industry: state.industry || '',
    feedback: null,
    lang: state.lang,
  };
}

/**
 * @param {object} prob
 * @param {string} answersText
 * @returns {Promise<string>}
 */
export async function gradeAmeProblem(prob, answersText) {
  const isEN = prob.lang === 'en';
  const sys = isEN
    ? 'You are an expert educator. Give markdown feedback in English. Start with 【Score: XX/100】'
    : 'あなたは教育専門家です。マークダウンで日本語フィードバック。最初の行に【スコア：XX/100】';
  const prompt = isEN
    ? `Grade AME answers.\nArticle: ${prob.article}\nAnswers:\n${answersText}`
    : `空雨傘の回答を採点。\n記事: ${prob.article}\n回答:\n${answersText}`;
  return callClaude(prompt, sys, 3750, 0.3, {
    mode: 'score',
    service: 'logic',
    problem_id: prob.beProblemId || null,
    user_answer: answersText,
    context: { tab: 'ame' },
    markdownResponse: true,
  });
}

export function buildAmePastEntry(prob) {
  return {
    id: prob.id || Date.now(),
    sheet: 'ame',
    theme: prob.theme || '—',
    diff: prob.diff,
    date: prob.date,
    industry: prob.industry || '',
    article: prob.article || '',
    questions: JSON.stringify(prob.questions || []),
    lang: prob.lang,
  };
}
