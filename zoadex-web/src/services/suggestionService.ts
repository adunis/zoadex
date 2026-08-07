import api from './api';
import { withFallback } from './withFallback';
import { mockSuggestions } from './mockData';
import { Suggestion } from '../types/suggestion';

export const suggestionService = {
  async getSuggestions(
    latitude: number,
    longitude: number,
    timestamp?: string,
  ): Promise<Suggestion[]> {
    return withFallback(
      async () => {
        const params = new URLSearchParams({
          lat: latitude.toString(),
          lon: longitude.toString(),
        });
        if (timestamp) params.append('timestamp', timestamp);
        const response = await api.get<Suggestion[]>(`/suggestions?${params.toString()}`);
        return response.data;
      },
      mockSuggestions,
    );
  },
};
