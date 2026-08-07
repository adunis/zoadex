import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { regionService } from '../services/regionService';
import { useAuth } from '../hooks/useAuth';
import { useActiveRegion } from '../hooks/useActiveRegion';
import { buildRegionHierarchy, getContinentEmoji } from '../utils/regions';
import { CountryFlag } from '../components/common/CountryFlag';

function getTierBadge(tier?: string, hasGps?: boolean): { label: string; className: string } {
  switch (tier) {
    case 'FULL': return { label: '✅ Full data', className: 'tier-badge--full' };
    case 'BASIC': return { label: hasGps ? '🟢 Basic data' : '🟡 Basic (no GPS)', className: hasGps ? 'tier-badge--basic' : 'tier-badge--basic-nogps' };
    case 'PARTIAL': return { label: hasGps ? '🟡 Partial data' : '🟡 Partial (no GPS)', className: 'tier-badge--partial' };
    default: return { label: '⛔ Data missing', className: 'tier-badge--missing' };
  }
}

export function RegionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { activeRegion } = useActiveRegion();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [error, setError] = useState('');

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getAll(),
  });

  const { data: myRegionIds = [] } = useQuery({
    queryKey: ['myRegions'],
    queryFn: () => regionService.getMyRegions(),
    enabled: isAuthenticated,
  });

  const maxSlots = user?.plan === 'PREMIUM' || user?.plan === 'PRO' ? 5 : 1;
  const isAdmin = user?.username?.toLowerCase().includes('admin');
  const effectiveMaxSlots = isAdmin ? 999 : maxSlots;

  // Split regions into 3 groups
  const unlockedRegions = useMemo(() => 
    regions.filter(r => myRegionIds.includes(r.id) && r.id !== activeRegion?.id),
    [regions, myRegionIds, activeRegion?.id]
  );

  const lockedRegions = useMemo(() => 
    regions.filter(r => !myRegionIds.includes(r.id)),
    [regions, myRegionIds]
  );

  const lockedHierarchy = useMemo(() => buildRegionHierarchy(lockedRegions), [lockedRegions]);

  async function handleActivate(regionId: string) {
    setError('');
    try {
      await regionService.switchRegion(regionId);
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to activate region.');
    }
  }

  async function handleUnlock(regionId: string) {
    setError('');
    // Check if user has available slots
    if (myRegionIds.length >= effectiveMaxSlots) {
      setShowPremiumModal(true);
      return;
    }
    try {
      await regionService.unlockRegion(regionId);
      queryClient.invalidateQueries({ queryKey: ['myRegions'] });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? '';
      if (msg.includes('limit') || msg.includes('slot') || msg.includes('upgrade')) {
        setShowPremiumModal(true);
      } else {
        setError(msg || 'Failed to unlock region.');
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="page regions-page">
        <h2>Regions</h2>
        <p>Log in to manage your regions.</p>
      </div>
    );
  }

  return (
    <div className="page regions-page">
      <h2>Your Regions</h2>
      <p className="regions-page__subtitle">
        {myRegionIds.length} / {effectiveMaxSlots} region slots used
        {!isAdmin && user?.plan === 'FREE' && ' • Upgrade to Premium for up to 5 regions'}
      </p>

      {error && <p className="regions-page__error" role="alert">{error}</p>}

      {/* === CURRENTLY ACTIVE REGION === */}
      {activeRegion && (
        <section className="regions-page__section">
          <h3 className="regions-page__section-title">🟢 Currently Active Region</h3>
          <div
            className="region-item region-item--active region-item--large"
            onClick={() => navigate(`/regions/${activeRegion.id}`)}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <CountryFlag country={activeRegion.country} regionName={activeRegion.name} size={32} />
            <div className="region-item__details">
              <span className="region-item__name">{activeRegion.name}</span>
              <span className="region-item__country">{activeRegion.country} • {activeRegion.continent}</span>
            </div>
            <span className="region-item__species">{activeRegion.speciesCount ?? 0} species</span>
            <span className="region-item__badge">Active</span>
          </div>
        </section>
      )}

      {/* === UNLOCKED REGIONS === */}
      {unlockedRegions.length > 0 && (
        <section className="regions-page__section">
          <h3 className="regions-page__section-title">🔓 Unlocked Regions</h3>
          <div className="regions-page__region-list">
            {unlockedRegions.map(region => (
              <div
                key={region.id}
                className="region-item"
                onClick={() => navigate(`/regions/${region.id}`)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <CountryFlag country={region.country} regionName={region.name} size={24} />
                <div className="region-item__details">
                  <span className="region-item__name">{region.name}</span>
                  <span className="region-item__country">{region.country}</span>
                </div>
                <span className={`tier-badge ${getTierBadge(region.dataTier, region.hasGpsData).className}`}>
                  {getTierBadge(region.dataTier, region.hasGpsData).label}
                </span>
                <span className="region-item__species">{region.speciesCount ?? 0} species</span>
                {region.dataTier === 'MISSING' ? (
                  <span className="region-item__unavailable">Coming soon</span>
                ) : (
                  <button
                    className="btn btn--small btn--primary"
                    onClick={(e) => { e.stopPropagation(); handleActivate(region.id); }}
                  >
                    Activate
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* === LOCKED REGIONS === */}
      <section className="regions-page__section">
        <h3 className="regions-page__section-title">🔒 Explore More Regions</h3>
        {lockedHierarchy.map(({ continent, countries }) => (
          <div key={continent} className="regions-page__continent">
            <h4 className="regions-page__continent-title">
              {getContinentEmoji(continent)} {continent}
            </h4>
            {countries.map(({ country, regions: countryRegions }) => (
              <div key={country} className="regions-page__country">
                <h5 className="regions-page__country-title">
                  <CountryFlag country={country} size={18} /> {country}
                </h5>
                <div className="regions-page__region-list">
                  {countryRegions.map(region => (
                    <div
                      key={region.id}
                      className="region-item region-item--locked"
                      onClick={() => navigate(`/regions/${region.id}`)}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                    >
                      <CountryFlag country={country} regionName={region.name} size={16} />
                      <span className="region-item__name">{region.name}</span>
                      <span className={`tier-badge ${getTierBadge(region.dataTier, region.hasGpsData).className}`}>
                        {getTierBadge(region.dataTier, region.hasGpsData).label}
                      </span>
                      <span className="region-item__species">{region.speciesCount ?? 0} species</span>
                      {region.dataTier === 'MISSING' ? (
                        <span className="region-item__unavailable">Coming soon</span>
                      ) : (
                        <button
                          className="btn btn--small btn--outline"
                          onClick={(e) => { e.stopPropagation(); handleUnlock(region.id); }}
                        >
                          Unlock
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* === PREMIUM MODAL === */}
      {showPremiumModal && (
        <div className="modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">🌟 Upgrade to Premium</h3>
            <p className="modal__text">
              You've reached the maximum number of unlocked regions on the Free plan.
            </p>
            <p className="modal__text modal__text--highlight">
              Become a Premium member to unlock up to <strong>5 regions</strong> and discover species across different areas!
            </p>
            <div className="modal__actions">
              <button className="btn btn--primary" onClick={() => setShowPremiumModal(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
