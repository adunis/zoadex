import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useActiveRegion } from '../../hooks/useActiveRegion';
import { suggestionService } from '../../services/suggestionService';
import { SpeciesCategory } from '../../types/species';

export function WeatherCard() {
  const { latitude, longitude, error: geoError, loading: geoLoading, requestLocation } =
    useGeolocation();
  const { regionCenter } = useActiveRegion();

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const timestamp = new Date().toISOString();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggestions', latitude, longitude],
    queryFn: () => suggestionService.getSuggestions(latitude!, longitude!, timestamp),
    enabled: !!latitude && !!longitude,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // If geolocation not available, use active region center as default
  const { data: fallbackSuggestions = [] } = useQuery({
    queryKey: ['suggestions', 'default', regionCenter[0], regionCenter[1]],
    queryFn: () => suggestionService.getSuggestions(regionCenter[0], regionCenter[1], timestamp),
    enabled: !latitude && !geoLoading,
    staleTime: 30 * 60 * 1000,
  });

  const displaySuggestions = suggestions.length > 0 ? suggestions : fallbackSuggestions;
  const top5 = displaySuggestions.slice(0, 5);

  return (
    <section className="encounter-section">
      <h3 className="encounter-section__title">🔮 What you might encounter today</h3>

      {geoLoading || isLoading ? (
        <p className="encounter-section__loading">Checking what's around you...</p>
      ) : top5.length === 0 ? (
        <p className="encounter-section__empty">
          Explore the <Link to="/map">map</Link> to discover species in your area.
        </p>
      ) : (
        <ul className="encounter-list">
          {top5.map((suggestion, i) => (
            <li key={suggestion.speciesId || i} className="encounter-list__item">
              <span className="encounter-list__emoji">
                {getCategoryEmoji(suggestion.category)}
              </span>
              <div className="encounter-list__details">
                <span className="encounter-list__name">
                  {suggestion.commonName ?? suggestion.scientificName}
                </span>
                <span className="encounter-list__reason">
                  {suggestion.reasons?.[0] ?? formatConfidence(suggestion.confidence)}
                </span>
              </div>
              <span className="encounter-list__confidence">
                {Math.round((suggestion.confidence ?? 0) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}

      {!latitude && !geoLoading && !geoError && (
        <p className="encounter-section__hint">Enable location for personalized suggestions</p>
      )}
    </section>
  );
}

function getCategoryEmoji(category?: SpeciesCategory | string): string {
  switch (category) {
    case 'BIRDS':
      return '🐦';
    case 'MAMMALS':
      return '🐾';
    case 'REPTILES':
      return '🦎';
    case 'AMPHIBIANS':
      return '🐸';
    case 'INSECTS':
      return '🐛';
    case 'PLANTS':
      return '🌿';
    case 'TREES':
      return '🌲';
    case 'MUSHROOMS':
      return '🍄';
    case 'FISH':
      return '🐟';
    default:
      return '🌍';
  }
}

function formatConfidence(confidence?: number): string {
  if (!confidence) return '';
  if (confidence > 0.8) return 'Very likely here';
  if (confidence > 0.5) return 'Likely nearby';
  return 'Possible encounter';
}
