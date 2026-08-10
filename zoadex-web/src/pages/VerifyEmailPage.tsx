import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.post(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || 'Verification failed. The link may have expired.',
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="page auth-page">
      <div className="auth-page__container">
        <h1 className="auth-page__logo">🦊 ZoaDex</h1>
        <h2>Email Verification</h2>

        {status === 'loading' && (
          <div className="auth-page__loading" role="status" aria-live="polite">
            <p>Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="auth-page__success" role="status">
            <p>✅ Your email has been verified successfully!</p>
            <p>You can now enjoy all features of ZoaDex.</p>
            <p className="auth-page__link">
              <Link to="/">← Go to Home</Link>
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className="auth-page__error" role="alert">{errorMessage}</p>
            <p className="auth-page__link">
              <Link to="/">← Go to Home</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
