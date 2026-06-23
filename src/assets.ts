// Asset manifest — all image paths managed here
// public/ folder base is implicit; paths are relative to the web root

export const ASSETS = {
  reference: {
    intro:      '/assets/reference/dot-fossil-intro-reference.png',
    gameplay:   '/assets/reference/dot-fossil-gameplay-reference.png',
    collection: '/assets/reference/dot-fossil-collection-reference.png',
  },

  character: {
    idle:    '/assets/characters/explorer-idle.png',
    brush:   '/assets/characters/explorer-brush.png',
    dig:     '/assets/characters/explorer-dig.png',
    probe:   '/assets/characters/explorer-probe.png',
    found:   '/assets/characters/explorer-found.png',
    warning: '/assets/characters/explorer-warning.png',
  },

  tools: {
    brush:          '/assets/icons/tools/icon-brush.png',
    shovel:         '/assets/icons/tools/icon-shovel.png',
    probe:          '/assets/icons/tools/icon-probe.png',
    hammer:         '/assets/icons/tools/icon-hammer.png',
    pickaxe:        '/assets/icons/tools/icon-pickaxe.png',
    restorationKit: '/assets/icons/tools/icon-restoration-kit.png',
    backpack:       '/assets/icons/tools/icon-backpack.png',
    map:            '/assets/icons/tools/icon-map.png',
    gearMedal:      '/assets/icons/tools/icon-gear-medal.png',
  },

  fossils: {
    skull:            '/assets/icons/fossils/fossil-skull.png',
    rib:              '/assets/icons/fossils/fossil-rib.png',
    vertebra:         '/assets/icons/fossils/fossil-vertebra.png',
    claw:             '/assets/icons/fossils/fossil-claw.png',
    tooth:            '/assets/icons/fossils/fossil-tooth.png',
    fish:             '/assets/icons/fossils/fossil-fish.png',
    leaf:             '/assets/icons/fossils/fossil-leaf.png',
    footprint:        '/assets/icons/fossils/fossil-footprint.png',
    ammonite:         '/assets/icons/fossils/fossil-ammonite.png',
    pottery:          '/assets/icons/fossils/artifact-pottery.png',
    medallion:        '/assets/icons/fossils/artifact-medallion.png',
    boneFragment:     '/assets/icons/fossils/fossil-bone-fragment.png',
    legfoot:          '/assets/icons/fossils/fossil-legfoot.png',
    partialSkeleton:  '/assets/icons/fossils/fossil-partial-skeleton.png',
  },

  dinosaurs: {
    tyrannosaurusRex:    '/assets/dinosaurs/tyrannosaurus-rex.png',
    velociraptor:        '/assets/dinosaurs/velociraptor.png',
    brachiosaurus:       '/assets/dinosaurs/brachiosaurus.png',
    spinosaurus:         '/assets/dinosaurs/spinosaurus.png',
    ankylosaurus:        '/assets/dinosaurs/ankylosaurus.png',
    dilophosaurus:       '/assets/dinosaurs/dilophosaurus.png',
    parasaurolophus:     '/assets/dinosaurs/parasaurolophus.png',
    pachycephalosaurus:  '/assets/dinosaurs/pachycephalosaurus.png',
  },

  ui: {
    dotpadDevice:     '/assets/ui/dotpad-device.png',
    brailleBar:       '/assets/ui/braille-message-bar.png',
    stageCard:        '/assets/ui/stage-card.png',
    progressBar:      '/assets/ui/progress-bar.png',
    damageGauge:      '/assets/ui/damage-gauge.png',
    buttonCollection: '/assets/ui/button-collection.png',
    buttonMap:        '/assets/ui/button-map.png',
    badgeLock:        '/assets/ui/badge-lock.png',
    badgeUnlock:      '/assets/ui/badge-unlock.png',
    badgeBronze:      '/assets/ui/badge-complete-bronze.png',
    badgeSilver:      '/assets/ui/badge-complete-silver.png',
    badgeGold:        '/assets/ui/badge-complete-gold.png',
    fossilCrate:      '/assets/ui/fossil-crate.png',
    signpost:         '/assets/ui/excavation-signpost.png',
    desertRocks:      '/assets/ui/desert-rocks.png',
    cactusCluster:    '/assets/ui/cactus-cluster.png',
    logoTitle:        '/assets/ui/logo-title.png',
  },
} as const;

// Map CharacterAction → character asset
import type { CharacterAction } from './types';
export const CHARACTER_ACTION_ASSET: Record<CharacterAction, string> = {
  idle:    ASSETS.character.idle,
  brush:   ASSETS.character.brush,
  dig:     ASSETS.character.dig,
  probe:   ASSETS.character.probe,
  found:   ASSETS.character.found,
  warning: ASSETS.character.warning,
  move:    ASSETS.character.idle,
};

// Map ToolType → tool asset
import type { ToolType } from './types';
export const TOOL_ASSET: Record<ToolType, string> = {
  brush:       ASSETS.tools.brush,
  careful_dig: ASSETS.tools.shovel,
  probe:       ASSETS.tools.probe,
};
