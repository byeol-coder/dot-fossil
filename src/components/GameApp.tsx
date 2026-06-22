import { useReducer } from 'react';
import { createInitialState, gameReducer } from '../core/gameState';
import { usePanningInput } from '../dotpad/panningInput';
import { useKeyboardInput } from '../input/keyboardInput';
import TitleScreen from './TitleScreen';
import DigScreen from './DigScreen';
import CollectionBook from './CollectionBook';

const INITIAL_STAGE = 'desert_rib';

export default function GameApp() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STAGE, createInitialState);

  // Panning input always active
  usePanningInput(dispatch);
  // Keyboard input active in game mode
  useKeyboardInput(dispatch, state.mode);

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
