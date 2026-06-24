import { useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../types';

// Simulate DotPad panning gestures via keyboard
// Short left/right pan = move 1 cell
// Long left/right pan (Shift) = move 3 cells
// `enabled` gates listeners to the active dig screen so menu/result screens
// keep their own Enter/Space/arrow handling without the game mutating in the background.
export function usePanningInput(dispatch: Dispatch<GameAction>, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    function handleKey(e: KeyboardEvent) {
      // Ignore input inside form fields so AT / text entry still works
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
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
  }, [dispatch, enabled]);
}
