import { useState, useMemo, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SpeciesCard } from '../components/species/SpeciesCard';
import { speciesService } from '../services/speciesService';
import { regionService } from '../services/regionService';
import { sightingService } from '../services/sightingService';
import { useAuth } from '../hooks/useAuth';
import { Species } from '../types/species';
import { ALL_CATEGORIES, getCategoryEmoji } from '../constants/categories';
import { computeRarityThresholds } from '../utils/rarity';
import { fetchWikipediaSummary } from '../services/wikipediaService';

type SortOption = 'name' | 'recent' | 'rarity';

export function ChecklistPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [detailSpecies, setDetailSpecies] = useState<Species | null>(null);
  const [showOnlyDiscovered, setShowOnlyDiscovered] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusSpeciesId = searchParams.get('speciesId');
  const cameFromMap = searchParams.get('fromMap') === 'true';
  const returnUrl = searchParams.get('returnUrl');
  const urlCategory = searchParams.get('category');
  const urlFilter = searchParams.get('filter');

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getAll(),
  });

  const activeRegionId = regions.length > 0 ? regions[0].id : null;

  const { data: speciesResult, isLoading: speciesLoading, error: speciesError } = useQuery({
    queryKey: ['species', activeRegionId],
    queryFn: () => speciesService.getByRegion(activeRegionId!),
    enabled: !!activeRegionId,
  });

  // Fetch focused species directly by ID when navigated with speciesId param
  const { data: focusedSpecies } = useQuery({
    queryKey: ['species-detail', focusSpeciesId],
    queryFn: () => speciesService.getById(focusSpeciesId!),
    enabled: !!focusSpeciesId,
  });

  const allSpecies = speciesResult?.species ?? [];

  const rarityThresholds = useMemo(() => {
    const counts = allSpecies.map(s => s.occurrenceCount).filter((c): c is number => c != null);
    return computeRarityThresholds(counts);
  }, [allSpecies]);

  // Auto-open detail view when navigated from map with a speciesId param
  useEffect(() => {
    if (focusSpeciesId && !detailSpecies) {
      // First try to find in the already-loaded region list
      const target = allSpecies.find((s) => s.id === focusSpeciesId);
      if (target) {
        setDetailSpecies(target);
      } else if (focusedSpecies) {
        // Fallback: use the directly-fetched species (handles cross-region navigation)
        setDetailSpecies(focusedSpecies);
      }
    }
  }, [focusSpeciesId, allSpecies, focusedSpecies, detailSpecies]);

  const { data: sightings = [] } = useQuery({
    queryKey: ['mySightings'],
    queryFn: () => sightingService.getByUser(),
    enabled: isAuthenticated,
  });

  // Initialize category and filter from URL params
  useEffect(() => {
    if (urlCategory && ALL_CATEGORIES.some(c => c.id === urlCategory)) {
      setSelectedCategory(urlCategory);
    }
    if (urlFilter === 'discovered') {
      setShowOnlyDiscovered(true);
    }
  }, [urlCategory, urlFilter]);

  const filteredAndSorted = useMemo(() => {
    let species = allSpecies;

    if (selectedCategory !== 'ALL') {
      species = species.filter((s) => s.category === selectedCategory);
    }

    if (showOnlyDiscovered) {
      const sightedSpeciesIds = new Set(sightings.map(s => s.speciesId));
      species = species.filter(s => sightedSpeciesIds.has(s.id));
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      species = species.filter(
        (s) =>
          (s.commonName ?? '').toLowerCase().includes(lower) ||
          s.scientificName.toLowerCase().includes(lower),
      );
    }

    const sorted = [...species];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => (a.commonName ?? a.scientificName).localeCompare(b.commonName ?? b.scientificName));
        break;
      case 'recent':
        sorted.sort((a, b) => {
          if (a.discoveredAt && b.discoveredAt) return b.discoveredAt.localeCompare(a.discoveredAt);
          if (a.discoveredAt) return -1;
          if (b.discoveredAt) return 1;
          return 0;
        });
        break;
      case 'rarity':
        sorted.sort((a, b) => (a.discovered === b.discovered ? 0 : a.discovered ? 1 : -1));
        break;
    }
    return sorted;
  }, [allSpecies, selectedCategory, searchQuery, sortBy, showOnlyDiscovered, sightings]);

  const speciesSightings = useMemo(() => {
    if (!detailSpecies) return [];
    return sightings.filter((s) => s.speciesId === detailSpecies.id);
  }, [detailSpecies, sightings]);

  const { data: wikiData } = useQuery({
    queryKey: ['wiki', detailSpecies?.scientificName],
    queryFn: () =>
      fetchWikipediaSummary(
        detailSpecies!.scientificName,
        detailSpecies!.commonName ?? undefined,
      ),
    enabled: !!detailSpecies?.scientificName,
    staleTime: 24 * 60 * 60 * 1000,
  });

  if (detailSpecies) {
    return (
      <div className="page checklist-page">
        <button className="btn btn--secondary btn--small" onClick={() => setDetailSpecies(null)}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="species-detail">
          <div className="species-detail__header">
            <div className="species-detail__image">
              {detailSpecies.thumbnailUrl ? (
                <img src={detailSpecies.thumbnailUrl} alt={detailSpecies.commonName ?? detailSpecies.scientificName} />
              ) : (
                <div className="species-detail__placeholder">
                  {getCategoryEmoji(detailSpecies.category)}
                </div>
              )}
            </div>
            <h2>{detailSpecies.commonName ?? detailSpecies.scientificName}</h2>
            <p className="species-detail__scientific">{detailSpecies.scientificName}</p>
            <span className="species-detail__category">{detailSpecies.category}</span>
          </div>
          {detailSpecies.description && (
            <p className="species-detail__description">{detailSpecies.description}</p>
          )}
          {detailSpecies.habitat && (
            <p className="species-detail__habitat">
              <strong>Habitat:</strong> {detailSpecies.habitat}
            </p>
          )}
          {wikiData && (
            <section className="species-detail__wiki">
              <p className="species-detail__wiki-text">{wikiData.extract}</p>
              <a
                href={wikiData.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="species-detail__wiki-link"
              >
                Read more on Wikipedia →
              </a>
            </section>
          )}
          <section className="species-detail__sightings">
            <h3>Your Sightings ({speciesSightings.length})</h3>
            {speciesSightings.length > 0 ? (
              <ul className="species-detail__sighting-list">
                {speciesSightings.map((s) => (
                  <li key={s.id}>
                    <span>{new Date(s.dateTime).toLocaleDateString()}</span>
                    {s.notes && <span className="species-detail__sighting-note">{s.notes}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="species-detail__no-sightings">No sightings yet</p>
            )}
          </section>
          {cameFromMap ? (
            <button
              className="btn btn--secondary btn--full"
              onClick={() => navigate(returnUrl ? decodeURIComponent(returnUrl) : '/map')}
            >
              ← Back to Map
            </button>
          ) : (
            <button
              className="btn btn--secondary btn--full"
              onClick={() => navigate(`/map?speciesId=${detailSpecies.id}&speciesName=${encodeURIComponent(detailSpecies.commonName ?? detailSpecies.scientificName)}`)}
            >
              🗺️ Show on Map
            </button>
          )}
          <a href="/log" className="btn btn--primary btn--full">
            Log Sighting
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page checklist-page">
      <h2>Explore</h2>

      <div className="checklist-page__search">
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

      <div className="checklist-page__filters">
        <button
          className={`filter-btn ${selectedCategory === 'ALL' ? 'filter-btn--active' : ''}`}
          onClick={() => setSelectedCategory('ALL')}
        >
          🌍 All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn ${selectedCategory === cat.id ? 'filter-btn--active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="checklist-page__view-toggle">
        <button
          className={`filter-btn ${!showOnlyDiscovered ? 'filter-btn--active' : ''}`}
          onClick={() => setShowOnlyDiscovered(false)}
        >
          All Species
        </button>
        <button
          className={`filter-btn ${showOnlyDiscovered ? 'filter-btn--active' : ''}`}
          onClick={() => setShowOnlyDiscovered(true)}
        >
          👁 Discovered Only
        </button>
      </div>

      {showOnlyDiscovered && !isAuthenticated && (
        <p className="checklist-page__login-notice">🔒 Log in to see your discovered species.</p>
      )}

      <div className="checklist-page__sort">
        <label htmlFor="sort-select">Sort:</label>
        <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
          <option value="name">A-Z</option>
          <option value="recent">Most Recent</option>
          <option value="rarity">Rarity</option>
        </select>
      </div>

      <div className="checklist-page__grid">
        {speciesLoading && (
          <p className="checklist-page__loading">Loading species...</p>
        )}
        {speciesError && (
          <p className="checklist-page__error">Failed to load species. Please try again.</p>
        )}
        {!speciesLoading && !speciesError && filteredAndSorted.map((species) => (
          <SpeciesCard
            key={species.id}
            species={species}
            onClick={() => setDetailSpecies(species)}
            rarityThresholds={rarityThresholds}
          />
        ))}
        {!speciesLoading && !speciesError && filteredAndSorted.length === 0 && (
          <p className="checklist-page__empty">No species found.</p>
        )}
      </div>
    </div>
  );
}
