import { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { THINKING_CORES } from '../../domain/thinking-domain.js';
import { esc, fmtDate } from '../../utils/markdown.js';

/**
 * @returns {JSX.Element}
 */
export default function ThinkingPastList() {
  const { state } = useAppContext();
  const { t, lang } = useTranslation();
  const langKey = lang === 'en' ? 'en' : 'ja';
  const past = state.thinkingPast || [];
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div className="card">
        <button type="button" className="back-btn" onClick={() => setSelected(null)}>
          ← {t('back')}
        </button>
        <p className="slabel">{t('thinkingSituationLbl')}</p>
        <div className="problem-box">{esc(selected.situation)}</div>
      </div>
    );
  }

  return (
    <div className="card" id="thinking-past-list">
      {past.length === 0 ? (
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>{t('noData')}</p>
      ) : (
        past.map((p) => {
          const coreObj = THINKING_CORES[langKey].find((c) => c.value === p.core);
          return (
            <div
              key={p.id}
              className="pitem"
              style={{ cursor: 'pointer', marginBottom: '8px' }}
              onClick={() => setSelected(p)}
              role="button"
              tabIndex={0}
            >
              <div style={{ fontSize: '13px', fontWeight: 500 }}>{esc(p.theme || coreObj?.label || '—')}</div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>
                ★{p.diff} · {fmtDate(p.date)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
