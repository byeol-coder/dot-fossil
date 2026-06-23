import { useReducer, useEffect, useRef } from 'react';
import { createInitialState, gameReducer } from '../core/gameState';
import { usePanningInput } from '../dotpad/panningInput';
import { useKeyboardInput } from '../input/keyboardInput';
import TitleScreen from './TitleScreen';
import DigScreen from './DigScreen';
import CollectionBook from './CollectionBook';

const INITIAL_STAGE = 'desert_rib';

export default function GameApp() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STAGE, createInitialState);
  const prevScreen = useRef(state.screen);

  // Panning input always active
  usePanningInput(dispatch);
  // Keyboard input active in game mode
  useKeyboardInput(dispatch, state.mode);

  // Move focus to screen heading on every screen transition
  useEffect(() => {
    if (prevScreen.current === state.screen) return;
    prevScreen.current = state.screen;

    // Small delay so React finishes rendering the new screen first
    requestAnimationFrame(() => {
      const landmark = document.querySelector<HTMLElement>(
        '[role="main"] h1, [role="main"], main h1, main'
      );
      if (landmark) {
        landmark.tabIndex = -1;
        landmark.focus({ preventScroll: true });
      }
    });
  }, [state.screen]);

  switch (state.screen) {
    case 'title':
      return <TitleScreen dispatch={dispatch} />;
    case 'game':
      return <DigScreen state={state} dispatch={dispatch} />;
    case 'collection':
      return (
        <CollectionBook
          collectedFossils={state.collectedFossils}
          fossilPieces={state.fossilPieces}
          totalPieces={state.totalPieces}
          dispatch={dispatch}
        />
      );
    default:
      return <TitleScreen dispatch={dispatch} />;
  }
}
