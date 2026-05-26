import { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { THINKING_TYPES } from '../../domain/thinking-domain.js';
import { gradeThinkingStep } from '../../logic/thinkingLogic.js';
import { esc, formatFeedback100 } from '../../utils/markdown.js';

/**
 * @param {{ problem: object }} props
 * @returns {JSX.Element}
 */
export default function ProblemView({ problem }) {
  const { dispatch } = useAppContext();
  const { t, lang } = useTranslation();
  const langKey = lang === 'en' ? 'en' : 'ja';
  const [answers, setAnswers] = useState(problem.questions?.map(() => '') || []);
  const [feedback, setFeedback] = useState(null);
  const busy = false;

  const handleSubmit = async () => {
    const idx = 0;
    const answer = answers.join('\n');
    if (!answer.trim()) return;
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'thinking' });
    try {
      const fb = await gradeThinkingStep(problem, idx, answer);
      setFeedback(fb);
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      dispatch({ type: 'SET_GRADE_BUSY', payload: null });
    }
  };

  return (
    <div id="thinking-result" className="card" style={{ marginTop: '1rem' }}>
      <p className="slabel">{t('thinkingSituationLbl')}</p>
      <div className="problem-box" id="thinking-situation">
        {esc(problem.situation)}
      </div>
      {problem.extraInfo && (
        <div className="problem-box" style={{ marginTop: '8px', borderStyle: 'dashed' }}>
          {esc(problem.extraInfo)}
        </div>
      )}
      <div id="thinking-steps" style={{ marginTop: '1rem' }}>
        {problem.questions?.map((q, i) => {
          const typeObj = THINKING_TYPES[langKey].find((t) => t.id === q.typeId);
          return (
            <div key={i} className="ta-qa-block">
              <p className="ta-q-lbl">
                <strong>{typeObj?.label || ''}</strong>
              </p>
              <p className="ta-q-lbl">{esc(q.question)}</p>
              <textarea
                className="sum-ta"
                value={answers[i] || ''}
                onChange={(e) => {
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                style={{ minHeight: '120px', width: '100%' }}
              />
            </div>
          );
        })}
      </div>
      <button type="button" className="btn" style={{ marginTop: '12px' }} onClick={handleSubmit} disabled={busy}>
        {t('thinkingSubmitBtn') || t('submitBtn')}
      </button>
      {feedback && (
        <div
          id="thinking-feedback"
          className="feedback-box"
          style={{ marginTop: '1rem' }}
          dangerouslySetInnerHTML={{ __html: formatFeedback100(feedback, problem.lang) }}
        />
      )}
    </div>
  );
}
