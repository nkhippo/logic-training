import { useTranslation } from '../../hooks/useTranslation.js';
import { useAppContext } from '../../contexts/AppContext.jsx';

/**
 * @returns {JSX.Element}
 */
export default function BusyOverlay() {
  const { t } = useTranslation();
  const { state } = useAppContext();
  const busy = !!(state.genBusy || state.gradeBusy);

  return (
    <div
      id="app-busy-overlay"
      className={`app-busy-overlay${busy ? ' show' : ''}`}
      aria-hidden={!busy}
      role="alert"
      aria-live="assertive"
    >
      <div className="app-busy-overlay-inner">
        <div className="app-busy-spinner" aria-hidden="true" />
        <p className="app-busy-overlay-title">{t('genBtnBusy')}</p>
        <p className="app-busy-overlay-hint">{t('busyOverlayHint')}</p>
      </div>
    </div>
  );
}
