import {
  FILL_PRESETS,
  SUMMARY_PRESETS,
  CRITIQUE_PRESETS,
  AME_PRESETS,
} from '../../domain/logic-domain.js';
import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

const THEME_PRESET_COLS = 5;

const MAP = {
  f: { presets: FILL_PRESETS, docKey: 'fDocType', diffKey: 'fDiff' },
  s: { presets: SUMMARY_PRESETS, docKey: 'sDocType', diffKey: 'sDiff' },
  c: { presets: CRITIQUE_PRESETS, docKey: 'cDocType', diffKey: 'cDiff' },
  a: { presets: AME_PRESETS, docKey: 'aDocType', diffKey: 'aDiff' },
};

/**
 * @param {{ tab: 'f'|'s'|'c'|'a' }} props
 * @returns {JSX.Element}
 */
export default function PresetRow({ tab }) {
  const { state, dispatch } = useAppContext();
  const { t, lang } = useTranslation();
  const { presets, docKey, diffKey } = MAP[tab];
  const langKey = lang === 'en' ? 'en' : 'ja';
  const items = presets[langKey];
  const selected = state[docKey];
  const diff = state[diffKey];

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
        {t('themeLbl')} <span className="label-req">*</span>
      </label>
      <div className="preset-row preset-row-theme">
        {items.map((item) => {
          const disabled = diff > 0 && item.minDiff > diff;
          const sel = selected === item.value;
          return (
            <button
              key={item.value}
              type="button"
              className={`preset-btn${sel ? ' sel' : ''}`}
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
    </div>
  );
}
