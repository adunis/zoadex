import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, UserMinus, Check, X, MapPin } from 'lucide-react';
import api from '../services/api';

type Tab = 'friends' | 'requests' | 'nearby';

interface Friend {
  id: string;
  username: string;
  level: number;
  activeRegionName: string;
}

interface FriendRequest {
  id: string;
  username: string;
  level: number;
}

interface NearbyExplorer {
  id: string;
  username: string;
  level: number;
  activeRegionName: string;
}

export function FriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const res = await api.get<Friend[]>('/friends');
      return res.data;
    },
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['friends-requests'],
    queryFn: async () => {
      const res = await api.get<FriendRequest[]>('/friends/requests');
      return res.data;
    },
  });

  const { data: nearby = [], isLoading: loadingNearby } = useQuery({
    queryKey: ['friends-nearby'],
    queryFn: async () => {
      const res = await api.get<NearbyExplorer[]>('/friends/nearby');
      return res.data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: (friendId: string) => api.delete(`/friends/${friendId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => api.post(`/friends/${requestId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (requestId: string) => api.post(`/friends/${requestId}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends-requests'] });
    },
  });

  const addFriendMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/friends/request/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends-nearby'] });
    },
  });

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'friends', label: 'Friends', count: friends.length },
    { key: 'requests', label: 'Requests', count: requests.length },
    { key: 'nearby', label: 'Nearby' },
  ];

  return (
    <div className="page friends-page">
      <h2 className="friends-page__title">
        <Users size={22} /> Friends
      </h2>

      <div className="friends-page__tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`friends-page__tab ${activeTab === tab.key ? 'friends-page__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className="friends-page__tab-badge">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="friends-page__content" role="tabpanel">
        {activeTab === 'friends' && (
          <div className="friends-page__list">
            {loadingFriends && <p className="friends-page__loading">Loading friends...</p>}
            {!loadingFriends && friends.length === 0 && (
              <div className="friends-page__empty">
                <Users size={40} />
                <p>No friends yet. Check the Nearby tab to connect with explorers!</p>
              </div>
            )}
            {friends.map((friend) => (
              <div key={friend.id} className="friend-card">
                <div className="friend-card__avatar">
                  {friend.username.charAt(0).toUpperCase()}
                </div>
                <div className="friend-card__info">
                  <span className="friend-card__name">{friend.username}</span>
                  <span className="friend-card__meta">
                    Lvl {friend.level} · <MapPin size={11} /> {friend.activeRegionName}
                  </span>
                </div>
                <button
                  className="btn btn--small btn--danger"
                  onClick={() => removeMutation.mutate(friend.id)}
                  disabled={removeMutation.isPending}
                  aria-label={`Remove ${friend.username}`}
                >
                  <UserMinus size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="friends-page__list">
            {loadingRequests && <p className="friends-page__loading">Loading requests...</p>}
            {!loadingRequests && requests.length === 0 && (
              <div className="friends-page__empty">
                <UserPlus size={40} />
                <p>No pending friend requests.</p>
              </div>
            )}
            {requests.map((req) => (
              <div key={req.id} className="friend-card">
                <div className="friend-card__avatar">
                  {req.username.charAt(0).toUpperCase()}
                </div>
                <div className="friend-card__info">
                  <span className="friend-card__name">{req.username}</span>
                  <span className="friend-card__meta">Lvl {req.level}</span>
                </div>
                <div className="friend-card__actions">
                  <button
                    className="btn btn--small btn--primary"
                    onClick={() => acceptMutation.mutate(req.id)}
                    disabled={acceptMutation.isPending}
                    aria-label={`Accept request from ${req.username}`}
                  >
                    <Check size={12} /> Accept
                  </button>
                  <button
                    className="btn btn--small btn--danger"
                    onClick={() => declineMutation.mutate(req.id)}
                    disabled={declineMutation.isPending}
                    aria-label={`Decline request from ${req.username}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'nearby' && (
          <div className="friends-page__list">
            {loadingNearby && <p className="friends-page__loading">Loading nearby explorers...</p>}
            {!loadingNearby && nearby.length === 0 && (
              <div className="friends-page__empty">
                <MapPin size={40} />
                <p>No explorers found nearby. Try a different region!</p>
              </div>
            )}
            {nearby.map((explorer) => (
              <div key={explorer.id} className="friend-card">
                <div className="friend-card__avatar">
                  {explorer.username.charAt(0).toUpperCase()}
                </div>
                <div className="friend-card__info">
                  <span className="friend-card__name">{explorer.username}</span>
                  <span className="friend-card__meta">
                    Lvl {explorer.level} · <MapPin size={11} /> {explorer.activeRegionName}
                  </span>
                </div>
                <button
                  className="btn btn--small btn--primary"
                  onClick={() => addFriendMutation.mutate(explorer.id)}
                  disabled={addFriendMutation.isPending}
                  aria-label={`Add ${explorer.username} as friend`}
                >
                  <UserPlus size={12} /> Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
