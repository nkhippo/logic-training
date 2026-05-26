import { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import {
  generateThinkingReflectionFeedback,
  extractReflectionPrompt,
} from '../../logic/thinkingLogic.js';
import { md2h } from '../../utils/markdown.js';

/**
 * @param {{ feedback: string }} props
 * @returns {JSX.Element|null}
 */
export default function ReflectionView({ feedback }) {
  const { state, dispatch } = useAppContext();
  const prob = state.thinking;
  const { t } = useTranslation();
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [fb1, setFb1] = useState('');
  const [fb2, setFb2] = useState('');
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!prob || prob.reflectionStep === -1) return null;

  const d1Prompt = extractReflectionPrompt(feedback, prob.lang);

  const handleSkip = () => {
    dispatch({ type: 'UPDATE_THINKING', payload: { reflectionStep: -1, phase: 'feedback' } });
    setDone(true);
  };

  const handleSubmit = async (r) => {
    const ans = r === 1 ? ans1.trim() : ans2.trim();
    if (!ans) return;
    setSubmitting(true);
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'thinking' });
    try {
      const fb = await generateThinkingReflectionFeedback(prob, r, ans);
      dispatch({ type: 'UPDATE_THINKING', payload: { reflectionStep: r } });
      if (r === 1) {
        setFb1(fb);
        setRound(1);
      } else {
        setFb2(fb);
        setRound(2);
        setDone(true);
      }
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      setSubmitting(false);
      dispatch({ type: 'SET_GRADE_BUSY', payload: null });
    }
  };

  if (prob.reflectionStep === -1 && done) {
    return (
      <p className="slabel" style={{ marginTop: '1rem' }}>
        {t('thinkingSessionDoneLbl') || 'セッション完了'}
      </p>
    );
  }

  return (
    <div className="ta-section-block" style={{ marginTop: '1.5rem', borderLeft: '3px solid var(--purple)' }}>
      <p className="slabel">{t('thinkingReflectLbl')}</p>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px' }}>
        {t('thinkingReflectDesc') || '以下の問いかけは任意です。'}
      </p>
      {round === 0 && d1Prompt && (
        <div
          className="problem-box"
          style={{ marginBottom: '12px', background: 'var(--bg2)' }}
          dangerouslySetInnerHTML={{ __html: md2h(d1Prompt) }}
        />
      )}
      {round === 0 && (
        <>
          <textarea
            className="sum-ta"
            value={ans1}
            onChange={(e) => setAns1(e.target.value)}
            placeholder={t('thinkingReflectPlaceholder') || '振り返りを入力...'}
            style={{ minHeight: '100px', width: '100%' }}
            disabled={submitting}
          />
          <div className="action-bar" style={{ marginTop: '8px', gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={() => handleSubmit(1)} disabled={submitting}>
              {t('thinkingReflectReplyBtn')}
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
              onClick={handleSkip}
            >
              {t('thinkingReflectSkipBtn')}
            </button>
          </div>
        </>
      )}
      {fb1 && <div style={{ marginTop: '12px' }} dangerouslySetInnerHTML={{ __html: md2h(fb1) }} />}
      {round >= 1 && !done && (
        <>
          <textarea
            className="sum-ta"
            value={ans2}
            onChange={(e) => setAns2(e.target.value)}
            placeholder={t('thinkingReflectPlaceholder')}
            style={{ minHeight: '100px', width: '100%', marginTop: '12px' }}
            disabled={submitting}
          />
          <div className="action-bar" style={{ marginTop: '8px', gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={() => handleSubmit(2)} disabled={submitting}>
              {t('thinkingReflectReply2Btn')}
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
              onClick={handleSkip}
            >
              {t('thinkingReflectSkipBtn')}
            </button>
          </div>
        </>
      )}
      {fb2 && <div style={{ marginTop: '12px' }} dangerouslySetInnerHTML={{ __html: md2h(fb2) }} />}
      {done && (
        <p className="slabel" style={{ marginTop: '1rem' }}>
          {t('thinkingSessionDoneLbl') || 'セッション完了'}
        </p>
      )}
    </div>
  );
}
