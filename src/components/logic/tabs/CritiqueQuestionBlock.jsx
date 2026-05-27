import { useState } from 'react';
import { esc } from '../../../utils/markdown.js';

/**
 * @param {object} props
 * @param {object} props.q
 * @param {number} props.index
 * @param {string} props.form
 * @param {string} props.lang
 * @param {string} props.value
 * @param {(v: string) => void} props.onChange
 * @param {object} props.labels
 * @returns {JSX.Element}
 */
export default function CritiqueQuestionBlock({ q, index, form, lang, value, onChange, labels }) {
  const [tipOpen, setTipOpen] = useState(false);
  const tc = parseInt(q.targetChars, 10) || 120;
  const type = q.type || '本当にそう言える？の指摘';
  const intentLabel = labels.cQTypes?.[type] || type;
  const tooltip = labels.cTooltips?.[type];
  const tipId = `c-tooltip-${index}`;
  const charSuffix = lang === 'ja' ? labels.charWithin || '字以内' : labels.charWithin || 'chars or less';

  return (
    <div className="crit-q-block">
      <div className="crit-q-lbl">
        {labels.qLbl}
        {q.id || index + 1}
        {' '}
        <span className="q-type-badge">{intentLabel}</span>
        {tooltip && (
          <span className="tooltip-wrap">
            <button
              type="button"
              className="tooltip-icon"
              aria-label={tooltip.label}
              title={tooltip.label}
              onClick={() => setTipOpen((o) => !o)}
            >
              ?
            </button>
            <span className={`tooltip-box${tipOpen ? ' show' : ''}`} id={tipId} role="tooltip">
              <span className="tooltip-title">{esc(tooltip.label)}</span>
              {esc(tooltip.body)}
              <span className="tooltip-example">{esc(tooltip.example)}</span>
            </span>
          </span>
        )}
        <span style={{ fontSize: '11px', color: 'var(--text2)' }}>
          （
          {tc}
          {charSuffix}
          ）
        </span>
      </div>
      {form === 'B' && q.argument && <div className="crit-arg-box">{esc(q.argument)}</div>}
      <p className="crit-q-text">{esc(q.question || '')}</p>
      <textarea
        className="sum-ta"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minHeight: `${Math.max(80, tc * 1.6)}px`, width: '100%' }}
        placeholder={labels.qInst}
        data-target={tc}
      />
    </div>
  );
}
