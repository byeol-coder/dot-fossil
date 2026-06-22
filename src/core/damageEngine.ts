import type { FossilPiece } from '../types';

export function calcDamage(fossilPieces: FossilPiece[]): number {
  if (fossilPieces.length === 0) return 0;
  const totalDamage = fossilPieces.reduce((sum, fp) => sum + fp.damage, 0);
  return Math.round((totalDamage / fossilPieces.length) * 100);
}
