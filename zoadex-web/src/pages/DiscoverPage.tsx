import { useState, useEffect } from 'react';
import { Search, CheckCircle, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SightingForm } from '../components/sighting/SightingForm';
import { SuggestionList } from '../components/sighting/SuggestionList';
import { suggestionService } from '../services/suggestionService';
import { sightingService } from '../services/sightingService';
import { speciesService } from '../services/speciesService';
import { regionService } from '../services/regionService';
import { useGeolocation } from '../hooks/useGeolocation';
import { useExpedition } from '../hooks/useExpedition';
import { Suggestion } from '../types/suggestion';
import { Species } from '../types/species';
import { CreateSightingRequest } from '../types/sighting';

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<{ id: string; name: string } | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [badgeUnlocked, setBadgeUnlocked] = useState<string | null>(null);
  const { latitude, longitude, requestLocation, loading: geoLoading } = useGeolocation();
  const { expedition } = useExpedition();

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getAll(),
  });
  const activeRegionId = regions[0]?.id ?? null;

  const { data: suggestions = [] } = useQuery<Suggestion[]>({
    queryKey: ['suggestions', latitude, longitude],
    queryFn: () => suggestionService.getSuggestions(latitude!, longitude!, new Date().toISOString()),
    enabled: !!latitude && !!longitude,
  });

  const { data: searchResults = [] } = useQuery<Species[]>({
    queryKey: ['speciesSearch', searchQuery, activeRegionId],
    queryFn: () => speciesService.search(searchQuery, activeRegionId!),
    enabled: searchQuery.length >= 2 && !!activeRegionId,
  });

  const speciesOptions = searchQuery.length >= 2
    ? searchResults.map((s) => ({ id: s.id, name: s.commonName ?? s.scientificName }))
    : suggestions.map((s) => ({ id: s.speciesId, name: s.commonName ?? s.scientificName }));

  const handleSuggestionSelect = (speciesId: string) => {
    const suggestion = suggestions.find((s) => s.speciesId === speciesId);
    if (suggestion) {
      setSelectedSpecies({ id: suggestion.speciesId, name: suggestion.commonName ?? suggestion.scientificName });
    }
  };

  const handleSubmit = async (data: {
    speciesId: string;
    latitude: number;
    longitude: number;
    dateTime: string;
    notes?: string;
    photoUrl?: string;
  }) => {
    const request: CreateSightingRequest = {
      ...data,
      expeditionId: expedition?.id,
    };

    try {
      await sightingService.create(request);
      setSubmitSuccess(true);
      setBadgeUnlocked('Explorer');
      setTimeout(() => {
        setSubmitSuccess(false);
        setBadgeUnlocked(null);
        setSelectedSpecies(null);
      }, 3000);
    } catch {
      // Error handled by service fallback
    }
  };

  if (submitSuccess) {
    return (
      <div className="page discover-page">
        <div className="success-animation">
          <div className="success-animation__icon">
            <CheckCircle size={64} />
          </div>
          <h2>Sighting Logged! 🎉</h2>
          <p>Great observation! Keep exploring.</p>
          {badgeUnlocked && (
            <div className="badge-unlock-notification">
              <Award size={24} />
              <span>Badge Unlocked: {badgeUnlocked}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page discover-page">
      <h2>Log a Sighting</h2>

      {!latitude && !geoLoading && (
        <div className="discover-page__location-prompt">
          <p>📍 Enable location for species suggestions</p>
          <button className="btn btn--secondary" onClick={requestLocation}>
            Allow Location
          </button>
        </div>
      )}

      {geoLoading && (
        <p className="discover-page__loading">Getting your location...</p>
      )}

      <div className="discover-page__search">
        <div className="search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search species..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search species"
          />
        </div>
      </div>

      {!selectedSpecies && searchQuery.length < 2 && (
        <SuggestionList
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
        />
      )}

      <SightingForm
        onSubmit={handleSubmit}
        speciesOptions={speciesOptions}
        selectedSpecies={selectedSpecies}
        expedition={expedition}
      />
    </div>
  );
}
