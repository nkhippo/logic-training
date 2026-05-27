import { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext.jsx';
import { useTranslation } from '../../../hooks/useTranslation.js';
import { L } from '../../../services/i18n.js';
import { esc, fmtDate, parseF } from '../../../utils/markdown.js';
import { normSummaryProb, sumTypeLabel } from '../../../domain/logic-domain.js';
import { normCritiqueProb } from '../../../logic/critiqueLogic.js';
import { normAmeProb } from '../../../logic/ameLogic.js';
import ProblemMeta from '../../shared/ProblemMeta.jsx';

const TAB_MAP = { fill: 'f', summary: 's', critique: 'c', ame: 'a' };
const BADGE = { 1: 'b1', 2: 'b2', 3: 'b3', 4: 'b4', 5: 'b5' };

/**
 * @param {unknown} raw
 * @returns {Array}
 */
function parseQuestions(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * @param {string} text
 * @param {number} ansCount
 * @returns {string}
 */
function renderFillBlanks(text, ansCount) {
  let html = esc(text);
  for (let i = 1; i <= ansCount; i++) {
    html = html.replace(`【_${i}_】`, `<span class="blank" id="blank-${i}">（${i}）</span>`);
  }
  return html;
}

/**
 * @param {{ tab: 'fill'|'summary'|'critique'|'ame', prob: object }} props
 * @returns {JSX.Element|null}
 */
function PastQuestions({ tab, prob }) {
  const { t, lang } = useTranslation();
  const labels = L[prob.lang || lang] || L.ja;
  const charSuffix = (prob.lang || lang) === 'ja' ? labels.charWithin || '字以内' : labels.charWithin || ' chars or less';

  if (tab === 'summary') {
    const p = normSummaryProb(prob, prob.lang || lang);
    if (!p.questions?.length) return null;
    return (
      <div style={{ marginTop: '1rem' }}>
        <p className="slabel">{t('sInst')}</p>
        {p.questions.map((q, i) => {
          const tc = q.targetChars || 50;
          const badge = sumTypeLabel(q.type, prob.lang || lang);
          return (
            <div key={q.id || i} className="sum-q-block">
              <div className="sum-q-lbl no-print">
                {labels.qLbl}
                {q.id || i + 1}
                {' '}
                <span className="q-type-badge">{badge}</span>
                <span style={{ fontSize: '11px', color: 'var(--text2)' }}>
                  （
                  {t('charTarget') || '目標'}
                  {' '}
                  {tc}
                  {charSuffix}
                  ）
                </span>
              </div>
              <p className="sum-q-text">{esc(q.question || '')}</p>
            </div>
          );
        })}
      </div>
    );
  }

  if (tab === 'critique') {
    const p = normCritiqueProb({ ...prob, questions: parseQuestions(prob.questions) });
    if (!p.questions?.length) return null;
    return (
      <div style={{ marginTop: '1rem' }}>
        <p className="slabel">{t('cInst')}</p>
        {p.questions.map((q, i) => {
          const tc = parseInt(q.targetChars, 10) || 120;
          const type = q.type || '本当にそう言える？の指摘';
          const intentLabel = labels.cQTypes?.[type] || type;
          return (
            <div key={q.id || i} className="crit-q-block" style={{ marginTop: '1rem' }}>
              <div className="crit-q-lbl">
                {labels.qLbl}
                {q.id || i + 1}
                {' '}
                <span className="q-type-badge">{intentLabel}</span>
                <span style={{ fontSize: '11px', color: 'var(--text2)' }}>
                  （
                  {tc}
                  {charSuffix}
                  ）
                </span>
              </div>
              {p.form === 'B' && q.argument && <div className="crit-arg-box">{esc(q.argument)}</div>}
              <p className="crit-q-text">{esc(q.question || '')}</p>
            </div>
          );
        })}
      </div>
    );
  }

  if (tab === 'ame') {
    const p = normAmeProb({ ...prob, questions: parseQuestions(prob.questions) });
    if (!p.questions?.length) return null;
    return (
      <div style={{ marginTop: '1rem' }}>
        {p.law && (
          <>
            <p className="slabel">{t('aLawLbl')}</p>
            <div className="mode-bar" style={{ marginBottom: '1rem' }}>
              {esc(p.law)}
            </div>
          </>
        )}
        {p.questions.map((q, i) => {
          const tc = q.targetChars || 150;
          const type = q.type || '';
          let sectionLbl = type;
          if (type === '空' || type === 'Sky') sectionLbl = t('aSora');
          else if (type === '雨' || type === 'Rain') sectionLbl = t('aAme');
          else if (type === '傘' || type === 'Umbrella') sectionLbl = t('aKasa');
          const isUmbrella = type === '傘' || type === 'Umbrella';
          return (
            <div key={q.id || i} className="ame-q-block">
              <div className="ame-section-lbl">
                {sectionLbl}
                <span className="q-type-badge" style={{ marginLeft: '6px' }}>
                  {type}
                </span>
              </div>
              <p className="ame-q-lbl">
                {esc(q.question || '')}
                <span style={{ fontSize: '11px', color: 'var(--text2)', marginLeft: '6px' }}>
                  （
                  {tc}
                  {charSuffix}
                  ）
                </span>
              </p>
              {isUmbrella && p.constraint && (
                <div className="ame-constraint">
                  {t('aConstraintLbl')}
                  {esc(p.constraint)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

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
    const fillAnswers = tab === 'fill' ? parseF(p.answers) : [];
    const critiqueNorm = tab === 'critique' ? normCritiqueProb({ ...p, questions: parseQuestions(p.questions) }) : null;

    return (
      <div className="card">
        <button type="button" className="back-btn no-print" onClick={() => setSelected(null)}>
          ← {t('back')}
        </button>
        <div style={{ marginTop: '1rem' }}>
          <ProblemMeta prob={p} />
          {tab === 'fill' && (
            <div
              className="problem-box"
              style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{
                __html: renderFillBlanks(p.text || '', fillAnswers.length),
              }}
            />
          )}
          {tab === 'summary' && (
            <div className="problem-box" style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
              {esc(p.text)}
            </div>
          )}
          {tab === 'critique' && critiqueNorm?.form === 'A' && critiqueNorm.text && (
            <div className="problem-box" style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
              {esc(critiqueNorm.text)}
            </div>
          )}
          {tab === 'ame' && (
            <>
              <p className="slabel" style={{ marginTop: '1rem' }}>
                {t('aArticleLbl')}
              </p>
              <div className="problem-box" style={{ whiteSpace: 'pre-wrap' }}>
                {esc(p.article)}
              </div>
            </>
          )}
          <PastQuestions tab={tab} prob={p} />
          {tab === 'fill' && fillAnswers.length > 0 && (
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              {fillAnswers.length} blanks
            </p>
          )}
        </div>
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
