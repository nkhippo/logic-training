import { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext.jsx';
import { useTranslation } from '../../../hooks/useTranslation.js';
import DiffSelector from '../../shared/DiffSelector.jsx';
import PresetRow from '../../shared/PresetRow.jsx';
import IndustrySelector from '../../shared/IndustrySelector.jsx';
import ProblemMeta from '../../shared/ProblemMeta.jsx';
import { validateBeforeGen } from '../../../logic/themeHelpers.js';
import { generateAmeProblem, gradeAmeProblem, buildAmePastEntry } from '../../../logic/ameLogic.js';
import { addPastEntry } from '../../../services/pastStorage.js';
import { esc, formatFeedback100 } from '../../../utils/markdown.js';

/**
 * @returns {JSX.Element}
 */
export default function AmeTab() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const prob = state.ame;
  const [answers, setAnswers] = useState([]);
  const busy = state.genBusy === 'ame' || state.gradeBusy === 'ame';

  const handleGenerate = async () => {
    if (!validateBeforeGen(state, 'a') || state.aDiff < 1) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('diffRequired') } });
      return;
    }
    dispatch({ type: 'SET_GEN_BUSY', payload: 'ame' });
    try {
      const data = await generateAmeProblem(state);
      dispatch({ type: 'SET_AME_PROBLEM', payload: data });
      setAnswers(data.questions.map(() => ''));
      dispatch({ type: 'SET_PAST', tab: 'a', payload: addPastEntry('ame', buildAmePastEntry(data)) });
      dispatch({ type: 'SET_TOAST', payload: { message: t('aSavedOk') || t('savedOk') } });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      dispatch({ type: 'SET_GEN_BUSY', payload: null });
    }
  };

  const handleScore = async () => {
    if (!prob) return;
    const text = answers.map((a, i) => `${i + 1}. ${a}`).join('\n');
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'ame' });
    try {
      const feedback = await gradeAmeProblem(prob, text);
      const updated = { ...prob, feedback };
      dispatch({ type: 'SET_AME_PROBLEM', payload: updated });
      dispatch({ type: 'SET_PAST', tab: 'a', payload: addPastEntry('ame', buildAmePastEntry(updated)) });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      dispatch({ type: 'SET_GRADE_BUSY', payload: null });
    }
  };

  return (
    <div className="card no-print">
      <PresetRow tab="a" />
      <IndustrySelector />
      <DiffSelector tab="a" />
      <button type="button" className="btn" onClick={handleGenerate} disabled={busy}>
        {t('aGenBtn')}
      </button>
      {prob && (
        <div style={{ marginTop: '1.5rem' }}>
          <ProblemMeta prob={prob} />
          <div className="problem-box">{esc(prob.article)}</div>
          {prob.questions.map((q, i) => (
            <div key={i} style={{ marginTop: '1rem' }}>
              <p className="sum-q-lbl">
                <span className="q-type-badge">{q.type}</span>
              </p>
              <p className="sum-q-text">{esc(q.question)}</p>
              <textarea
                className="sum-ta"
                value={answers[i] || ''}
                onChange={(e) => {
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                style={{ minHeight: '80px', width: '100%' }}
              />
            </div>
          ))}
          <button type="button" className="btn" style={{ marginTop: '12px' }} onClick={handleScore} disabled={busy}>
            {t('aSubmit')}
          </button>
          {prob.feedback && (
            <div
              className="feedback-box"
              style={{ marginTop: '1rem' }}
              dangerouslySetInnerHTML={{ __html: formatFeedback100(prob.feedback, prob.lang) }}
            />
          )}
        </div>
      )}
    </div>
  );
}
