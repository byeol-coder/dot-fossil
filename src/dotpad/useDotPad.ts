import { useCallback, useEffect, useRef, useState } from 'react';
import { DotPadSDK, DotPadScanner, DataCodes, KeyCodes } from './DotPadSDK-3_0_0.js';
import type { DotDevice } from './DotPadSDK-3_0_0.js';
import type { DotGrid } from './tactilePatterns';
import type { Dispatch } from 'react';
import type { GameAction } from '../types';
import { encodeMatrixToHex } from './encoding';
import { getFossilPattern } from './fossilPatterns';
import { textToBrailleHex } from './koreanBraille';
import { fetchBrailleUnicode, unicodeBrailleToHex } from './braillify';

export type DotPadStatus = 'disconnected' | 'connecting' | 'connected' | 'unsupported';

// DotPad hardware key → synthetic keyboard key. By re-emitting hardware keys as
// DOM keydown events on window, EVERY screen that already handles the keyboard
// (title menu, fossil select, tutorial, dig, result, collection) also responds to
// the panning keys — one mapping covers all screens instead of per-screen wiring.
//   Panning left/right + LPF1/RPF4 → arrow keys (move / navigate)
//   Function 1 → Space (primary action: dig / select / confirm)
//   Function 2/3 → F2/F1 (precision / clue mode — handled only on the dig screen)
const PANNING_KEY_TO_DOM: Record<string, string> = {
  [KeyCodes.PanningLeft]:  'ArrowLeft',
  [KeyCodes.PanningRight]: 'ArrowRight',
  [KeyCodes.LPF1]:         'ArrowUp',
  [KeyCodes.RPF4]:         'ArrowDown',
  [KeyCodes.KeyFunction1]: ' ',
  [KeyCodes.KeyFunction2]: 'F2',
  [KeyCodes.KeyFunction3]: 'F1',
};

