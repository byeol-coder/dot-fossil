// Asset manifest — all paths relative to app base (works in dev and GitHub Pages subpath)
const B = import.meta.env.BASE_URL; // '/' in dev, './' in production build

export const ASSETS = {
  reference: {
    intro:      `${B}assets/reference/dot-fossil-intro-reference.png`,
    gameplay:   `${B}assets/reference/dot-fossil-gameplay-reference.png`,
    collection: `${B}assets/reference/dot-fossil-collection-reference.png`,
    tutorial:   `${B}assets/reference/tutorial-dialogue-screen-bg.png`,
  },

  screens: {
    title:             `${B}assets/screens/title-screen-bg.png`,
    titleWide:         `${B}assets/screens/title-screen-bg-wide.png`,
    titlePortrait:     `${B}assets/screens/title-screen-bg-portrait.png`,
    tutorialDialogue:  `${B}assets/screens/tutorial-dialogue-screen-bg.png`,
    fossilSelect:      `${B}assets/screens/fossil-select-screen-bg.png`,
    stageEnterDesert:  `${B}assets/screens/stage-enter-desert-bg.png`,
    playDefault:       `${B}assets/screens/play-screen-default-bg.png`,
    playClueFound:     `${B}assets/screens/play-screen-clue-found-bg.png`,
    playDigging:       `${B}assets/screens/play-screen-digging-bg.png`,
    playFossilFound:   `${B}assets/screens/play-screen-fossil-found-bg.png`,
    playWarning:       `${B}assets/screens/play-screen-warning-bg.png`,
    excavationResult:  `${B}assets/screens/excavation-result-screen-bg.png`,
  },

  character: {
    idle:    `${B}assets/characters/explorer-idle.png`,
    brush:   `${B}assets/characters/explorer-brush.png`,
    dig:     `${B}assets/characters/explorer-dig.png`,
    probe:   `${B}assets/characters/explorer-probe.png`,
    found:   `${B}assets/characters/explorer-found.png`,
    warning: `${B}assets/characters/explorer-warning.png`,
  },

  tools: {
    brush:          `${B}assets/icons/tools/icon-brush.png`,
    shovel:         `${B}assets/icons/tools/icon-shovel.png`,
    probe:          `${B}assets/icons/tools/icon-probe.png`,
    hammer:         `${B}assets/icons/tools/icon-hammer.png`,
    pickaxe:        `${B}assets/icons/tools/icon-pickaxe.png`,
    restorationKit: `${B}assets/icons/tools/icon-restoration-kit.png`,
    backpack:       `${B}assets/icons/tools/icon-backpack.png`,
    map:            `${B}assets/icons/tools/icon-map.png`,
    gearMedal:      `${B}assets/icons/tools/icon-gear-medal.png`,
  },

  fossils: {
    skull:           `${B}assets/icons/fossils/fossil-skull.png`,
    rib:             `${B}assets/icons/fossils/fossil-rib.png`,
    vertebra:        `${B}assets/icons/fossils/fossil-vertebra.png`,
    claw:            `${B}assets/icons/fossils/fossil-claw.png`,
    tooth:           `${B}assets/icons/fossils/fossil-tooth.png`,
    fish:            `${B}assets/icons/fossils/fossil-fish.png`,
    leaf:            `${B}assets/icons/fossils/fossil-leaf.png`,
    footprint:       `${B}assets/icons/fossils/fossil-footprint.png`,
    ammonite:        `${B}assets/icons/fossils/fossil-ammonite.png`,
    pottery:         `${B}assets/icons/fossils/artifact-pottery.png`,
    medallion:       `${B}assets/icons/fossils/artifact-medallion.png`,
    boneFragment:    `${B}assets/icons/fossils/fossil-bone-fragment.png`,
    legfoot:         `${B}assets/icons/fossils/fossil-legfoot.png`,
    partialSkeleton: `${B}assets/icons/fossils/fossil-partial-skeleton.png`,
  },

  dinosaurs: {
    tyrannosaurusRex:   `${B}assets/dinosaurs/tyrannosaurus-rex.png`,
    velociraptor:       `${B}assets/dinosaurs/velociraptor.png`,
    brachiosaurus:      `${B}assets/dinosaurs/brachiosaurus.png`,
    spinosaurus:        `${B}assets/dinosaurs/spinosaurus.png`,
    ankylosaurus:       `${B}assets/dinosaurs/ankylosaurus.png`,
    dilophosaurus:      `${B}assets/dinosaurs/dilophosaurus.png`,
    parasaurolophus:    `${B}assets/dinosaurs/parasaurolophus.png`,
    pachycephalosaurus: `${B}assets/dinosaurs/pachycephalosaurus.png`,
    triceratops:        `${B}assets/dinosaurs/triceratops.png`,
    stegosaurus:        `${B}assets/dinosaurs/stegosaurus.png`,
  },

  ui: {
    dotpadDevice:     `${B}assets/ui/dotpad-device.png`,
    brailleBar:       `${B}assets/ui/braille-message-bar.png`,
    stageCard:        `${B}assets/ui/stage-card.png`,
    progressBar:      `${B}assets/ui/progress-bar.png`,
    damageGauge:      `${B}assets/ui/damage-gauge.png`,
    buttonCollection: `${B}assets/ui/button-collection.png`,
    buttonMap:        `${B}assets/ui/button-map.png`,
    badgeLock:        `${B}assets/ui/badge-lock.png`,
    badgeUnlock:      `${B}assets/ui/badge-unlock.png`,
    badgeBronze:      `${B}assets/ui/badge-complete-bronze.png`,
    badgeSilver:      `${B}assets/ui/badge-complete-silver.png`,
    badgeGold:        `${B}assets/ui/badge-complete-gold.png`,
    fossilCrate:      `${B}assets/ui/fossil-crate.png`,
    fossilCrateLabel: `${B}assets/ui/fossil-crate-label.png`,
    signpost:         `${B}assets/ui/excavation-signpost.png`,
    signpostLabel:    `${B}assets/ui/excavation-signpost-label.png`,
    desertRocks:      `${B}assets/ui/desert-rocks.png`,
    cactusCluster:    `${B}assets/ui/cactus-cluster.png`,
    logoTitle:        `${B}assets/ui/logo-title.png`,
  },
} as const;

// Map CharacterAction → character asset
import type { CharacterAction } from './types';
export const CHARACTER_ACTION_ASSET: Record<CharacterAction, string> = {
  idle:      ASSETS.character.idle,
  brush:     ASSETS.character.brush,
  dig:       ASSETS.character.dig,
  probe:     ASSETS.character.probe,
  found:     ASSETS.character.found,
  warning:   ASSETS.character.warning,
  move:      ASSETS.character.idle,
  celebrate: ASSETS.character.found,
};

// Map ToolType → tool asset
import type { ToolType } from './types';
export const TOOL_ASSET: Record<ToolType, string> = {
  brush:       ASSETS.tools.brush,
  careful_dig: ASSETS.tools.shovel,
  probe:       ASSETS.tools.probe,
};
