import CONFIG from './config.js';
import { getUserId } from './user.js';

/**
 * @returns {boolean}
 */
export function useBackendApi() {
  return !!(CONFIG.USE_BACKEND_API && CONFIG.API_BASE_URL);
}

/**
 * @returns {string}
 */
export function backendUserId() {
  return getUserId();
}

/**
 * @param {string} path
 * @param {object} body
 * @returns {Promise<object>}
 */
export async function beFetchJson(path, body) {
  const base = String(CONFIG.API_BASE_URL || '').replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const msg = data.message || data.error || `API error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * @param {object} payload
 * @returns {Promise<{problem_id?: string, content?: string}>}
 */
export async function beGenerateProblem(payload) {
  return beFetchJson('/api/generate-problem', payload);
}

/**
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function beScoreAnswer(payload) {
  return beFetchJson('/api/score-answer', payload);
}

/**
 * @param {object} payload
 * @returns {Promise<{content?: string}>}
 */
export async function beComplete(payload) {
  return beFetchJson('/api/complete', payload);
}

/**
 * Claude 呼び出し（BE 経由）
 * @param {string} prompt
 * @param {string} sys
 * @param {number} [maxTok]
 * @param {number} [temperature]
 * @param {object|null} [beOpts]
 * @returns {Promise<string|null>}
 */
export async function callClaude(prompt, sys, maxTok = 2500, temperature = 0.9, beOpts = null) {
  if (beOpts && useBackendApi()) {
    if (beOpts.mode === 'generate') {
      const data = await beGenerateProblem({
        service: beOpts.service,
        tab: beOpts.tab,
        thinking_type: beOpts.thinking_type,
        level: beOpts.level,
        theme: beOpts.theme || 'auto',
        user_id: backendUserId(),
        system_prompt: sys,
        user_prompt: prompt,
        max_tokens: maxTok,
        temperature,
      });
      if (typeof beOpts.onProblemId === 'function' && data.problem_id) {
        beOpts.onProblemId(data.problem_id);
      }
      return data.content || '';
    }
    if (beOpts.mode === 'score') {
      const data = await beScoreAnswer({
        service: beOpts.service,
        problem_id: beOpts.problem_id || null,
        user_answer: beOpts.user_answer,
        user_id: backendUserId(),
        context: beOpts.context,
        system_prompt: sys,
        user_prompt: prompt,
        max_tokens: maxTok,
        temperature,
      });
      if (beOpts.markdownResponse || beOpts.jsonResponse) {
        return data.raw_text || data.feedback || '';
      }
      return data.feedback || '';
    }
  }
  if (useBackendApi()) {
    const data = await beComplete({
      system_prompt: sys,
      user_prompt: prompt,
      max_tokens: maxTok,
      temperature,
      user_id: backendUserId(),
    });
    return data.content || '';
  }
  return callClaudeMsg(sys, prompt, maxTok, temperature);
}

/**
 * @param {string} sys
 * @param {string|Array} content
 * @param {number} [maxTok]
 * @param {number} [temperature]
 * @returns {Promise<string|null>}
 */
export async function callClaudeMsg(sys, content, maxTok = 2500, temperature = 0.9) {
  if (useBackendApi()) {
    const payload = {
      system_prompt: sys,
      max_tokens: maxTok,
      temperature,
      user_id: backendUserId(),
    };
    if (Array.isArray(content)) {
      payload.user_content = content;
    } else {
      payload.user_prompt = String(content || '');
    }
    const data = await beComplete(payload);
    return data.content || '';
  }
  return null;
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(new Error('Failed to read image'));
    r.readAsDataURL(file);
  });
}

/**
 * @param {string} raw
 * @returns {object}
 */
export function parseModelJSON(raw) {
  const s = String(raw || '').trim();
  const tryParse = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    const p = tryParse(fenced[1].trim());
    if (p) return p;
  }
  const direct = tryParse(s);
  if (direct) return direct;
  const start = s.indexOf('{');
  if (start >= 0) {
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < s.length; i++) {
      const c = s[i];
      if (inStr) {
        if (esc) esc = false;
        else if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') {
        inStr = true;
        continue;
      }
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          const p = tryParse(s.slice(start, i + 1));
          if (p) return p;
          break;
        }
      }
    }
  }
  const m = s.match(/\{[\s\S]*\}/);
  if (m) {
    const p = tryParse(m[0]);
    if (p) return p;
  }
  throw new Error('JSON not found');
}

export function safeJSON(raw) {
  return parseModelJSON(raw);
}

/**
 * @param {object} p
 * @returns {object}
 */
export function normalizeFillFromModel(p) {
  const root = p?.problem || p?.data || p || {};
  let text = String(root.text || root.passage || root.content || root.article || '').trim();
  let answers = root.answers;
  if (!Array.isArray(answers) && Array.isArray(root.blanks)) {
    answers = root.blanks.map((b) =>
      typeof b === 'string' ? b : b?.answer || b?.correct || b?.word || b?.value || ''
    );
  }
  if (!Array.isArray(answers)) answers = [];
  answers = answers
    .map((a) => (typeof a === 'string' ? a : a?.answer || a?.word || a?.text || ''))
    .filter(Boolean);
  if (text && /\{\{?\d+\}?\}/.test(text)) {
    for (let i = 0; i < answers.length; i++) {
      text = text.replace(new RegExp(`\\{\\{?${i}\\}?\\}`, 'g'), `【_${i + 1}_】`);
    }
  }
  let hints = root.hints;
  if (!Array.isArray(hints) && Array.isArray(root.blanks)) {
    hints = root.blanks.map((b) => b?.hint || '');
  }
  return { ...root, text, answers, hints: Array.isArray(hints) ? hints : [] };
}

/**
 * @param {object} p
 * @returns {object}
 */
export function normalizeAmeFromModel(p) {
  const root = p?.problem || p?.data || p?.result || p || {};
  const pick = (obj) => {
    const article = String(obj.article || obj.text || obj.passage || obj.body || obj.content || obj.記事 || '').trim();
    let questions = obj.questions || obj.設問 || obj.items || obj.prompts;
    if (typeof questions === 'string') questions = parseF(questions);
    if (!Array.isArray(questions) && questions && typeof questions === 'object') {
      questions = Object.values(questions);
    }
    if (!Array.isArray(questions)) questions = [];
    questions = questions.map((q, i) => {
      if (typeof q === 'string') return { id: i + 1, type: '', question: q, targetChars: 150 };
      return {
        id: q.id || i + 1,
        type: q.type || q.タイプ || '',
        question: q.question || q.q || q.prompt || q.設問 || q.設問文 || '',
        targetChars: parseInt(q.targetChars || q.chars || q.字数, 10) || 150,
      };
    });
    return { article, questions };
  };
  let { article, questions } = pick(root);
  if (!article || !questions.length) {
    for (const v of Object.values(root)) {
      if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
      const nested = pick(v);
      if (nested.article && nested.questions.length) {
        article = nested.article;
        questions = nested.questions;
        break;
      }
    }
  }
  return {
    ...root,
    theme: root.theme,
    article,
    law: root.law || root.法則 || null,
    constraint: root.constraint || root.制約 || null,
    questions,
    form: root.form || root.type || root.形式 || null,
  };
}

/**
 * @param {*} v
 * @returns {Array}
 */
export function parseF(v) {
  if (Array.isArray(v)) return v;
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}
