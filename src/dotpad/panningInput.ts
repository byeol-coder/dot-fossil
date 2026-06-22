import { useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../types';

// Simulate DotPad panning gestures via keyboard
// Short left/right pan = move 1 cell
// Long left/right pan (Shift) = move 3 cells
export function usePanningInput(dispatch: Dispatch<GameAction>) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const shift = e.shiftKey;
      const step = shift ? 3 : 1;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          dispatch({ type: 'MOVE_CURSOR', dx: -step, dy: 0 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          dispatch({ type: 'MOVE_CURSOR', dx: step, dy: 0 });
          break;
        case 'ArrowUp':
          e.preventDefault();
          dispatch({ type: 'MOVE_CURSOR', dx: 0, dy: -step });
          break;
        case 'ArrowDown':
          e.preventDefault();
          dispatch({ type: 'MOVE_CURSOR', dx: 0, dy: step });
          break;
        case ' ':
        case 'Enter':
          if (!e.shiftKey) {
            e.preventDefault();
            dispatch({ type: 'USE_TOOL' });
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dispatch]);
}
