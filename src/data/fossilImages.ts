import { ASSETS } from '../assets';

// ── Fossil id → image, mapped by ACTUAL image CONTENT ────────────────────────
// The bundled fossil PNG filenames are shifted relative to what they depict
// (e.g. fossil-tooth.png actually shows a rib cage, fossil-leaf.png an ammonite
// shell, fossil-rib.png a vertebra). Verified by inspecting each image. This
// single source of truth maps each fossil id to the file that truly shows it,
// so the 도감 / 발굴지 선택 / 결과 screens all display the correct fossil.
export const FOSSIL_IMG: Record<string, string> = {
  rib:             ASSETS.fossils.tooth,    // fossil-tooth.png  = rib cage
  shell:           ASSETS.fossils.leaf,     // fossil-leaf.png   = spiral shell / ammonite
  skull:           ASSETS.fossils.skull,    // fossil-skull.png  = skull ✓
  vertebra:        ASSETS.fossils.rib,      // fossil-rib.png    = vertebra
  claw:            ASSETS.fossils.vertebra, // fossil-vertebra.png = claw
  tooth:           ASSETS.fossils.claw,     // fossil-claw.png   = tooth
  fish:            ASSETS.fossils.ammonite, // fossil-ammonite.png = fish
  leaf:            ASSETS.fossils.fish,     // fossil-fish.png   = leaf
  footprint:       ASSETS.fossils.footprint,// fossil-footprint.png = footprint ✓
  ammonite:        ASSETS.fossils.leaf,     // ammonite shares the spiral-shell image
  legfoot:         ASSETS.fossils.legfoot,
  partialSkeleton: ASSETS.fossils.partialSkeleton,
  pottery:         ASSETS.fossils.pottery,
  medallion:       ASSETS.fossils.medallion,
  bone_fragment:   ASSETS.fossils.boneFragment,
};
