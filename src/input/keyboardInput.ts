import { useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameMode } from '../types';

export function useKeyboardInput(dispatch: Dispatch<GameAction>, mode: GameMode) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Tool selection
      if (e.key === '1') {
        dispatch({ type: 'SET_TOOL', tool: 'brush' });
        return;
      }
      if (e.key === '2') {
        dispatch({ type: 'SET_TOOL', tool: 'careful_dig' });
        return;
      }
      if (e.key === '3') {
        dispatch({ type: 'SET_TOOL', tool: 'probe' });
        return;
      }

      // Mode switching
      if (e.key === 'F1') {
        e.preventDefault();
        dispatch({ type: 'SET_MODE', mode: 'clue_scan' });
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        dispatch({ type: 'SET_MODE', mode: 'precision_dig' });
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        dispatch({ type: 'SET_SCREEN', screen: 'collection' });
        return;
      }

      // Clue navigation
      if (e.key === 'Tab' && mode === 'clue_scan') {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch({ type: 'PREV_CLUE' });
        } else {
          dispatch({ type: 'NEXT_CLUE' });
        }
        return;
      }

      // Info keys
      if (e.key === 'p' || e.key === 'P') {
        dispatch({ type: 'READ_POSITION' });
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        dispatch({ type: 'READ_HINT' });
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        dispatch({ type: 'READ_SURROUNDINGS' });
        return;
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dispatch, mode]);
}
