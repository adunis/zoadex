import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { MockModeProvider, useMockMode } from './context/MockModeContext';
import { LanguageProvider } from './context/LanguageContext';
import { registerMockModeCallback, unregisterMockModeCallback } from './services/withFallback';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ExpeditionPage } from './pages/ExpeditionPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { BadgesPage } from './pages/BadgesPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegionsPage } from './pages/RegionsPage';
import { RegionDetailPage } from './pages/RegionDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { SpeciesDetailPage } from './pages/SpeciesDetailPage';
import { FeedPage } from './pages/FeedPage';
import { SightingDetailPage } from './pages/SightingDetailPage';
import { FriendsPage } from './pages/FriendsPage';
import { EmailVerificationBanner } from './components/auth/EmailVerificationBanner';
import { InstallPrompt } from './components/pwa/InstallPrompt';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function DemoBanner() {
  const { isMockMode } = useMockMode();
  if (!isMockMode) return null;
  return (
    <div className="demo-banner" role="status" aria-live="polite">
      ⚠️ Demo mode — backend not connected
    </div>
  );
}

function MockModeSync() {
  const { setMockMode } = useMockMode();
  useEffect(() => {
    registerMockModeCallback(setMockMode);
    return () => unregisterMockModeCallback();
  }, [setMockMode]);
  return null;
}


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MockModeProvider>
        <MockModeSync />
        <AuthProvider>
          <LanguageProvider>
            <BrowserRouter>
            <DemoBanner />
            <InstallPrompt />
            <EmailVerificationBanner />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/log" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
                <Route path="/explore" element={<ProtectedRoute><ChecklistPage /></ProtectedRoute>} />
                <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
                <Route path="/expedition" element={<ProtectedRoute><ExpeditionPage /></ProtectedRoute>} />
                <Route path="/checklist" element={<ChecklistPage />} />
                <Route path="/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/regions" element={<ProtectedRoute><RegionsPage /></ProtectedRoute>} />
                <Route path="/regions/:id" element={<RegionDetailPage />} />
                <Route path="/species/:id" element={<SpeciesDetailPage />} />
                <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
                <Route path="/sightings/:id" element={<SightingDetailPage />} />
                <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
          </LanguageProvider>
        </AuthProvider>
      </MockModeProvider>
    </QueryClientProvider>
  );
}

export default App;
