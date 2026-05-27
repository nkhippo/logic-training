import { useEffect, useState } from 'react';
import {
  PERSONA_INDUSTRY_ROLES,
  PERSONA_TENURE_OPTIONS,
  PERSONA_TENURE_DESC,
} from '../../domain/industry-persona.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import { usePersona } from '../../hooks/usePersona.js';
import { useAppContext } from '../../contexts/AppContext.jsx';

const MAX_PERSONA_ROWS = 3;

/**
 * @param {{ row: { industry: string, role: string }, index: number, langKey: 'ja'|'en', onChange: Function, onRemove: Function, canRemove: boolean }} props
 * @returns {JSX.Element}
 */
function PersonaRow({ row, index, langKey, onChange, onRemove, canRemove }) {
  const { t } = useTranslation();
  const industries = PERSONA_INDUSTRY_ROLES[langKey] || [];
  const selectedInd = industries.find((ind) => ind.industry === row.industry);
  const roles = selectedInd?.roles || [];

  return (
    <div className="persona-row" style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
      <select
        className="persona-industry-sel"
        value={row.industry}
        onChange={(e) => onChange(index, { industry: e.target.value, role: '' })}
        style={{
          flex: 1,
          padding: '7px 8px',
          border: '.5px solid var(--border2)',
          borderRadius: 'var(--r-md)',
          fontSize: '12px',
          background: 'var(--bg2)',
          color: 'var(--text)',
        }}
      >
        <option value="">{t('personaIndustryPlaceholder')}</option>
        {industries.map((ind) => (
          <option key={ind.industry} value={ind.industry}>
            {ind.industry}
          </option>
        ))}
      </select>
      <select
        className="persona-role-sel"
        value={row.role}
        disabled={!selectedInd}
        onChange={(e) => onChange(index, { ...row, role: e.target.value })}
        style={{
          flex: 1,
          padding: '7px 8px',
          border: '.5px solid var(--border2)',
          borderRadius: 'var(--r-md)',
          fontSize: '12px',
          background: 'var(--bg2)',
          color: 'var(--text)',
        }}
      >
        <option value="">{t('personaRolePlaceholder')}</option>
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {canRemove ? (
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text2)',
            fontSize: '16px',
            padding: '0 4px',
          }}
          aria-label="削除"
        >
          ×
        </button>
      ) : (
        <span style={{ width: '24px', flexShrink: 0 }} aria-hidden="true" />
      )}
    </div>
  );
}

/**
 * @param {{ onClose: Function }} props
 * @returns {JSX.Element}
 */
export default function PersonaModal({ onClose }) {
  const { t, lang } = useTranslation();
  const { personas, tenure, savePersona } = usePersona();
  const { dispatch } = useAppContext();
  const langKey = lang === 'en' ? 'en' : 'ja';
  const [localPersonas, setLocalPersonas] = useState(
    personas.length ? [...personas] : [{ industry: '', role: '' }]
  );
  const [localTenure, setLocalTenure] = useState(tenure);

  const tenureDesc = PERSONA_TENURE_DESC[langKey][localTenure] || '';

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const updateRow = (index, row) => {
    setLocalPersonas((rows) => rows.map((r, i) => (i === index ? row : r)));
  };

  const removeRow = (index) => {
    setLocalPersonas((rows) => rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setLocalPersonas((rows) =>
      rows.length >= MAX_PERSONA_ROWS ? rows : [...rows, { industry: '', role: '' }]
    );
  };

  const handleSave = () => {
    const filtered = localPersonas.filter((p) => p.industry && p.role).slice(0, MAX_PERSONA_ROWS);
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
    <div className="guide-overlay no-print show" onClick={onClose} role="presentation">
      <div
        className="guide-modal"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="persona-modal-title"
      >
        <div className="guide-modal-header">
          <span className="guide-modal-title" id="persona-modal-title">
            👤 {t('personaTitle')}
          </span>
          <button type="button" className="guide-close-btn" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <div className="guide-body" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
            {t('personaDesc')}
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}
            >
              {t('personaIndustryLbl')}
            </label>
            <div id="persona-rows">
              {localPersonas.map((row, i) => (
                <PersonaRow
                  key={i}
                  row={row}
                  index={i}
                  langKey={langKey}
                  canRemove={i > 0}
                  onChange={updateRow}
                  onRemove={removeRow}
                />
              ))}
            </div>
            {localPersonas.length < MAX_PERSONA_ROWS && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={addRow}
                style={{ marginTop: '8px', fontSize: '12px', padding: '4px 12px' }}
              >
                {t('personaAddBtn')}
              </button>
            )}
          </div>

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
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleClear}
              style={{ background: 'var(--bg2)', color: 'var(--text2)', border: '.5px solid var(--border2)' }}
            >
              {t('personaClearBtn')}
            </button>
            <button type="button" className="btn" onClick={handleSave}>
              {t('personaSaveBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
