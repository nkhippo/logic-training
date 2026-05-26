import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

const DIFF_LEVELS = [1, 2, 3, 4, 5];
const STARS = ['★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★'];

/**
 * @param {{ tab: 'f'|'s'|'c'|'a' }} props
 * @returns {JSX.Element}
 */
export default function DiffSelector({ tab }) {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const diffKey = `${tab}Diff`;
  const current = state[diffKey];

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
        {t('diffLbl')} <span className="label-req">*</span>
      </label>
      <div className="diff-row">
        {DIFF_LEVELS.map((level, i) => (
          <button
            key={level}
            type="button"
            className={`diff-btn${current === level ? ' sel' : ''}`}
            data-d={level}
            onClick={() => dispatch({ type: 'SET_DIFF', tab, payload: level })}
          >
            {STARS[i]}
            <br />
            <span className="dlbl">{t('dLabels')?.[i] || ''}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
