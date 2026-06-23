import type { ToolType } from '../types';

export interface ToolDef {
  id: ToolType;
  name: string;
  description: string;
  shortcut: string;
  removeDepth: number;
  damageRisk: number;
  radius: number;
}

export const TOOL_DEFS: Record<ToolType, ToolDef> = {
  brush: {
    id: 'brush',
    name: '브러시',
    description: '부드럽게 흙을 털어냅니다. 넓게 안전하게.',
    shortcut: '1',
    removeDepth: 1,
    damageRisk: 0,
    radius: 3,
  },
  careful_dig: {
    id: 'careful_dig',
    name: '조심스럽게 파기',
    description: '넓게 빠르게 흙을 제거합니다. 화석 근처 주의.',
    shortcut: '2',
    removeDepth: 2,
    damageRisk: 0.08,
    radius: 3,
  },
  probe: {
    id: 'probe',
    name: '탐침',
    description: '흙을 제거하지 않고 주변 5칸을 탐지합니다.',
    shortcut: '3',
    removeDepth: 0,
    damageRisk: 0,
    radius: 5,
  },
};
