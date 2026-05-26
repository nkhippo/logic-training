import { useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext.jsx';

/**
 * @returns {JSX.Element|null}
 */
export default function Toast() {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    if (!state.toast) return undefined;
    const id = setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), state.toast.ms || 3500);
    return () => clearTimeout(id);
  }, [state.toast, dispatch]);

  if (!state.toast?.message) return null;
  return <div className="toast show">{state.toast.message}</div>;
}
