import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { CountryFlag } from '../components/common/CountryFlag';
import { regionService } from '../services/regionService';
import { speciesService } from '../services/speciesService';
import { sightingService } from '../services/sightingService';
import { SightingMap } from '../components/map/SightingMap';
import { useAuth } from '../hooks/useAuth';
import { useActiveRegion } from '../hooks/useActiveRegion';
import { ALL_CATEGORIES } from '../constants/categories';
import { Region } from '../types/region';
import { SpeciesCategory } from '../types/species';

function getTierBadge(tier?: string, hasGps?: boolean): { label: string; className: string } {
  switch (tier) {
    case 'FULL': return { label: '✅ Full data', className: 'tier-badge--full' };
    case 'BASIC': return { label: hasGps ? '🟢 Basic data' : '🟡 Basic (no GPS)', className: hasGps ? 'tier-badge--basic' : 'tier-badge--basic-nogps' };
    case 'PARTIAL': return { label: hasGps ? '🟡 Partial data' : '🟡 Partial (no GPS)', className: 'tier-badge--partial' };
    default: return { label: '⛔ Data missing', className: 'tier-badge--missing' };
  }
}

export function RegionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { activeRegion } = useActiveRegion();

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getAll(),
  });

  const region: Region | undefined = regions.find(r => r.id === id);

  const { data: speciesResult } = useQuery({
    queryKey: ['species', id],
    queryFn: () => speciesService.getByRegion(id!),
    enabled: !!id,
  });

  const { data: sightings = [] } = useQuery({
    queryKey: ['sightings'],
    queryFn: () => sightingService.getByUser(),
    enabled: isAuthenticated,
  });

  const { data: myRegionIds = [] } = useQuery({
    queryKey: ['myRegions'],
    queryFn: () => regionService.getMyRegions(),
    enabled: isAuthenticated,
  });

  const queryClient = useQueryClient();
  const isUnlocked = myRegionIds.includes(id!);

  const isActive = region?.id === activeRegion?.id;
  const allSpecies = speciesResult?.species ?? [];
  const totalSpecies = speciesResult?.total ?? region?.speciesCount ?? 0;

  // Count per category
  const categoryCounts = ALL_CATEGORIES.map(cat => {
    const total = allSpecies.filter(s => s.category === cat.id).length;
    const discovered = sightings.filter(s => {
      const species = allSpecies.find(sp => sp.id === s.speciesId);
      return species?.category === cat.id;
    }).length;
    return { ...cat, total, discovered };
  });

  const mapCenter: [number, number] = region?.centerLatitude != null && region?.centerLongitude != null
    ? [region.centerLatitude, region.centerLongitude]
    : [20, 0];

  // Convert sightings to map pins
  const sightingPins = sightings
    .filter(s => s.latitude && s.longitude)
    .map(s => ({
      id: s.id,
      speciesName: s.speciesName ?? 'Unknown',
      latitude: s.latitude,
      longitude: s.longitude,
      dateTime: s.dateTime,
      category: s.speciesCategory ?? SpeciesCategory.PLANTS,
    }));

  async function handleSetActive() {
    try {
      await regionService.switchRegion(id!);
      window.location.reload();
    } catch {
      alert('Failed to switch region. You may need to upgrade to Premium.');
    }
  }

  async function handleUnlock() {
    try {
      await regionService.unlockRegion(id!);
      queryClient.invalidateQueries({ queryKey: ['myRegions'] });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.response?.data?.error ?? 'Failed to unlock region.';
      alert(msg);
    }
  }

  if (!region) {
    return (
      <div className="page">
        <p>Loading region...</p>
      </div>
    );
  }

  return (
    <div className="page region-detail-page">
      <button className="btn btn--small btn--secondary" onClick={() => navigate('/regions')}>
        <ArrowLeft size={14} /> Back to Regions
      </button>

      <header className="region-detail__header">
        <div className="region-detail__hero">
          <CountryFlag country={region.country} regionName={region.name} size={64} />
          <div className="region-detail__hero-text">
            <h2 className="region-detail__hero-name">
              {region.name}
              <span className={`tier-badge ${getTierBadge(region.dataTier, region.hasGpsData).className}`}>
                {getTierBadge(region.dataTier, region.hasGpsData).label}
              </span>
            </h2>
            <p className="region-detail__hero-subtitle">
              {region.country} • {region.continent}
            </p>
          </div>
        </div>
        {isActive && (
          <span className="region-detail__active-badge">✓ Active Region</span>
        )}
        {!isActive && isAuthenticated && isUnlocked && (
          <button className="btn btn--primary btn--small" onClick={handleSetActive}>
            Activate
          </button>
        )}
        {!isActive && isAuthenticated && !isUnlocked && region.dataTier !== 'MISSING' && (
          <button className="btn btn--small btn--outline" onClick={handleUnlock}>
            Unlock this Region
          </button>
        )}
        {!isActive && isAuthenticated && !isUnlocked && region.dataTier === 'MISSING' && (
          <span className="region-item__unavailable">⛔ Data not yet available</span>
        )}
      </header>

      {region.description && (
        <p className="region-detail__description">{region.description}</p>
      )}

      <section className="region-detail__map">
        <h3>Your Sightings in {region.name}</h3>
        <div className="region-detail__map-container">
          <SightingMap
            center={mapCenter}
            zoom={region.adminLevel != null && region.adminLevel <= 2 ? 5 : 8}
            pins={sightingPins}
            heatmapPoints={[]}
            showHeatmap={false}
          />
        </div>
        {sightingPins.length === 0 && (
          <p className="region-detail__no-sightings">
            No sightings logged in this region yet. Start exploring!
          </p>
        )}
      </section>

      <section className="region-detail__progress">
        <h3>🎯 Discovery Progress</h3>
        <p className="region-detail__total">
          {totalSpecies} species catalogued in this region
        </p>
        <div className="region-detail__categories">
          {categoryCounts.filter(c => c.total > 0).map(cat => (
            <div key={cat.id} className="region-detail__cat">
              <span className="region-detail__cat-emoji">{cat.emoji}</span>
              <span className="region-detail__cat-label">{cat.label}</span>
              <span className="region-detail__cat-count">
                {cat.discovered}/{cat.total}
              </span>
              <div className="region-detail__cat-bar">
                <div
                  className="region-detail__cat-fill"
                  style={{ width: `${cat.total > 0 ? (cat.discovered / cat.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
