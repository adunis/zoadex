import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { speciesService } from '../../services/speciesService';
import { regionService } from '../../services/regionService';
import { Species } from '../../types/species';
import { useAuth } from '../../hooks/useAuth';
import { ALL_CATEGORIES } from '../../constants/categories';

function groupByCategory(species: Species[]): Record<string, { discovered: number; total: number }> {
  const counts: Record<string, { discovered: number; total: number }> = {};
  for (const cat of ALL_CATEGORIES) {
    counts[cat.id] = { discovered: 0, total: 0 };
  }
  for (const s of species) {
    if (counts[s.category]) {
      counts[s.category].total++;
      if (s.discovered) {
        counts[s.category].discovered++;
      }
    }
  }
  return counts;
}

export function CategoryTabs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getAll(),
  });

  const activeRegionId = regions.length > 0 ? regions[0].id : null;

  const { data: speciesResult, isLoading } = useQuery({
    queryKey: ['allSpecies', activeRegionId],
    queryFn: () => speciesService.getByRegion(activeRegionId!),
    enabled: !!activeRegionId,
  });

  const allSpecies = speciesResult?.species ?? [];
  const categoryData = groupByCategory(allSpecies);

  if (isLoading) {
    return (
      <section className="category-tabs">
        <p className="category-tabs__loading">Loading species data...</p>
      </section>
    );
  }

  return (
    <section className="category-tabs">
      <h3 className="category-tabs__title">🎯 Your Discovery Progress</h3>
      <div className="category-tabs__grid">
        {ALL_CATEGORIES.map(cat => {
          const data = categoryData[cat.id];
          const total = data?.total ?? 0;
          const discovered = data?.discovered ?? 0;
          const percentage = total > 0 ? Math.round((discovered / total) * 100) : 0;
          return (
            <div
              key={cat.id}
              className="category-progress-card category-progress-card--clickable"
              onClick={() => navigate(`/explore?category=${cat.id}&filter=discovered`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/explore?category=${cat.id}&filter=discovered`); }}
            >
              <span className="category-progress-card__emoji">{cat.emoji}</span>
              <span className="category-progress-card__label">{cat.label}</span>
              <div className="category-progress-card__bar">
                <div className="category-progress-card__fill" style={{ width: `${percentage}%` }} />
              </div>
              <span className="category-progress-card__count">
                {discovered}/{total}
              </span>
            </div>
          );
        })}
      </div>

      {!user && (
        <div className="category-tabs__login-prompt">
          <p>🔒 Login to track your discoveries</p>
          <a href="/login" className="btn btn--secondary btn--small">Login</a>
        </div>
      )}
    </section>
  );
}
