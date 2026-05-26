import { useTranslation } from '../../hooks/useTranslation.js';

/**
 * @param {{ onClose: Function }} props
 * @returns {JSX.Element}
 */
export default function LangModal({ onClose }) {
  const { t, lang, setLang } = useTranslation();

  const choose = (code) => {
    setLang(code);
    onClose();
  };

  return (
    <div className="modal-overlay show" onClick={onClose} role="presentation">
      <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>{t('langModalTitle')}</h2>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '1rem' }}>{t('langModalDesc')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button type="button" className={`btn${lang === 'ja' ? '' : ' btn-sm'}`} onClick={() => choose('ja')}>
            {t('langChoiceJa')}
          </button>
          <button type="button" className={`btn${lang === 'en' ? '' : ' btn-sm'}`} onClick={() => choose('en')}>
            {t('langChoiceEn')}
          </button>
        </div>
      </div>
    </div>
  );
}
