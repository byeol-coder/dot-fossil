export type GameMode = 'clue_scan' | 'precision_dig' | 'collection';
export type ToolType = 'brush' | 'careful_dig' | 'probe';
export type CellType = 'soil' | 'hard_soil' | 'rock' | 'fossil' | 'crack' | 'empty' | 'revealed';
export type CharacterAction = 'idle' | 'move' | 'brush' | 'dig' | 'probe' | 'found' | 'warning' | 'celebrate';
export type Screen = 'title' | 'tutorial' | 'fossil-select' | 'stage-enter' | 'game' | 'stage-result' | 'collection';
export type ExcavationGrade = 'clean' | 'good' | 'restore_needed';
export type ResultAction = 'next_fossil' | 'collection' | 'retry' | 'home';

export interface DigCell {
  x: number;
  y: number;
  type: CellType;
  depth: number;          // 0=surface, 1=shallow, 2=deep (for soil/rock)
  revealed: boolean;
  fragile: number;        // 0-1
  fossilId?: string;
  pieceId?: string;       // which FossilPiece this cell belongs to
  damage: number;         // accumulated damage 0-1
  fossilRevealProgress?: number;  // 0-100, progressive reveal for fossil cells
}

export interface Clue {
  id: string;
  x: number;
  y: number;
  radius: number;
  fossilId: string;
  description: string;
  discovered: boolean;
}

export interface FossilPiece {
  id: string;
  fossilId: string;
  cells: { x: number; y: number }[];
  found: boolean;
  damage: number;
}

export interface FossilDef {
  id: string;
  name: string;
  nameEn: string;
  pieces: number;
  description: string;
  dinosaur?: string;
}

export interface Stage {
  id: string;
  name: string;
  nameEn: string;
  target: string;
  maxDamage: number;
  width: number;
  height: number;
  fossils: { fossilId: string; count: number }[];
  totalPieces: number;
}

export interface ExcavationResult {
  stageId: string;
  fossilId: string;
  completion: number;
  damage: number;
  foundPieces: number;
  requiredPieces: number;
  grade: ExcavationGrade;
  completedAt: string;
}

export interface CollectionItem {
  fossilId: string;
  stageId: string;
  bestCompletion: number;
  lowestDamage: number;
  grade: ExcavationGrade;
  timesCompleted: number;
  unlocked: boolean;
  completed: boolean;
  lastCompletedAt: string;
}

export interface GameState {
  screen: Screen;
  mode: GameMode;
  cursor: { x: number; y: number; size: 1 | 2 | 5 };
  selectedClueIndex: number;
  currentTool: ToolType;
  characterAction: CharacterAction;
  brailleMessage: string;
  brailleLabel: string;
  dialogueMessage: string;    // longer speech-bubble message (distinct from braille)
  completion: number;
  damage: number;
  foundPieces: number;
  totalPieces: number;
  grid: DigCell[][];
  clues: Clue[];
  fossilPieces: FossilPiece[];
  collectedFossils: string[];
  stageId: string;
  paused: boolean;
  damageWarningShown: boolean;
  result: ExcavationResult | null;
  collection: CollectionItem[];
  selectedResultActionIndex: number;
}

export type GameAction =
  | { type: 'MOVE_CURSOR'; dx: number; dy: number }
  | { type: 'USE_TOOL' }
  | { type: 'SET_TOOL'; tool: ToolType }
  | { type: 'NEXT_CLUE' }
  | { type: 'PREV_CLUE' }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'READ_POSITION' }
  | { type: 'READ_HINT' }
  | { type: 'READ_SURROUNDINGS' }
  | { type: 'SELECT_STAGE'; stageId: string }
  | { type: 'ENTER_STAGE' }
  | { type: 'COMPLETE_STAGE' }
  | { type: 'DISMISS_DAMAGE_WARNING' }
  | { type: 'RESTART_STAGE' }
  | { type: 'RESULT_ACTION'; action: ResultAction }
  | { type: 'SELECT_RESULT_ACTION'; index: number };
