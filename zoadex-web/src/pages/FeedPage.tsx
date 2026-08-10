import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Newspaper, ThumbsUp, RefreshCw, MapPin } from 'lucide-react';
import { useActiveRegion } from '../hooks/useActiveRegion';
import api from '../services/api';
import { timeAgo } from '../utils/timeAgo';

interface FeedItem {
  id: string;
  username: string;
  speciesName: string;
  photoUrl: string | null;
  location: string;
  createdAt: string;
  confirmationCount: number;
}

interface FeedResponse {
  content: FeedItem[];
  totalPages: number;
  last: boolean;
}

export function FeedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeRegionId } = useActiveRegion();
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['feed', activeRegionId, page],
    queryFn: async () => {
      const res = await api.get<FeedResponse>(`/social/feed/${activeRegionId}`, {
        params: { page, size: 20 },
      });
      return res.data;
    },
    enabled: !!activeRegionId,
  });

  const handleRefresh = () => {
    setPage(0);
    queryClient.invalidateQueries({ queryKey: ['feed', activeRegionId] });
  };

  const feedItems = data?.content ?? [];
  const isLast = data?.last ?? true;

  if (!activeRegionId) {
    return (
      <div className="page feed-page">
        <h2 className="feed-page__title">
          <Newspaper size={22} /> Regional Feed
        </h2>
        <div className="feed-page__empty">
          <p>Select a region to see sightings from nearby explorers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page feed-page">
      <div className="feed-page__header">
        <h2 className="feed-page__title">
          <Newspaper size={22} /> Regional Feed
        </h2>
        <button
          className="btn btn--small btn--secondary"
          onClick={handleRefresh}
          disabled={isFetching}
          aria-label="Refresh feed"
        >
          <RefreshCw size={14} className={isFetching ? 'feed-page__spin' : ''} />
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="feed-page__loading">Loading sightings...</div>
      )}

      {!isLoading && feedItems.length === 0 && (
        <div className="feed-page__empty">
          <Newspaper size={48} />
          <p>No sightings yet in this region.</p>
          <p className="feed-page__empty-hint">Be the first to log a discovery!</p>
        </div>
      )}

      <div className="feed-page__list">
        {feedItems.map((item) => (
          <article
            key={item.id}
            className="feed-card"
            onClick={() => navigate(`/sightings/${item.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/sightings/${item.id}`)}
            aria-label={`Sighting of ${item.speciesName} by ${item.username}`}
          >
            {item.photoUrl && (
              <div className="feed-card__photo">
                <img src={item.photoUrl} alt={item.speciesName} loading="lazy" />
              </div>
            )}
            <div className="feed-card__content">
              <div className="feed-card__header">
                <span className="feed-card__username">{item.username}</span>
                <span className="feed-card__time">{timeAgo(item.createdAt)}</span>
              </div>
              <h3 className="feed-card__species">{item.speciesName}</h3>
              <div className="feed-card__meta">
                <span className="feed-card__location">
                  <MapPin size={12} /> {item.location}
                </span>
                <span className="feed-card__confirmations">
                  <ThumbsUp size={12} /> {item.confirmationCount}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!isLast && (
        <button
          className="btn btn--secondary btn--full feed-page__load-more"
          onClick={() => setPage((p) => p + 1)}
          disabled={isFetching}
        >
          {isFetching ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
