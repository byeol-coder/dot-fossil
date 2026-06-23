import type { Stage } from '../types';

export const STAGES: Record<string, Stage> = {
  desert_rib: {
    id: 'desert_rib',
    name: '사막의 작은 갈비뼈',
    nameEn: 'Desert Rib',
    target: '갈비뼈 조각 3개를 손상 없이 발굴하세요',
    maxDamage: 30,
    width: 20,
    height: 14,
    fossils: [
      { fossilId: 'rib', count: 3 },
      { fossilId: 'shell', count: 1 },
    ],
    totalPieces: 4,
  },
};
