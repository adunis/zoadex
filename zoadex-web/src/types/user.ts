export interface User {
  id: string;
  username: string;
  email: string;
  plan: string;
  activeRegionId: string | null;
  activeRegionName: string | null;
  totalSightings: number;
  uniqueSpeciesDiscovered: number;
  createdAt: string;
}

export interface UserPrivacy {
  showSightingsOnMap: string; // YES, APPROXIMATE, NO
  profileVisibility: string; // PUBLIC, FOLLOWERS_ONLY, PRIVATE
  allowFollows: string; // YES, APPROVAL_REQUIRED, NO
  showInLeaderboards: string; // YES, ANONYMOUS, NO
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  regionId?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}
