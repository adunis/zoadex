export enum BadgeTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  tier: BadgeTier;
  category?: string;
  requirement: number;
}

export interface UserBadge {
  badge: Badge;
  earnedAt: string;
  progress: number;
}

export interface AchievementProgress {
  badgeId: string;
  badgeName: string;
  currentCount: number;
  requiredCount: number;
  tier: BadgeTier;
  nextTier?: BadgeTier;
  percentage: number;
}
