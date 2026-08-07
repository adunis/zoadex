import { useState, useCallback } from 'react';

type Language = 'en' | 'it';

const LANG_KEY = 'zoadex_language';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem(LANG_KEY) as Language) ?? 'en'
  );

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(LANG_KEY, lang);
    setLanguageState(lang);
  }, []);

  return { language, setLanguage };
}
