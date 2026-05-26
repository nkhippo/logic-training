import { useState } from 'react';
import { THINKING_CORES, THINKING_LEVELS } from '../../domain/thinking-domain.js';
import { useAppContext } from '../../contexts/AppContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import IndustrySelector from '../shared/IndustrySelector.jsx';
import { generateThinkingProblem, buildThinkingPastEntry } from '../../logic/thinkingLogic.js';
import { addPastEntry } from '../../services/pastStorage.js';

/**
 * @returns {JSX.Element}
 */
export default function GenerateForm() {
  const { state, dispatch } = useAppContext();
  const { t, lang } = useTranslation();
  const langKey = lang === 'en' ? 'en' : 'ja';
  const [core, setCore] = useState('');
  const [level, setLevel] = useState(1);
  const [thinkingDiff, setThinkingDiff] = useState(0);
  const busy = state.genBusy === 'thinking';

  const cores = [{ value: '', label: t('thinkingCoreRandom') || 'ランダム' }, ...THINKING_CORES[langKey]];

  const handleGenerate = async () => {
    if (!thinkingDiff) {
      dispatch({ type: 'SET_TOAST', payload: { message: t('diffRequired') } });
      return;
    }
    dispatch({ type: 'SET_GEN_BUSY', payload: 'thinking' });
    try {
      const data = await generateThinkingProblem({
        lang,
        diff: thinkingDiff,
        level: thinkingDiff >= 3 ? level : 1,
        core,
        industry: state.industry,
        personas: state.personas,
        tenure: state.tenure,
      });
      dispatch({ type: 'SET_THINKING_PROBLEM', payload: data });
      dispatch({
        type: 'SET_THINKING_PAST',
        payload: addPastEntry('thinking', buildThinkingPastEntry(data)),
      });
    } catch (e) {
      dispatch({
        type: 'SET_TOAST',
        payload: { message: `${t('thinkingGenFailed') || '生成失敗'} ${e.message}` },
      });
    } finally {
      dispatch({ type: 'SET_GEN_BUSY', payload: null });
    }
  };

  return (
    <div className="card no-print">
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500 }}>{t('thinkingCoreLbl')}</label>
        <div className="preset-row">
          {cores.map((item) => (
            <button
              key={item.value || 'rand'}
              type="button"
              className={`preset-btn${core === item.value ? ' sel' : ''}`}
              onClick={() => setCore(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <IndustrySelector />
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500 }}>{t('thinkingDiffLbl')}</label>
        <div className="diff-row" id="thinking-diff-row">
          {[1, 2, 3, 4, 5].map((d, i) => (
            <button
              key={d}
              type="button"
              className={`diff-btn${thinkingDiff === d ? ' sel' : ''}`}
              onClick={() => setThinkingDiff(d)}
            >
              {'★'.repeat(d)}
              {'☆'.repeat(5 - d)}
              <br />
              <span className="dlbl">{Array.isArray(t('dLabels')) ? t('dLabels')[i] : ''}</span>
            </button>
          ))}
        </div>
      </div>
      {thinkingDiff >= 3 && (
        <div id="thinking-level-block" style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500 }}>{t('thinkingLevelLbl')}</label>
          <div className="preset-row">
            {THINKING_LEVELS[langKey].map((lv) => (
              <button
                key={lv.id}
                type="button"
                className={`preset-btn${level === lv.id ? ' sel' : ''}`}
                onClick={() => setLevel(lv.id)}
              >
                {lv.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button type="button" className="btn" onClick={handleGenerate} disabled={busy}>
        {t('thinkingGenBtn')}
      </button>
    </div>
  );
}
