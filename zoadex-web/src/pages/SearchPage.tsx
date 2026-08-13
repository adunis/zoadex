import { useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface SearchResult {
  id: string;
  commonName: string | null;
  scientificName: string;
  category: string;
  thumbnailUrl: string | null;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ['globalSearch', query],
    queryFn: async () => {
      const response = await api.get<SearchResult[]>('/species/search', {
        params: { q: query, limit: 40 },
      });
      return response.data;
    },
    enabled: query.length >= 2,
  });

  return (
    <div className="page search-page">
      <h2 className="search-page__title">Search Species</h2>

      <div className="search-page__input-wrapper">
        <Search size={20} className="search-page__icon" />
        <input
          type="text"
          className="search-page__input"
          placeholder="Search by common or scientific name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          aria-label="Search species globally"
        />
      </div>

      {isLoading && query.length >= 2 && (
        <p className="search-page__loading">Searching...</p>
      )}

      {query.length >= 2 && !isLoading && results.length === 0 && (
        <p className="search-page__empty">No species found for "{query}"</p>
      )}

      <div className="search-page__results">
        {results.map((species) => (
          <div
            key={species.id}
            className="search-page__card"
            onClick={() => navigate(`/species/${species.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/species/${species.id}`); }}
          >
            <div className="search-page__card-image">
              {species.thumbnailUrl ? (
                <img src={species.thumbnailUrl} alt={species.commonName ?? species.scientificName} />
              ) : (
                <span className="search-page__card-placeholder">🔍</span>
              )}
            </div>
            <div className="search-page__card-info">
              <span className="search-page__card-name">
                {species.commonName ?? species.scientificName}
              </span>
              <span className="search-page__card-scientific">
                {species.scientificName}
              </span>
              <span className="search-page__card-category">
                {species.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
