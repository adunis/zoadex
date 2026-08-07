export type UILanguage = 'en' | 'it' | 'fr' | 'es' | 'de' | 'ja';
export type SpeciesLanguage = 'en' | 'it' | 'fr' | 'es' | 'de' | 'zh' | 'ar' | 'ja';

export const UI_LANGUAGES: { code: UILanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'it', label: 'Italiano', flag: 'it' },
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'es', label: 'Español', flag: 'es' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'ja', label: '日本語', flag: 'jp' },
];

export const SPECIES_LANGUAGES: { code: SpeciesLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'it', label: 'Italiano', flag: 'it' },
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'es', label: 'Español', flag: 'es' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'zh', label: '中文', flag: 'cn' },
  { code: 'ar', label: 'العربية', flag: 'sa' },
  { code: 'ja', label: '日本語', flag: 'jp' },
];

type Translations = Record<string, string>;

const en: Translations = {
  'nav.home': 'Home',
  'nav.map': 'Map',
  'nav.log': 'Log',
  'nav.explore': 'Explore',
  'nav.profile': 'Profile',
  'home.welcome': 'Welcome',
  'home.species_here': 'Species here',
  'map.discover': 'Discover',
  'map.your_sightings': 'Your Sightings',
  'map.species_at_cursor': 'Species here',
  'map.select_category': 'Select category to explore',
  'map.pan_to_explore': 'Pan map to explore',
  'map.viewing': 'Viewing',
  'map.back_to': 'Back to',
  'map.view_region': 'View',
  'regions.title': 'Your Regions',
  'regions.active': 'Currently Active Region',
  'regions.unlocked': 'Unlocked Regions',
  'regions.locked': 'Explore More Regions',
  'regions.activate': 'Activate',
  'regions.unlock': 'Unlock',
  'regions.coming_soon': 'Coming soon',
  'regions.slots_used': 'region slots used',
  'profile.title': 'Profile',
  'profile.member_since': 'Member since',
  'profile.sightings': 'Sightings',
  'profile.species': 'Species',
  'profile.settings': 'Settings',
  'profile.ui_language': 'App Language',
  'profile.species_languages': 'Species Name Languages',
  'profile.species_lang_hint': 'Select one or more languages for species names',
  'profile.logout': 'Logout',
  'species.rare': 'Rare',
  'species.uncommon': 'Uncommon',
  'species.common': 'Common',
  'species.very_common': 'Very Common',
  'tier.full': 'Full data',
  'tier.basic': 'Basic data',
  'tier.partial': 'Partial data',
  'tier.missing': 'Data missing',
  'sighting.log_title': 'Log a Sighting',
  'sighting.outside_region': 'Your location is outside your active region',
};

const it: Translations = {
  'nav.home': 'Home',
  'nav.map': 'Mappa',
  'nav.log': 'Registra',
  'nav.explore': 'Esplora',
  'nav.profile': 'Profilo',
  'home.welcome': 'Benvenuto',
  'home.species_here': 'Specie qui',
  'map.discover': 'Scopri',
  'map.your_sightings': 'I tuoi avvistamenti',
  'map.species_at_cursor': 'Specie qui',
  'map.select_category': 'Seleziona categoria per esplorare',
  'map.pan_to_explore': 'Muovi la mappa per esplorare',
  'map.viewing': 'Visualizzando',
  'map.back_to': 'Torna a',
  'map.view_region': 'Visualizza',
  'regions.title': 'Le tue Regioni',
  'regions.active': 'Regione Attiva',
  'regions.unlocked': 'Regioni Sbloccate',
  'regions.locked': 'Esplora Altre Regioni',
  'regions.activate': 'Attiva',
  'regions.unlock': 'Sblocca',
  'regions.coming_soon': 'In arrivo',
  'regions.slots_used': 'slot regioni usati',
  'profile.title': 'Profilo',
  'profile.member_since': 'Membro dal',
  'profile.sightings': 'Avvistamenti',
  'profile.species': 'Specie',
  'profile.settings': 'Impostazioni',
  'profile.ui_language': 'Lingua App',
  'profile.species_languages': 'Lingue Nomi Specie',
  'profile.species_lang_hint': 'Seleziona una o più lingue per i nomi delle specie',
  'profile.logout': 'Esci',
  'species.rare': 'Raro',
  'species.uncommon': 'Non comune',
  'species.common': 'Comune',
  'species.very_common': 'Molto comune',
  'tier.full': 'Dati completi',
  'tier.basic': 'Dati base',
  'tier.partial': 'Dati parziali',
  'tier.missing': 'Dati mancanti',
  'sighting.log_title': 'Registra Avvistamento',
  'sighting.outside_region': 'La tua posizione è fuori dalla regione attiva',
};

const fr: Translations = {
  'nav.home': 'Accueil', 'nav.map': 'Carte', 'nav.log': 'Noter',
  'nav.explore': 'Explorer', 'nav.profile': 'Profil',
  'home.welcome': 'Bienvenue', 'map.discover': 'Découvrir',
  'map.your_sightings': 'Vos observations',
  'regions.title': 'Vos Régions', 'regions.activate': 'Activer',
  'regions.unlock': 'Débloquer', 'profile.title': 'Profil',
  'profile.logout': 'Déconnexion',
  'profile.ui_language': 'Langue de l\'app',
  'profile.species_languages': 'Langues des noms d\'espèces',
};

const es: Translations = {
  'nav.home': 'Inicio', 'nav.map': 'Mapa', 'nav.log': 'Registrar',
  'nav.explore': 'Explorar', 'nav.profile': 'Perfil',
  'home.welcome': 'Bienvenido', 'map.discover': 'Descubrir',
  'map.your_sightings': 'Tus avistamientos',
  'regions.title': 'Tus Regiones', 'regions.activate': 'Activar',
  'regions.unlock': 'Desbloquear', 'profile.title': 'Perfil',
  'profile.logout': 'Cerrar sesión',
  'profile.ui_language': 'Idioma de la app',
  'profile.species_languages': 'Idiomas de nombres de especies',
};

const de: Translations = {
  'nav.home': 'Start', 'nav.map': 'Karte', 'nav.log': 'Erfassen',
  'nav.explore': 'Entdecken', 'nav.profile': 'Profil',
  'home.welcome': 'Willkommen', 'map.discover': 'Entdecken',
  'map.your_sightings': 'Deine Sichtungen',
  'regions.title': 'Deine Regionen', 'regions.activate': 'Aktivieren',
  'regions.unlock': 'Freischalten', 'profile.title': 'Profil',
  'profile.logout': 'Abmelden',
  'profile.ui_language': 'App-Sprache',
  'profile.species_languages': 'Artnamen-Sprachen',
};

const ja: Translations = {
  'nav.home': 'ホーム', 'nav.map': '地図', 'nav.log': '記録',
  'nav.explore': '探索', 'nav.profile': 'プロフィール',
  'home.welcome': 'ようこそ', 'map.discover': '発見',
  'regions.title': 'あなたの地域', 'profile.logout': 'ログアウト',
};

const ALL_TRANSLATIONS: Record<UILanguage, Translations> = { en, it, fr, es, de, ja };

export function t(key: string, lang: UILanguage): string {
  return ALL_TRANSLATIONS[lang]?.[key] ?? ALL_TRANSLATIONS.en[key] ?? key;
}
