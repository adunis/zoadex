import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UILanguage, SpeciesLanguage, t as translate } from '../i18n/translations';

interface LanguageContextType {
  uiLanguage: UILanguage;
  speciesLanguages: SpeciesLanguage[];
  setUiLanguage: (lang: UILanguage) => void;
  setSpeciesLanguages: (langs: SpeciesLanguage[]) => void;
  t: (key: string) => string;
  formatSpeciesName: (species: {
    commonName?: string | null;
    scientificName: string;
    nameIt?: string | null;
    nameFr?: string | null;
    nameEs?: string | null;
    nameDe?: string | null;
    nameZh?: string | null;
    nameAr?: string | null;
    nameJa?: string | null;
  }) => string;
  /** @deprecated Use formatSpeciesName instead */
  getSpeciesName: (commonName: string | null, localName: string | null, scientificName: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  uiLanguage: 'en',
  speciesLanguages: ['en'],
  setUiLanguage: () => {},
  setSpeciesLanguages: () => {},
  t: (key) => key,
  formatSpeciesName: (s) => s.commonName ?? s.scientificName,
  getSpeciesName: (cn, _ln, sn) => cn ?? sn,
});

const STORAGE_UI_LANG = 'zoadex_ui_language';
const STORAGE_SPECIES_LANGS = 'zoadex_species_languages';

const LANG_FLAGS: Record<SpeciesLanguage, string> = {
  en: '🇬🇧', it: '🇮🇹', fr: '🇫🇷', es: '🇪🇸',
  de: '🇩🇪', zh: '🇨🇳', ar: '🇸🇦', ja: '🇯🇵',
};

function getNameForLang(species: any, lang: SpeciesLanguage): string | null {
  switch (lang) {
    case 'en': return species.commonName ?? null;
    case 'it': return species.nameIt ?? null;
    case 'fr': return species.nameFr ?? null;
    case 'es': return species.nameEs ?? null;
    case 'de': return species.nameDe ?? null;
    case 'zh': return species.nameZh ?? null;
    case 'ar': return species.nameAr ?? null;
    case 'ja': return species.nameJa ?? null;
    default: return null;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [uiLanguage, setUiLang] = useState<UILanguage>(() => {
    const stored = localStorage.getItem(STORAGE_UI_LANG);
    return (stored as UILanguage) || 'en';
  });

  const [speciesLanguages, setSpecLangs] = useState<SpeciesLanguage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SPECIES_LANGS);
      return stored ? (JSON.parse(stored) as SpeciesLanguage[]) : ['en'];
    } catch { return ['en']; }
  });

  const setUiLanguage = useCallback((lang: UILanguage) => {
    setUiLang(lang);
    localStorage.setItem(STORAGE_UI_LANG, lang);
  }, []);

  const setSpeciesLanguages = useCallback((langs: SpeciesLanguage[]) => {
    const valid: SpeciesLanguage[] = langs.length > 0 ? langs : ['en'];
    setSpecLangs(valid);
    localStorage.setItem(STORAGE_SPECIES_LANGS, JSON.stringify(valid));
  }, []);

  const tFn = useCallback((key: string) => translate(key, uiLanguage), [uiLanguage]);

  const formatSpeciesName = useCallback((species: any): string => {
    if (speciesLanguages.length === 1) {
      const name = getNameForLang(species, speciesLanguages[0]);
      return name ?? species.commonName ?? species.scientificName;
    }
    // Multiple languages: show flag + name for each
    const parts = speciesLanguages
      .map(lang => {
        const name = getNameForLang(species, lang);
        if (!name) return null;
        return `${LANG_FLAGS[lang]} ${name}`;
      })
      .filter(Boolean);

    if (parts.length === 0) return species.commonName ?? species.scientificName;
    return parts.join('\n');
  }, [speciesLanguages]);

  // Keep old function for backward compat (delegates to new logic)
  const getSpeciesName = useCallback((commonName: string | null, localName: string | null, scientificName: string): string => {
    // Simple fallback for components not yet migrated
    if (speciesLanguages.length === 1 && speciesLanguages[0] === 'it' && localName) return localName;
    if (speciesLanguages.length === 1 && speciesLanguages[0] === 'en') return commonName ?? scientificName;
    return commonName ?? scientificName;
  }, [speciesLanguages]);

  return (
    <LanguageContext.Provider value={{
      uiLanguage, speciesLanguages, setUiLanguage, setSpeciesLanguages, t: tFn, formatSpeciesName, getSpeciesName
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  return useContext(LanguageContext);
}
