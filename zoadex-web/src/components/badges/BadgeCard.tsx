import { Award } from 'lucide-react';
import { BadgeTier, UserBadge } from '../../types/badge';

interface BadgeCardProps {
  badge: UserBadge;
}

const tierColors: Record<BadgeTier, string> = {
  [BadgeTier.BRONZE]: '#cd7f32',
  [BadgeTier.SILVER]: '#c0c0c0',
  [BadgeTier.GOLD]: '#ffd700',
  [BadgeTier.PLATINUM]: '#e5e4e2',
};

export function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div className="badge-card">
      <div
        className="badge-card__icon"
        style={{ borderColor: tierColors[badge.badge.tier] }}
      >
        <Award size={32} color={tierColors[badge.badge.tier]} />
      </div>
      <h4 className="badge-card__name">{badge.badge.name}</h4>
      <p className="badge-card__tier">{badge.badge.tier}</p>
      <p className="badge-card__date">
        {new Date(badge.earnedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
