import {
  FILL_PRESETS,
  SUMMARY_PRESETS,
  CRITIQUE_PRESETS,
  AME_PRESETS,
} from '../domain/logic-domain.js';
import { INDUSTRY_PRESETS } from '../domain/industry-persona.js';

const THEME_MAP = {
  f: { presets: FILL_PRESETS, diffKey: 'fDiff', docKey: 'fDocType' },
  s: { presets: SUMMARY_PRESETS, diffKey: 'sDiff', docKey: 'sDocType' },
  c: { presets: CRITIQUE_PRESETS, diffKey: 'cDiff', docKey: 'cDocType' },
  a: { presets: AME_PRESETS, diffKey: 'aDiff', docKey: 'aDocType' },
};

/**
 * @param {object} state
 * @param {'f'|'s'|'c'|'a'} mode
 * @returns {string}
 */
export function themeValueFor(state, mode) {
  return state[THEME_MAP[mode].docKey] || '';
}

/**
 * @param {object} state
 * @param {'f'|'s'|'c'|'a'} mode
 * @returns {number}
 */
export function diffValueFor(state, mode) {
  return state[THEME_MAP[mode].diffKey] || 0;
}

/**
 * @param {object} state
 * @param {'f'|'s'|'c'|'a'} mode
 * @returns {boolean}
 */
export function validateBeforeGen(state, mode) {
  return !!themeValueFor(state, mode) && diffValueFor(state, mode) >= 1;
}

/**
 * @param {object} state
 * @param {'f'|'s'|'c'|'a'} mode
 * @param {boolean} isEN
 * @returns {string}
 */
export function buildThemeInFromDocType(state, mode, isEN) {
  const lang = isEN ? 'en' : 'ja';
  const { presets, diffKey, docKey } = THEME_MAP[mode];
  const value = state[docKey];
  const diff = state[diffKey];
  const preset = presets[lang].find((x) => x.value === value);
  if (!preset || preset.minDiff > diff) return '';
  const ind = INDUSTRY_PRESETS[lang].find((p) => p.value === state.industry);
  const indNote =
    state.industry && ind
      ? isEN
        ? ` Industry context: ${ind.label}.`
        : ` 業界：${ind.label}。`
      : '';
  return preset.label + indNote;
}
