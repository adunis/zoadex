import api from './api';
import { withFallback } from './withFallback';
import { mockBadges, mockMyBadges, mockBadgeProgress } from './mockData';
import { Badge, UserBadge, AchievementProgress } from '../types/badge';

export const badgeService = {
  async getAllBadges(): Promise<Badge[]> {
    return withFallback(
      async () => {
        const response = await api.get<Badge[]>('/badges');
        return response.data;
      },
      mockBadges,
    );
  },

  async getMyBadges(): Promise<UserBadge[]> {
    return withFallback(
      async () => {
        const response = await api.get<UserBadge[]>('/badges/my');
        return response.data;
      },
      mockMyBadges,
    );
  },

  async getProgress(): Promise<AchievementProgress[]> {
    return withFallback(
      async () => {
        const response = await api.get<AchievementProgress[]>('/badges/progress');
        return response.data;
      },
      mockBadgeProgress,
    );
  },
};
