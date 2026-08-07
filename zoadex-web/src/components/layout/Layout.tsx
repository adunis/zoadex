import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useActiveRegion } from '../../hooks/useActiveRegion';
import { useAuth } from '../../hooks/useAuth';
import { CountryFlag } from '../common/CountryFlag';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRegion } = useActiveRegion();
  const { isAuthenticated } = useAuth();

  const isMapPage = location.pathname === '/map';

  return (
    <div className="app-layout">
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

