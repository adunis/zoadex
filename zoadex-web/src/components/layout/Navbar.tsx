import { NavLink } from 'react-router-dom';
import { Home, Map, PlusCircle, Compass, User } from 'lucide-react';
import { useLanguageContext } from '../../context/LanguageContext';

export function Navbar() {
  const { t } = useLanguageContext();

  return (
    <nav className="navbar" aria-label="Main navigation">
      <NavLink to="/" className="nav-item" aria-label={t('nav.home')}>
        <Home size={22} />
        <span>{t('nav.home')}</span>
      </NavLink>
      <NavLink to="/map" className="nav-item" aria-label={t('nav.map')}>
        <Map size={22} />
        <span>{t('nav.map')}</span>
      </NavLink>
      <NavLink to="/log" className="nav-item nav-item--primary" aria-label={t('nav.log')}>
        <PlusCircle size={30} />
        <span>{t('nav.log')}</span>
      </NavLink>
      <NavLink to="/explore" className="nav-item" aria-label={t('nav.explore')}>
        <Compass size={22} />
        <span>{t('nav.explore')}</span>
      </NavLink>
      <NavLink to="/profile" className="nav-item" aria-label={t('nav.profile')}>
        <User size={22} />
        <span>{t('nav.profile')}</span>
      </NavLink>
    </nav>
  );
}
