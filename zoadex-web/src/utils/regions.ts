import { Region } from '../types/region';

const CONTINENT_ORDER = ['Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania'];

export interface RegionHierarchy {
  continent: string;
  countries: {
    country: string;
    regions: Region[];
  }[];
}

export function buildRegionHierarchy(regions: Region[]): RegionHierarchy[] {
  // Group by continent, then by country
  const byContinent = new Map<string, Map<string, Region[]>>();

  for (const r of regions) {
    const continent = r.continent ?? 'Other';
    if (!byContinent.has(continent)) byContinent.set(continent, new Map());
    const countryMap = byContinent.get(continent)!;
    if (!countryMap.has(r.country)) countryMap.set(r.country, []);
    countryMap.get(r.country)!.push(r);
  }

  // Sort and build hierarchy
  return CONTINENT_ORDER
    .filter(c => byContinent.has(c))
    .map(continent => ({
      continent,
      countries: [...byContinent.get(continent)!.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([country, regions]) => ({
          country,
          regions: regions.sort((a, b) => a.name.localeCompare(b.name)),
        })),
    }));
}

export function groupByContinent(regions: Region[]): Record<string, Region[]> {
  const groups: Record<string, Region[]> = {};

  for (const r of regions) {
    const continent = r.continent ?? 'Other';
    if (!groups[continent]) groups[continent] = [];
    groups[continent].push(r);
  }

  const sorted: Record<string, Region[]> = {};
  for (const c of CONTINENT_ORDER) {
    if (groups[c]) sorted[c] = groups[c].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (groups['Other']) sorted['Other'] = groups['Other'];
  return sorted;
}

export function getContinentEmoji(continent: string): string {
  switch (continent) {
    case 'Europe': return '🇪🇺';
    case 'North America': return '🇳🇦';
    case 'South America': return '🇸🇦';
    case 'Asia': return '🇦🇸';
    case 'Africa': return '🇦🇫';
    case 'Oceania': return '🇴🇨';
    default: return '🌍';
  }
}

// ISO 3166-2 codes for sub-national regions (lowercase for hatscripts/circle-flags CDN)
const REGION_CODES: Record<string, string> = {
  // Italian regions (all confirmed working)
  'Emilia-Romagna': 'it-45', 'Lombardia': 'it-25', 'Piemonte': 'it-21',
  "Valle d'Aosta": 'it-23', 'Veneto': 'it-34', 'Friuli Venezia Giulia': 'it-36',
  'Liguria': 'it-42', 'Trentino-Alto Adige': 'it-32', 'Toscana': 'it-52',
  'Umbria': 'it-55', 'Marche': 'it-57', 'Lazio': 'it-62', 'Abruzzo': 'it-65',
  'Molise': 'it-67', 'Campania': 'it-72', 'Puglia': 'it-75',
  'Basilicata': 'it-77', 'Calabria': 'it-78', 'Sicilia': 'it-82', 'Sardegna': 'it-88',
  // US states (confirmed working)
  'California': 'us-ca', 'Texas': 'us-tx', 'Florida': 'us-fl',
  'Georgia': 'us-ga', 'Hawaii': 'us-hi', 'Colorado': 'us-co',
  'Arizona': 'us-az', 'Arkansas': 'us-ar', 'Ohio': 'us-oh',
  'Oregon': 'us-or', 'Washington': 'us-wa', 'Michigan': 'us-mi',
  'Minnesota': 'us-mn', 'Mississippi': 'us-ms', 'Missouri': 'us-mo',
  'Montana': 'us-mt', 'Nebraska': 'us-ne', 'Nevada': 'us-nv',
  'New Mexico': 'us-nm', 'North Carolina': 'us-nc', 'North Dakota': 'us-nd',
  'Oklahoma': 'us-ok', 'Pennsylvania': 'us-pa', 'Rhode Island': 'us-ri',
  'South Carolina': 'us-sc', 'South Dakota': 'us-sd', 'Tennessee': 'us-tn',
  'Utah': 'us-ut', 'Vermont': 'us-vt', 'Virginia': 'us-va',
  'West Virginia': 'us-wv', 'Wisconsin': 'us-wi', 'Wyoming': 'us-wy',
  'Idaho': 'us-id', 'Illinois': 'us-il', 'Indiana': 'us-in',
  'Iowa': 'us-ia', 'Kansas': 'us-ks', 'Kentucky': 'us-ky',
  'Louisiana': 'us-la', 'Maine': 'us-me', 'Maryland': 'us-md',
  'Massachusetts': 'us-ma',
  // Australian states
  'New South Wales': 'au-nsw', 'Victoria': 'au-vic', 'Queensland': 'au-qld',
  'Western Australia': 'au-wa', 'South Australia': 'au-sa', 'Tasmania': 'au-tas',
  'Northern Territory': 'au-nt', 'ACT': 'au-act',
  // Canadian provinces
  'Quebec': 'ca-qc', 'British Columbia': 'ca-bc',
  // Spanish communities
  'Catalonia': 'es-ct', 'Galicia': 'es-ga',
  // Indian states
  'Karnataka': 'in-ka',
};

// Wikipedia Commons flag filenames for regions not on hatscripts
const WIKIMEDIA_FLAGS: Record<string, string> = {
  // Japan
  'Hokkaido': 'Flag_of_Hokkaido_Prefecture.svg',
  'Kanto': 'Flag_of_Tokyo_Metropolis.svg',
  'Kansai': 'Flag_of_Osaka_Prefecture.svg',
  'Kyushu': 'Flag_of_Fukuoka_Prefecture.svg',
  'Okinawa': 'Flag_of_Okinawa_Prefecture.svg',
  // Spain
  'Andalusia': 'Flag_of_Andalucía.svg',
  'Canary Islands': 'Flag_of_the_Canary_Islands.svg',
  'Valencia': 'Flag_of_the_Valencian_Community.svg',
  'Basque Country': 'Flag_of_the_Basque_Country.svg',
  // France
  'Ile-de-France': 'Flag_of_Île-de-France.svg',
  'Provence-Alpes-Cote d\'Azur': 'Flag_of_Provence-Alpes-Côte_d%27Azur.svg',
  'Occitanie': 'Flag_of_Occitania.svg',
  'Brittany': 'Flag_of_Brittany.svg',
  'Normandy': 'Flag_of_Normandy.svg',
  'French Guiana': 'Flag_of_French_Guiana.svg',
  'Reunion': 'Flag_of_Réunion.svg',
  // Germany
  'Bavaria': 'Flag_of_Bavaria_%28lozengy%29.svg',
  'Baden-Wurttemberg': 'Flag_of_Baden-Württemberg.svg',
  'North Rhine-Westphalia': 'Flag_of_North_Rhine-Westphalia.svg',
  'Lower Saxony': 'Flag_of_Lower_Saxony.svg',
  // Canada
  'Ontario': 'Flag_of_Ontario.svg',
  'Alberta': 'Flag_of_Alberta.svg',
  'Manitoba': 'Flag_of_Manitoba.svg',
  'Saskatchewan': 'Flag_of_Saskatchewan.svg',
  'Nova Scotia': 'Flag_of_Nova_Scotia.svg',
  'New Brunswick': 'Flag_of_New_Brunswick.svg',
  'Newfoundland': 'Flag_of_Newfoundland_and_Labrador.svg',
  'Prince Edward Island': 'Flag_of_Prince_Edward_Island.svg',
  // India
  'Kerala': 'Flag_of_Kerala.png',
  'Uttarakhand': 'Flag_of_Uttarakhand.svg',
  'Karnataka': 'Flag_of_Karnataka.svg',
  'Rajasthan': 'Flag_of_Rajasthan.svg',
  // China
  'Tibet': 'Flag_of_Tibet.svg',
  // Mexico
  'Baja California': 'Flag_of_Baja_California.svg',
  'Yucatan': 'Flag_of_Quintana_Roo.svg',
  'Oaxaca': 'Flag_of_Oaxaca.svg',
  'Chiapas': 'Flag_of_Chiapas.svg',
  'Jalisco': 'Flag_of_Jalisco.svg',
  // Indonesia
  'Java': 'Flag_of_West_Java.svg',
  'Sumatra': 'Flag_of_North_Sumatra.svg',
  'Borneo (Kalimantan)': 'Flag_of_South_Kalimantan.svg',
  'Sulawesi': 'Flag_of_South_Sulawesi.svg',
  'Papua': 'Flag_of_Papua_(province).svg',
  // China - new
  'Inner Mongolia': 'Flag_of_Inner_Mongolia.svg',
  'Xinjiang': 'Flag_of_the_People%27s_Republic_of_China.svg',
  'Heilongjiang': 'Flag_of_the_People%27s_Republic_of_China.svg',
  'Hainan': 'Flag_of_Hainan.svg',
  'Fujian': 'Flag_of_the_People%27s_Republic_of_China.svg',
  // India - new
  'Tamil Nadu': 'Flag_of_Tamil_Nadu.svg',
  'West Bengal': 'Flag_of_West_Bengal.png',
  'Goa': 'Flag_of_Goa.svg',
  'Madhya Pradesh': 'Flag_of_Madhya_Pradesh.svg',
  // Japan - new
  'Tohoku': 'Flag_of_Miyagi_Prefecture.svg',
  'Chubu': 'Flag_of_Nagano_Prefecture.svg',
  // Brazil - new
  'Pampa': 'Flag_of_Rio_Grande_do_Sul.svg',
  // Indonesia - new
  'Bali': 'Flag_of_Bali.svg',
};

/**
 * Get the flag URL for a specific region.
 * Prefers regional flag from hatscripts, falls back to Wikimedia, then country flag.
 */
export function getRegionFlagUrl(regionName: string, country: string): string {
  // 1. Try hatscripts circle-flags (best quality, circular)
  const regionCode = REGION_CODES[regionName];
  if (regionCode) {
    return `https://hatscripts.github.io/circle-flags/flags/${regionCode}.svg`;
  }
  // 2. Try Wikimedia Commons (rectangular flag images)
  const wikiFile = WIKIMEDIA_FLAGS[regionName];
  if (wikiFile) {
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${wikiFile}?width=80`;
  }
  // 3. Fall back to country flag from hatscripts
  const countryCode = COUNTRY_CODES[country];
  if (countryCode) {
    return `https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`;
  }
  return '';
}

// ISO 3166-1 alpha-2 country codes for flag CDN
const COUNTRY_CODES: Record<string, string> = {
  'Italy': 'it', 'France': 'fr', 'Spain': 'es', 'Germany': 'de',
  'United Kingdom': 'gb', 'Portugal': 'pt', 'Austria': 'at',
  'Switzerland': 'ch', 'Netherlands': 'nl', 'Belgium': 'be',
  'Greece': 'gr', 'Poland': 'pl', 'Czech Republic': 'cz',
  'Sweden': 'se', 'Norway': 'no', 'Denmark': 'dk',
  'Finland': 'fi', 'Ireland': 'ie', 'Croatia': 'hr',
  'Romania': 'ro', 'Hungary': 'hu',
  'United States': 'us', 'Canada': 'ca', 'Mexico': 'mx',
  'Costa Rica': 'cr',
  'Brazil': 'br', 'Argentina': 'ar', 'Colombia': 'co',
  'Peru': 'pe', 'Chile': 'cl', 'Ecuador': 'ec',
  'Japan': 'jp', 'South Korea': 'kr', 'India': 'in',
  'Thailand': 'th', 'Indonesia': 'id', 'China': 'cn',
  'Turkey': 'tr', 'Israel': 'il',
  'South Africa': 'za', 'Kenya': 'ke', 'Tanzania': 'tz',
  'Morocco': 'ma', 'Madagascar': 'mg',
  'Australia': 'au', 'New Zealand': 'nz',
  // European additions
  'Serbia': 'rs', 'Bulgaria': 'bg', 'Slovakia': 'sk',
  'Slovenia': 'si', 'Lithuania': 'lt', 'Latvia': 'lv',
  'Estonia': 'ee', 'Iceland': 'is', 'Ukraine': 'ua',
  'Albania': 'al', 'Bosnia and Herzegovina': 'ba', 'Montenegro': 'me',
  'Malta': 'mt',
  // African additions
  'Egypt': 'eg', 'Nigeria': 'ng', 'Ethiopia': 'et',
  'Ghana': 'gh', 'Uganda': 'ug', 'Namibia': 'na',
  'Botswana': 'bw', 'Rwanda': 'rw', 'Senegal': 'sn',
  'Cameroon': 'cm', 'Mozambique': 'mz', 'Congo': 'cg',
};

export function getCountryCode(country: string): string | null {
  return COUNTRY_CODES[country] ?? null;
}

export function getCountryFlagUrl(country: string, _size?: number): string {
  const code = COUNTRY_CODES[country];
  if (!code) return '';
  return `https://hatscripts.github.io/circle-flags/flags/${code}.svg`;
}

// Emoji fallback for text-only contexts
export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    'Italy': '🇮🇹', 'France': '🇫🇷', 'Spain': '🇪🇸', 'Germany': '🇩🇪',
    'United Kingdom': '🇬🇧', 'Portugal': '🇵🇹', 'Austria': '🇦🇹',
    'Switzerland': '🇨🇭', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪',
    'Greece': '🇬🇷', 'Poland': '🇵🇱', 'Czech Republic': '🇨🇿',
    'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Denmark': '🇩🇰',
    'Finland': '🇫🇮', 'Ireland': '🇮🇪', 'Croatia': '🇭🇷',
    'Romania': '🇷🇴', 'Hungary': '🇭🇺',
    'United States': '🇺🇸', 'Canada': '🇨🇦', 'Mexico': '🇲🇽',
    'Costa Rica': '🇨🇷',
    'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'Colombia': '🇨🇴',
    'Peru': '🇵🇪', 'Chile': '🇨🇱', 'Ecuador': '🇪🇨',
    'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'India': '🇮🇳',
    'Thailand': '🇹🇭', 'Indonesia': '🇮🇩', 'China': '🇨🇳',
    'Turkey': '🇹🇷', 'Israel': '🇮🇱',
    'South Africa': '🇿🇦', 'Kenya': '🇰🇪', 'Tanzania': '🇹🇿',
    'Morocco': '🇲🇦', 'Madagascar': '🇲🇬',
    'Australia': '🇦🇺', 'New Zealand': '🇳🇿',
  };
  return flags[country] ?? '🌍';
}
