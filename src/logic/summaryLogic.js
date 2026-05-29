import {
  S_LENGTH_FIXED,
  S_LENGTH_VARIABLE,
  S_RATIO,
  calcBlocks,
  getSumQuestionTypes,
  buildSummaryGradePrompt,
  addIndustryConstraintToPrompts,
} from '../domain/logic-domain.js';
import { DEFAULT_S_VOLUME } from '../domain/constants.js';
import { callClaude, callClaudeMsg, fileToBase64, safeJSON } from '../services/api.js';
import { buildPersonaPromptNote } from '../services/persona.js';
import { buildThemeInFromDocType } from './themeHelpers.js';

const SUM_FORMAT_NOTE_JA =
  '文章の書式ルール：\n- 段落の冒頭は全角スペース「　」を1つ入れてインデントすること\n- 段落の区切りには改行を入れること';
const SUM_FORMAT_NOTE_EN =
  'Formatting rules:\n- Indent the first line of each paragraph\n- Add a line break between paragraphs';

function buildThemeInst(themeIn, length, isEN) {
  if (!themeIn) {
    return isEN
      ? `Create one reading passage of approximately ${length} characters.`
      : `約${length}文字の読解用文章（問題文）を1つ作成してください。`;
  }
  return isEN
    ? `Create one reading passage of about ${length} characters on: "${themeIn}".`
    : `テーマ「${themeIn}」について、約${length}文字の読解用文章を1つ作成してください。`;
}

function getSumPrompts(lang) {
  const prompts =
    lang === 'ja'
      ? {
          1: '難易度1: 社内メール。設問：主張のまとめ1問。約60%圧縮可能な構造。',
          2: '難易度2: 議事録。設問2問。約50%圧縮。',
          3: '難易度3: 提案書一節。設問3問。約40%圧縮。',
          4: '難易度4: 分析レポート。設問3問。約30%圧縮。',
          5: '難易度5: 経営戦略文書。設問3問。約20%圧縮。',
        }
      : {
          1: 'Difficulty 1: Internal email. 1 summary question. ~60% compression.',
          2: 'Difficulty 2: Minutes. 2 questions. ~50%.',
          3: 'Difficulty 3: Proposal excerpt. 3 questions. ~40%.',
          4: 'Difficulty 4: Analysis report. 3 questions. ~30%.',
          5: 'Difficulty 5: Strategy document. 3 questions. ~20%.',
        };
  return addIndustryConstraintToPrompts(prompts, lang);
}

/**
 * @param {object} state
 * @returns {Promise<object>}
 */
export async function generateSummaryProblem(state) {
  const isEN = state.lang === 'en';
  const themeIn = buildThemeInFromDocType(state, 's', isEN);
  const diff = state.sDiff;
  const length =
    diff <= 3 ? S_LENGTH_FIXED[diff] : S_LENGTH_VARIABLE[state.sVolume || DEFAULT_S_VOLUME].chars;
  const numQ = calcBlocks(diff);
  const ratio = S_RATIO[diff];
  const sys = isEN
    ? 'You are an expert in business writing education. Respond ONLY in valid JSON.'
    : 'あなたはビジネス文書の読解の教育専門家です。必ずJSON形式のみで返答してください。';
  const themeInst = buildThemeInst(themeIn, length, isEN);
  const types = getSumQuestionTypes(diff);
  const typeGuide = isEN
    ? `Generate exactly ${numQ} questions. Types: ${types.join(', ')}.`
    : `設問は${numQ}問。タイプ: ${types.join('、')}。`;
  const jsonInst = isEN
    ? `Return ONLY: {"theme":"...","text":"passage ~${length} chars","questions":[{"id":1,"type":"用語の説明","question":"...","targetChars":50}]}`
    : `返答JSONのみ: {"theme":"...","text":"約${length}字","questions":[{"id":1,"type":"主張のまとめ","question":"...","targetChars":80}]}`;
  const beProblemHolder = {};
  const raw = await callClaude(
    `${themeInst}\n${getSumPrompts(state.lang)[diff]}\n${typeGuide}\n${jsonInst}\n${isEN ? SUM_FORMAT_NOTE_EN : SUM_FORMAT_NOTE_JA}${buildPersonaPromptNote(state, isEN)}`,
    sys,
    length <= 500 ? 1200 : length <= 2000 ? 3000 : 6000,
    0.9,
    {
      mode: 'generate',
      service: 'logic',
      tab: 'summary',
      theme: themeIn || 'auto',
      onProblemId: (id) => {
        beProblemHolder.id = id;
      },
    }
  );
  if (!raw) throw new Error('Empty response');
  const p = safeJSON(raw);
  if (!p.text || !Array.isArray(p.questions) || !p.questions.length) {
    throw new Error('Invalid JSON');
  }
  const questions = p.questions.map((q, i) => ({
    id: q.id || i + 1,
    type: q.type || '主張のまとめ',
    question: q.question || '',
    targetChars: parseInt(q.targetChars, 10) || 50,
  }));
  return {
    id: Date.now(),
    beProblemId: beProblemHolder.id || null,
    theme: p.theme || (themeIn ? themeIn.slice(0, 20) : ''),
    diff,
    date: new Date().toISOString(),
    industry: state.industry || '',
    text: p.text,
    questions,
    ratio,
    length,
    sVolume: diff >= 4 ? state.sVolume || DEFAULT_S_VOLUME : null,
    feedback: null,
    lang: state.lang,
  };
}

