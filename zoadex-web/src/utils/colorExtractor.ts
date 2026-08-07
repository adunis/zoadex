/**
 * Extract dominant colors from an image URL using canvas.
 * Returns 2-3 most prominent non-white/non-black colors.
 * Uses circular sampling to avoid white corners in circle-flag SVGs.
 */
export async function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const size = 64; // small size for speed
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size).data;
        const colors = getDominantColors(imageData, size, 3);
        resolve(colors);
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}

/**
 * Color quantization with circular sampling — only samples pixels within the
 * central circle to avoid white/transparent corners in circular flag SVGs.
 * Returns top N distinct colors (excluding near-white, near-black, and desaturated).
 */
function getDominantColors(data: Uint8ClampedArray, size: number, count: number): string[] {
  const colorMap = new Map<string, number>();
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 3;

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      // Skip pixels outside the circle
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > radius * radius) continue;

      const i = (y * size + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128) continue; // skip transparent

      // Skip near-white, near-black, and low-saturation colors
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lightness = (max + min) / 2;
      const chroma = max - min;

      if (lightness > 190) continue; // strict — skip anything lighter than light grey
      if (lightness < 25) continue;  // skip very dark
      if (chroma < 30 && lightness > 80) continue; // skip greys and desaturated colors

      // Bucket to reduce noise (round to nearest 32)
      const br = Math.round(r / 32) * 32;
      const bg = Math.round(g / 32) * 32;
      const bb = Math.round(b / 32) * 32;
      const key = `${br},${bg},${bb}`;
      colorMap.set(key, (colorMap.get(key) ?? 0) + 1);
    }
  }

  // Sort by frequency
  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);

  // Get top N distinct colors (ensure they're visually different)
  const results: string[] = [];
  for (const [key] of sorted) {
    const [r, g, b] = key.split(',').map(Number);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    // Check it's sufficiently different from already picked colors
    const isDifferent = results.every(existing => colorDistance(existing, hex) > 100);
    if (isDifferent) {
      results.push(hex);
      if (results.length >= count) break;
    }
  }

  return results;
}

function colorDistance(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Build a RegionPalette from extracted colors.
 */
export function buildPaletteFromColors(colors: string[]): {
  primary: string;
  primaryLight: string;
  secondary: string;
  gradient: string;
  mapAccent: string;
} | null {
  if (colors.length === 0) return null;

  // Filter out colors that are too light to be a good primary
  const usable = colors.filter(hex => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 180; // reject anything lighter than this
  });

  if (usable.length === 0) {
    // All colors are light — darken the first one
    const hex = colors[0];
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 80);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 80);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 80);
    const darkened = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return {
      primary: darkened,
      primaryLight: colors[0],
      secondary: colors[1] ?? darkened,
      gradient: `linear-gradient(135deg, ${darkened}, ${colors[0]})`,
      mapAccent: colors[1] ?? darkened,
    };
  }

  const primary = usable[0];
  const secondary = usable[1] ?? colors.find(c => c !== primary) ?? primary;
  const primaryLight = lightenColor(primary, 20);

  return {
    primary,
    primaryLight,
    secondary,
    gradient: `linear-gradient(135deg, ${primary}, ${primaryLight})`,
    mapAccent: secondary,
  };
}

function lightenColor(hex: string, percent: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + percent);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + percent);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + percent);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
