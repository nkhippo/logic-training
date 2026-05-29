import { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext.jsx';
import { useTranslation } from '../../../hooks/useTranslation.js';
import DiffSelector from '../../shared/DiffSelector.jsx';
import PresetRow from '../../shared/PresetRow.jsx';
import IndustrySelector from '../../shared/IndustrySelector.jsx';
import ProblemMeta from '../../shared/ProblemMeta.jsx';
import { validateBeforeGen } from '../../../logic/themeHelpers.js';
import { generateFillProblem, gradeFillProblem, buildFillPastEntry } from '../../../logic/fillLogic.js';
import { addPastEntry } from '../../../services/pastStorage.js';
import { esc, formatFillFeedback100 } from '../../../utils/markdown.js';

/**
 * @returns {JSX.Element}
 */
export default function FillTab() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const prob = state.fill;
  const [answers, setAnswers] = useState([]);
  const busy = state.genBusy === 'fill' || state.gradeBusy === 'fill';

  const renderBlanks = (text, ansCount) => {
    let html = esc(text);
    for (let i = 1; i <= ansCount; i++) {
      html = html.replace(`【_${i}_】`, `<span class="blank" id="blank-${i}">（${i}）</span>`);
    }
    return html;
  };

  const handleGenerate = async () => {
    if (!validateBeforeGen(state, 'f')) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('themeRequired') } });
      return;
    }
    if (state.fDiff < 1) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('diffRequired') } });
      return;
    }
    dispatch({ type: 'SET_GEN_BUSY', payload: 'fill' });
    try {
      const data = await generateFillProblem(state);
      dispatch({ type: 'SET_FILL_PROBLEM', payload: data });
      setAnswers(data.answers.map(() => ''));
      const entry = buildFillPastEntry(data);
      const past = addPastEntry('fill', entry);
      dispatch({ type: 'SET_PAST', tab: 'f', payload: past });
      dispatch({ type: 'SET_TOAST', payload: { message: t('savedOk') } });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: `${t('genFailed')} ${e.message}` } });
    } finally {
      dispatch({ type: 'SET_GEN_BUSY', payload: null });
    }
  };

  const handleScore = async () => {
    if (!prob) return;
    const ua = answers.map((a) => a.trim());
    if (ua.some((a) => !a)) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('fillAnswerRequired') } });
      return;
    }
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'fill' });
    try {
      const feedback = await gradeFillProblem(prob, ua);
      const updated = { ...prob, feedback, userAnswers: ua };
      dispatch({ type: 'SET_FILL_PROBLEM', payload: updated });
      const entry = buildFillPastEntry(updated);
      const past = addPastEntry('fill', entry);
      dispatch({ type: 'SET_PAST', tab: 'f', payload: past });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: `${t('gradingErr')}: ${e.message}` } });
    } finally {
      dispatch({ type: 'SET_GRADE_BUSY', payload: null });
    }
  };

  return (
    <div className="card no-print">
      <PresetRow tab="f" />
      <IndustrySelector />
      <DiffSelector tab="f" />
      <button type="button" className="btn" onClick={handleGenerate} disabled={busy}>
        <span>{state.genBusy === 'fill' ? t('genBtnBusy') : t('genBtn')}</span>
      </button>

      {prob && (
        <div id="fill-result" style={{ marginTop: '1.5rem' }}>
          <ProblemMeta prob={prob} />
          <div
            className="problem-box"
            dangerouslySetInnerHTML={{ __html: renderBlanks(prob.text, prob.answers.length) }}
          />
          <div className="answer-section" style={{ marginTop: '1rem' }}>
            <p className="slabel no-print">{t('answerBox')}</p>
            {prob.answers.map((_, i) => (
              <div key={i} className="answer-item">
                <div className="answer-row">
                  <label>（{i + 1}）</label>
                  <input
                    type="text"
                    value={answers[i] || ''}
                    onChange={(e) => {
                      const next = [...answers];
                      next[i] = e.target.value;
                      setAnswers(next);
                    }}
                  />
                </div>
                {prob.hints?.[i] && <div className="hint-text no-print">{prob.hints[i]}</div>}
              </div>
            ))}
          </div>
          <button type="button" className="btn" style={{ marginTop: '12px' }} onClick={handleScore} disabled={busy}>
            {t('submitBtn')}
          </button>
          {prob.feedback && (
            <div
              className="feedback-box"
              style={{ marginTop: '1rem' }}
              dangerouslySetInnerHTML={{ __html: formatFillFeedback100(prob.feedback, prob.lang) }}
            />
          )}
        </div>
      )}
    </div>
  );
}
