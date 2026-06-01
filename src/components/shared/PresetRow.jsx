import {
  FILL_PRESETS,
  SUMMARY_PRESETS,
  CRITIQUE_PRESETS,
  AME_PRESETS,
} from '../../domain/logic-domain.js';
import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

const THEME_PRESET_COLS = 5;
const CUSTOM_VALUE = 'custom';

const CUSTOM_PLACEHOLDER = {
  ja: '例：フィリピンの社会課題、テスト計画書 など',
  en: 'e.g. Philippine social issues, Test plan document',
};

const MAP = {
  f: { presets: FILL_PRESETS, docKey: 'fDocType', diffKey: 'fDiff', customKey: 'fCustomTheme' },
  s: { presets: SUMMARY_PRESETS, docKey: 'sDocType', diffKey: 'sDiff', customKey: 'sCustomTheme' },
  c: { presets: CRITIQUE_PRESETS, docKey: 'cDocType', diffKey: 'cDiff', customKey: 'cCustomTheme' },
  a: { presets: AME_PRESETS, docKey: 'aDocType', diffKey: 'aDiff', customKey: 'aCustomTheme' },
};

/**
 * @param {{ tab: 'f'|'s'|'c'|'a' }} props
 * @returns {JSX.Element}
 */
export default function PresetRow({ tab }) {
  const { state, dispatch } = useAppContext();
  const { t, lang } = useTranslation();
  const { presets, docKey, diffKey, customKey } = MAP[tab];
  const langKey = lang === 'en' ? 'en' : 'ja';
  const items = presets[langKey];
  const selected = state[docKey];
  const diff = state[diffKey];
  const customText = state[customKey];
  const isCustomSelected = selected === CUSTOM_VALUE;
  const maxCustomLength = langKey === 'en' ? 30 : 15;

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
        {t('themeLbl')} <span className="label-req">*</span>
      </label>
      <div className="preset-row preset-row-theme">
        {items.map((item) => {
          const disabled = diff > 0 && item.minDiff > diff;
          const sel = selected === item.value;
          const isCustom = item.value === CUSTOM_VALUE;
          return (
            <button
              key={item.value}
              type="button"
              className={`preset-btn${sel ? ' sel' : ''}${isCustom ? ' preset-btn-custom' : ''}`}
              disabled={disabled}
              title={item.label}
              onClick={() => dispatch({ type: 'SET_DOC_TYPE', tab, payload: item.value })}
            >
              {item.label}
            </button>
          );
        })}
        {Array.from({ length: Math.max(0, THEME_PRESET_COLS - items.length) }, (_, i) => (
          <span key={`empty-${i}`} className="preset-cell-empty" aria-hidden="true" />
        ))}
      </div>
      {isCustomSelected && (
        <div className="custom-theme-input-wrap">
          <input
            type="text"
            className="custom-theme-input"
            value={customText}
            maxLength={maxCustomLength}
            placeholder={CUSTOM_PLACEHOLDER[langKey]}
            onChange={(e) =>
              dispatch({ type: 'SET_CUSTOM_THEME', tab, payload: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}
