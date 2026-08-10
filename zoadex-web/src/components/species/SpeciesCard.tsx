import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Species, getMacroCategory } from '../../types/species';
import { getRarity } from '../../utils/rarity';

interface SpeciesCardProps {
  species: Species;
  onClick?: () => void;
  rarityThresholds?: { veryCommon: number; common: number; uncommon: number };
}

function getCategoryEmoji(species: Species): string {
  const macro = getMacroCategory(species.category);
  switch (macro) {
    case 'PLANTS': return '🌿';
    case 'MUSHROOMS': return '🍄';
    case 'ANIMALS': return '🐾';
  }
}

function getRarityBadge(species: Species, thresholds?: { veryCommon: number; common: number; uncommon: number }): React.ReactNode {
  const rarity = getRarity(species.occurrenceCount, thresholds);
  switch (rarity) {
    case 'RARE': return <span className="species-card__badge species-card__badge--rare">✨ Rare</span>;
    case 'UNCOMMON': return <span className="species-card__badge species-card__badge--uncommon">🟡 Uncommon</span>;
    case 'COMMON': return <span className="species-card__badge species-card__badge--common">🟢 Common</span>;
    case 'VERY_COMMON': return <span className="species-card__badge species-card__badge--common">🟢 Very Common</span>;
  }
}

function getSeasonEmoji(): string {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return '🌸 Spring';
  if (month >= 5 && month <= 7) return '☀️ Summer';
  if (month >= 8 && month <= 10) return '🍂 Autumn';
  return '❄️ Winter';
}

export function SpeciesCard({ species, onClick, rarityThresholds }: SpeciesCardProps) {
  const navigate = useNavigate();
  const thumbnailUrl = species.thumbnailUrl || (species.images ?? [])[0]?.url;
  const displayName = species.commonName ?? species.scientificName;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/species/${species.id}`);
    }
  };

  return (
    <button
      className={`species-card ${species.discovered ? 'species-card--discovered' : ''}`}
      onClick={handleClick}
      type="button"
      aria-label={`${displayName}${species.discovered ? ' - discovered' : ''}`}
    >
      <div className="species-card__image">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={displayName} loading="lazy" />
        ) : (
          <div className="species-card__silhouette">
            {species.discovered ? getCategoryEmoji(species) : '?'}
          </div>
        )}
        {species.discovered && (
          <div className="species-card__check" aria-label="Discovered">
            <Check size={16} />
          </div>
        )}
      </div>
      <span
        className="species-card__map-btn"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/map?speciesId=${species.id}&speciesName=${encodeURIComponent(species.commonName ?? species.scientificName)}`);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            navigate(`/map?speciesId=${species.id}&speciesName=${encodeURIComponent(species.commonName ?? species.scientificName)}`);
          }
        }}
        aria-label={`Show ${displayName} on map`}
      >
        🗺️
      </span>
      <div className="species-card__info">
        <h4 className="species-card__name">{displayName}</h4>
        <p className="species-card__scientific">{species.scientificName}</p>
      </div>
      <div className="species-card__meta">
        <span className="species-card__meta-item" title="Rarity">
          {getRarityBadge(species, rarityThresholds)}
        </span>
        <span className="species-card__meta-item" title="Active time">
          ☀️ Day
        </span>
        <span className="species-card__meta-item" title="Best season">
          {getSeasonEmoji()}
        </span>
      </div>
    </button>
  );
}

