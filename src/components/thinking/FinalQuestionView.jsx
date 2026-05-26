import { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import {
  gradeThinkingFinalAnswer,
  generateThinkingFinalFeedback,
} from '../../logic/thinkingLogic.js';
import { ENABLE_REFLECTION } from '../../domain/constants.js';
import { esc } from '../../utils/markdown.js';

/**
 * @param {{ onComplete: () => void }} props
 * @returns {JSX.Element|null}
 */
export default function FinalQuestionView({ onComplete }) {
  const { state, dispatch } = useAppContext();
  const prob = state.thinking;
  const { t } = useTranslation();
  const [answer, setAnswer] = useState(prob?.finalAnswer || '');
  const [hint, setHint] = useState('');
  const [showRevise, setShowRevise] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!prob) return null;

  const handleSubmit = async () => {
    const trimmed = answer.trim();
    if (!trimmed) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('overWarn') || '回答を入力してください' } });
      return;
    }
    setSubmitting(true);
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'thinking' });
    try {
      const updated = { ...prob, finalAnswer: trimmed };
      dispatch({ type: 'UPDATE_THINKING', payload: { finalAnswer: trimmed } });
      const result = await gradeThinkingFinalAnswer(updated);
      if (!result) throw new Error('no result');
      dispatch({
        type: 'UPDATE_THINKING',
        payload: { finalScore: result.score },
      });

      if (result.score >= 90) {
        await goToFeedback(result);
        return;
      }
      if (!prob.finalRetried) {
        dispatch({ type: 'UPDATE_THINKING', payload: { finalRetried: true } });
        setHint(result.feedback || '');
        setShowRevise(true);
        return;
      }
      await goToFeedback(result);
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      setSubmitting(false);
      dispatch({ type: 'SET_GRADE_BUSY', payload: null });
    }
  };

  const goToFeedback = async (finalResult) => {
    const current = state.thinking || prob;
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'thinking' });
    try {
      const fb = await generateThinkingFinalFeedback(current, finalResult);
      dispatch({
        type: 'UPDATE_THINKING',
        payload: {
          feedback: fb,
          done: true,
          phase: ENABLE_REFLECTION ? 'reflection' : 'feedback',
        },
      });
      onComplete();
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      dispatch({ type: 'SET_GRADE_BUSY', payload: null });
    }
  };

  return (
    <div className="ta-section-block" style={{ marginTop: '1rem' }}>
      <p className="slabel">{t('thinkingFinalQLbl')}</p>
      <p className="ta-q-lbl">{esc(prob.finalQuestion)}</p>
      <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '8px' }}>
        {t('thinkingFinalQDesc') || '2文以内・100字以内'}
      </p>
      <textarea
        className="sum-ta"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        style={{ minHeight: '100px', width: '100%' }}
        disabled={submitting}
      />
      {!showRevise && (
        <button type="button" className="btn" style={{ marginTop: '8px' }} onClick={handleSubmit} disabled={submitting}>
          {t('thinkingSubmitFinalBtn')}
        </button>
      )}
      {showRevise && hint && (
        <div className="ta-boss-reply-block" style={{ marginTop: '12px' }}>
          <p className="slabel">{t('thinkingFinalHintLbl') || 'もう一歩です：'}</p>
          <div className="problem-box" style={{ background: 'var(--bg2)', borderLeft: '3px solid var(--purple)' }}>
            {esc(hint)}
          </div>
          <button
            type="button"
            className="btn"
            style={{ marginTop: '8px' }}
            onClick={async () => {
              dispatch({ type: 'UPDATE_THINKING', payload: { finalAnswer: answer.trim() } });
              await goToFeedback({ score: prob.finalScore });
            }}
            disabled={submitting}
          >
            {t('thinkingReviseAndSubmitBtn') || '修正して最終回答を送信する'}
          </button>
        </div>
      )}
    </div>
  );
}
