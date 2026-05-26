import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.jsx';
import * as api from '../services/api.js';

/**
 * Railway API ラッパー（ローディング状態を Context に反映）
 * @returns {{ generateProblem: Function, scoreAnswer: Function }}
 */
export function useAPI() {
  const { dispatch } = useAppContext();

  const generateProblem = useCallback(
    async (params) => {
      dispatch({ type: 'SET_GEN_BUSY', payload: params.tab || 'fill' });
      try {
        const data = await api.beGenerateProblem({
          service: params.service,
          tab: params.tab,
          theme: params.theme || 'auto',
          user_id: api.backendUserId(),
          system_prompt: params.system_prompt,
          user_prompt: params.user_prompt,
          max_tokens: params.max_tokens,
          temperature: params.temperature,
          ...params,
        });
        return data;
      } finally {
        dispatch({ type: 'SET_GEN_BUSY', payload: null });
      }
    },
    [dispatch]
  );

  const scoreAnswer = useCallback(
    async (params) => {
      dispatch({ type: 'SET_GRADE_BUSY', payload: params.tab || 'fill' });
      try {
        return await api.beScoreAnswer({
          service: params.service,
          problem_id: params.problem_id,
          user_answer: params.user_answer,
          user_id: api.backendUserId(),
          context: params.context,
          system_prompt: params.system_prompt,
          user_prompt: params.user_prompt,
          max_tokens: params.max_tokens,
          temperature: params.temperature,
          ...params,
        });
      } finally {
        dispatch({ type: 'SET_GRADE_BUSY', payload: null });
      }
    },
    [dispatch]
  );

  return { generateProblem, scoreAnswer };
}
