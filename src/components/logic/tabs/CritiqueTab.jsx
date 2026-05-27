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
  normCritiqueProb,
} from '../../../logic/critiqueLogic.js';
import { addPastEntry } from '../../../services/pastStorage.js';
import { L } from '../../../services/i18n.js';
import { esc, formatFeedback100 } from '../../../utils/markdown.js';
import CritiqueQuestionBlock from './CritiqueQuestionBlock.jsx';

/**
 * @returns {JSX.Element}
 */
export default function CritiqueTab() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const labels = L[state.lang] || L.ja;
  const prob = state.critique ? normCritiqueProb(state.critique) : null;
  const [answers, setAnswers] = useState([]);
  const busy = state.genBusy === 'critique' || state.gradeBusy === 'critique';

  const handleGenerate = async () => {
    if (!validateBeforeGen(state, 'c') || state.cDiff < 1) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('diffRequired') } });
      return;
    }
    dispatch({ type: 'SET_GEN_BUSY', payload: 'critique' });
    try {
      const data = normCritiqueProb(await generateCritiqueProblem(state));
      dispatch({ type: 'SET_CRITIQUE_PROBLEM', payload: data });
      setAnswers(data.questions.map(() => ''));
      dispatch({ type: 'SET_PAST', tab: 'c', payload: addPastEntry('critique', buildCritiquePastEntry(data)) });
      dispatch({ type: 'SET_TOAST', payload: { message: t('cSavedOk') } });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: `${t('cGenFailed')} ${e.message}` } });
    } finally {
      dispatch({ type: 'SET_GEN_BUSY', payload: null });
    }
  };

  const handleScore = async () => {
    if (!prob) return;
    if (answers.some((a) => !String(a || '').trim())) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('critiqueAnswerRequired') } });
      return;
    }
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'critique' });
    try {
      const feedback = await gradeCritiqueProblem(prob, answers);
      const updated = { ...prob, feedback };
      dispatch({ type: 'SET_CRITIQUE_PROBLEM', payload: updated });
      dispatch({ type: 'SET_PAST', tab: 'c', payload: addPastEntry('critique', buildCritiquePastEntry(updated)) });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: `${t('cGradingErr')}: ${e.message}` } });
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
          {prob.form === 'A' && prob.text && <div className="problem-box">{esc(prob.text)}</div>}
          {prob.questions.map((q, i) => (
            <CritiqueQuestionBlock
              key={q.id || i}
              q={q}
              index={i}
              form={prob.form}
              lang={prob.lang || state.lang}
              value={answers[i] || ''}
              onChange={(v) => {
                const next = [...answers];
                next[i] = v;
                setAnswers(next);
              }}
              labels={labels}
            />
          ))}
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
