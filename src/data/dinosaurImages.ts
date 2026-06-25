import { ASSETS } from '../assets';

// Maps fossils.ts dinosaur field (kebab-case) → actual PNG asset
export const DINOSAUR_IMG: Record<string, string> = {
  'tyrannosaurus-rex':  ASSETS.dinosaurs.tyrannosaurusRex,
  'velociraptor':       ASSETS.dinosaurs.velociraptor,
  'brachiosaurus':      ASSETS.dinosaurs.brachiosaurus,
  'spinosaurus':        ASSETS.dinosaurs.spinosaurus,
  'ankylosaurus':       ASSETS.dinosaurs.ankylosaurus,
  'dilophosaurus':      ASSETS.dinosaurs.dilophosaurus,
  'parasaurolophus':    ASSETS.dinosaurs.parasaurolophus,
  'pachycephalosaurus': ASSETS.dinosaurs.pachycephalosaurus,
  'triceratops':        ASSETS.dinosaurs.triceratops,
  'stegosaurus':        ASSETS.dinosaurs.stegosaurus,
};

export const DINOSAUR_KO: Record<string, string> = {
  'tyrannosaurus-rex':  '티라노사우루스',
  'velociraptor':       '벨로키랍토르',
  'brachiosaurus':      '브라키오사우루스',
  'spinosaurus':        '스피노사우루스',
  'ankylosaurus':       '안킬로사우루스',
  'dilophosaurus':      '딜로포사우루스',
  'parasaurolophus':    '파라사우롤로푸스',
  'pachycephalosaurus': '파키케팔로사우루스',
  'triceratops':        '트리케라톱스',
  'stegosaurus':        '스테고사우루스',
};
