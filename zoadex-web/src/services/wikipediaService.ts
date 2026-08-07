export interface WikiSummary {
  extract: string;
  pageUrl: string;
}

export async function fetchWikipediaSummary(
  scientificName: string,
  commonName?: string,
): Promise<WikiSummary | null> {
  const names = [scientificName, commonName].filter(Boolean) as string[];

  for (const name of names) {
    try {
      const encoded = encodeURIComponent(name.replace(/ /g, '_'));
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      );
      if (!response.ok) continue;
      const data = await response.json();
      if (data.type === 'standard' && data.extract) {
        return {
          extract: data.extract,
          pageUrl:
            data.content_urls?.desktop?.page ??
            `https://en.wikipedia.org/wiki/${encoded}`,
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}
