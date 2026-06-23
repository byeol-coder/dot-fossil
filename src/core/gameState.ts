import type {
  GameState, GameAction, ToolType, GameMode, Screen,
  ExcavationGrade, ExcavationResult, CollectionItem,
} from '../types';
import { STAGES } from '../data/stages';
import { generateGrid } from './fossilEngine';
import { applyTool } from './digEngine';
import { getClueMessage } from './clueEngine';
import { ko } from '../i18n/ko';

// ── LocalStorage persistence ───────────────────────────────────────────────

function loadCollection(): CollectionItem[] {
  try {
    const raw = localStorage.getItem('dot-fossil-collection');
    return raw ? (JSON.parse(raw) as CollectionItem[]) : [];
  } catch {
    return [];
  }
}

function persistCollection(col: CollectionItem[]): void {
  try {
    localStorage.setItem('dot-fossil-collection', JSON.stringify(col));
  } catch { /* ignore */ }
}

// ── Grade calculation ──────────────────────────────────────────────────────

export function getExcavationGrade(completion: number, damage: number): ExcavationGrade {
  if (completion >= 90 && damage <= 10) return 'clean';
  if (completion >= 70 && damage <= 30) return 'good';
  return 'restore_needed';
}

function buildResult(state: GameState): ExcavationResult {
  const stage = STAGES[state.stageId];
  return {
    stageId: state.stageId,
    fossilId: stage?.fossils[0]?.fossilId ?? state.stageId,
    completion: state.completion,
    damage: state.damage,
    foundPieces: state.foundPieces,
    requiredPieces: state.totalPieces,
    grade: getExcavationGrade(state.completion, state.damage),
    completedAt: new Date().toISOString(),
  };
}

function mergeIntoCollection(
  collection: CollectionItem[],
  result: ExcavationResult,
): CollectionItem[] {
  const next = [...collection];
  const idx  = next.findIndex(c => c.fossilId === result.fossilId);
  if (idx >= 0) {
    next[idx] = {
      ...next[idx],
      bestCompletion: Math.max(next[idx].bestCompletion, result.completion),
      lowestDamage:   Math.min(next[idx].lowestDamage, result.damage),
      timesCompleted: next[idx].timesCompleted + 1,
      grade:          result.grade,
      lastCompletedAt: result.completedAt,
    };
  } else {
    next.push({
      fossilId:       result.fossilId,
      stageId:        result.stageId,
      bestCompletion: result.completion,
      lowestDamage:   result.damage,
      grade:          result.grade,
      timesCompleted: 1,
      unlocked:       true,
      completed:      true,
      lastCompletedAt: result.completedAt,
    });
  }
  return next;
}

// ── Initial state ──────────────────────────────────────────────────────────

export function createInitialState(stageId: string): GameState {
  const stage = STAGES[stageId] ?? STAGES['desert_rib'];
  const { grid, clues, fossilPieces } = generateGrid(stage);
  const collection = loadCollection();

  return {
    screen:     'title',
    mode:       'clue_scan',
    cursor:     { x: Math.floor(stage.width / 2), y: Math.floor(stage.height / 2), size: 1 },
    selectedClueIndex: 0,
    currentTool: 'brush',
    characterAction: 'idle',
    brailleMessage:  ko.braille.helloDoti,
    brailleLabel:    '시작',
    dialogueMessage: '',
    completion: 0,
    damage:     0,
    foundPieces: 0,
    totalPieces: fossilPieces.length,
    grid,
    clues,
    fossilPieces,
    collectedFossils: [],
    stageId,
    paused: false,
    damageWarningShown: false,
    result: null,
    collection,
    selectedResultActionIndex: 0,
  };
}

