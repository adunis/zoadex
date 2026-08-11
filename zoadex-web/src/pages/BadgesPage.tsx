import { useQuery } from '@tanstack/react-query';
import { ProgressRing } from '../components/badges/ProgressRing';
import { badgeService } from '../services/badgeService';
import { useAuth } from '../hooks/useAuth';
import { Lock, Trophy } from 'lucide-react';
import { BadgeWithStatus } from '../types/badge';

export function BadgesPage() {
  const { isAuthenticated } = useAuth();
  const { data: allBadges = [] } = useQuery({
    queryKey: ['allBadgesStatus'],
    queryFn: () => badgeService.getAllWithStatus(),
    enabled: isAuthenticated,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['badgeProgress'],
    queryFn: () => badgeService.getProgress(),
    enabled: isAuthenticated,
  });

  const unlockedBadges = allBadges.filter((b: BadgeWithStatus) => b.unlocked);
  const lockedBadges = allBadges.filter((b: BadgeWithStatus) => !b.unlocked);

  // Group locked badges by category
  const lockedByCategory = lockedBadges.reduce((acc: Record<string, BadgeWithStatus[]>, b: BadgeWithStatus) => {
    const cat = b.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(b);
    return acc;
  }, {} as Record<string, BadgeWithStatus[]>);

  return (
    <div className="page badges-page">
      <h2>Badges</h2>

      {/* Earned Badges */}
      <section className="badges-page__earned">
        <h3><Trophy size={18} /> Earned ({unlockedBadges.length})</h3>
        {unlockedBadges.length > 0 ? (
          <div className="badges-grid">
            {unlockedBadges.map((badge: BadgeWithStatus) => (
              <div key={badge.id} className="badge-card badge-card--earned">
                <div className="badge-card__icon">
                  {badge.iconUrl ? <img src={badge.iconUrl} alt="" /> : <Trophy size={32} />}
                </div>
                <div className="badge-card__info">
                  <span className="badge-card__name">{badge.name}</span>
                  <span className="badge-card__tier badge-card__tier--{badge.tier?.toLowerCase()}">{badge.tier}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="badges-page__empty">No badges earned yet. Start exploring!</p>
        )}
      </section>

      {/* In Progress */}
      {progress.length > 0 && (
        <section className="badges-page__progress">
          <h3>In Progress</h3>
          <div className="progress-list">
            {progress.map((p) => (
              <div key={p.badgeId} className="progress-item">
                <ProgressRing percentage={p.percentage} size={60} />
                <div className="progress-item__info">
                  <h4>{p.badgeName}</h4>
                  <p>{p.currentCount}/{p.requiredCount} - {p.tier}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Unlockable Badges (greyed out) */}
      <section className="badges-page__locked">
        <h3><Lock size={18} /> Unlockable Badges ({lockedBadges.length})</h3>
        {Object.entries(lockedByCategory).map(([category, badges]) => (
          <div key={category} className="badges-page__locked-category">
            <h4 className="badges-page__locked-category-title">{category}</h4>
            <div className="badges-grid">
              {(badges as BadgeWithStatus[]).map((badge: BadgeWithStatus) => (
                <div key={badge.id} className="badge-card badge-card--locked">
                  <div className="badge-card__icon badge-card__icon--locked">
                    <Lock size={24} />
                  </div>
                  <div className="badge-card__info">
                    <span className="badge-card__name">{badge.name}</span>
                    <span className="badge-card__description">{badge.description}</span>
                    <span className="badge-card__tier">{badge.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
