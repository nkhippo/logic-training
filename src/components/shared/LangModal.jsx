import { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';

/**
 * @param {{ onClose: Function }} props
 * @returns {JSX.Element}
 */
export default function LangModal({ onClose }) {
  const { t, lang, setLang } = useTranslation();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const choose = (code) => {
    if (lang === code) {
      onClose();
      return;
    }
    setLang(code);
    onClose();
  };

  return (
    <div
      className="guide-overlay no-print show"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="guide-modal"
        style={{ maxWidth: '360px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-modal-title"
      >
        <div className="guide-modal-header">
          <span className="guide-modal-title" id="lang-modal-title">
            {t('langModalTitle')}
          </span>
          <button type="button" className="guide-close-btn" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <div className="guide-body lang-modal-body">
          <p className="lang-modal-desc">{t('langModalDesc')}</p>
          <div className="lang-modal-choices">
            <button
              type="button"
              className={`lang-choice-btn${lang === 'ja' ? ' sel' : ''}`}
              onClick={() => choose('ja')}
              disabled={lang === 'ja'}
            >
              {t('langChoiceJa')}
            </button>
            <button
              type="button"
              className={`lang-choice-btn${lang === 'en' ? ' sel' : ''}`}
              onClick={() => choose('en')}
              disabled={lang === 'en'}
            >
              {t('langChoiceEn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
