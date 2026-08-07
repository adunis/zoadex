import { useQuery } from '@tanstack/react-query';
import { BadgeCard } from '../components/badges/BadgeCard';
import { ProgressRing } from '../components/badges/ProgressRing';
import { badgeService } from '../services/badgeService';
import { useAuth } from '../hooks/useAuth';

export function BadgesPage() {
  const { isAuthenticated } = useAuth();

  const { data: myBadges = [] } = useQuery({
    queryKey: ['myBadges'],
    queryFn: () => badgeService.getMyBadges(),
    enabled: isAuthenticated,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['badgeProgress'],
    queryFn: () => badgeService.getProgress(),
    enabled: isAuthenticated,
  });

  return (
    <div className="page badges-page">
      <h2>Badges</h2>

      <section className="badges-page__earned">
        <h3>Earned ({myBadges.length})</h3>
        {myBadges.length > 0 ? (
          <div className="badges-grid">
            {myBadges.map((badge) => (
              <BadgeCard key={badge.badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <p className="badges-page__empty">No badges earned yet. Start exploring!</p>
        )}
      </section>

      <section className="badges-page__progress">
        <h3>In Progress</h3>
        <div className="progress-list">
          {progress.map((p) => (
            <div key={p.badgeId} className="progress-item">
              <ProgressRing percentage={p.percentage} size={60} />
              <div className="progress-item__info">
                <h4>{p.badgeName}</h4>
                <p>
                  {p.currentCount}/{p.requiredCount} — {p.tier}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
