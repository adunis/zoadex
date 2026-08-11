import { MapPin, RefreshCw, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { WeatherCard } from '../components/home/WeatherCard';
import { CategoryTabs } from '../components/home/CategoryTabs';
import { SightingMap } from '../components/map/SightingMap';
import { CountryFlag } from '../components/common/CountryFlag';
import { sightingService } from '../services/sightingService';
import { useAuth } from '../hooks/useAuth';
import { useActiveRegion } from '../hooks/useActiveRegion';

export function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { activeRegion, regionCenter } = useActiveRegion();

  const mapCenter = regionCenter;

  const { data: sightingPins = [] } = useQuery({
    queryKey: ['sightingPins'],
    queryFn: () => sightingService.getMapPins(),
    enabled: isAuthenticated,
  });  if (!isAuthenticated) {
    return (
      <div className="page home-page">
        <header className="home-page__header home-page__header--guest">
          <h1 className="home-page__logo">🌍 ZoaDex</h1>
          <p className="home-page__tagline">Your real-world Pokédex for biodiversity discovery</p>
          <p className="home-page__subtitle">
            Explore species in 236 regions across 73 countries. Log sightings, earn badges, and discover nature like never before.
          </p>
          <div className="home-page__cta">
            <Link to="/login" className="btn btn--primary btn--large">
              <LogIn size={18} /> Login
            </Link>
            <Link to="/register" className="btn btn--secondary btn--large">
              Create Account
            </Link>
          </div>
          <p className="home-page__map-hint">
            👇 You can still explore the <Link to="/map">Map</Link> without an account
          </p>
        </header>
      </div>
    );
  }
  return (
    <div className="page home-page">
      <header className="home-page__header">
        {activeRegion && (
          <div className="home-page__region-hero">
            <CountryFlag country={activeRegion.country} regionName={activeRegion.name} size={40} />
            <div>
              <h1 className="home-page__welcome">Welcome, {user?.username || 'Explorer'}!</h1>
              <p className="home-page__region-name">{activeRegion.name}, {activeRegion.country}</p>
            </div>
          </div>
        )}
        {!activeRegion && (
          <h1 className="home-page__welcome">Welcome, {user?.username || 'Explorer'}!</h1>
        )}
        {activeRegion?.description && (
          <p className="home-page__region-desc">{activeRegion.description}</p>
        )}
        <div className="home-page__region">
          <MapPin size={16} />
          <span className="home-page__region-label">
            {activeRegion ? `${activeRegion.name}, ${activeRegion.country}` : 'Loading...'}
          </span>
          <a href="/regions" className="btn btn--small btn--secondary" aria-label="Switch Region">
            <RefreshCw size={12} /> Switch
          </a>
        </div>
      </header>

      <WeatherCard />

      {isAuthenticated ? (
        <section className="home-page__map">
          <h3 className="home-page__section-title">Your Sightings</h3>
          <div className="home-page__map-container">
            <SightingMap center={mapCenter} zoom={10} pins={sightingPins} />
          </div>
        </section>
      ) : (
        <section className="home-page__map">
          <h3 className="home-page__section-title">Explore the Map</h3>
          <div className="home-page__map-container">
            <SightingMap center={mapCenter} zoom={10} pins={[]} />
          </div>
          <p className="home-page__login-hint">
            🔒 <a href="/login">Login</a> to track your discoveries on the map
          </p>
        </section>
      )}

      <CategoryTabs />
    </div>
  );
}
