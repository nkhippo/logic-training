import { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext.jsx';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { esc, fmtDate } from '../../../utils/markdown.js';
import { parseF } from '../../../services/api.js';

const TAB_MAP = { fill: 'f', summary: 's', critique: 'c', ame: 'a' };
const BADGE = { 1: 'b1', 2: 'b2', 3: 'b3', 4: 'b4', 5: 'b5' };

/**
 * @param {{ tab: 'fill'|'summary'|'critique'|'ame' }} props
 * @returns {JSX.Element}
 */
export default function PastList({ tab }) {
  const { state } = useAppContext();
  const { t } = useTranslation();
  const prefix = TAB_MAP[tab];
  const pastKey = `${prefix}Past`;
  const filterKey = `${prefix}Filter`;
  const all = state[pastKey] || [];
  const filter = state[filterKey] || 'all';
  const list = all.filter((p) => (filter === 'all' ? true : String(p.diff) === filter));
  const [selected, setSelected] = useState(null);

  /**
   * critique 過去問は A(form) だと text、B(form) だと questions が主体。
   * questions が文字列/配列/オブジェクトのどれで来ても表示できる形に整形する。
   * @param {any} p
   * @returns {string}
   */
  const critiqueBody = (p) => {
    const text = String(p?.text || '').trim();
    if (text) return text;
    const qRaw = p?.questions;
    if (!qRaw) return '—';

    let qs = qRaw;
    if (typeof qs === 'string') {
      const s = qs.trim();
      if (!s) return '—';
      try {
        qs = JSON.parse(s);
      } catch {
        return s;
      }
    }

    if (Array.isArray(qs)) {
      const lines = qs
        .map((q, idx) => {
          const id = q?.id ?? idx + 1;
          const type = q?.type ? `（${q.type}）` : '';
          const arg = q?.argument ? `\n${q.argument}` : '';
          const question = q?.question ? `\n${q.question}` : '';
          return `【設問${id}】${type}${arg}${question}`.trim();
        })
        .filter(Boolean);
      return lines.length ? lines.join('\n\n') : '—';
    }

    if (typeof qs === 'object') {
      try {
        return JSON.stringify(qs, null, 2);
      } catch {
        return String(qs);
      }
    }

    return String(qs);
  };

  const preview = (p) => {
    if (tab === 'fill') return String(p.text || '').replace(/【_\d+_】/g, '[  ]').slice(0, 80);
    if (tab === 'ame') return String(p.article || '').slice(0, 80);
    return String(p.text || '').slice(0, 80);
  };

  if (selected) {
    const p = selected;
    return (
      <div className="card">
        <button type="button" className="back-btn no-print" onClick={() => setSelected(null)}>
          ← {t('back')}
        </button>
        <div className="problem-box" style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
          {tab === 'fill' && esc(p.text)}
          {tab === 'summary' && esc(p.text)}
          {tab === 'critique' && esc(critiqueBody(p))}
          {tab === 'ame' && esc(p.article)}
        </div>
        {tab === 'fill' && p.answers && (
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            {parseF(p.answers).length} blanks
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      {list.length === 0 ? (
        <div className="pempty">
          <i className="ti ti-inbox" style={{ fontSize: '26px', display: 'block', marginBottom: '.4rem' }} />
          {t('noData')}
        </div>
      ) : (
        list.map((p) => (
          <div key={p.id} className="pcard" onClick={() => setSelected(p)} role="button" tabIndex={0}>
            <div className="pc-h">
              <div className="pc-t">{esc(p.theme)}</div>
              <div className="pc-m">
                <span className={`badge ${BADGE[p.diff] || 'b3'}`}>★{p.diff}</span>
              </div>
            </div>
            <div className="pc-pre">{esc(preview(p))}</div>
            <div className="pc-date">
              {fmtDate(p.date)}
              {p.lang ? ` · ${p.lang.toUpperCase()}` : ''}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
