import { extractColorsFromImage, buildPaletteFromColors } from './colorExtractor';
import { getRegionFlagUrl } from './regions';

export interface RegionPalette {
  primary: string;      // Main accent (buttons, headers)
  primaryLight: string; // Lighter variant
  secondary: string;    // Secondary accent
  gradient: string;     // Button gradient
  mapAccent: string;    // Map markers/overlays
}

// Palettes keyed by region name (Italian regions, US states) or country name (fallback)
const REGION_PALETTES: Record<string, RegionPalette> = {
  // ─── Italian Regions ───────────────────────────────────────────────────────────
  'Emilia-Romagna': { primary: '#1A237E', primaryLight: '#3949AB', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #1A237E, #3949AB)', mapAccent: '#1A237E' },
  'Lombardia': { primary: '#2E7D32', primaryLight: '#43A047', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #2E7D32, #43A047)', mapAccent: '#2E7D32' },
  'Piemonte': { primary: '#B71C1C', primaryLight: '#E53935', secondary: '#1565C0', gradient: 'linear-gradient(135deg, #B71C1C, #E53935)', mapAccent: '#1565C0' },
  'Toscana': { primary: '#C62828', primaryLight: '#E53935', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Veneto': { primary: '#F9A825', primaryLight: '#FBC02D', secondary: '#C62828', gradient: 'linear-gradient(135deg, #F9A825, #FFCA28)', mapAccent: '#C62828' },
  'Sicilia': { primary: '#C62828', primaryLight: '#E53935', secondary: '#F9A825', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#F9A825' },
  'Sardegna': { primary: '#FAFAFA', primaryLight: '#E0E0E0', secondary: '#C62828', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Lazio': { primary: '#0D47A1', primaryLight: '#1565C0', secondary: '#FFC107', gradient: 'linear-gradient(135deg, #0D47A1, #1976D2)', mapAccent: '#FFC107' },
  'Campania': { primary: '#C62828', primaryLight: '#E53935', secondary: '#1565C0', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#1565C0' },
  'Liguria': { primary: '#C62828', primaryLight: '#E53935', secondary: '#1A237E', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#1A237E' },
  'Trentino-Alto Adige': { primary: '#FAFAFA', primaryLight: '#E0E0E0', secondary: '#C62828', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Friuli Venezia Giulia': { primary: '#1565C0', primaryLight: '#1976D2', secondary: '#F9A825', gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)', mapAccent: '#F9A825' },
  'Calabria': { primary: '#1565C0', primaryLight: '#1976D2', secondary: '#F9A825', gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)', mapAccent: '#F9A825' },
  'Puglia': { primary: '#2E7D32', primaryLight: '#43A047', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #2E7D32, #43A047)', mapAccent: '#2E7D32' },
  'Abruzzo': { primary: '#1B5E20', primaryLight: '#2E7D32', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #1B5E20, #2E7D32)', mapAccent: '#1B5E20' },
  'Umbria': { primary: '#C62828', primaryLight: '#E53935', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Marche': { primary: '#2E7D32', primaryLight: '#43A047', secondary: '#C62828', gradient: 'linear-gradient(135deg, #2E7D32, #43A047)', mapAccent: '#C62828' },
  "Valle d'Aosta": { primary: '#B71C1C', primaryLight: '#E53935', secondary: '#212121', gradient: 'linear-gradient(135deg, #B71C1C, #E53935)', mapAccent: '#212121' },
  'Molise': { primary: '#1565C0', primaryLight: '#1976D2', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)', mapAccent: '#C62828' },
  'Basilicata': { primary: '#2E7D32', primaryLight: '#43A047', secondary: '#1565C0', gradient: 'linear-gradient(135deg, #2E7D32, #43A047)', mapAccent: '#1565C0' },

  // ─── US States ─────────────────────────────────────────────────────────────────
  'California': { primary: '#002F6C', primaryLight: '#1565C0', secondary: '#CF9A00', gradient: 'linear-gradient(135deg, #002F6C, #1565C0)', mapAccent: '#CF9A00' },
  'Texas': { primary: '#002868', primaryLight: '#1565C0', secondary: '#BF0A30', gradient: 'linear-gradient(135deg, #002868, #1565C0)', mapAccent: '#BF0A30' },
  'New York': { primary: '#1A237E', primaryLight: '#3949AB', secondary: '#CF9A00', gradient: 'linear-gradient(135deg, #1A237E, #3949AB)', mapAccent: '#CF9A00' },
  'Florida': { primary: '#C62828', primaryLight: '#E53935', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Hawaii': { primary: '#003580', primaryLight: '#1565C0', secondary: '#C62828', gradient: 'linear-gradient(135deg, #003580, #1976D2)', mapAccent: '#C62828' },
  'Colorado': { primary: '#002868', primaryLight: '#1565C0', secondary: '#C8102E', gradient: 'linear-gradient(135deg, #002868, #1565C0)', mapAccent: '#C8102E' },
  'Alaska': { primary: '#003087', primaryLight: '#1565C0', secondary: '#FFB612', gradient: 'linear-gradient(135deg, #003087, #1976D2)', mapAccent: '#FFB612' },
  'New Jersey': { primary: '#E8B430', primaryLight: '#FBC02D', secondary: '#1A237E', gradient: 'linear-gradient(135deg, #E8B430, #FBC02D)', mapAccent: '#1A237E' },
  'Arizona': { primary: '#C62828', primaryLight: '#E53935', secondary: '#B87333', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#B87333' },
  'Oregon': { primary: '#002B5C', primaryLight: '#1565C0', secondary: '#FFC107', gradient: 'linear-gradient(135deg, #002B5C, #1976D2)', mapAccent: '#FFC107' },

  // ─── Countries (fallback for single-region countries) ──────────────────────────
  'Italy': { primary: '#1B5E20', primaryLight: '#4CAF50', secondary: '#E53935', gradient: 'linear-gradient(135deg, #1B5E20, #4CAF50)', mapAccent: '#1B5E20' },
  'France': { primary: '#1A237E', primaryLight: '#3F51B5', secondary: '#E53935', gradient: 'linear-gradient(135deg, #1A237E, #3F51B5)', mapAccent: '#1A237E' },
  'Spain': { primary: '#BF360C', primaryLight: '#FF5722', secondary: '#FFC107', gradient: 'linear-gradient(135deg, #BF360C, #FF8A65)', mapAccent: '#BF360C' },
  'Germany': { primary: '#212121', primaryLight: '#616161', secondary: '#FFC107', gradient: 'linear-gradient(135deg, #212121, #424242)', mapAccent: '#424242' },
  'United Kingdom': { primary: '#1A237E', primaryLight: '#283593', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1A237E, #3949AB)', mapAccent: '#1A237E' },
  'Portugal': { primary: '#1B5E20', primaryLight: '#388E3C', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1B5E20, #43A047)', mapAccent: '#1B5E20' },
  'United States': { primary: '#1A237E', primaryLight: '#1565C0', secondary: '#B71C1C', gradient: 'linear-gradient(135deg, #1A237E, #1976D2)', mapAccent: '#1565C0' },
  'Japan': { primary: '#B71C1C', primaryLight: '#E53935', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #B71C1C, #EF5350)', mapAccent: '#C62828' },
  'Brazil': { primary: '#1B5E20', primaryLight: '#2E7D32', secondary: '#F9A825', gradient: 'linear-gradient(135deg, #1B5E20, #43A047)', mapAccent: '#1B5E20' },
  'Argentina': { primary: '#0277BD', primaryLight: '#039BE5', secondary: '#FFC107', gradient: 'linear-gradient(135deg, #0277BD, #29B6F6)', mapAccent: '#0277BD' },
  'Australia': { primary: '#1A237E', primaryLight: '#1565C0', secondary: '#FFC107', gradient: 'linear-gradient(135deg, #1A237E, #1976D2)', mapAccent: '#1565C0' },
  'India': { primary: '#E65100', primaryLight: '#FF6D00', secondary: '#1B5E20', gradient: 'linear-gradient(135deg, #E65100, #FF9100)', mapAccent: '#E65100' },
  'South Korea': { primary: '#1A237E', primaryLight: '#283593', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1A237E, #3949AB)', mapAccent: '#1A237E' },
  'China': { primary: '#C62828', primaryLight: '#E53935', secondary: '#F9A825', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Mexico': { primary: '#1B5E20', primaryLight: '#388E3C', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1B5E20, #43A047)', mapAccent: '#1B5E20' },
  'South Africa': { primary: '#1B5E20', primaryLight: '#2E7D32', secondary: '#F9A825', gradient: 'linear-gradient(135deg, #1B5E20, #388E3C)', mapAccent: '#1B5E20' },
  'Kenya': { primary: '#212121', primaryLight: '#424242', secondary: '#C62828', gradient: 'linear-gradient(135deg, #212121, #616161)', mapAccent: '#C62828' },
  'Sweden': { primary: '#1565C0', primaryLight: '#1976D2', secondary: '#F9A825', gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)', mapAccent: '#1565C0' },
  'Norway': { primary: '#1A237E', primaryLight: '#283593', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1A237E, #3949AB)', mapAccent: '#C62828' },
  'Finland': { primary: '#1565C0', primaryLight: '#1976D2', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)', mapAccent: '#1565C0' },
  'Greece': { primary: '#0D47A1', primaryLight: '#1565C0', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #0D47A1, #1976D2)', mapAccent: '#0D47A1' },
  'Switzerland': { primary: '#C62828', primaryLight: '#E53935', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Ireland': { primary: '#1B5E20', primaryLight: '#2E7D32', secondary: '#FF8F00', gradient: 'linear-gradient(135deg, #1B5E20, #43A047)', mapAccent: '#1B5E20' },
  'Croatia': { primary: '#1A237E', primaryLight: '#283593', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1A237E, #3949AB)', mapAccent: '#C62828' },
  'Hungary': { primary: '#1B5E20', primaryLight: '#388E3C', secondary: '#C62828', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Turkey': { primary: '#C62828', primaryLight: '#E53935', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Colombia': { primary: '#F9A825', primaryLight: '#FBC02D', secondary: '#1A237E', gradient: 'linear-gradient(135deg, #F9A825, #FFCA28)', mapAccent: '#F9A825' },
  'Peru': { primary: '#C62828', primaryLight: '#E53935', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Chile': { primary: '#C62828', primaryLight: '#E53935', secondary: '#1565C0', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#1565C0' },
  'Ecuador': { primary: '#F9A825', primaryLight: '#FBC02D', secondary: '#0D47A1', gradient: 'linear-gradient(135deg, #F9A825, #FFCA28)', mapAccent: '#0D47A1' },
  'Costa Rica': { primary: '#1565C0', primaryLight: '#1976D2', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)', mapAccent: '#C62828' },
  'Thailand': { primary: '#1A237E', primaryLight: '#283593', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1A237E, #3949AB)', mapAccent: '#C62828' },
  'Indonesia': { primary: '#C62828', primaryLight: '#E53935', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'New Zealand': { primary: '#1A237E', primaryLight: '#283593', secondary: '#C62828', gradient: 'linear-gradient(135deg, #1A237E, #3949AB)', mapAccent: '#C62828' },
  'Canada': { primary: '#C62828', primaryLight: '#E53935', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #C62828, #EF5350)', mapAccent: '#C62828' },
  'Israel': { primary: '#1565C0', primaryLight: '#1976D2', secondary: '#FAFAFA', gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)', mapAccent: '#1565C0' },
};

// Default palette (original ZoaDex deep blue + green)
const DEFAULT_PALETTE: RegionPalette = {
  primary: '#1a237e',
  primaryLight: '#3949ab',
  secondary: '#66bb6a',
  gradient: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
  mapAccent: '#66bb6a',
};

export function getRegionPalette(regionName?: string, country?: string): RegionPalette {
  if (regionName && REGION_PALETTES[regionName]) return REGION_PALETTES[regionName];
  if (country && REGION_PALETTES[country]) return REGION_PALETTES[country];
  return DEFAULT_PALETTE;
}

/**
 * Calculate relative luminance of a hex color.
 * Returns true if the color is "light" (needs dark text).
 */
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  // Relative luminance formula
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.55;
}

export function applyPalette(palette: RegionPalette): void {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', palette.primary);
  root.style.setProperty('--color-primary-light', palette.primaryLight);
  root.style.setProperty('--color-secondary', palette.secondary);
  root.style.setProperty('--gradient-button', palette.gradient);
  root.style.setProperty('--color-map-accent', palette.mapAccent);

  // Set text color based on primary luminance
  const textOnPrimary = isLightColor(palette.primary) ? '#1a1a1a' : '#ffffff';
  const textOnSecondary = isLightColor(palette.secondary) ? '#1a1a1a' : '#ffffff';
  root.style.setProperty('--color-on-primary', textOnPrimary);
  root.style.setProperty('--color-on-secondary', textOnSecondary);

  // Also set general text color: if primary is light, region-badge etc need dark text
  const primaryTextColor = isLightColor(palette.primary) ? '#1a1a1a' : palette.primary;
  root.style.setProperty('--color-primary-text', primaryTextColor);
}

// ─── Dynamic Palette Extraction with localStorage Cache ─────────────────────────

const CACHE_KEY = 'zoadex_palette_cache_v3'; // bumped to invalidate stale white-palette cache

function getCachedPalette(regionName: string): RegionPalette | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
    return cache[regionName] ?? null;
  } catch {
    return null;
  }
}

function setCachedPalette(regionName: string, palette: RegionPalette): void {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
    cache[regionName] = palette;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

/**
 * Extract palette from flag image. Returns cached if available.
 * Hardcoded palettes always take priority (manually curated = best quality).
 * Falls back to extraction or DEFAULT.
 */
export async function extractPaletteFromFlag(
  regionName: string,
  country: string,
): Promise<RegionPalette> {
  // 1. If hardcoded palette exists, always use it (manually curated = best quality)
  const hardcoded = REGION_PALETTES[regionName] ?? REGION_PALETTES[country];
  if (hardcoded) return hardcoded;

  // 2. Check localStorage cache
  const cached = getCachedPalette(regionName);
  if (cached) return cached;

  // 3. Try extracting from flag image (only for regions without hardcoded palette)
  const flagUrl = getRegionFlagUrl(regionName, country);
  if (flagUrl) {
    const colors = await extractColorsFromImage(flagUrl);
    const extracted = buildPaletteFromColors(colors);
    if (extracted) {
      setCachedPalette(regionName, extracted);
      return extracted;
    }
  }

  return DEFAULT_PALETTE;
}
