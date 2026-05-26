import {
  addIndustryConstraintToPrompts,
  calcBlanks,
  F_LENGTH,
  gradeMaxTokensByDiff,
} from '../domain/logic-domain.js';
import {
  callClaude,
  normalizeFillFromModel,
  parseModelJSON,
} from '../services/api.js';
import { buildPersonaPromptNote } from '../services/persona.js';
import { buildThemeInFromDocType } from './themeHelpers.js';

const FILL_HINT_NONE_NOTE_JA =
  '\n\n重要：難易度3以上ではhintsフィールドはすべて必ず空文字列("")にしてください。ヒントを含む文字列を返してはいけません。';
const FILL_HINT_NONE_NOTE_EN =
  '\n\nIMPORTANT: For difficulty 3 and above, every hints field must be an empty string (""). Do not return any hint text.';
const FILL_FORMAT_NOTE_JA =
  '文章の書式ルール：\n- 段落の冒頭は全角スペース「　」を1つ入れてインデントすること\n- 段落の区切りには改行を入れること\n- 読みやすさを重視し、1段落は3〜5文程度にまとめること';
const FILL_FORMAT_NOTE_EN =
  'Formatting rules:\n- Indent the first line of each paragraph\n- Add a line break between paragraphs\n- Keep each paragraph to 3-5 sentences for readability';
const FILL_SCORE100_NOTE_JA =
  '\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n採点基準：各設問は均等配点（例：5問なら各20点）。正解は満点、部分的に正しい場合（意味が近い接続詞）は半点、不正解は0点。';
const FILL_SCORE100_NOTE_EN =
  '\n\nStart with 【Score: XX/100】 on the very first line.\nEach question is worth equal points (e.g. 20pts each for 5 questions). Full marks for correct answer, half marks for close alternatives, 0 for incorrect.';

/**
 * @param {string} lang
 * @returns {object}
 */
function getFillPrompts(lang) {
  if (lang === 'ja') {
    return addIndustryConstraintToPrompts({
      1: `難易度1（入門）:\n- 文書タイプ：社内メール・業務連絡（ビジネス文書）\n- 文字数：400〜500字\n- 穴抜き：2個\n- ヒント：各空欄に「逆接」「順接」などの関係性を必ず明記すること`,
      2: `難易度2（基礎）:\n- 文書タイプ：議事録・進捗報告（ビジネス文書）\n- 文字数：400〜500字\n- 穴抜き：3個\n- ヒント：前後の文脈から推測できる軽いヒントを付けること`,
      3: `難易度3（標準）:\n- 文書タイプ：提案書・企画書の一節（ビジネス文書）\n- 文字数：400〜500字\n- 穴抜き：3個\n- ヒント：なし（hintsはすべて空文字列）`,
      4: `難易度4（上級）:\n- 文書タイプ：分析レポート・調査報告（ビジネス文書）\n- 文字数：400〜500字\n- 穴抜き：4個\n- ヒント：なし（hintsはすべて空文字列）`,
      5: `難易度5（超難問）:\n- 文書タイプ：経営戦略文書・コンサルレポート（ビジネス文書）\n- 文字数：400〜500字\n- 穴抜き：5個\n- ヒント：なし（hintsはすべて空文字列）`,
    });
  }
  return addIndustryConstraintToPrompts({
    1: `Difficulty 1 (Beginner):\n- Document type: Internal email / business communication\n- Length: 400-500 characters\n- Blanks: 2\n- Hints: specify the logical relation for each blank`,
    2: `Difficulty 2 (Basic):\n- Document type: Meeting minutes / progress report\n- Length: 400-500 characters\n- Blanks: 3\n- Hints: light contextual hints`,
    3: `Difficulty 3 (Standard):\n- Document type: Proposal excerpt\n- Length: 400-500 characters\n- Blanks: 3\n- Hints: none (all hints must be empty strings)`,
    4: `Difficulty 4 (Advanced):\n- Document type: Analysis report\n- Length: 400-500 characters\n- Blanks: 4\n- Hints: none (all hints must be empty strings)`,
    5: `Difficulty 5 (Master):\n- Document type: Strategy / consulting report\n- Length: 400-500 characters\n- Blanks: 5\n- Hints: none (all hints must be empty strings)`,
  });
}

/**
 * @param {string} themeIn
 * @param {number} length
 * @param {boolean} isEN
 * @returns {string}
 */
function buildThemeInst(themeIn, length, isEN) {
  if (!themeIn) {
    if (isEN) {
      return `Choose a theme from: recent global economic topics, cutting-edge science and technology, or health and medicine. Write a logical text of approximately ${length} characters.`;
    }
    return `テーマは以下のカテゴリから選んでください：最近の世界経済のトピック、科学技術の最前線、健康・医療に関するトピック。約${length}文字の論理的な文章を作成してください。`;
  }
  return isEN
    ? `Create content on the theme "${themeIn}" with about ${length} characters.`
    : `テーマ「${themeIn}」について、約${length}文字の論理的な文章を作成してください。`;
}

