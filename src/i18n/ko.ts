export const ko = {
  common: {
    start: "시작하기",
    next: "다음",
    skip: "건너뛰기",
    back: "뒤로",
    confirm: "확인",
    cancel: "취소",
    continueDigging: "계속 발굴",
    collection: "도감 보기",
    settings: "설정",
    help: "도움말",
  },

  intro: {
    title: "Dot Fossil",
    subtitle: "촉각 발굴단",
    tagline: "촉각으로 탐험하고, 촉각으로 발견하고, 촉각으로 복원하라!",
    pressEnter: "Enter를 눌러 시작",
  },

  tutorial: {
    title: "튜토리얼 안내",
    dialogues: [
      "안녕! 나는 도티야.",
      "오늘도 촉각으로 화석을 찾아보자!",
      "닷패드 위의 땅을 천천히 만져봐.",
      "낮은 점은 흙, 굵은 덩어리는 돌이야.",
      "곡선이 느껴지면 화석일 수 있어.",
      "균열은 조심해야 해!",
    ],
  },

  fossilSelect: {
    title: "오늘은 무슨 화석을 발굴할까?",
    instruction: "화석을 선택해 주세요.",
  },

  fossils: {
    trexTooth: {
      name: "티라노 이빨",
      dinosaur: "티라노사우루스",
      description: "크고 날카로운 이빨 화석입니다.",
    },
    triceratopsHorn: {
      name: "트리케라톱스 뿔",
      dinosaur: "트리케라톱스",
      description: "단단한 뿔 화석입니다.",
    },
    stegosaurusPlate: {
      name: "스테고사우루스 등판",
      dinosaur: "스테고사우루스",
      description: "등 위의 판 모양 화석입니다.",
    },
    brachiosaurusNeck: {
      name: "브라키오사우루스 목뼈",
      dinosaur: "브라키오사우루스",
      description: "긴 목을 이루는 뼈 화석입니다.",
    },
  },

  stage: {
    desert: "사막 발굴지",
    enterMessage: "사막 발굴지에 도착했어. 먼저 단서를 찾아보자!",
  },

  tools: {
    brush: "브러시",
    carefulDig: "조심 파기",
    probe: "탐침",
  },

  gameplay: {
    clueHardness: "단단한 흙",
    clueCurve: "곡선 반응",
    clueCrack: "균열 주의",
    soilRemoved: "흙을 조금 걷어냈어.",
    boneHint: "뼈 같은 곡선이 살짝 보여.",
    bonePartVisible: "뼈 조각 일부가 드러났어.",
    fossilMoreVisible: "화석 윤곽이 더 선명해졌어.",
    fossilFound: "화석 조각을 발견했어!",
    rockHit: "돌이 있어. 다른 방향을 살펴보자.",
    noReaction: "특별한 반응은 없어.",
    brushRecommended: "브러시로 천천히 해보자.",
    damageWarning: "손상 위험! 더 조심해야 해.",
    alreadyFound: "이미 발견한 조각이야.",
  },

  braille: {
    helloDoti: "안녕 나는 도티",
    fossilSelect: "화석 선택",
    stageEnter: "발굴지 도착",
    curveDetected: "곡선 반응",
    boneHint: "뼈 느낌",
    bonePartVisible: "뼈 일부",
    fossilMoreVisible: "윤곽 선명",
    brushRecommended: "브러시 추천",
    crackWarning: "균열 주의",
    fossilFound: "화석 발견",
    collectionSaved: "도감 저장",
    complete: "발굴 완료",
    nextChoice: "다음 선택",
    allComplete: "전체 완료",
    alreadyFound: "이미 발견",
    rockHit: "암석 발견",
    soilRemoved: "흙 제거",
    noReaction: "반응 없음",
  },

  result: {
    title: "발굴 완료",
    completion: "완성도",
    damage: "손상도",
    clean: "깨끗한 발굴",
    good: "좋은 발굴",
    restoreNeeded: "복원이 더 필요해",
    completeTitle: "발굴 완료",
    completeMessage: "좋아! 발굴을 완료했어.",
    savedToCollection: "도감에 저장했어.",
    nextFossil: "다음 화석 발굴",
    viewCollection: "도감 보기",
    retry: "다시 발굴",
    home: "메인으로",
    allComplete: "모든 화석을 확인했어.",
  },

  accessibility: {
    keyboardGuide: "키보드로 조작할 수 있습니다.",
    numpadGuide: "숫자 키패드로 커서를 이동할 수 있습니다.",
    panningGuide: "닷패드 패닝키로 단서를 이동할 수 있습니다.",
    brailleGuide: "20셀 점자 메시지에 현재 상태가 표시됩니다.",
  },
};

export type Ko = typeof ko;
