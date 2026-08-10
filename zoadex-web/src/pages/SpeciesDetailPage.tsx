import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin } from 'lucide-react';
import { speciesService } from '../services/speciesService';
import { fetchWikipediaSummary, WikiSummary } from '../services/wikipediaService';
import { useLanguageContext } from '../context/LanguageContext';
import { getMacroCategory, SpeciesCategory } from '../types/species';
import { getRarity } from '../utils/rarity';

function getCategoryIcon(category: SpeciesCategory): string {
  const macro = getMacroCategory(category);
  switch (macro) {
    case 'PLANTS': return '🌿';
    case 'MUSHROOMS': return '🍄';
    case 'ANIMALS': return '🐾';
  }
}

function getRarityLabel(occurrenceCount?: number): { label: string; className: string } {
  const rarity = getRarity(occurrenceCount);
  switch (rarity) {
    case 'RARE': return { label: '✨ Rare', className: 'species-detail__badge--rare' };
    case 'UNCOMMON': return { label: '🟡 Uncommon', className: 'species-detail__badge--uncommon' };
    case 'COMMON': return { label: '🟢 Common', className: 'species-detail__badge--common' };
    case 'VERY_COMMON': return { label: '🟢 Very Common', className: 'species-detail__badge--common' };
  }
}

export function SpeciesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatSpeciesName } = useLanguageContext();
  const [wiki, setWiki] = useState<WikiSummary | null>(null);

  const { data: species, isLoading, error } = useQuery({
    queryKey: ['species', id],
    queryFn: () => speciesService.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (species) {
      fetchWikipediaSummary(species.scientificName, species.commonName ?? undefined)
        .then(setWiki)
        .catch(() => setWiki(null));
    }
  }, [species]);

  if (isLoading) {
    return (
      <div className="page species-detail">
        <div className="species-detail__loading">Loading species data...</div>
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="page species-detail">
        <button className="species-detail__back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <p className="species-detail__error">Species not found.</p>
      </div>
    );
  }

  const displayName = formatSpeciesName(species);
  const thumbnailUrl = species.thumbnailUrl || (species.images ?? [])[0]?.url;
  const rarityInfo = getRarityLabel(species.occurrenceCount);

  return (
    <div className="page species-detail">
      <button className="species-detail__back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="species-detail__hero">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={displayName}
            className="species-detail__hero-image"
          />
        ) : (
          <div className="species-detail__hero-placeholder">
            {getCategoryIcon(species.category)}
          </div>
        )}
      </div>

      <div className="species-detail__header">
        <h1 className="species-detail__name">{displayName}</h1>
        <p className="species-detail__scientific">{species.scientificName}</p>

        <div className="species-detail__badges">
          <span className="species-detail__badge species-detail__badge--category">
            {getCategoryIcon(species.category)} {species.category}
          </span>
          <span className={`species-detail__badge ${rarityInfo.className}`}>
            {rarityInfo.label}
          </span>
        </div>
      </div>

      {species.images && species.images.length > 0 && (
        <section className="species-detail__gallery">
          <h3>Gallery</h3>
          <div className="species-detail__gallery-scroll">
            {species.images.map((img) => (
              <div key={img.id} className="species-detail__gallery-item">
                <img src={img.url} alt={img.caption || species.scientificName} loading="lazy" />
                {img.caption && <span className="species-detail__gallery-caption">{img.caption}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {wiki && (
        <section className="species-detail__wiki">
          <h3>About</h3>
          <p className="species-detail__wiki-text">{wiki.extract}</p>
          <a
            href={wiki.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="species-detail__wiki-link"
          >
            Read more on Wikipedia →
          </a>
        </section>
      )}

      <section className="species-detail__occurrence">
        <h3>Where to Find</h3>
        <div className="species-detail__occurrence-stat">
          <MapPin size={16} />
          <span>{species.occurrenceCount ?? 0} recorded sightings</span>
        </div>
        <button
          className="btn btn--secondary"
          onClick={() => navigate(`/map?speciesId=${species.id}&speciesName=${encodeURIComponent(species.commonName ?? species.scientificName)}`)}
        >
          View on Map
        </button>
      </section>
    </div>
  );
}
