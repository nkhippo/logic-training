/**
 * 過去問の localStorage 永続化（GAS 廃止後）
 */

const PREFIX = 'thinkgrindai_past_';

/**
 * @param {'fill'|'summary'|'critique'|'ame'|'thinking'} mode
 * @returns {Array}
 */
export function loadPastFromStorage(mode) {
  try {
    const raw = localStorage.getItem(PREFIX + mode);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * @param {'fill'|'summary'|'critique'|'ame'|'thinking'} mode
 * @param {Array} rows
 */
export function savePastToStorage(mode, rows) {
  localStorage.setItem(PREFIX + mode, JSON.stringify(rows));
}

/**
 * @param {'fill'|'summary'|'critique'|'ame'|'thinking'} mode
 * @param {object} entry
 * @returns {Array}
 */
export function addPastEntry(mode, entry) {
  const store = loadPastFromStorage(mode);
  const idx = store.findIndex((p) => String(p.id) === String(entry.id));
  if (idx >= 0) store[idx] = entry;
  else store.unshift(entry);
  savePastToStorage(mode, store);
  return store;
}
