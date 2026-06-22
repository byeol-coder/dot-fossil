import type { FossilDef } from '../types';

export const FOSSIL_DEFS: Record<string, FossilDef> = {
  rib: {
    id: 'rib',
    name: '갈비뼈',
    nameEn: 'Rib',
    pieces: 3,
    description: '작은 공룡의 구부러진 갈비뼈 화석입니다.',
  },
  shell: {
    id: 'shell',
    name: '조개',
    nameEn: 'Shell',
    pieces: 1,
    description: '고대 바다에서 온 나선형 조개 화석입니다.',
  },
};
