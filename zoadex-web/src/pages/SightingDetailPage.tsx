import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, MapPin, Calendar, Send, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { timeAgo } from '../utils/timeAgo';

interface SightingDetail {
  id: string;
  photoUrl: string | null;
  speciesName: string;
  speciesScientificName: string;
  location: string;
  date: string;
  notes: string;
  username: string;
}

interface SightingSocial {
  confirmationCount: number;
  confirmedByMe: boolean;
  comments: SightingComment[];
}

interface SightingComment {
  id: string;
  username: string;
  text: string;
  createdAt: string;
}

export function SightingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: sighting, isLoading: loadingSighting } = useQuery({
    queryKey: ['sighting', id],
    queryFn: async () => {
      const res = await api.get<SightingDetail>(`/social/sightings/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: social, isLoading: loadingSocial } = useQuery({
    queryKey: ['sighting-social', id],
    queryFn: async () => {
      const res = await api.get<SightingSocial>(`/social/sightings/${id}/social`);
      return res.data;
    },
    enabled: !!id,
  });

  const confirmMutation = useMutation({
    mutationFn: () => api.post(`/social/sightings/${id}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sighting-social', id] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) =>
      api.post(`/social/sightings/${id}/comments`, { text }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['sighting-social', id] });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (trimmed) {
      commentMutation.mutate(trimmed);
    }
  };

  if (loadingSighting) {
    return (
      <div className="page sighting-detail">
        <div className="sighting-detail__loading">Loading sighting...</div>
      </div>
    );
  }

  if (!sighting) {
    return (
      <div className="page sighting-detail">
        <div className="sighting-detail__empty">Sighting not found.</div>
      </div>
    );
  }

  return (
    <div className="page sighting-detail">
      {sighting.photoUrl && (
        <div className="sighting-detail__hero">
          <img src={sighting.photoUrl} alt={sighting.speciesName} />
        </div>
      )}

      <div className="sighting-detail__info">
        <h2 className="sighting-detail__species">{sighting.speciesName}</h2>
        {sighting.speciesScientificName && (
          <p className="sighting-detail__scientific">{sighting.speciesScientificName}</p>
        )}

        <div className="sighting-detail__meta">
          <span className="sighting-detail__meta-item">
            <MapPin size={14} /> {sighting.location}
          </span>
          <span className="sighting-detail__meta-item">
            <Calendar size={14} /> {new Date(sighting.date).toLocaleDateString()}
          </span>
        </div>

        <p className="sighting-detail__observer">
          Spotted by <strong>{sighting.username}</strong>
        </p>

        {sighting.notes && (
          <div className="sighting-detail__notes">
            <p>{sighting.notes}</p>
          </div>
        )}
      </div>

      <div className="sighting-detail__actions">
        <button
          className={`btn btn--confirm ${social?.confirmedByMe ? 'btn--confirm--active' : ''}`}
          onClick={() => confirmMutation.mutate()}
          disabled={confirmMutation.isPending || social?.confirmedByMe}
          aria-label="Confirm sighting"
        >
          <ThumbsUp size={16} />
          <span>{social?.confirmationCount ?? 0}</span>
          <span className="btn--confirm__label">
            {social?.confirmedByMe ? 'Confirmed' : 'Confirm'}
          </span>
        </button>
      </div>

      <section className="sighting-detail__comments" aria-label="Comments">
        <h3 className="sighting-detail__comments-title">
          <MessageCircle size={18} /> Comments
          {social?.comments && social.comments.length > 0 && (
            <span className="sighting-detail__comments-count">
              ({social.comments.length})
            </span>
          )}
        </h3>

        {loadingSocial && <p className="sighting-detail__comments-loading">Loading...</p>}

        {social?.comments && social.comments.length === 0 && (
          <p className="sighting-detail__comments-empty">No comments yet. Be the first!</p>
        )}

        <div className="sighting-detail__comments-list">
          {social?.comments?.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-item__header">
                <span className="comment-item__username">{comment.username}</span>
                <span className="comment-item__time">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="comment-item__text">{comment.text}</p>
            </div>
          ))}
        </div>

        <form className="sighting-detail__comment-form" onSubmit={handleSubmitComment}>
          <input
            type="text"
            className="sighting-detail__comment-input"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={commentMutation.isPending}
            aria-label="Write a comment"
          />
          <button
            type="submit"
            className="btn btn--primary sighting-detail__comment-send"
            disabled={!commentText.trim() || commentMutation.isPending}
            aria-label="Send comment"
          >
            <Send size={16} />
          </button>
        </form>
      </section>
    </div>
  );
}
