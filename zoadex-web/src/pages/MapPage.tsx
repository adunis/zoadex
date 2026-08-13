import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Paintbrush, StickyNote } from 'lucide-react';
import { SightingMap } from '../components/map/SightingMap';
import { ExploredGrid } from '../components/map/ExploredGrid';
import { MapNotes, MapNoteForm } from '../components/map/MapNotes';
import { RegionPickerModal } from '../components/map/RegionPickerModal';
import { CountryFlag } from '../components/common/CountryFlag';
import { mapService } from '../services/mapService';
import { sightingService } from '../services/sightingService';
import { speciesService } from '../services/speciesService';
import { regionService } from '../services/regionService';
import { useAuth } from '../hooks/useAuth';
import { useActiveRegion } from '../hooks/useActiveRegion';
import { useLanguageContext } from '../context/LanguageContext';
import { ALL_CATEGORIES, ANIMAL_CATEGORIES, PLANT_CATEGORIES, getCategoryEmoji, getCategoryLabel, CATEGORY_DETECTION_RADIUS } from '../constants/categories';
import { HeatmapPoint } from '../types/map';
import { computeRarityThresholds, getRarity, getRarityLabel } from '../utils/rarity';
import { getRegionPalette, applyPalette, extractPaletteFromFlag } from '../utils/regionPalettes';

type CategoryFilter = 'ALL' | 'ANIMALS' | 'PLANTS_MUSHROOMS' | string;

