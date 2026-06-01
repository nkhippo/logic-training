import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { LANG_KEY, DEFAULT_S_VOLUME } from '../domain/constants.js';
import { loadPersonaFromStorage } from '../services/persona.js';
import { loadPastFromStorage } from '../services/pastStorage.js';
import { migrateLocalStorageKeys } from '../utils/migrate.js';

const AppContext = createContext(null);

const initialState = {
  lang: localStorage.getItem(LANG_KEY) || 'ja',
  fDiff: 0,
  sDiff: 0,
  cDiff: 0,
  aDiff: 0,
  fDocType: '',
  sDocType: '',
  cDocType: '',
  aDocType: '',
  fCustomTheme: '',
  sCustomTheme: '',
  cCustomTheme: '',
  aCustomTheme: '',
  sVolume: DEFAULT_S_VOLUME,
  fFilter: 'all',
  sFilter: 'all',
  cFilter: 'all',
  aFilter: 'all',
  fPast: [],
  sPast: [],
  cPast: [],
  aPast: [],
  fill: null,
  summary: null,
  critique: null,
  ame: null,
  thinking: null,
  thinkingPast: [],
  industry: '',
  personas: [],
  tenure: '',
  genBusy: null,
  genPhase: null,
  gradeBusy: null,
  gradePhase: null,
  toast: null,
};

/**
 * @param {object} state
 * @param {object} action
 * @returns {object}
 */
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LANG':
      return { ...state, lang: action.payload };
    case 'SET_DIFF': {
      const key = `${action.tab}Diff`;
      return { ...state, [key]: action.payload };
    }
    case 'SET_DOC_TYPE': {
      const key = `${action.tab}DocType`;
      return { ...state, [key]: action.payload };
    }
    case 'SET_CUSTOM_THEME': {
      const key = `${action.tab}CustomTheme`;
      return { ...state, [key]: action.payload };
    }
    case 'SET_VOLUME':
      return { ...state, sVolume: action.payload };
    case 'SET_INDUSTRY':
      return { ...state, industry: action.payload };
    case 'SET_PERSONAS':
      return { ...state, personas: action.payload };
    case 'SET_TENURE':
      return { ...state, tenure: action.payload };
    case 'SET_FILL_PROBLEM':
      return { ...state, fill: action.payload };
    case 'SET_SUMMARY_PROBLEM':
      return { ...state, summary: action.payload };
    case 'SET_CRITIQUE_PROBLEM':
      return { ...state, critique: action.payload };
    case 'SET_AME_PROBLEM':
      return { ...state, ame: action.payload };
    case 'SET_THINKING_PROBLEM':
      return { ...state, thinking: action.payload };
    case 'SET_THINKING_PHASE': {
      if (!state.thinking) return state;
      return {
        ...state,
        thinking: { ...state.thinking, phase: action.payload },
      };
    }
    case 'SET_THINKING_STEP_RESULT': {
      if (!state.thinking) return state;
      const steps = [...(state.thinking.steps || [])];
      steps[action.stepIdx] = { ...steps[action.stepIdx], ...action.payload };
      return {
        ...state,
        thinking: { ...state.thinking, steps },
      };
    }
    case 'UPDATE_THINKING': {
      if (!state.thinking) return state;
      return {
        ...state,
        thinking: { ...state.thinking, ...action.payload },
      };
    }
    case 'SET_PAST': {
      const pastKey = `${action.tab}Past`;
      return { ...state, [pastKey]: action.payload };
    }
    case 'SET_THINKING_PAST':
      return { ...state, thinkingPast: action.payload };
    case 'SET_FILTER': {
      const filterKey = `${action.tab}Filter`;
      return { ...state, [filterKey]: action.payload };
    }
    case 'SET_GEN_BUSY':
      return { ...state, genBusy: action.payload };
    case 'SET_GRADE_BUSY':
      return { ...state, gradeBusy: action.payload };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    default:
      return state;
  }
}

/**
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    migrateLocalStorageKeys();
    const persona = loadPersonaFromStorage();
    dispatch({ type: 'SET_PERSONAS', payload: persona.personas });
    dispatch({ type: 'SET_TENURE', payload: persona.tenure });
    dispatch({ type: 'SET_PAST', tab: 'f', payload: loadPastFromStorage('fill') });
    dispatch({ type: 'SET_PAST', tab: 's', payload: loadPastFromStorage('summary') });
    dispatch({ type: 'SET_PAST', tab: 'c', payload: loadPastFromStorage('critique') });
    dispatch({ type: 'SET_PAST', tab: 'a', payload: loadPastFromStorage('ame') });
    dispatch({ type: 'SET_THINKING_PAST', payload: loadPastFromStorage('thinking') });
  }, []);

  useEffect(() => {
    document.documentElement.lang = state.lang;
  }, [state.lang]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * @returns {{ state: object, dispatch: Function }}
 */
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
