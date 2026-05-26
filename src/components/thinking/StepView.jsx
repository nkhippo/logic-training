import { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { THINKING_TYPES } from '../../domain/thinking-domain.js';
import {
  gradeThinkingStep,
  generateThinkingFollowup,
  generateThinkingClosingFeedback,
  isLastAnswerStep,
} from '../../logic/thinkingLogic.js';
import { esc, md2h } from '../../utils/markdown.js';

/**
 * @param {{ stepIdx: number, mode: string, isActive: boolean, onAdvance: (next: string) => Promise<void> }} props
 * @returns {JSX.Element|null}
 */
export default function StepView({ stepIdx, mode, isActive, onAdvance }) {
  const { state, dispatch } = useAppContext();
  const prob = state.thinking;
  const { t, lang } = useTranslation();
  const langKey = lang === 'en' ? 'en' : 'ja';
  const saved = prob?.steps?.[stepIdx];
  const [defineAns, setDefineAns] = useState('');
  const [typeChecks, setTypeChecks] = useState([]);
  const [orderReason, setOrderReason] = useState('');
  const [define2Ans, setDefine2Ans] = useState(prob?.questions?.map(() => '') || []);
  const [answers, setAnswers] = useState(prob?.questions?.map(() => '') || []);
  const [followup, setFollowup] = useState(saved?.followup || '');
  const [closingFb, setClosingFb] = useState(saved?.closingFeedback || '');
  const [showActions, setShowActions] = useState(false);
  const [actionKind, setActionKind] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviseMode, setReviseMode] = useState(false);

  if (!prob) return null;

  const collectAnswer = () => {
    if (mode === 'define') return defineAns.trim();
    if (mode === 'typeselect') {
      return JSON.stringify({ selectedTypes: typeChecks, orderReason: orderReason.trim() });
    }
    if (mode === 'define2') return define2Ans.map((a) => a.trim()).join('\n---\n');
    return answers.map((a) => a.trim()).join('\n---\n');
  };

  const handleSubmit = async () => {
    const answer = collectAnswer();
    if (!answer || answer === '{"selectedTypes":[],"orderReason":""}') {
      dispatch({ type: 'SET_TOAST', payload: { message: t('overWarn') || '回答を入力してください' } });
      return;
    }
    setSubmitting(true);
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'thinking' });
    try {
      const result = await gradeThinkingStep(prob, stepIdx, mode, answer);
      if (!result) throw new Error('no result');

      const stepPatch = {
        mode,
        answer,
        score: result.score,
        pass: result.pass,
        missing: result.missing || [],
        logicIssues: result.logicIssues || [],
        reason: result.reason || '',
        revised: saved?.revised || false,
        retryCount: saved?.retryCount || 0,
      };
      dispatch({ type: 'SET_THINKING_STEP_RESULT', stepIdx, payload: stepPatch });

      const updates = {};
      if (result.userCore?.trim() && mode !== 'answer') {
        updates.userCore = result.userCore.trim();
      }
      if (Object.keys(updates).length) {
        dispatch({ type: 'UPDATE_THINKING', payload: updates });
      }

      const score = result.score ?? 0;
      if (score >= 95) {
        await onAdvance('next');
        return;
      }
      if (score >= 80) {
        const fu = await generateThinkingFollowup(
          { ...prob, steps: prob.steps.map((s, i) => (i === stepIdx ? { ...s, ...stepPatch } : s)) },
          result,
          'soft',
        );
        dispatch({
          type: 'SET_THINKING_STEP_RESULT',
          stepIdx,
          payload: { followup: fu },
        });
        setFollowup(fu);
        setActionKind('soft');
        setShowActions(true);
        return;
      }

      const retryCount = saved?.retryCount || 0;
      if (retryCount >= 1) {
        const closing = await generateThinkingClosingFeedback(prob, stepIdx);
        dispatch({
          type: 'SET_THINKING_STEP_RESULT',
          stepIdx,
          payload: { closingFeedback: closing },
        });
        dispatch({ type: 'UPDATE_THINKING', payload: { done: true, phase: 'steps' } });
        setClosingFb(closing);
        setShowActions(false);
        return;
      }

      const fu = await generateThinkingFollowup(
        { ...prob, steps: prob.steps.map((s, i) => (i === stepIdx ? { ...s, ...stepPatch, revised: true } : s)) },
        result,
        'strong',
      );
      dispatch({
        type: 'SET_THINKING_STEP_RESULT',
        stepIdx,
        payload: { followup: fu, revised: true, retryCount: 1 },
      });
      setFollowup(fu);
      setActionKind('revise-only');
      setShowActions(true);
      setReviseMode(true);
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      setSubmitting(false);
      dispatch({ type: 'SET_GRADE_BUSY', payload: null });
    }
  };

  const displaySaved = saved && !isActive && !reviseMode;
  const canEdit = isActive && !prob.done && (!saved?.closingFeedback || reviseMode);

  const renderInputs = () => {
    if (mode === 'define') {
      return (
        <div className="ta-qa-block">
          <p className="ta-q-lbl">{t('thinkingDefineQuestionLbl')}</p>
          <textarea
            className="sum-ta"
            value={defineAns}
            onChange={(e) => setDefineAns(e.target.value)}
            style={{ minHeight: '100px', width: '100%' }}
            disabled={!canEdit || submitting}
          />
        </div>
      );
    }
    if (mode === 'typeselect') {
      const types = THINKING_TYPES[langKey];
      return (
        <div className="ta-qa-block">
          <p className="ta-q-lbl">{t('thinkingTypeSelectLbl')}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {types.map((tp) => (
              <label key={tp.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={typeChecks.includes(tp.id)}
                  onChange={(e) => {
                    if (e.target.checked) setTypeChecks([...typeChecks, tp.id]);
                    else setTypeChecks(typeChecks.filter((id) => id !== tp.id));
                  }}
                  disabled={!canEdit || submitting}
                />
                <span>{tp.label}</span>
              </label>
            ))}
          </div>
          <p className="ta-q-lbl">{t('thinkingTypeOrderLbl')}</p>
          <textarea
            className="sum-ta"
            value={orderReason}
            onChange={(e) => setOrderReason(e.target.value)}
            style={{ minHeight: '80px', width: '100%' }}
            disabled={!canEdit || submitting}
          />
        </div>
      );
    }
    if (mode === 'define2') {
      return prob.questions.map((q, i) => {
        const typeObj = THINKING_TYPES[langKey].find((tp) => tp.id === q.typeId);
        return (
          <div key={i} className="ta-qa-block">
            <p className="ta-q-lbl">
              <strong>{typeObj?.label}</strong>
            </p>
            <p className="ta-q-lbl" style={{ color: 'var(--text2)', fontSize: '12px' }}>
              {typeObj?.desc}
            </p>
            <p className="ta-q-lbl">{t('thinkingDefineCheckLbl')}</p>
            <textarea
              className="sum-ta"
              value={define2Ans[i] || ''}
              onChange={(e) => {
                const next = [...define2Ans];
                next[i] = e.target.value;
                setDefine2Ans(next);
              }}
              style={{ minHeight: '80px', width: '100%' }}
              disabled={!canEdit || submitting}
            />
          </div>
        );
      });
    }
    return prob.questions.map((q, i) => {
      const typeObj = THINKING_TYPES[langKey].find((tp) => tp.id === q.typeId);
      const target = q.targetChars || 200;
      return (
        <div key={i} className="ta-qa-block">
          <p className="ta-q-lbl">
            <strong>{typeObj?.label}</strong>
          </p>
          <p className="ta-q-lbl">{esc(q.question)}</p>
          <p className="ta-q-lbl" style={{ fontSize: '12px', color: 'var(--text2)' }}>
            {t('thinkingStepCharTarget')?.replace('{n}', String(target)) || `（目安 ${target} 字）`}
          </p>
          <textarea
            className="sum-ta"
            value={answers[i] || ''}
            onChange={(e) => {
              const next = [...answers];
              next[i] = e.target.value;
              setAnswers(next);
            }}
            style={{ minHeight: '120px', width: '100%' }}
            disabled={!canEdit || submitting}
          />
        </div>
      );
    });
  };

  return (
    <div className="ta-step-block" data-step={stepIdx}>
      <p className="ta-step-lbl">
        {t('thinkingStepLbl') || 'ステップ'} {stepIdx + 1}
      </p>
      {renderInputs()}
      {canEdit && !showActions && !closingFb && (
        <button
          type="button"
          className="btn"
          style={{ marginTop: '12px' }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {t('thinkingSubmitStepBtn') || t('thinkingSubmitBtn')}
        </button>
      )}
      {(saved?.reason || displaySaved) && (
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '8px' }}>{esc(saved?.reason)}</p>
      )}
      {followup && (
        <div className="ta-boss-reply-block" style={{ marginTop: '12px' }}>
          <p className="slabel">{t('thinkingFollowupLbl') || '上司からのフィードバック'}</p>
          <div
            className="problem-box"
            style={{ background: 'var(--bg2)', borderLeft: '3px solid var(--amber)' }}
          >
            {esc(followup)}
          </div>
        </div>
      )}
      {showActions && actionKind === 'soft' && (
        <div className="action-bar" style={{ marginTop: '8px', gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-sm" onClick={() => onAdvance('next')} disabled={submitting}>
            {t('thinkingProceedBtn') || 'このまま次へ進む'}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: 'var(--bg2)', color: 'var(--text)' }}
            onClick={() => {
              setShowActions(false);
              setReviseMode(true);
            }}
          >
            {t('thinkingReviseBtn')}
          </button>
        </div>
      )}
      {showActions && actionKind === 'revise-only' && (
        <div className="action-bar" style={{ marginTop: '8px' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setShowActions(false);
              setFollowup('');
              setReviseMode(true);
            }}
          >
            {t('thinkingReviseBtn')}
          </button>
        </div>
      )}
      {(closingFb || saved?.closingFeedback) && (
        <div className="ta-section-block" style={{ marginTop: '12px' }}>
          <p className="slabel">{t('thinkingClosedLbl') || '打ち切り'}</p>
          <p style={{ fontSize: '13px', color: 'var(--text2)' }}>{t('thinkingClosedDesc')}</p>
          <div dangerouslySetInnerHTML={{ __html: md2h(closingFb || saved?.closingFeedback) }} />
        </div>
      )}
    </div>
  );
}
