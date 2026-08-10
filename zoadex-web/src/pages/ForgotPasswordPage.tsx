import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-page__container">
        <h1 className="auth-page__logo">🦊 ZoaDex</h1>
        <h2>Reset Password</h2>

        {error && <p className="auth-page__error" role="alert">{error}</p>}

        {success ? (
          <div className="auth-page__success" role="status">
            <p>✅ If an account exists with that email, you'll receive a password reset link shortly.</p>
            <p className="auth-page__link">
              <Link to="/login">← Back to Login</Link>
            </p>
          </div>
        ) : (
          <>
            <p className="auth-page__hint">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-page__link">
              Remember your password? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
