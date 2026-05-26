import { PERSONA_KEY } from '../domain/constants.js';
import { PERSONA_TENURE_OPTIONS } from '../domain/industry-persona.js';

/**
 * @param {{ personas: Array, tenure: string }} ctx
 * @param {boolean} isEN
 * @returns {string}
 */
export function buildPersonaPromptNote(ctx, isEN) {
  const { personas = [], tenure = '' } = ctx;
  if (!personas.length && !tenure) return '';
  const lang = isEN ? 'en' : 'ja';
  const tenureOptions = PERSONA_TENURE_OPTIONS[lang];
  const tenureLabel = tenureOptions.find((o) => o.value === tenure)?.label || '';
  const personaLines = personas.map((p) => `${p.industry}・${p.role}`).join('、');
  if (isEN) {
    const lines = [];
    if (personaLines) lines.push(`Industry/Role: ${personaLines}`);
    if (tenureLabel) lines.push(`Years of experience: ${tenureLabel}`);
    if (!lines.length) return '';
    return `\n\n[Respondent background]\n${lines.join('\n')}\nGenerate the problem using topics and examples that fit this background. Do NOT change the difficulty level or scoring criteria based on this background.`;
  }
  const lines = [];
  if (personaLines) lines.push(`業界・職種：${personaLines}`);
  if (tenureLabel) lines.push(`勤続年数：${tenureLabel}`);
  if (!lines.length) return '';
  return `\n\n【回答者のバックグラウンド】\n${lines.join('\n')}\nこのバックグラウンドに沿った題材・事例・表現レベルで問題を生成すること。難易度・採点基準はバックグラウンドによって変えないこと。`;
}

/**
 * @returns {{ personas: Array, tenure: string }|null}
 */
export function getPersonaSnapshot(ctx) {
  if (!ctx.personas?.length) return null;
  return { personas: ctx.personas, tenure: ctx.tenure || '' };
}

/**
 * @returns {{ personas: Array, tenure: string }}
 */
export function loadPersonaFromStorage() {
  try {
    const raw = localStorage.getItem(PERSONA_KEY);
    if (!raw) return { personas: [], tenure: '' };
    const data = JSON.parse(raw);
    return { personas: data.personas || [], tenure: data.tenure || '' };
  } catch {
    return { personas: [], tenure: '' };
  }
}

/**
 * @param {Array} personas
 * @param {string} tenure
 */
export function savePersonaToStorage(personas, tenure) {
  localStorage.setItem(PERSONA_KEY, JSON.stringify({ personas, tenure }));
}