export function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusSpeciesId = searchParams.get('speciesId');
  const focusSpeciesName = searchParams.get('speciesName');
  const { isAuthenticated } = useAuth();
  const { regionCenter, activeRegionId, regions, activeRegion } = useActiveRegion();
  const navigate = useNavigate();
  const { formatSpeciesName } = useLanguageContext();

  const [showMySightings, setShowMySightings] = useState(isAuthenticated);
  const [speciesAtCursor, setSpeciesAtCursor] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter | null>(null);
  const [viewedRegionId, setViewedRegionId] = useState<string | null>(null);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [paintMode, setPaintMode] = useState(false);
  const [addNoteMode, setAddNoteMode] = useState(false);
  const [exploredCellCount, setExploredCellCount] = useState(0);
  const [noteFormCoords, setNoteFormCoords] = useState<{ lat: number; lng: number } | null>(null);

  // The region being displayed on map (viewed or active)
  const displayRegion = viewedRegionId
    ? regions.find(r => r.id === viewedRegionId)
    : activeRegion;

  const displayCenter: [number, number] = displayRegion?.centerLatitude != null && displayRegion?.centerLongitude != null
    ? [displayRegion.centerLatitude, displayRegion.centerLongitude]
    : regionCenter;

  const isViewingOtherRegion = viewedRegionId != null && viewedRegionId !== activeRegionId;
  const displayRegionId = displayRegion?.id ?? activeRegionId;

  // Keep sightings toggle in sync with auth state
  useEffect(() => {
    setShowMySightings(isAuthenticated);
  }, [isAuthenticated]);

  // Apply palette when viewed region changes
  useEffect(() => {
    if (!displayRegion) return;
    const hardcoded = getRegionPalette(displayRegion.name, displayRegion.country);
    applyPalette(hardcoded);
    extractPaletteFromFlag(displayRegion.name, displayRegion.country).then(applyPalette);
  }, [displayRegion?.name, displayRegion?.country]);

  const selectedCategories = useMemo((): Set<string> => {
    if (!selectedFilter) return new Set();
    if (selectedFilter === 'ALL') return new Set(ALL_CATEGORIES.map(c => c.id));
    if (selectedFilter === 'ANIMALS') return new Set(ANIMAL_CATEGORIES);
    if (selectedFilter === 'PLANTS_MUSHROOMS') return new Set(PLANT_CATEGORIES);
    return new Set([selectedFilter]);
  }, [selectedFilter]);

  // Restore map state from URL params on mount
  useEffect(() => {
    const categoriesParam = searchParams.get('categories');

    if (categoriesParam) {
      const cats = categoriesParam.split(',');
      if (cats.length > 1) {
        const isAll = ALL_CATEGORIES.every(c => cats.includes(c.id)) && cats.length === ALL_CATEGORIES.length;
        const isAnimals = ANIMAL_CATEGORIES.every(c => cats.includes(c)) && cats.length === ANIMAL_CATEGORIES.length;
        const isPlants = PLANT_CATEGORIES.every(c => cats.includes(c)) && cats.length === PLANT_CATEGORIES.length;
        if (isAll) setSelectedFilter('ALL');
        else if (isAnimals) setSelectedFilter('ANIMALS');
        else if (isPlants) setSelectedFilter('PLANTS_MUSHROOMS');
      } else if (cats.length === 1) {
        setSelectedFilter(cats[0]);
      }
    }

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function navigateToExplore(id: string) {
    const mapStateParams = new URLSearchParams();
    if (selectedFilter) {
      mapStateParams.set('categories', [...selectedCategories].join(','));
    }
    const returnUrl = `/map?${mapStateParams.toString()}`;
    navigate(`/explore?speciesId=${id}&fromMap=true&returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  function selectFilter(filter: CategoryFilter) {
    setSelectedFilter(prev => prev === filter ? null : filter);
  }

  const { data: sightingPins = [] } = useQuery({
    queryKey: ['sightingPins'],
    queryFn: () => sightingService.getMapPins(),
    enabled: isAuthenticated && showMySightings,
  });

  const { data: userSightings = [] } = useQuery({
    queryKey: ['userSightings'],
    queryFn: () => sightingService.getByUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Build a map of speciesId -> sighting count
  const sightedSpeciesMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of userSightings) {
      map.set(s.speciesId, (map.get(s.speciesId) ?? 0) + 1);
    }
    return map;
  }, [userSightings]);

  const { data: heatmapPoints = [], isLoading: isLoadingHeatmap } = useQuery({
    queryKey: ['heatmap', displayRegionId],
    queryFn: () => mapService.getHeatmapData(displayRegionId!),
    enabled: !!displayRegionId,
  });

  const { data: speciesSummary = [] } = useQuery({
    queryKey: ['speciesSummary', displayRegionId],
    queryFn: () => speciesService.getSummary(displayRegionId!),
    enabled: !!displayRegionId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: boundary } = useQuery({
    queryKey: ['regionBoundary', displayRegionId],
    queryFn: () => regionService.getBoundary(displayRegionId!),
    enabled: !!displayRegionId,
    staleTime: Infinity, // boundaries don't change
  });

  const speciesLookup = useMemo(() => {
    const map = new Map<string, { commonName: string | null; scientificName: string; category: string; thumbnailUrl?: string; occurrenceCount: number; nameIt?: string | null; nameFr?: string | null; nameEs?: string | null; nameDe?: string | null; nameZh?: string | null; nameAr?: string | null; nameJa?: string | null }>();
    for (const s of speciesSummary) {
      map.set(s.id, {
        commonName: s.commonName ?? null,
        scientificName: s.scientificName,
        category: s.category,
        thumbnailUrl: s.thumbnailUrl ?? undefined,
        occurrenceCount: s.occurrenceCount,
        nameIt: s.nameIt,
        nameFr: s.nameFr,
        nameEs: s.nameEs,
        nameDe: s.nameDe,
        nameZh: s.nameZh,
        nameAr: s.nameAr,
        nameJa: s.nameJa,
      });
    }
    return map;
  }, [speciesSummary]);

  const rarityThresholds = useMemo(() => {
    const counts = [...speciesLookup.values()].map(s => s.occurrenceCount);
    return computeRarityThresholds(counts);
  }, [speciesLookup]);

  const selectedCategoryArray = [...selectedCategories];

  const { data: categoryPoints = [], isLoading: isLoadingPoints } = useQuery({
    queryKey: ['occurrencePoints', displayRegionId, selectedCategoryArray.sort().join(',')],
    queryFn: () => mapService.getOccurrencePoints(displayRegionId!, selectedCategoryArray, 3000),
    enabled: !!displayRegionId && selectedCategories.size > 0,
    staleTime: 5 * 60 * 1000,
  });

  const displayPoints: HeatmapPoint[] = useMemo(() => {
    if (focusSpeciesId) {
      return heatmapPoints
        .filter(p => p.speciesId === focusSpeciesId)
        .map(p => ({ ...p }));
    }
    if (selectedCategories.size === 0) return [];

    let points: HeatmapPoint[] = categoryPoints.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      intensity: p.occurrenceCount,
      speciesId: p.speciesId,
      clusterSize: p.clusterSize,
      radiusKm: p.radiusKm,
    }));
    return points;
  }, [focusSpeciesId, heatmapPoints, selectedCategories, categoryPoints, speciesLookup, rarityThresholds]);

  const clusterInfoMap = useMemo(() => {
    const map = new Map<string, { clusterSize: number }>();
    for (const p of displayPoints) {
      if (p.speciesId && p.clusterSize) {
        const existing = map.get(p.speciesId);
        if (!existing || p.clusterSize > existing.clusterSize) {
          map.set(p.speciesId, { clusterSize: p.clusterSize });
        }
      }
    }
    return map;
  }, [displayPoints]);

  function clearSpeciesFocus() {
    setSearchParams({});
  }

  const handleCellPainted = useCallback(() => {
    setExploredCellCount(prev => prev + 1);
  }, []);

  const handleOpenNoteForm = useCallback((lat: number, lng: number) => {
    setNoteFormCoords({ lat, lng });
    setAddNoteMode(false);
  }, []);

  const handleNoteSubmitted = useCallback(() => {
    setNoteFormCoords(null);
  }, []);

  return (
    <div className="page map-page">
      {/* Region picker button */}
      <button className="map-page__region-btn" onClick={() => setShowRegionPicker(true)}>
        <CountryFlag country={displayRegion?.country ?? ''} regionName={displayRegion?.name} size={20} />
        {displayRegion?.name ?? 'Select Region'}
        {isViewingOtherRegion && <span className="map-page__viewing-badge">Viewing</span>}
      </button>

      {/* Viewing another region banner */}
      {isViewingOtherRegion && (
        <div className="map-page__viewing-banner">
          <span>👁️ Viewing {displayRegion?.name} (read-only)</span>
          <button onClick={() => setViewedRegionId(null)}>Back to {activeRegion?.name}</button>
        </div>
      )}

      {/* Region picker modal */}
      {showRegionPicker && (
        <RegionPickerModal
          regions={regions}
          currentRegionId={displayRegion?.id}
          activeRegionId={activeRegionId}
          onSelect={(regionId) => {
            setViewedRegionId(regionId === activeRegionId ? null : regionId);
            setShowRegionPicker(false);
          }}
          onClose={() => setShowRegionPicker(false)}
        />
      )}

      {/* Map tools - bottom left */}
      {!isViewingOtherRegion && isAuthenticated && (
        <div className="map-page__tools">
          <button
            className={`map-page__tool-btn ${paintMode ? 'map-page__tool-btn--active' : ''}`}
            onClick={() => { setPaintMode(prev => !prev); setAddNoteMode(false); }}
            aria-pressed={paintMode}
          >
            <Paintbrush size={20} />
            <span className="map-page__tool-label">Mark as Explored</span>
          </button>
          <button
            className={`map-page__tool-btn ${addNoteMode ? 'map-page__tool-btn--active' : ''}`}
            onClick={() => { setAddNoteMode(prev => !prev); setPaintMode(false); }}
            aria-pressed={addNoteMode}
          >
            <StickyNote size={20} />
            <span className="map-page__tool-label">Add a Note</span>
          </button>
          {exploredCellCount > 0 && (
            <span className="map-page__tools-counter">{exploredCellCount} cells</span>
          )}
        </div>
      )}

      {focusSpeciesName && (
        <div className="map-page__species-focus">
          <span>📍 Showing: <strong>{decodeURIComponent(focusSpeciesName)}</strong></span>
          <button onClick={clearSpeciesFocus} className="map-page__focus-clear" aria-label="Clear filter">✕</button>
        </div>
      )}

      {!focusSpeciesId && (
        <div className="map-page__category-filters">
          {/* Your Sightings toggle */}
          {isAuthenticated && (
            <>
              <button
                className={`map-category-pill map-category-pill--sightings ${showMySightings ? 'map-category-pill--active' : ''}`}
                onClick={() => setShowMySightings(prev => !prev)}
                aria-pressed={showMySightings}
              >
                📍 Your Sightings
              </button>
              <div className="map-category-divider" aria-hidden="true" />
            </>
          )}

          {/* Group filters */}
          <button
            className={`map-category-pill map-category-pill--group ${selectedFilter === 'ALL' ? 'map-category-pill--active' : ''}`}
            onClick={() => selectFilter('ALL')}
            aria-pressed={selectedFilter === 'ALL'}
          >
            🌍 All
          </button>
          <button
            className={`map-category-pill map-category-pill--group ${selectedFilter === 'ANIMALS' ? 'map-category-pill--active' : ''}`}
            onClick={() => selectFilter('ANIMALS')}
            aria-pressed={selectedFilter === 'ANIMALS'}
          >
            🐾 Animals
          </button>
          <button
            className={`map-category-pill map-category-pill--group ${selectedFilter === 'PLANTS_MUSHROOMS' ? 'map-category-pill--active' : ''}`}
            onClick={() => selectFilter('PLANTS_MUSHROOMS')}
            aria-pressed={selectedFilter === 'PLANTS_MUSHROOMS'}
          >
            🌿 Plants & Mushrooms
          </button>

          <div className="map-category-divider" aria-hidden="true" />

          {/* Individual categories */}
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`map-category-pill ${selectedFilter === cat.id ? 'map-category-pill--active' : ''}`}
              onClick={() => selectFilter(cat.id)}
              aria-pressed={selectedFilter === cat.id}
            >
              <span className="map-category-pill__emoji">{cat.emoji}</span>
              <span className="map-category-pill__label">{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="map-page__body">
        <div className="map-page__map-wrapper">
          {(isLoadingHeatmap || isLoadingPoints) && selectedCategories.size > 0 && (
            <div className="map-page__loading">
              <div className="map-loading-animation">
                <div className="map-loading-animation__circle"></div>
                <div className="map-loading-animation__circle"></div>
                <div className="map-loading-animation__circle"></div>
              </div>
              <p>Discovering species in this area...</p>
            </div>
          )}
          <div className="map-page__container">
            <SightingMap
              center={displayCenter}
              zoom={7}
              pins={showMySightings && !isViewingOtherRegion ? sightingPins : []}
              heatmapPoints={displayPoints}
              showHeatmap={true}
              focusedSpecies={!!focusSpeciesId}
              onSpeciesAtCursor={setSpeciesAtCursor}
              speciesLookup={speciesLookup}
              sightedSpecies={sightedSpeciesMap}
              showCrosshair={selectedCategories.size > 0}
              showSightingMarkers={showMySightings && !isViewingOtherRegion}
              boundary={boundary}
              rarityThresholds={rarityThresholds}
              regions={regions}
              currentRegionId={displayRegionId ?? undefined}
              onSwitchRegion={(id) => setViewedRegionId(id)}
              paintMode={paintMode}
              addNoteMode={addNoteMode}
            >
              {isAuthenticated && (<ExploredGrid
                regionId={activeRegionId}
                paintMode={paintMode}
                onCellPainted={handleCellPainted}
              />)}
              {isAuthenticated && (<MapNotes
                regionId={activeRegionId}
                addNoteMode={addNoteMode}
                onOpenNoteForm={handleOpenNoteForm}
              />)}
            </SightingMap>
          </div>
          {selectedCategories.size === 0 && !focusSpeciesId && (
            <div className="map-page__discover-hint">
              <p>☝️ Select one or more categories above to explore species on the map</p>
            </div>
          )}

          {selectedCategories.size > 0 && !isLoadingPoints && displayPoints.length === 0 && (
            <div className="map-page__no-data-hint">
              <p>📍 No location data imported for this region yet.</p>
              <p>Species are catalogued but GPS locations need to be imported.</p>
            </div>
          )}
        </div>

        {(() => {
          const filteredSpeciesAtCursor = speciesAtCursor.filter(id => {
            const info = speciesLookup.get(id);
            return info && selectedCategories.has(info.category);
          });

          const sortedSpeciesAtCursor = [...filteredSpeciesAtCursor].sort((a, b) => {
            const aInfo = speciesLookup.get(a);
            const bInfo = speciesLookup.get(b);
            return (aInfo?.occurrenceCount ?? 0) - (bInfo?.occurrenceCount ?? 0);
          });

          const rareSpecies = sortedSpeciesAtCursor.filter(id => getRarity(speciesLookup.get(id)?.occurrenceCount, rarityThresholds) === 'RARE');
          const uncommonSpecies = sortedSpeciesAtCursor.filter(id => getRarity(speciesLookup.get(id)?.occurrenceCount, rarityThresholds) === 'UNCOMMON');
          const commonSpecies = sortedSpeciesAtCursor.filter(id => {
            const rarity = getRarity(speciesLookup.get(id)?.occurrenceCount, rarityThresholds);
            return rarity === 'COMMON' || rarity === 'VERY_COMMON';
          });

          function renderSpeciesItem(id: string) {
            const info = speciesLookup.get(id);
            if (!info) return null;
            const clusterInfo = clusterInfoMap.get(id);
            return (
              <li
                key={id}
                className="species-panel__item species-panel__item--clickable"
                onClick={() => navigateToExplore(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigateToExplore(id); }}
              >
                <div className="species-panel__image">
                  {info.thumbnailUrl ? (
                    <img src={info.thumbnailUrl} alt={info.commonName ?? info.scientificName} />
                  ) : (
                    <span className="species-panel__placeholder">
                      {info.category === 'MUSHROOMS' ? '🍄' :
                       ['TREES', 'PLANTS'].includes(info.category) ? '🌿' : '🐾'}
                    </span>
                  )}
                </div>
                <div className="species-panel__info">
                  <span className="species-panel__name">
                    {formatSpeciesName(info).split('\n').map((line, i) => (
                      <span key={i} className="species-panel__name-line">{line}</span>
                    ))}
                  </span>
                  <span className="species-panel__rarity">
                    {getRarityLabel(info.occurrenceCount, rarityThresholds)}
                  </span>
                  {sightedSpeciesMap.get(id) && (
                    <span className="species-panel__sighted">
                      👁 Sighted {sightedSpeciesMap.get(id)}×
                    </span>
                  )}
                  {clusterInfo && clusterInfo.clusterSize > 1 && (
                    <span className="species-panel__cluster">
                      Seen {clusterInfo.clusterSize}× near here
                    </span>
                  )}
                </div>
              </li>
            );
          }

          return (
            <aside className="map-page__species-panel">
              {focusSpeciesId && (
                <div className="species-panel__focused">
                  <h4>📌 Viewing Species</h4>
                  {(() => {
                    const info = speciesLookup.get(focusSpeciesId);
                    if (!info) return <p>Loading...</p>;
                    return (
                      <div className="species-panel__focused-card">
                        <div className="species-panel__focused-image">
                          {info.thumbnailUrl ? <img src={info.thumbnailUrl} alt={info.commonName ?? info.scientificName} /> : <span>{getCategoryEmoji(info.category)}</span>}
                        </div>
                        <div className="species-panel__focused-info">
                          <span className="species-panel__focused-name">
                            {formatSpeciesName(info).split('\n').map((line, i) => (
                              <span key={i} className="species-panel__name-line">{line}</span>
                            ))}
                          </span>
                          <span className="species-panel__focused-category">{getCategoryLabel(info.category)}</span>
                          <span className="species-panel__focused-rarity">{getRarityLabel(info.occurrenceCount, rarityThresholds)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <h4 className="species-panel__title">
                {selectedCategories.size === 0
                  ? 'Select category to explore'
                  : sortedSpeciesAtCursor.length > 0
                    ? selectedCategories.size === 1
                      ? `📍 ${ALL_CATEGORIES.find(c => selectedCategories.has(c.id))?.label ?? 'Species'} here (${sortedSpeciesAtCursor.length})`
                      : `📍 Species here (${sortedSpeciesAtCursor.length})`
                    : '📍 Pan map to explore'}
              </h4>
              {selectedCategories.size === 1 && (() => {
                const cat = [...selectedCategories][0];
                const radius = CATEGORY_DETECTION_RADIUS[cat];
                if (!radius) return null;
                const km = Math.round(radius * 111);
                return (
                  <p className="species-panel__radius-hint">📍 Showing within ~{km}km</p>
                );
              })()}
              {selectedCategories.size > 0 && sortedSpeciesAtCursor.length === 0 && (
                <p className="species-panel__hint">Pan or zoom the map to discover species at the crosshair position.</p>
              )}
              <ul className="species-panel__list">
                {rareSpecies.length > 0 && (
                  <>
                    <h5 className="species-panel__rarity-header">✨ Rare</h5>
                    {rareSpecies.map(renderSpeciesItem)}
                  </>
                )}
                {uncommonSpecies.length > 0 && (
                  <>
                    <h5 className="species-panel__rarity-header">🟡 Uncommon</h5>
                    {uncommonSpecies.map(renderSpeciesItem)}
                  </>
                )}
                {commonSpecies.length > 0 && (
                  <>
                    <h5 className="species-panel__rarity-header">🟢 Common</h5>
                    {commonSpecies.map(renderSpeciesItem)}
                  </>
                )}
              </ul>
            </aside>
          );
        })()}
      </div>

      {/* Note form modal */}
      {noteFormCoords && displayRegionId && (
        <MapNoteForm
          latitude={noteFormCoords.lat}
          longitude={noteFormCoords.lng}
          regionId={displayRegionId}
          onClose={() => setNoteFormCoords(null)}
          onSubmitted={handleNoteSubmitted}
        />
      )}
    </div>
  );
}
