import { useMemo } from 'react';
import { Region } from '../../types/region';
import { CountryFlag } from '../common/CountryFlag';

interface RegionPickerModalProps {
  regions: Region[];
  currentRegionId?: string;
  activeRegionId?: string | null;
  onSelect: (regionId: string) => void;
  onClose: () => void;
}

export function RegionPickerModal({ regions, currentRegionId, activeRegionId, onSelect, onClose }: RegionPickerModalProps) {
  const available = regions.filter(r => r.hasGpsData);

  const grouped = useMemo(() => {
    const map = new Map<string, Region[]>();
    for (const r of available) {
      const continent = r.continent ?? 'Other';
      if (!map.has(continent)) map.set(continent, []);
      map.get(continent)!.push(r);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [available]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Explore a Region">
      <div className="modal modal--large" onClick={e => e.stopPropagation()}>
        <h3 className="modal__title">🌍 Explore a Region</h3>
        <p className="modal__text">Select a region to view its species map. You can only log sightings in your active region.</p>
        <div className="region-picker__list">
          {grouped.map(([continent, regs]) => (
            <div key={continent} className="region-picker__group">
              <h4 className="region-picker__continent">{continent}</h4>
              {regs.map(r => (
                <button
                  key={r.id}
                  className={`region-picker__item ${r.id === currentRegionId ? 'region-picker__item--current' : ''} ${r.id === activeRegionId ? 'region-picker__item--active' : ''}`}
                  onClick={() => onSelect(r.id)}
                >
                  <CountryFlag country={r.country} regionName={r.name} size={20} />
                  <span className="region-picker__name">{r.name}</span>
                  {r.id === activeRegionId && <span className="region-picker__active-badge">Active</span>}
                  <span className="region-picker__country">{r.country}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <button className="btn btn--secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
