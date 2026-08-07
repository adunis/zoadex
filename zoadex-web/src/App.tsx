import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MockModeProvider>
        <MockModeSync />
        <AuthProvider>
          <LanguageProvider>
            <BrowserRouter>
            <DemoBanner />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/log" element={<DiscoverPage />} />
                <Route path="/explore" element={<ChecklistPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/expedition" element={<ExpeditionPage />} />
                <Route path="/checklist" element={<ChecklistPage />} />
                <Route path="/badges" element={<BadgesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/regions" element={<RegionsPage />} />
                <Route path="/regions/:id" element={<RegionDetailPage />} />
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
