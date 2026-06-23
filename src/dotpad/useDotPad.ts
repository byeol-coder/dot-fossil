import { useCallback, useEffect, useRef, useState } from 'react';
import { DotPadSDK, DotPadScanner, DataCodes, KeyCodes } from './DotPadSDK-3_0_0.js';
import type { DotDevice } from './DotPadSDK-3_0_0.js';
import type { DotGrid } from './tactilePatterns';
import type { Dispatch } from 'react';
import type { GameAction } from '../types';
import { encodeMatrixToHex } from './encoding';

export type DotPadStatus = 'disconnected' | 'connecting' | 'connected' | 'unsupported';

const PANNING_KEY_TO_ACTION: Record<string, { dx: number; dy: number } | null> = {
  [KeyCodes.PanningLeft]:  { dx: -1, dy: 0 },
  [KeyCodes.PanningRight]: { dx:  1, dy: 0 },
  [KeyCodes.LPF1]:         { dx: 0,  dy: -1 },
  [KeyCodes.RPF4]:         { dx: 0,  dy:  1 },
};

export function useDotPad(dispatch: Dispatch<GameAction>) {
  const sdk = useRef<DotPadSDK | null>(null);
  const device = useRef<DotDevice | null>(null);
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
        const move = PANNING_KEY_TO_ACTION[key];
        if (move) dispatch({ type: 'MOVE_CURSOR', dx: move.dx, dy: move.dy });
        if (key === KeyCodes.KeyFunction1) dispatch({ type: 'USE_TOOL' });
        if (key === KeyCodes.KeyFunction2) dispatch({ type: 'SET_MODE', mode: 'precision_dig' });
        if (key === KeyCodes.KeyFunction3) dispatch({ type: 'SET_MODE', mode: 'clue_scan' });
        if (key === KeyCodes.KeyFunction4) dispatch({ type: 'SET_SCREEN', screen: 'collection' });
      },
    );
    sdk.current = s;
    return () => { s.disconnect(); };
  }, [dispatch]);

  const connect = useCallback(async () => {
    if (!('bluetooth' in navigator)) {
      setStatus('unsupported');
      return;
    }
    if (status === 'connecting' || status === 'connected') return;
    setStatus('connecting');
    try {
      const scanner = new DotPadScanner();
      const bleDevice = await scanner.startBleScan();
      if (!bleDevice) { setStatus('disconnected'); return; }
      const dev = await sdk.current!.connectBleDevice(bleDevice);
      if (!dev) { setStatus('disconnected'); return; }
      device.current = dev;
      setStatus('connected');
    } catch {
      setStatus('disconnected');
    }
  }, [status]);

  const disconnect = useCallback(() => {
    if (sdk.current && device.current) {
      sdk.current.disconnect(device.current);
    }
    device.current = null;
    setStatus('disconnected');
  }, []);

  const sendGrid = useCallback((dotGrid: DotGrid) => {
    if (status !== 'connected' || !sdk.current) return;
    const hex = encodeMatrixToHex(dotGrid);
    sdk.current.displayGraphicData(hex);
  }, [status]);

  return { status, connect, disconnect, sendGrid };
}
