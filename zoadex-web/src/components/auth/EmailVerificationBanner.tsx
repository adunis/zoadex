import { useState } from 'react';
import { Mail } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified !== false) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
    } catch {
      // Silently fail — user can try again
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="email-verification-banner" role="alert">
      <Mail size={16} />
      <span className="email-verification-banner__text">
        Please verify your email address to unlock all features.
      </span>
      {sent ? (
        <span className="email-verification-banner__sent">✓ Email sent!</span>
      ) : (
        <button
          className="email-verification-banner__btn"
          onClick={handleResend}
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Resend verification email'}
        </button>
      )}
    </div>
  );
}
