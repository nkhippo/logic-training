import { useTranslation } from '../../hooks/useTranslation.js';

/**
 * @param {{ activeMode: string, onChange: Function }} props
 * @returns {JSX.Element}
 */
export default function SubTabs({ activeMode, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="sub-tabs no-print">
      <button
        type="button"
        className={`sub-tab${activeMode === 'new' ? ' active' : ''}`}
        onClick={() => onChange('new')}
      >
        <i className="ti ti-plus" /> {t('subNew')}
      </button>
      <button
        type="button"
        className={`sub-tab${activeMode === 'past' ? ' active' : ''}`}
        onClick={() => onChange('past')}
      >
        <i className="ti ti-history" /> {t('subPast')}
      </button>
    </div>
  );
}