/**
 * @param {object} prob
 * @param {string[]} userTexts
 * @returns {Promise<string>}
 */
export async function gradeSummaryProblem(prob, userTexts) {
  const isEN = (prob.lang || 'ja') === 'en';
  const sys = isEN
    ? 'You are an expert educator. Give markdown feedback in English.'
    : 'あなたは教育専門家です。マークダウンで日本語フィードバックしてください。';
  const prompt = buildSummaryGradePrompt(prob, userTexts);
  return callClaude(prompt, sys, 3750, 0.3, {
    mode: 'score',
    service: 'logic',
    problem_id: prob.beProblemId || null,
    user_answer: userTexts.join('\n'),
    context: { tab: 'summary', original_problem: prob.text || '' },
    markdownResponse: true,
  });
}

/**
 * @param {object} prob
 * @param {File} imageFile
 * @returns {Promise<string>}
 */
export async function gradeSummaryProblemImage(prob, imageFile) {
  const isEN = (prob.lang || 'ja') === 'en';
  const sys = isEN
    ? 'You are an expert educator. Read the submitted image and give markdown feedback in English.'
    : 'あなたは教育専門家です。提出画像を読み取り、マークダウンで日本語フィードバックしてください。';
  const p = {
    ...prob,
    questions: Array.isArray(prob.questions) ? prob.questions : [],
  };
  const questionList = p.questions
    .map((q, i) =>
      isEN
        ? `Question ${q.id || i + 1}: ${q.question || ''} (target: ${q.targetChars || 50} chars)`
        : `設問${q.id || i + 1}: ${q.question || ''}（目標: ${q.targetChars || 50}文字以内）`
    )
    .join('\n');
  const prompt = isEN
    ? `[Passage]\n${p.text || ''}\n\n[Questions]\n${questionList}\n\nRead the learner's answers from the attached image. If some text is unreadable, state that explicitly. Grade each question individually on accuracy, conciseness, expression, and logical selection, then provide improved examples within the character limits and overall feedback.`
    : `【問題文】\n${p.text || ''}\n\n【設問】\n${questionList}\n\n添付画像から学習者の回答を読み取ってください。読み取れない箇所がある場合は、その旨を明記してください。各設問ごとに「内容の正確さ・簡潔さ・表現・論理的取捨選択」で評価し、文字数以内の改善例と総合講評を示してください。`;
  const base64 = await fileToBase64(imageFile);
  const feedback = await callClaudeMsg(
    sys,
    [
      { type: 'text', text: prompt },
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageFile.type || 'image/jpeg',
          data: base64,
        },
      },
    ],
    3750,
    0.3
  );
  if (!feedback) throw new Error('Empty response');
  return feedback;
}

export function buildSummaryPastEntry(prob) {
  return {
    id: prob.id || Date.now(),
    sheet: 'summary',
    theme: prob.theme || '—',
    diff: prob.diff,
    date: prob.date,
    industry: prob.industry || '',
    text: prob.text || '',
    questions: JSON.stringify(prob.questions || []),
    ratio: prob.ratio,
    lang: prob.lang,
  };
}
