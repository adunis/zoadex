import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { regionService } from '../services/regionService';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  xp: number;
  sightingCount: number;
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('alltime');

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getAll(),
  });

  const [selectedRegionId, setSelectedRegionId] = useState<string>('');

  // Use first region as default if none selected
  const regionId = selectedRegionId || regions[0]?.id || '';

  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', regionId, period],
    queryFn: async () => {
      const response = await api.get<LeaderboardEntry[]>(`/leaderboard/${regionId}`, {
        params: { period, limit: 20 },
      });
      return response.data;
    },
    enabled: !!regionId,
  });

  return (
    <div className="page leaderboard-page">
      <h2 className="leaderboard-page__title">
        <Trophy size={24} /> Leaderboard
      </h2>

      <div className="leaderboard-page__filters">
        <select
          className="leaderboard-page__select"
          value={selectedRegionId || regions[0]?.id || ''}
          onChange={(e) => setSelectedRegionId(e.target.value)}
          aria-label="Select region"
        >
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <div className="leaderboard-page__period-pills">
          {(['weekly', 'monthly', 'alltime'] as const).map((p) => (
            <button
              key={p}
              className={`leaderboard-page__period-btn ${period === p ? 'leaderboard-page__period-btn--active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'weekly' ? 'Week' : p === 'monthly' ? 'Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="leaderboard-page__loading">Loading...</p>}

      {!isLoading && entries.length === 0 && (
        <p className="leaderboard-page__empty">No sightings yet for this region and period.</p>
      )}

      {entries.length > 0 && (
        <table className="leaderboard-page__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Explorer</th>
              <th>Level</th>
              <th>Sightings</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.userId}
                className={entry.userId === user?.id ? 'leaderboard-page__row--current' : ''}
              >
                <td className="leaderboard-page__rank">
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                </td>
                <td className="leaderboard-page__user">
                  <span className="leaderboard-page__avatar">
                    {entry.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="leaderboard-page__username">{entry.username}</span>
                </td>
                <td className="leaderboard-page__level">Lv.{entry.level}</td>
                <td className="leaderboard-page__sightings">{entry.sightingCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
