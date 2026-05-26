import { INDUSTRY_PRESETS } from '../../domain/industry-persona.js';
import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

/**
 * @returns {JSX.Element}
 */
export default function IndustrySelector() {
  const { state, dispatch } = useAppContext();
  const { t, lang } = useTranslation();
  const langKey = lang === 'en' ? 'en' : 'ja';
  const items = INDUSTRY_PRESETS[langKey];

  return (
    <div className="industry-block" style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
        {t('industryLbl')}
      </label>
      <div className="industry-preset-row">
        {items.map((item) => (
          <button
            key={item.value || 'any'}
            type="button"
            className={`preset-btn${state.industry === item.value ? ' sel' : ''}`}
            data-industry={item.value}
            onClick={() => dispatch({ type: 'SET_INDUSTRY', payload: item.value })}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
