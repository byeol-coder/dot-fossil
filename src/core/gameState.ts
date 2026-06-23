import type { GameState, GameAction, ToolType, GameMode, Screen } from '../types';
import { STAGES } from '../data/stages';
import { generateGrid } from './fossilEngine';
import { applyTool } from './digEngine';
import { getClueMessage } from './clueEngine';

export function createInitialState(stageId: string): GameState {
  const stage = STAGES[stageId] ?? STAGES['desert_rib'];
  const { grid, clues, fossilPieces } = generateGrid(stage);

  return {
    screen: 'title',
    mode: 'clue_scan',
    cursor: { x: Math.floor(stage.width / 2), y: Math.floor(stage.height / 2), size: 1 },
    selectedClueIndex: 0,
    currentTool: 'brush',
    characterAction: 'idle',
    brailleMessage: '발굴 준비 완료',
    brailleLabel: '시작',
    completion: 0,
    damage: 0,
    foundPieces: 0,
    totalPieces: stage.totalPieces,
    grid,
    clues,
    fossilPieces,
    collectedFossils: [],
    stageId,
    paused: false,
  };
}

function clampCursor(x: number, y: number, width: number, height: number) {
  return {
    x: Math.max(0, Math.min(width - 1, x)),
    y: Math.max(0, Math.min(height - 1, y)),
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const height = state.grid.length;
  const width = height > 0 ? state.grid[0].length : 20;

  switch (action.type) {
    case 'MOVE_CURSOR': {
      const newPos = clampCursor(
        state.cursor.x + action.dx,
        state.cursor.y + action.dy,
        width,
        height,
      );
      const newState: GameState = {
        ...state,
        cursor: { ...state.cursor, ...newPos },
        characterAction: 'move',
      };
      // Auto-update clue message when moving in clue_scan mode
      if (state.mode === 'clue_scan') {
        const msg = getClueMessage(newState);
        return { ...newState, brailleMessage: msg, brailleLabel: '단서 탐색' };
      }
      return newState;
    }

    case 'USE_TOOL': {
      const partial = applyTool(state, state.currentTool);
      return { ...state, ...partial };
    }

    case 'SET_TOOL': {
      const toolNames: Record<ToolType, string> = {
        brush: '브러시 선택',
        careful_dig: '조심 파기 선택',
        probe: '탐침 선택',
      };
      return {
        ...state,
        currentTool: action.tool,
        brailleMessage: toolNames[action.tool],
        brailleLabel: '도구',
        characterAction: 'idle',
      };
    }

    case 'NEXT_CLUE': {
      const nextIdx = (state.selectedClueIndex + 1) % Math.max(1, state.clues.length);
      const newState = { ...state, selectedClueIndex: nextIdx };
      const msg = getClueMessage(newState);
      return { ...newState, brailleMessage: msg, brailleLabel: '다음 단서' };
    }

    case 'PREV_CLUE': {
      const prevIdx = (state.selectedClueIndex - 1 + Math.max(1, state.clues.length)) % Math.max(1, state.clues.length);
      const newState = { ...state, selectedClueIndex: prevIdx };
      const msg = getClueMessage(newState);
      return { ...newState, brailleMessage: msg, brailleLabel: '이전 단서' };
    }

    case 'SET_MODE': {
      const modeNames: Record<GameMode, string> = {
        clue_scan: '단서 탐색 모드',
        precision_dig: '정밀 발굴 모드',
        collection: '도감 모드',
      };
      return {
        ...state,
        mode: action.mode,
        brailleMessage: modeNames[action.mode],
        brailleLabel: '모드 변경',
      };
    }

    case 'SET_SCREEN': {
      const screenNames: Record<Screen, string> = {
        title: '타이틀',
        tutorial: '튜토리얼',
        game: '게임 시작',
        collection: '도감',
      };
      return {
        ...state,
        screen: action.screen,
        brailleMessage: screenNames[action.screen],
        brailleLabel: '화면 전환',
      };
    }

    case 'READ_POSITION': {
      const cell = state.grid[state.cursor.y]?.[state.cursor.x];
      const typeKo: Record<string, string> = {
        soil: '토양',
        hard_soil: '단단한 흙',
        rock: '암석',
        fossil: '화석',
        crack: '균열',
        empty: '빈 공간',
        revealed: '발굴됨',
      };
      const typeName = cell ? (typeKo[cell.type] ?? cell.type) : '알 수 없음';
      const msg = `위치 (${state.cursor.x + 1}, ${state.cursor.y + 1}): ${typeName}`;
      return { ...state, brailleMessage: msg, brailleLabel: '위치 읽기' };
    }

    case 'READ_HINT': {
      const stage = STAGES[state.stageId];
      return {
        ...state,
        brailleMessage: stage?.target ?? '목표 없음',
        brailleLabel: '힌트',
      };
    }

    case 'READ_SURROUNDINGS': {
      const partial = applyTool(state, 'probe');
      return { ...state, ...partial };
    }

    default:
      return state;
  }
}
