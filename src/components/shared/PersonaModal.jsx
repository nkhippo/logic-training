import { useState } from 'react';
import {
  PERSONA_INDUSTRY_ROLES,
  PERSONA_TENURE_OPTIONS,
  PERSONA_TENURE_DESC,
} from '../../domain/industry-persona.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import { usePersona } from '../../hooks/usePersona.js';
import { useAppContext } from '../../contexts/AppContext.jsx';

/**
 * @param {{ onClose: Function }} props
 * @returns {JSX.Element}
 */
export default function PersonaModal({ onClose }) {
  const { t, lang } = useTranslation();
  const { personas, tenure, savePersona } = usePersona();
  const { dispatch } = useAppContext();
  const langKey = lang === 'en' ? 'en' : 'ja';
  const [localPersonas, setLocalPersonas] = useState(personas.length ? [...personas] : [{ industry: '', role: '' }]);
  const [localTenure, setLocalTenure] = useState(tenure);

  const tenureDesc = PERSONA_TENURE_DESC[langKey][localTenure] || '';

  const handleSave = () => {
    const filtered = localPersonas.filter((p) => p.industry && p.role).slice(0, 3);
    savePersona(filtered, localTenure);
    dispatch({ type: 'SET_TOAST', payload: { message: t('personaSavedMsg') } });
    onClose();
  };

  const handleClear = () => {
    setLocalPersonas([{ industry: '', role: '' }]);
    setLocalTenure('');
    savePersona([], '');
    dispatch({ type: 'SET_TOAST', payload: { message: t('personaClearedMsg') } });
    onClose();
  };

  return (
    <div className="modal-overlay show" onClick={onClose} role="presentation">
      <div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>{t('personaTitle')}</h2>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '1rem' }}>{t('personaDesc')}</p>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            {t('personaTenureLbl')}
          </label>
          <select
            value={localTenure}
            onChange={(e) => setLocalTenure(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '.5px solid var(--border2)',
              borderRadius: 'var(--r-md)',
              fontSize: '13px',
              background: 'var(--bg2)',
              color: 'var(--text)',
            }}
          >
            {PERSONA_TENURE_OPTIONS[langKey].map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {tenureDesc && (
            <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '6px' }}>{tenureDesc}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-sm" onClick={handleClear} style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>
            {t('personaClearBtn')}
          </button>
          <button type="button" className="btn" onClick={handleSave}>
            {t('personaSaveBtn')}
          </button>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '12px' }}>
          {PERSONA_INDUSTRY_ROLES[langKey]?.length ? t('personaIndustryLbl') : ''}
        </p>
      </div>
    </div>
  );
}
