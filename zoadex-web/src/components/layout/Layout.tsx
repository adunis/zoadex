import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Navbar } from './Navbar';
import { NotificationBell } from './NotificationBell';
import { useActiveRegion } from '../../hooks/useActiveRegion';
import { useAuth } from '../../hooks/useAuth';
import { CountryFlag } from '../common/CountryFlag';
import { OnboardingModal, useOnboarding } from '../onboarding/OnboardingModal';
import { requestPermission } from '../../utils/pushNotifications';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRegion } = useActiveRegion();
  const { isAuthenticated } = useAuth();
  const { showOnboarding } = useOnboarding();
  const [onboardingVisible, setOnboardingVisible] = useState(showOnboarding);

  const isMapPage = location.pathname === '/map';

  // Request push notification permission on first authenticated visit
  if (isAuthenticated) {
    requestPermission();
  }

  return (
    <div className="app-layout">
      {isAuthenticated && onboardingVisible && (
        <OnboardingModal onComplete={() => setOnboardingVisible(false)} />
      )}
      {isAuthenticated && <NotificationBell />}
      <main className="app-content">
        <Outlet />
      </main>
      {!isMapPage && activeRegion ? (
        <button
          className="region-badge"
          onClick={() => navigate('/regions')}
          aria-label={`Current region: ${activeRegion.name}. Click to manage regions.`}
        >
          <CountryFlag country={activeRegion.country} regionName={activeRegion.name} size={28} />
          <span className="region-badge__name">{activeRegion.name}</span>
        </button>
      ) : !isMapPage && isAuthenticated ? (
        <button
          className="region-badge region-badge--empty"
          onClick={() => navigate('/regions')}
          aria-label="No region selected. Click to choose a region."
        >
          🌍 Select Region
        </button>
      ) : null}
      <Navbar />
    </div>
  );
}

