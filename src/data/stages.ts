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
  jungle_claw: {
    id: 'jungle_claw',
    name: '정글의 날카로운 발톱',
    nameEn: 'Jungle Claw',
    target: '발톱과 이빨 화석을 조심스럽게 발굴하세요',
    maxDamage: 30,
    width: 20,
    height: 14,
    fossils: [
      { fossilId: 'claw', count: 1 },
      { fossilId: 'tooth', count: 2 },
    ],
    totalPieces: 3,
  },
  river_skull: {
    id: 'river_skull',
    name: '강가의 거대한 두개골',
    nameEn: 'River Skull',
    target: '두개골과 척추뼈 화석을 발굴하세요',
    maxDamage: 25,
    width: 22,
    height: 14,
    fossils: [
      { fossilId: 'skull', count: 2 },
      { fossilId: 'vertebra', count: 2 },
    ],
    totalPieces: 4,
  },
};
