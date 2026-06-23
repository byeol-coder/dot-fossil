import { useReducer, useEffect, useRef } from 'react';
import { createInitialState, gameReducer } from '../core/gameState';
import { usePanningInput } from '../dotpad/panningInput';
import { useKeyboardInput } from '../input/keyboardInput';
import { useDotPad } from '../dotpad/useDotPad';
import TitleScreen from './TitleScreen';
import TutorialScreen from './TutorialScreen';
import FossilSelectScreen from './FossilSelectScreen';
import StageEnterScreen from './StageEnterScreen';
import DigScreen from './DigScreen';
import StageResultScreen from './StageResultScreen';
import CollectionBook from './CollectionBook';

const INITIAL_STAGE = 'desert_rib';

export default function GameApp() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STAGE, createInitialState);
  const prevScreen = useRef(state.screen);

  // DotPad connection lives here so it persists across screen transitions
  const { status: dotpadStatus, connect, disconnect, sendGrid, sendRawHex } = useDotPad(dispatch);

  // Panning input always active
  usePanningInput(dispatch);
  // Keyboard input active in game mode
  useKeyboardInput(dispatch, state.mode);

  // Move focus to screen heading on every screen transition
  useEffect(() => {
    if (prevScreen.current === state.screen) return;
    prevScreen.current = state.screen;

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
    case 'tutorial':
      return <TutorialScreen dispatch={dispatch} />;
    case 'fossil-select':
      return <FossilSelectScreen dispatch={dispatch} />;
    case 'stage-enter':
      return <StageEnterScreen state={state} dispatch={dispatch} />;
    case 'game':
      return (
        <DigScreen
          state={state}
          dispatch={dispatch}
          dotpadStatus={dotpadStatus}
          connect={connect}
          disconnect={disconnect}
          sendGrid={sendGrid}
          sendRawHex={sendRawHex}
        />
      );
    case 'stage-result':
      return <StageResultScreen state={state} dispatch={dispatch} sendRawHex={sendRawHex} />;
    case 'collection':
      return (
        <CollectionBook
          collectedFossils={state.collectedFossils}
          fossilPieces={state.fossilPieces}
          totalPieces={state.totalPieces}
          dispatch={dispatch}
          sendRawHex={sendRawHex}
        />
      );
    default:
      return <TitleScreen dispatch={dispatch} />;
  }
}
