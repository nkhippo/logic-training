import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { ENABLE_REFLECTION } from '../../domain/constants.js';
import {
  getThinkingStepMode,
  getThinkingStepCount,
  isLastAnswerStep,
  generateThinkingFinalQuestion,
  generateThinkingFinalFeedback,
} from '../../logic/thinkingLogic.js';
import { esc } from '../../utils/markdown.js';
import StepView from './StepView.jsx';
import FinalQuestionView from './FinalQuestionView.jsx';
import FeedbackView from './FeedbackView.jsx';
import ReflectionView from './ReflectionView.jsx';

/**
 * @returns {JSX.Element|null}
 */
export default function ProblemView() {
  const { state, dispatch } = useAppContext();
  const prob = state.thinking;
  const { t } = useTranslation();

  if (!prob) return null;

  const handleAdvance = async () => {
    const current = state.thinking;
    if (!current || current.done) return;
    const stepIdx = current.currentStepIdx;
    const mode = getThinkingStepMode(current.level, stepIdx);

    if (isLastAnswerStep(current, stepIdx, mode)) {
      dispatch({ type: 'SET_GRADE_BUSY', payload: 'thinking' });
      try {
        if (current.diff < 2) {
          const fb = await generateThinkingFinalFeedback(current, null);
          dispatch({
            type: 'UPDATE_THINKING',
            payload: {
              feedback: fb,
              done: true,
              phase: ENABLE_REFLECTION ? 'reflection' : 'feedback',
            },
          });
        } else {
          const fq = await generateThinkingFinalQuestion(current);
          dispatch({
            type: 'UPDATE_THINKING',
            payload: {
              finalQuestion: fq,
              phase: 'finalQuestion',
              currentStepIdx: stepIdx,
            },
          });
        }
      } catch (e) {
        dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
      } finally {
        dispatch({ type: 'SET_GRADE_BUSY', payload: null });
      }
      return;
    }

    dispatch({
      type: 'UPDATE_THINKING',
      payload: { currentStepIdx: stepIdx + 1 },
    });
  };

  const stepCount = getThinkingStepCount(prob.level);
  const phase = prob.phase || 'steps';

  return (
    <div id="thinking-result" className="card" style={{ marginTop: '1rem' }}>
      <p className="slabel">{t('thinkingSituationLbl')}</p>
      <div className="problem-box" id="thinking-situation">
        {esc(prob.situation)}
      </div>
      {prob.extraInfo && (
        <div className="problem-box" style={{ marginTop: '8px', borderStyle: 'dashed' }}>
          {esc(prob.extraInfo)}
        </div>
      )}

      {phase === 'steps' && (
        <div id="thinking-steps" style={{ marginTop: '1rem' }}>
          {Array.from({ length: stepCount }, (_, i) => {
            if (i > prob.currentStepIdx) return null;
            const mode = getThinkingStepMode(prob.level, i);
            return (
              <StepView
                key={i}
                stepIdx={i}
                mode={mode}
                isActive={i === prob.currentStepIdx}
                onAdvance={handleAdvance}
              />
            );
          })}
        </div>
      )}

      {phase === 'finalQuestion' && <FinalQuestionView onComplete={() => {}} />}

      {(phase === 'feedback' || phase === 'reflection' || prob.feedback) && (
        <FeedbackView feedback={prob.feedback} />
      )}

      {phase === 'reflection' && ENABLE_REFLECTION && prob.reflectionStep !== -1 && (
        <ReflectionView feedback={prob.feedback} />
      )}

      {prob.done && phase === 'steps' && prob.steps?.some((s) => s?.closingFeedback) && (
        <p className="slabel" style={{ marginTop: '1rem' }}>
          {t('thinkingSessionDoneLbl') || 'セッション完了'}
        </p>
      )}
    </div>
  );
}