/**
 * @param {object} state App state
 * @returns {Promise<object>}
 */
export async function generateFillProblem(state) {
  const isEN = state.lang === 'en';
  const themeIn = buildThemeInFromDocType(state, 'f', isEN);
  const diff = state.fDiff;
  const length = F_LENGTH;
  const blanks = calcBlanks(diff);
  const sys = isEN
    ? 'You are an expert in business writing and logical communication. Respond ONLY in valid JSON format.'
    : 'あなたはビジネス文書の作成と論理的コミュニケーションの専門家です。必ず指定されたJSON形式のみで返答してください。';
  const themeInst = buildThemeInst(themeIn, length, isEN);
  const diffPrompt = getFillPrompts(state.lang)[diff];
  let jsonInst = isEN
    ? `Replace ${blanks} conjunctions with placeholders [_1_][_2_]... Return ONLY this JSON:\n{"theme":"topic in 5 words or less","text":"problem text with placeholders","answers":["conj1"],"hints":["hint1"]}`
    : `接続詞${blanks}個を【_1_】【_2_】...で置き換えてください。\n返答はJSONのみ：\n{"theme":"テーマ","text":"問題文","answers":["接続詞1"],"hints":["ヒント1"]}`;
  if (diff >= 3) jsonInst += isEN ? FILL_HINT_NONE_NOTE_EN : FILL_HINT_NONE_NOTE_JA;
  const personaNote = buildPersonaPromptNote(state, isEN);
  const beProblemHolder = {};
  const raw = await callClaude(
    `${themeInst}\n${diffPrompt}\n${jsonInst}\n${isEN ? FILL_FORMAT_NOTE_EN : FILL_FORMAT_NOTE_JA}${personaNote}`,
    sys,
    1200,
    0.9,
    {
      mode: 'generate',
      service: 'logic',
      tab: 'fill',
      theme: themeIn || 'auto',
      onProblemId: (id) => {
        beProblemHolder.id = id;
      },
    }
  );
  if (!raw) throw new Error('Empty response');
  const p = normalizeFillFromModel(parseModelJSON(raw));
  if (!p.text || !Array.isArray(p.answers) || !p.answers.length) {
    throw new Error('Invalid JSON structure');
  }
  if (isEN) {
    let t = p.text;
    for (let i = 1; i <= p.answers.length; i++) {
      t = t.replace(`[_${i}_]`, `【_${i}_】`);
    }
    p.text = t;
  }
  if (diff >= 3) p.hints = (p.answers || []).map(() => '');
  return {
    ...p,
    id: Date.now(),
    beProblemId: beProblemHolder.id || null,
    theme: p.theme || (themeIn ? themeIn.slice(0, 20) : ''),
    diff,
    date: new Date().toISOString(),
    industry: state.industry || '',
    blanks,
    feedback: null,
    userAnswers: null,
    lang: state.lang,
  };
}

/**
 * @param {object} prob
 * @param {string[]} ua
 * @returns {Promise<string>}
 */
export async function gradeFillProblem(prob, ua) {
  const isEN = prob.lang === 'en';
  const sys = isEN
    ? 'You are an expert educator in business writing. Give structured feedback in English using markdown.'
    : 'あなたはビジネス文書の論理的表現に関する教育専門家です。マークダウンで日本語フィードバックしてください。';
  const ct = prob.answers.reduce((t, a, i) => t.replace(`【_${i + 1}_】`, `[${a}]`), prob.text);
  const prompt = isEN
    ? `${FILL_SCORE100_NOTE_EN}\n\nGrade fill-in-the-blank (Difficulty ${prob.diff}/5).\n[Problem]\n${ct}\n[Correct]\n${prob.answers.map((a, i) => `(${i + 1}) ${a}`).join('\n')}\n[Learner]\n${ua.map((a, i) => `(${i + 1}) ${a}`).join('\n')}`
    : `${FILL_SCORE100_NOTE_JA}\n\n穴埋め問題（難易度${prob.diff}/5）の添削。\n【問題文】${ct}\n【正解】${prob.answers.map((a, i) => `（${i + 1}）${a}`).join('\n')}\n【学習者】${ua.map((a, i) => `（${i + 1}）${a}`).join('\n')}`;
  return callClaude(prompt, sys, gradeMaxTokensByDiff(prob.diff), 0.3, {
    mode: 'score',
    service: 'logic',
    problem_id: prob.beProblemId || null,
    user_answer: ua.join('\n'),
    context: { original_problem: ct, tab: 'fill' },
    markdownResponse: true,
  });
}

/**
 * @param {object} prob
 * @returns {object}
 */
export function buildFillPastEntry(prob) {
  return {
    id: prob.id || Date.now(),
    sheet: 'fill',
    theme: prob.theme || '—',
    diff: prob.diff,
    date: prob.date,
    industry: prob.industry || '',
    text: prob.text,
    answers: prob.answers,
    hints: prob.hints || [],
    feedback: prob.feedback || null,
    userAnswers: prob.userAnswers || [],
    lang: prob.lang,
  };
}