function clampCursor(x: number, y: number, width: number, height: number) {
  return {
    x: Math.max(0, Math.min(width - 1, x)),
    y: Math.max(0, Math.min(height - 1, y)),
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  const height = state.grid.length;
  const width  = height > 0 ? state.grid[0].length : 20;

  switch (action.type) {
    case 'MOVE_CURSOR': {
      const newPos = clampCursor(
        state.cursor.x + action.dx,
        state.cursor.y + action.dy,
        width, height,
      );
      const newState: GameState = {
        ...state,
        cursor: { ...state.cursor, ...newPos },
        characterAction: 'move',
      };
      if (state.mode === 'clue_scan') {
        const msg = getClueMessage(newState);
        return { ...newState, brailleMessage: msg, brailleLabel: '단서 탐색', dialogueMessage: msg };
      }
      return newState;
    }

    case 'SET_CURSOR_POSITION': {
      const newPos = clampCursor(action.x, action.y, width, height);
      const newState: GameState = {
        ...state,
        cursor: { ...state.cursor, ...newPos },
        characterAction: 'move',
      };
      if (state.mode === 'clue_scan') {
        const msg = getClueMessage(newState);
        return { ...newState, brailleMessage: msg, brailleLabel: '단서 탐색', dialogueMessage: msg };
      }
      return newState;
    }

    case 'USE_TOOL': {
      const partial = applyTool(state, state.currentTool);
      return { ...state, ...partial };
    }

    case 'SET_TOOL': {
      const toolNames: Record<ToolType, string> = {
        brush:       `${ko.tools.brush} 선택`,
        careful_dig: `${ko.tools.carefulDig} 선택`,
        probe:       `${ko.tools.probe} 선택`,
      };
      return {
        ...state,
        currentTool:    action.tool,
        brailleMessage: toolNames[action.tool],
        brailleLabel:   '도구',
        dialogueMessage: toolNames[action.tool],
        characterAction: 'idle',
      };
    }

    case 'NEXT_CLUE': {
      const nextIdx = (state.selectedClueIndex + 1) % Math.max(1, state.clues.length);
      const newState = { ...state, selectedClueIndex: nextIdx };
      const msg = getClueMessage(newState);
      return { ...newState, brailleMessage: msg, brailleLabel: '다음 단서', dialogueMessage: msg };
    }

    case 'PREV_CLUE': {
      const prevIdx = (state.selectedClueIndex - 1 + Math.max(1, state.clues.length)) % Math.max(1, state.clues.length);
      const newState = { ...state, selectedClueIndex: prevIdx };
      const msg = getClueMessage(newState);
      return { ...newState, brailleMessage: msg, brailleLabel: '이전 단서', dialogueMessage: msg };
    }

    case 'SET_MODE': {
      const modeNames: Record<GameMode, string> = {
        clue_scan:    '단서 탐색 모드',
        precision_dig: '정밀 발굴 모드',
        collection:   '도감 모드',
      };
      return {
        ...state,
        mode:           action.mode,
        brailleMessage: modeNames[action.mode],
        brailleLabel:   '모드 변경',
        dialogueMessage: modeNames[action.mode],
      };
    }

    case 'SET_SCREEN': {
      const screenNames: Record<Screen, string> = {
        title:          ko.intro.title,
        tutorial:       ko.tutorial.title,
        'fossil-select': ko.braille.fossilSelect,
        'stage-enter':  ko.braille.stageEnter,
        game:           ko.stage.enterMessage,
        'stage-result': ko.result.title,
        collection:     ko.common.collection,
      };
      return {
        ...state,
        screen:         action.screen,
        brailleMessage: screenNames[action.screen],
        brailleLabel:   '화면 전환',
        dialogueMessage: '',
      };
    }

    case 'SELECT_STAGE': {
      const newStage = STAGES[action.stageId] ?? STAGES['desert_rib'];
      const generated = generateGrid(newStage);
      return {
        ...state,
        stageId:    action.stageId,
        screen:     'stage-enter',
        grid:       generated.grid,
        clues:      generated.clues,
        fossilPieces: generated.fossilPieces,
        completion: 0,
        damage:     0,
        foundPieces: 0,
        totalPieces: generated.fossilPieces.length,
        cursor:     { x: Math.floor(newStage.width / 2), y: Math.floor(newStage.height / 2), size: 1 },
        characterAction: 'idle',
        mode:       'clue_scan',
        currentTool: 'brush',
        damageWarningShown: false,
        result:     null,
        brailleMessage: `${newStage.name} ${ko.braille.stageEnter}`,
        brailleLabel: '스테이지',
        dialogueMessage: `${newStage.name}에 도착했어. 먼저 단서를 찾아보자!`,
      };
    }

    case 'ENTER_STAGE': {
      return {
        ...state,
        screen:         'game',
        brailleMessage: ko.stage.enterMessage,
        brailleLabel:   '게임',
        dialogueMessage: ko.stage.enterMessage,
      };
    }

    case 'COMPLETE_STAGE': {
      const result = buildResult(state);
      const newCollection = mergeIntoCollection(state.collection, result);
      persistCollection(newCollection);
      return {
        ...state,
        screen:         'stage-result',
        characterAction: 'celebrate',
        result,
        collection: newCollection,
        brailleMessage: ko.braille.complete,
        brailleLabel:   ko.result.title,
        dialogueMessage: ko.result.completeMessage,
        selectedResultActionIndex: 0,
      };
    }

    case 'DISMISS_DAMAGE_WARNING': {
      return {
        ...state,
        damageWarningShown: true,
        brailleMessage:  ko.common.continueDigging,
        brailleLabel:    '경고 확인',
        dialogueMessage: ko.gameplay.brushRecommended,
      };
    }

    case 'RESTART_STAGE': {
      const rstStage  = STAGES[state.stageId] ?? STAGES['desert_rib'];
      const rstGen    = generateGrid(rstStage);
      return {
        ...state,
        screen:     'game',
        grid:       rstGen.grid,
        clues:      rstGen.clues,
        fossilPieces: rstGen.fossilPieces,
        completion: 0,
        damage:     0,
        foundPieces: 0,
        totalPieces: rstGen.fossilPieces.length,
        cursor:     { x: Math.floor(rstStage.width / 2), y: Math.floor(rstStage.height / 2), size: 1 },
        characterAction: 'idle',
        mode:       'clue_scan',
        currentTool: 'brush',
        damageWarningShown: false,
        result:     null,
        brailleMessage: '재도전 시작!',
        brailleLabel:   '게임',
        dialogueMessage: '다시 한번 도전해보자!',
      };
    }

    case 'RESULT_ACTION': {
      switch (action.action) {
        case 'next_fossil':
          return {
            ...state,
            screen:         'fossil-select',
            brailleMessage: ko.braille.fossilSelect,
            brailleLabel:   '다음',
            dialogueMessage: ko.result.nextFossil,
          };
        case 'collection':
          return {
            ...state,
            screen:         'collection',
            brailleMessage: ko.common.collection,
            brailleLabel:   '도감',
            dialogueMessage: '',
          };
        case 'retry':
          return gameReducer(state, { type: 'RESTART_STAGE' });
        case 'home':
          return {
            ...state,
            screen:         'title',
            brailleMessage: ko.intro.title,
            brailleLabel:   '메인',
            dialogueMessage: '',
          };
      }
      return state;
    }

    case 'SELECT_RESULT_ACTION':
      return { ...state, selectedResultActionIndex: action.index };

    case 'READ_POSITION': {
      const cell = state.grid[state.cursor.y]?.[state.cursor.x];
      const typeKo: Record<string, string> = {
        soil: '토양', hard_soil: '단단한 흙', rock: '암석',
        fossil: '화석', crack: '균열', empty: '빈 공간', revealed: '발굴됨',
      };
      const typeName = cell ? (typeKo[cell.type] ?? cell.type) : '알 수 없음';
      const fossilProgress = cell?.type === 'fossil'
        ? ` (${cell.fossilRevealProgress ?? 0}% 노출)`
        : '';
      const msg = `위치 (${state.cursor.x + 1}, ${state.cursor.y + 1}): ${typeName}${fossilProgress}`;
      return { ...state, brailleMessage: msg, brailleLabel: '위치 읽기', dialogueMessage: msg };
    }

    case 'READ_HINT': {
      const stage = STAGES[state.stageId];
      const msg   = stage?.target ?? '목표 없음';
      return { ...state, brailleMessage: msg, brailleLabel: '힌트', dialogueMessage: msg };
    }

    case 'READ_SURROUNDINGS': {
      const partial = applyTool(state, 'probe');
      return { ...state, ...partial };
    }

    default:
      return state;
  }
}
