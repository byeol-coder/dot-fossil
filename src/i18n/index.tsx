import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { ko } from './ko';
import { en } from './en';
import type { Strings } from './ko';

type Lang = 'ko' | 'en';

const STRINGS: Record<Lang, Strings> = { ko, en };

const STORAGE_KEY = 'dot-fossil-lang';

function loadLang(): Lang {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'en' ? 'en' : 'ko';
}

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  tArr: (key: string) => string[];
}

const LangContext = createContext<LangContextValue>({
  lang: 'ko',
  setLang: () => {},
  t: (k) => k,
  tArr: () => [],
});

function resolveDot(obj: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((cur, seg) => {
    if (cur != null && typeof cur === 'object') {
      return (cur as Record<string, unknown>)[seg];
    }
    return undefined;
  }, obj);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const t = useCallback((key: string): string => {
    const strings = STRINGS[lang];
    const val = resolveDot(strings, key);
    if (typeof val === 'string') return val;
    const fallback = resolveDot(STRINGS.ko, key);
    return typeof fallback === 'string' ? fallback : key;
  }, [lang]);

  const tArr = useCallback((key: string): string[] => {
    const strings = STRINGS[lang];
    const val = resolveDot(strings, key);
    if (Array.isArray(val)) return val as string[];
    const fallback = resolveDot(STRINGS.ko, key);
    return Array.isArray(fallback) ? fallback as string[] : [];
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t, tArr }}>
      {children}
    </LangContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LangContext);
}
