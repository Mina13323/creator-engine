'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from './dictionaries/en';
import { ar } from './dictionaries/ar';

type Locale = 'en' | 'ar';
type Dictionary = typeof en;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const dictionaries: Record<Locale, Dictionary> = { en, ar };

// Helper to get nested object property by string path
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) as any;
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  // Try to load initial locale from localStorage or default to 'en'
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const savedLocale = localStorage.getItem('app-locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar')) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app-locale', newLocale);
  };

  const t = (key: string): string => {
    const dict = dictionaries[locale];
    const value = getNestedValue(dict, key);
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key; // Fallback to key itself
    }
    return value;
  };

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // Apply direction to the HTML element
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      <div dir={dir}>{children}</div>
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
