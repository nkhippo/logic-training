import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.jsx';
import { loadPersonaFromStorage, savePersonaToStorage } from '../services/persona.js';

/**
 * @returns {object}
 */
export function usePersona() {
  const { state, dispatch } = useAppContext();

  const loadPersona = useCallback(() => {
    const data = loadPersonaFromStorage();
    dispatch({ type: 'SET_PERSONAS', payload: data.personas });
    dispatch({ type: 'SET_TENURE', payload: data.tenure });
  }, [dispatch]);

  const savePersona = useCallback(
    (personas, tenure) => {
      savePersonaToStorage(personas, tenure);
      dispatch({ type: 'SET_PERSONAS', payload: personas });
      dispatch({ type: 'SET_TENURE', payload: tenure });
    },
    [dispatch]
  );

  return {
    personas: state.personas,
    tenure: state.tenure,
    loadPersona,
    savePersona,
  };
}
