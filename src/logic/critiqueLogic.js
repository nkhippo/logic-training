import { C_TEXT_LENGTH, addIndustryConstraintToPrompts } from '../domain/logic-domain.js';
import { callClaude, safeJSON } from '../services/api.js';
import { buildPersonaPromptNote } from '../services/persona.js';
import { buildThemeInFromDocType } from './themeHelpers.js';

/**
 * @param {object} prob
 * @returns {object}
 */
export function normCritiqueProb(prob) {
  let questions = prob.questions;
  if (typeof questions === 'string') {
    questions = questions.trim();
    if (questions) {
      try {
        questions = JSON.parse(questions);
      } catch {
        questions = [];
      }
      if (typeof questions === 'string') {
        try {
          questions = JSON.parse(questions);
        } catch {
          questions = [];
        }
      }
    } else {
      questions = [];
    }
  }
  if (!Array.isArray(questions)) questions = [];
  const form = prob.form || (prob.text && String(prob.text).trim() ? 'A' : 'B');
  return { ...prob, text: prob.text || '', questions, form };
}

/**
 * @param {object} prob
 * @param {string[]} userAnswers
 * @returns {string}
 */
function buildCritiqueGradePrompt(prob, userAnswers) {
  const isEN = (prob.lang || 'ja') === 'en';
  const passageSection =
    prob.form === 'A' && prob.text
      ? isEN
        ? `[Passage]\n${prob.text}\n\n`
        : `【問題文】\n${prob.text}\n\n`
      : '';
  const qSection = prob.questions
    .map((q, i) => {
      const ua = userAnswers[i] || '—';
      const argPart =
        prob.form === 'B' && q.argument
          ? isEN
            ? `[Argument]\n${q.argument}\n`
            : `【論証】\n${q.argument}\n`
          : '';
      return isEN
        ? `[Q${q.id || i + 1}] Type: ${q.type}\n${argPart}${q.question}\nTarget: within ${q.targetChars} chars\nLearner's answer:\n${ua}`
        : `【設問${q.id || i + 1}】タイプ: ${q.type}\n${argPart}${q.question}\n目標: ${q.targetChars}字以内\n学習者の回答:\n${ua}`;
    })
    .join('\n\n---\n\n');
  const gradeInst = isEN
    ? `Grade each question on the following axes and provide feedback:\n- Accuracy of gap/condition/flow/stakeholder identification\n- Logical validity of the learner's reasoning in a business context\n- Quality of written response (clarity, conciseness, plain business language)\nProvide an improved example answer within the character limit for each question.\n\n## Per-Question Feedback\n## Overall Feedback`
    : `各設問を以下の軸で採点し、フィードバックしてください。\n- 論理の弱点・前提の欠如・立場による疑問の特定の正確さ\n- 学習者の推論の論理的妥当性（ビジネス文脈）\n- 記述の質（明確さ・簡潔さ・平易なビジネス表現）\n各設問の末尾に、文字数以内の改善例を示してください。\n\n## 設問別フィードバック\n## 総合講評`;
  return `${passageSection}${qSection}\n\n${gradeInst}`;
}

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
 * @param {string[]} userAnswers
 * @returns {Promise<string>}
 */
export async function gradeCritiqueProblem(prob, userAnswers) {
  const p = normCritiqueProb(prob);
  const isEN = p.lang === 'en';
  const sys = isEN
    ? 'You are an expert in business communication and logical thinking education. Give structured feedback in English using markdown. Start with 【Score: XX/100】'
    : 'あなたはビジネスコミュニケーションと論理的思考の教育専門家です。マークダウンを使って構造的に日本語でフィードバックしてください。最初の行に【スコア：XX/100】';
  const prompt = buildCritiqueGradePrompt(p, userAnswers);
  const original = p.form === 'A' && p.text ? p.text : JSON.stringify(p.questions);
  return callClaude(prompt, sys, 3750, 0.3, {
    mode: 'score',
    service: 'logic',
    problem_id: p.beProblemId || null,
    user_answer: userAnswers.join('\n---\n'),
    context: { original_problem: original, tab: 'critique' },
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