export function useDotPad(dispatch: Dispatch<GameAction>) {
  const sdk = useRef<DotPadSDK | null>(null);
  const device = useRef<DotDevice | null>(null);
  // Demo (mock) mode: simulates a connected DotPad with no Bluetooth hardware so
  // the connection-state UI and the per-stage tactile-send path can be exercised
  // and demonstrated. Tactile/braille output is logged instead of sent to a device.
  const demo = useRef(false);
  const [status, setStatus] = useState<DotPadStatus>('disconnected');

  // Register callbacks once
  useEffect(() => {
    const s = new DotPadSDK();
    s.setCallBack(
      (dev, code) => {
        if (code === DataCodes.Connected) {
          device.current = dev;
          setStatus('connected');
        } else if (code === DataCodes.Disconnected) {
          device.current = null;
          setStatus('disconnected');
        }
      },
      (_dev, key) => {
        // Re-emit as a DOM keydown so the active screen's own keyboard handler runs.
        const domKey = PANNING_KEY_TO_DOM[key];
        if (domKey) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: domKey, bubbles: true, cancelable: true }));
        }
        // Function 4 → open the collection from anywhere (a navigation shortcut).
        if (key === KeyCodes.KeyFunction4) dispatch({ type: 'SET_SCREEN', screen: 'collection' });
      },
    );
    sdk.current = s;
    return () => { s.disconnect(); };
  }, [dispatch]);

  const connect = useCallback(async () => {
    // Web Bluetooth needs a secure context (https or localhost) and a browser
    // that exposes navigator.bluetooth (Chrome/Edge). In an iframe the parent
    // must grant allow="bluetooth". Surface these clearly instead of failing mute.
    if (!('bluetooth' in navigator) || !window.isSecureContext) {
      setStatus('unsupported');
      // eslint-disable-next-line no-console
      console.warn(
        '[DotPad] Web Bluetooth 사용 불가: Chrome/Edge + HTTPS(또는 localhost)가 필요합니다.' +
        (window.self !== window.top ? ' iframe이면 부모에 allow="bluetooth"를 추가하세요.' : '') +
        ' 하드웨어 없이 시연하려면 "데모"를 사용하세요.',
      );
      return;
    }
    if (status === 'connecting' || status === 'connected') return;
    setStatus('connecting');
    try {
      const scanner = new DotPadScanner();
      const bleDevice = await scanner.startBleScan(); // opens the BLE chooser (DotPad* devices)
      if (!bleDevice) { setStatus('disconnected'); return; } // user cancelled
      const dev = await sdk.current!.connectBleDevice(bleDevice);
      if (!dev) { setStatus('disconnected'); return; }
      device.current = dev;
      setStatus('connected');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[DotPad] 연결 실패:', err instanceof Error ? err.message : err);
      setStatus('disconnected');
    }
  }, [status]);

  // Simulated connection — no Bluetooth, for demos / QA / no-hardware play.
  const connectDemo = useCallback(() => {
    demo.current = true;
    setStatus('connected');
    // eslint-disable-next-line no-console
    console.info('[DotPad demo] 연결됨 (시뮬레이션). 촉각 패턴 전송이 콘솔에 기록됩니다.');
  }, []);

  const disconnect = useCallback(() => {
    if (!demo.current && sdk.current && device.current) {
      sdk.current.disconnect(device.current);
    }
    demo.current = false;
    device.current = null;
    setStatus('disconnected');
  }, []);

  // Count raised pins so a sighted tester/teacher can confirm the tactile image
  // actually changes between excavation stages.
  function raisedPins(hex: string): number {
    let n = 0;
    for (let i = 0; i < hex.length; i += 2) {
      const b = parseInt(hex.slice(i, i + 2), 16);
      for (let p = 0; p < 8; p++) if ((b >> p) & 1) n++;
    }
    return n;
  }

  const sendGrid = useCallback((dotGrid: DotGrid) => {
    if (status !== 'connected') return;
    const hex = encodeMatrixToHex(dotGrid);
    if (demo.current) {
      // eslint-disable-next-line no-console
      console.info(`[DotPad demo] 촉각그래픽 전송 · ${raisedPins(hex)}개 점 돌출`);
      return;
    }
    if (sdk.current) sdk.current.displayGraphicData(hex);
  }, [status]);

  const sendRawHex = useCallback((hex: string) => {
    if (status !== 'connected') return;
    if (demo.current) {
      // eslint-disable-next-line no-console
      console.info(`[DotPad demo] 촉각 패턴 전송 · ${raisedPins(hex)}개 점 돌출`);
      return;
    }
    if (sdk.current) sdk.current.displayGraphicData(hex);
  }, [status]);

  // Send text to the 20-cell braille text line (separate from the 60×40 graphic).
  // Proper 점역 comes from the braillify.kr API (cached); on network failure we
  // fall back to the local basic table so the line still works offline.
  const brailleCache = useRef<Map<string, string>>(new Map()); // text → DotPad hex
  const latestText = useRef('');
  const debounceTimer = useRef(0);

  const sendText = useCallback((text: string) => {
    if (status !== 'connected' || !text) return;
    latestText.current = text;

    const push = (hex: string, via: string) => {
      if (latestText.current !== text) return; // a newer message superseded this one
      if (demo.current) {
        // eslint-disable-next-line no-console
        console.info(`[DotPad demo] 점자 텍스트 전송 (20셀, ${via}): "${text.slice(0, 20)}"`);
        return;
      }
      sdk.current?.displayTextData(hex);
    };

    const cached = brailleCache.current.get(text);
    if (cached !== undefined) { push(cached, 'cache'); return; }

    // Debounce network 점역 so rapid cursor moves don't spam the API.
    window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      if (latestText.current !== text) return;
      fetchBrailleUnicode(text)
        .then(braille => {
          const hex = unicodeBrailleToHex(braille, 20);
          brailleCache.current.set(text, hex);
          push(hex, 'braillify');
        })
        .catch(() => push(textToBrailleHex(text, 20), 'local-fallback'));
    }, 160);
  }, [status]);

  // ── Hardware self-test ──────────────────────────────────────────────────────
  // Sends a sequence of KNOWN orientation patterns so a real-device tester can
  // confirm, in seconds, that cells map the way the encoder assumes. Each frame
  // is a full 300-cell graphic frame; the console says what to feel for.
  const selfTest = useCallback(() => {
    if (status !== 'connected') return;
    const rep = (b: string) => b.repeat(300);
    const ribOrFull = getFossilPattern('rib') ?? rep('FF');
    const steps: { hex: string; msg: string }[] = [
      { hex: rep('00'), msg: '1/6 전체 내림 — 모든 점이 내려갑니다.' },
      { hex: rep('01'), msg: '2/6 각 셀 왼쪽-위 점만(0x01) — 규칙적인 점 격자가 느껴져야 합니다.' },
      { hex: rep('88'), msg: '3/6 각 셀 아래 두 점만(0x88) — 가로줄(셀 하단)이 느껴져야 합니다.' },
      { hex: rep('0F'), msg: '4/6 각 셀 왼쪽 열 전체(0x0F) — 세로 줄무늬(왼쪽 열)가 느껴져야 합니다.' },
      { hex: ribOrFull, msg: '5/6 갈비뼈 화석 형태 — 똑바로(상하/좌우 정상) 보여야 합니다.' },
      { hex: rep('FF'), msg: '6/6 전체 올림 — 모든 점이 올라갑니다. 점검 완료.' },
    ];
    steps.forEach((s, i) => {
      window.setTimeout(() => {
        // eslint-disable-next-line no-console
        console.info('[DotPad 점검] ' + s.msg);
        if (demo.current) {
          // eslint-disable-next-line no-console
          console.info(`[DotPad demo] (점검) ${raisedPins(s.hex)}개 점 돌출`);
        } else if (sdk.current) {
          sdk.current.displayGraphicData(s.hex);
        }
      }, i * 1500);
    });
  }, [status]);

  return { status, connect, connectDemo, disconnect, selfTest, sendGrid, sendRawHex, sendText };
}
