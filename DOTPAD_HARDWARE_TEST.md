# Dot Fossil — 실기기(닷패드) 연동 검증 런북

코드(인코딩·페어링·전송)는 모두 준비됐고, `node scripts/encoding-selftest.mjs`로 인코딩이
기기 그래픽 포맷과 일치함을 수학적으로 증명했습니다(7/7 통과). 아래 절차로 **실물 닷패드**에서
페어링→발굴→출력을 최종 확인합니다. 소요 5분.

## 0. 준비물
- 닷패드 기기 (이름이 `DotPad…`로 시작, 예: DotPad320). 전원 ON.
- **Chrome 또는 Edge** (Safari/Firefox는 Web Bluetooth 미지원).
- 같은 PC에서 `localhost`로 실행 (localhost는 secure context라 HTTPS 없이 BLE 허용).

## 1. 실행
```bash
cd Dot-Fossil
npm install      # 최초 1회
npm run dev      # http://localhost:5181
```
Chrome에서 `http://localhost:5181` 접속. (다른 기기/폰에서 테스트하려면 §6 HTTPS 참고.)

## 2. 페어링
1. 발굴 화면까지 진입(메인 → 발굴 → 발굴지 선택 → 발굴 시작).
2. 우측 도구 패널 하단의 **연결** 버튼 클릭.
3. 브라우저 BLE 선택창에서 `DotPad…` 기기 선택 → 연결.
4. 상태 표시가 **“DotPad 연결됨”** 으로 바뀌면 성공.
   - 안 보이면 콘솔(F12) 경고 확인: Chrome/Edge·localhost·기기 전원·기기명 prefix.

## 3. 방향 점검 (핵심 — 셀 비트 순서 확인)
연결되면 패널에 **점검** 버튼이 나타납니다. 클릭하면 1.5초 간격으로 6단계가 출력됩니다.
손끝/눈으로 아래가 맞는지 확인하세요 (콘솔에도 각 단계 설명이 찍힙니다):

| 단계 | 보내는 값 | 기기에서 기대되는 모습 |
|---|---|---|
| 1 | 전체 0x00 | 모든 점 내려감 |
| 2 | 0x01 ×300 | **각 셀의 좌상단 점 1개만** 올라온 규칙적 격자 |
| 3 | 0x88 ×300 | **각 셀의 아래 행(가로줄)** 만 올라옴 |
| 4 | 0x0F ×300 | **각 셀의 왼쪽 세로열** 만 올라옴 |
| 5 | 갈비뼈 화석 | 갈비뼈 형태가 **상하/좌우 똑바로** |
| 6 | 전체 0xFF | 모든 점 올라감 |

- 2~4단계가 표대로면 셀 비트 순서(column-major)가 기기와 일치 → 라이브 그리드도 정상 출력됩니다. ✅
- 만약 **상하가 뒤집히거나 좌우가 바뀌어** 보이면, `src/dotpad/encoding.ts`의 `BIT_ORDER`만
  조정하면 됩니다(아래 §5). 셀 배치(행/열)는 SDK `displayGraphicData`와 이미 일치하므로 건드릴 필요 없습니다.

## 4. 발굴 출력 확인
1. 점검 후 도구(브러시 등) 선택, 방향키/패닝키로 커서 이동, Space/Enter 또는 패닝 발굴.
2. 발굴할수록 기기에서 **흙 점이 내려가고 화석 윤곽이 올라오는** 변화가 손끝으로 느껴지면 정상.
3. 조각 완성 시 화석 골격 패턴이 출력됩니다.
4. 기기 패닝키(좌/우, LPF1/RPF4)로 커서 이동, 기능키 F1=발굴·F2/F3=모드·F4=도감이 동작하는지 확인.

## 5. 만약 방향이 어긋나면 (조정 지점)
`src/dotpad/encoding.ts`의 `BIT_ORDER`는 셀(2×4핀) 안에서 비트→핀 좌표 매핑입니다. 현재:
```
좌열 위→아래 = bit 0,1,2,3 / 우열 위→아래 = bit 4,5,6,7  (column-major)
```
- 상하 반전 → 각 열의 y를 3-y로.
- 좌우 반전 → x의 0↔1.
- 변경 후 `node scripts/encoding-selftest.mjs`로 라운드트립이 깨지지 않는지 확인하고 §3 재점검.
- 참고: 기기 그래픽 모드는 raw 바이트를 그대로 받습니다(SDK는 텍스트 모드에서만 braille→graphic 변환).

## 6. (선택) 다른 기기/폰에서 테스트 — HTTPS 필요
localhost가 아닌 곳에서는 Web Bluetooth에 HTTPS가 필수입니다. 무설치 자체서명 방식:
```bash
# 1) 인증서 생성 (openssl)
mkdir -p .cert && openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout .cert/key.pem -out .cert/cert.pem -days 365 -subj "/CN=localhost"
# 2) vite 실행 시 https 옵션 (vite.config.js server.https에 .cert/key.pem,cert.pem 지정)
#    또는 온라인이면: npm i -D @vitejs/plugin-basic-ssl 후 plugin 추가가 가장 간단.
npm run dev -- --host   # LAN 노출 (https 설정 시)
```
폰 Chrome에서 `https://<PC-IP>:5181` 접속 → 자체서명 경고 허용 → §2부터 동일.

## 7. 하드웨어 없이 시연/QA
**데모** 버튼으로 연결을 시뮬레이션할 수 있습니다. 촉각 전송이 콘솔에
`[DotPad demo] 촉각그래픽 전송 · N개 점 돌출`로 기록되어, 발굴 단계별로 점 수가 줄어드는 것
(흙 제거)을 확인할 수 있습니다.

---
### 코드 측 검증 현황 (하드웨어 없이 완료)
- `scripts/encoding-selftest.mjs`: encode↔decode 역함수 일치, 0x01/0x88/0x0F/0xF0 방향, 행우선 셀 순서 — **7/7 통과**.
- SDK 3.0.0 페어링 경로(서비스 `49535343-fe7d-4ae5-8fa9-9fafd205e455`, 이름 prefix `DotPad`) 정상 배선.
- `connect()`에 secure-context 가드 + 실패 사유 로깅.
- 라이브 그리드(`sendGrid`)가 흙+화석+커서 합성을 그래픽 모드로 전송.
- **남은 것은 실물 기기로 §2~4를 1회 확인하는 것뿐입니다.**
