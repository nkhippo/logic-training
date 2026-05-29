import { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext.jsx';
import { useTranslation } from '../../../hooks/useTranslation.js';
import DiffSelector from '../../shared/DiffSelector.jsx';
import PresetRow from '../../shared/PresetRow.jsx';
import IndustrySelector from '../../shared/IndustrySelector.jsx';
import ProblemMeta from '../../shared/ProblemMeta.jsx';
import { validateBeforeGen } from '../../../logic/themeHelpers.js';
import {
  generateSummaryProblem,
  gradeSummaryProblem,
  gradeSummaryProblemImage,
  buildSummaryPastEntry,
} from '../../../logic/summaryLogic.js';
import { addPastEntry } from '../../../services/pastStorage.js';
import { esc, formatFeedback100 } from '../../../utils/markdown.js';
import { S_LENGTH_VARIABLE } from '../../../domain/logic-domain.js';

const SUPPORTED_SUMMARY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * @returns {JSX.Element}
 */
export default function SummaryTab() {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const prob = state.summary;
  const [answers, setAnswers] = useState([]);
  const [answerMode, setAnswerMode] = useState('text');
  const [imageFile, setImageFile] = useState(null);
  const busy = state.genBusy === 'summary' || state.gradeBusy === 'summary';

  const handleGenerate = async () => {
    if (!validateBeforeGen(state, 's') || state.sDiff < 1) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('diffRequired') } });
      return;
    }
    dispatch({ type: 'SET_GEN_BUSY', payload: 'summary' });
    try {
      const data = await generateSummaryProblem(state);
      dispatch({ type: 'SET_SUMMARY_PROBLEM', payload: data });
      setAnswers(data.questions.map(() => ''));
      setAnswerMode('text');
      setImageFile(null);
      const past = addPastEntry('summary', buildSummaryPastEntry(data));
      dispatch({ type: 'SET_PAST', tab: 's', payload: past });
      dispatch({ type: 'SET_TOAST', payload: { message: t('sSavedOk') } });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: `${t('genFailed')} ${e.message}` } });
    } finally {
      dispatch({ type: 'SET_GEN_BUSY', payload: null });
    }
  };

  const handleScore = async () => {
    if (!prob) return;
    if (answerMode === 'image' && !imageFile) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('noPhotoError') } });
      return;
    }
    dispatch({ type: 'SET_GRADE_BUSY', payload: 'summary' });
    try {
      const feedback =
        answerMode === 'image' ? await gradeSummaryProblemImage(prob, imageFile) : await gradeSummaryProblem(prob, answers);
      const updated = { ...prob, feedback };
      dispatch({ type: 'SET_SUMMARY_PROBLEM', payload: updated });
      dispatch({ type: 'SET_PAST', tab: 's', payload: addPastEntry('summary', buildSummaryPastEntry(updated)) });
    } catch (e) {
      dispatch({ type: 'SET_TOAST', payload: { message: e.message } });
    } finally {
      dispatch({ type: 'SET_GRADE_BUSY', payload: null });
    }
  };

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!SUPPORTED_SUMMARY_IMAGE_TYPES.includes(file.type)) {
      setImageFile(null);
      e.target.value = '';
      dispatch({ type: 'SET_TOAST', payload: { message: t('summaryImageFormatError') } });
      return;
    }
    setImageFile(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card">
      <div className="no-print">
        <PresetRow tab="s" />
        <IndustrySelector />
        <DiffSelector tab="s" />
        {state.sDiff >= 4 && (
          <div id="s-volume-selector" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>{t('sVolLbl')}</label>
            <div className="preset-row">
              {['short', 'mid', 'long'].map((vol) => (
                <button
                  key={vol}
                  type="button"
                  className={`preset-btn${state.sVolume === vol ? ' sel' : ''}`}
                  onClick={() => dispatch({ type: 'SET_VOLUME', payload: vol })}
                >
                  {t(vol === 'short' ? 'volShort' : vol === 'mid' ? 'volMid' : 'volLong')}
                  {' '}
                  ({S_LENGTH_VARIABLE[vol].chars}
                  {state.lang === 'ja' ? '字' : ' chars'})
                </button>
              ))}
            </div>
          </div>
        )}
        <button type="button" className="btn" onClick={handleGenerate} disabled={busy}>
          {t('sGenBtn')}
        </button>
      </div>
      {prob && (
        <div style={{ marginTop: '1.5rem' }}>
          <ProblemMeta prob={prob} />
          <div className="problem-box">{esc(prob.text)}</div>
          <button type="button" className="btn btn-outline no-print" onClick={handlePrint} disabled={busy}>
            {t('sPrintBtn')}
          </button>
          <div className="answer-mode-bar no-print" style={{ marginTop: '1rem' }}>
            <label>{t('ansModeLbl')}</label>
            <div className="answer-mode-toggle">
              <button
                type="button"
                className={`amode-btn${answerMode === 'text' ? ' active' : ''}`}
                onClick={() => setAnswerMode('text')}
                disabled={busy}
              >
                {t('amodeText')}
              </button>
              <button
                type="button"
                className={`amode-btn${answerMode === 'image' ? ' active' : ''}`}
                onClick={() => setAnswerMode('image')}
                disabled={busy}
              >
                {t('amodePhoto')}
              </button>
            </div>
          </div>
          {prob.questions.map((q, i) => (
            <div key={i} className="sum-q-block" style={{ marginTop: '1rem' }}>
              <p className="sum-q-text">{q.question}</p>
              {answerMode === 'text' ? (
                <textarea
                  className="sum-ta no-print"
                  value={answers[i] || ''}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  style={{ minHeight: '80px', width: '100%' }}
                />
              ) : (
                <div className="summary-block-print" />
              )}
            </div>
          ))}
          {answerMode === 'image' && (
            <div className="no-print" style={{ marginTop: '1rem' }}>
              <label>{t('summaryImageLbl')}</label>
              <label className="upload-zone">
                <input
                  type="file"
                  accept={SUPPORTED_SUMMARY_IMAGE_TYPES.join(',')}
                  onChange={handleImageChange}
                  disabled={busy}
                  style={{ display: 'none' }}
                />
                <span>{imageFile ? imageFile.name : t('uploadHint')}</span>
                <br />
                <small>{t('summaryImageNote')}</small>
              </label>
            </div>
          )}
          <button
            type="button"
            className="btn no-print"
            style={{ marginTop: '12px' }}
            onClick={handleScore}
            disabled={busy}
          >
            {t('sSubmit')}
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
