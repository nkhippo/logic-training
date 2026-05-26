import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.jsx';
import { L } from '../services/i18n.js';
import { LANG_KEY } from '../domain/constants.js';

/**
 * @returns {{ t: Function, lang: string, setLang: Function }}
 */
export function useTranslation() {
  const { state, dispatch } = useAppContext();

  const t = useCallback(
    (key) => {
      const text = L[state.lang]?.[key];
      return text !== undefined ? text : key;
    },
    [state.lang]
  );

  const setLang = useCallback(
    (lang) => {
      dispatch({ type: 'SET_LANG', payload: lang });
      localStorage.setItem(LANG_KEY, lang);
    },
    [dispatch]
  );

  return { t, lang: state.lang, setLang };
}
