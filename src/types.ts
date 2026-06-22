export type GameMode = 'clue_scan' | 'precision_dig' | 'collection';
export type ToolType = 'brush' | 'careful_dig' | 'probe';
export type CellType = 'soil' | 'hard_soil' | 'rock' | 'fossil' | 'crack' | 'empty' | 'revealed';
export type CharacterAction = 'idle' | 'move' | 'brush' | 'dig' | 'probe' | 'found' | 'warning';
export type Screen = 'title' | 'game' | 'collection';

export interface DigCell {
  x: number;
  y: number;
  type: CellType;
  depth: number;      // 0=surface, 1=shallow, 2=deep
  revealed: boolean;
  fragile: number;    // 0-1, how fragile this cell is
  fossilId?: string;
  damage: number;     // accumulated damage 0-1
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

export interface GameState {
  screen: Screen;
  mode: GameMode;
  cursor: { x: number; y: number; size: 1 | 2 | 5 };
  selectedClueIndex: number;
  currentTool: ToolType;
  characterAction: CharacterAction;
  brailleMessage: string;
  brailleLabel: string;
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
  | { type: 'READ_SURROUNDINGS' };
