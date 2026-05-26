import { esc, fmtDate } from '../../utils/markdown.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import { INDUSTRY_PRESETS } from '../../domain/industry-persona.js';

const BADGE = { 1: 'b1', 2: 'b2', 3: 'b3', 4: 'b4', 5: 'b5' };

/**
 * @param {{ prob: object }} props
 * @returns {JSX.Element}
 */
export default function ProblemMeta({ prob }) {
  const { t, lang } = useTranslation();
  const langKey = lang === 'en' ? 'en' : 'ja';
  const ind = INDUSTRY_PRESETS[langKey].find((p) => p.value === prob.industry);
  const indLabel = ind?.label || t('metaIndustryNone') || '未選択';
  const diff = +(prob.diff || 0);

  return (
    <div className="problem-meta-row">
      <span className="meta-tag">
        {t('theme')}
        {prob.theme || '—'}
      </span>
      <span className="meta-tag">
        {t('metaIndustry') || '業界'}：{indLabel}
      </span>
      {diff > 0 && (
        <span className="meta-tag meta-diff">
          <span className={`badge ${BADGE[diff] || 'b3'}`}>★{diff}</span>
        </span>
      )}
      {prob.date && (
        <span className="meta-tag" style={{ fontSize: '11px', color: 'var(--text2)' }}>
          {fmtDate(prob.date)}
        </span>
      )}
    </div>
  );
}
