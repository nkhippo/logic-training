import { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext.jsx';
import { useTranslation } from '../../../hooks/useTranslation.js';
import DiffSelector from '../../shared/DiffSelector.jsx';
import PresetRow from '../../shared/PresetRow.jsx';
import IndustrySelector from '../../shared/IndustrySelector.jsx';
import ProblemMeta from '../../shared/ProblemMeta.jsx';
import { validateBeforeGen } from '../../../logic/themeHelpers.js';
import {
  generateCritiqueProblem,
  gradeCritiqueProblem,
  buildCritiquePastEntry,
} from '../../../logic/critiqueLogic.js';
import { addPastEntry } from '../../../services/pastStorage.js';
import { esc, formatFeedback100 } from '../../../utils/markdown.js';

/**
 * @returns {JSX.Element}
 */
export default function CritiqueTab() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const prob = state.critique;
  const [answer, setAnswer] = useState('');
  const busy = state.genBusy === 'critique' || state.gradeBusy === 'critique';

  const handleGenerate = async () => {
    if (!validateBeforeGen(state, 'c') || state.cDiff < 1) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('diffRequired') } });
      return;
    }
    dispatch({ type: 'SET_GEN_BUSY', payload: 'critique' });
    try {
      const data = await generateCritiqueProblem(state);
      dispatch({ type: 'SET_CRITIQUE_PROBLEM', payload: data });
      setAnswer('');
      dispatch({ type: 'SET_PAST', tab: 'c', payload: addPastEntry('critique', buildCritiquePastEntry(data)) });
      dispatch({ type: 'SET_TOAST', payload: { message: t('cSavedOk') } });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      dispatch({ type: 'SET_GEN_BUSY', payload: null });
    }
  };

  const handleScore = async () => {
    if (!prob || !answer.trim()) return;
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'critique' });
    try {
      const feedback = await gradeCritiqueProblem(prob, answer);
      const updated = { ...prob, feedback };
      dispatch({ type: 'SET_CRITIQUE_PROBLEM', payload: updated });
      dispatch({ type: 'SET_PAST', tab: 'c', payload: addPastEntry('critique', buildCritiquePastEntry(updated)) });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      dispatch({ type: 'SET_GRADE_BUSY', payload: null });
    }
  };

  return (
    <div className="card no-print">
      <PresetRow tab="c" />
      <IndustrySelector />
      <DiffSelector tab="c" />
      <button type="button" className="btn" onClick={handleGenerate} disabled={busy}>
        {t('cGenBtn')}
      </button>
      {prob && (
        <div style={{ marginTop: '1.5rem' }}>
          <ProblemMeta prob={prob} />
          {prob.text && <div className="problem-box">{esc(prob.text)}</div>}
          {prob.questions?.map((q, i) => (
            <div key={i} style={{ marginTop: '1rem' }}>
              {q.argument && <p className="sum-q-text">{esc(q.argument)}</p>}
              <p className="sum-q-text">{esc(q.question)}</p>
            </div>
          ))}
          <textarea
            className="sum-ta"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ minHeight: '120px', width: '100%', marginTop: '1rem' }}
            placeholder={t('cInst')}
          />
          <button type="button" className="btn" style={{ marginTop: '12px' }} onClick={handleScore} disabled={busy}>
            {t('cSubmit')}
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
