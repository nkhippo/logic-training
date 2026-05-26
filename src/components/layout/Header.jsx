import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation.js';
import { usePersona } from '../../hooks/usePersona.js';
import PersonaModal from '../shared/PersonaModal.jsx';
import LangModal from '../shared/LangModal.jsx';

/**
 * @param {{ page: 'logic'|'thinking' }} props
 * @returns {JSX.Element}
 */
export default function Header({ page }) {
  const { t } = useTranslation();
  const { personas } = usePersona();
  const [showPersona, setShowPersona] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const titleKey = page === 'logic' ? 'appTitle' : 'thinkingAppTitle';
  const otherPath = page === 'logic' ? '/thinking' : '/logic';
  const otherLabel = page === 'logic' ? t('linkToThinking') : t('thinkingLinkToLogic');

  return (
    <>
      <div className="app-header no-print">
        <div className="app-header-main">
          <span className="app-header-brand">{t('serviceName')}</span>
          <h1>{t(titleKey)}</h1>
          <nav className="app-header-nav" aria-label="ページナビゲーション">
            <Link className="app-header-link" to={otherPath}>
              {otherLabel}
            </Link>
          </nav>
        </div>
        <div className="app-header-actions">
          <button
            type="button"
            className="header-action-btn no-print"
            onClick={() => setShowPersona(true)}
          >
            {t('profileBtn')}
            {personas.length > 0 && (
              <span className="persona-active-badge">{t('setting_in_progress')}</span>
            )}
          </button>
          <button type="button" className="header-action-btn no-print" onClick={() => setShowLang(true)}>
            {t('langBtn')}
          </button>
        </div>
      </div>
      {showPersona && <PersonaModal onClose={() => setShowPersona(false)} />}
      {showLang && <LangModal onClose={() => setShowLang(false)} />}
    </>
  );
}
