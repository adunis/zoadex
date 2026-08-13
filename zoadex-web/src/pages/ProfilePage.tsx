import { Award, Eye, LogOut, MapPin, Calendar, Flame, CreditCard, Star, Users, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { badgeService } from '../services/badgeService';
import { BadgeCard } from '../components/badges/BadgeCard';
import { useLanguageContext } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { UI_LANGUAGES, SPECIES_LANGUAGES, SpeciesLanguage } from '../i18n/translations';
import api from '../services/api';

function UpgradeButton() {
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const response = await api.post<{ url: string }>('/payments/checkout');
      window.location.href = response.data.url;
    } catch {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="profile-page__upgrade">
      <p className="profile-page__upgrade-text">
        🌟 Upgrade to <strong>PRO</strong> for unlimited regions, advanced stats, and more!
      </p>
      <button
        className="btn btn--accent btn--full"
        onClick={handleUpgrade}
        disabled={upgradeLoading}
      >
        <CreditCard size={16} />
        {upgradeLoading ? 'Redirecting...' : 'Upgrade to PRO'}
      </button>
    </div>
  );
}

export function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { uiLanguage, speciesLanguages, setUiLanguage, setSpeciesLanguages, t } = useLanguageContext();
  const { theme, toggleTheme } = useTheme();
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: myBadges = [] } = useQuery({
    queryKey: ['myBadges'],
    queryFn: () => badgeService.getMyBadges(),
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  function toggleSpeciesLang(lang: SpeciesLanguage) {
    if (speciesLanguages.includes(lang)) {
      if (speciesLanguages.length > 1) {
        setSpeciesLanguages(speciesLanguages.filter(l => l !== lang));
      }
    } else {
      setSpeciesLanguages([...speciesLanguages, lang]);
    }
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'June 2026';

  const displayBadges = myBadges.slice(0, 6);

  return (
    <div className="page profile-page">
      <h2>{t('profile.title')}</h2>

      <div className="profile-page__card">
        <div className="profile-page__avatar">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h3>{user?.username || 'Explorer'}</h3>
        <p className="profile-page__email">{user?.email || 'explorer@zoadex.app'}</p>
        <p className="profile-page__since">
          <Calendar size={14} /> {t('profile.member_since')} {memberSince}
        </p>
      </div>

      <div className="profile-page__region-section">
        <div className="profile-page__region">
          <MapPin size={16} />
          <span>{user?.activeRegionName || 'No region selected'}</span>
          <a href="/regions" className="btn btn--small btn--secondary">
            Manage Regions →
          </a>
        </div>
      </div>

      <div className="profile-page__stats">
        <div className="stat-item">
          <Eye size={20} />
          <span className="stat-item__value">{user?.totalSightings ?? 0}</span>
          <span className="stat-item__label">{t('profile.sightings')}</span>
        </div>
        <div className="stat-item">
          <Award size={20} />
          <span className="stat-item__value">{user?.uniqueSpeciesDiscovered ?? 0}</span>
          <span className="stat-item__label">{t('profile.species')}</span>
        </div>
        <div className="stat-item">
          <Flame size={20} />
          <span className="stat-item__value">3</span>
          <span className="stat-item__label">Week Streak</span>
        </div>
      </div>

      
      
      {/* Friends */}
      <div className="profile-page__friends-link" onClick={() => navigate('/friends')} role="button" tabIndex={0}>
        <Users size={20} />
        <span>Friends &amp; Nearby Explorers</span>
        <span className="profile-page__friends-chevron">&rsaquo;</span>
      </div>
      {/* Badges */}
      <section className="profile-page__badges">
        <div className="profile-page__badges-header">
          <h3>Badges</h3>
          <a href="/badges" className="btn btn--small btn--secondary">View All</a>
        </div>
        {displayBadges.length > 0 ? (
          <div className="badges-grid">
            {displayBadges.map((badge) => (
              <BadgeCard key={badge.badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <p className="profile-page__badges-empty">No badges yet. Start exploring to earn them!</p>
        )}
      </section>
      {/* XP Progress */}
      <div className="profile-page__xp">
        <div className="profile-page__xp-header">
          <Star size={20} className="profile-page__xp-icon" />
          <span className="profile-page__xp-level">Level {user?.level ?? 1}</span>
          <span className="profile-page__xp-total">{user?.xp ?? 0} XP</span>
        </div>
        <div className="profile-page__xp-bar">
          <div
            className="profile-page__xp-fill"
            style={{ width: `${user?.xpNeededForNext ? Math.min(100, ((user?.xpInCurrentLevel ?? 0) / user.xpNeededForNext) * 100) : 0}%` }}
          />
        </div>
        <p className="profile-page__xp-text">
          {user?.xpInCurrentLevel ?? 0} / {user?.xpNeededForNext ?? 100} XP to next level
        </p>
      </div>

      <section className="profile-page__settings">
        <h3>{t('profile.settings')}</h3>

        {user?.plan === 'FREE' && (
          <UpgradeButton />
        )}

        <div className="settings-group">
          <h4 className="settings-group__title">{t('profile.ui_language')}</h4>
          <div className="settings-group__options">
            {UI_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`lang-pill ${uiLanguage === lang.code ? 'lang-pill--active' : ''}`}
                onClick={() => setUiLanguage(lang.code)}
              >
                <img src={`https://hatscripts.github.io/circle-flags/flags/${lang.flag}.svg`} alt="" className="lang-pill__flag" />
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <h4 className="settings-group__title">{t('profile.species_languages')}</h4>
          <p className="settings-group__hint">{t('profile.species_lang_hint')}</p>
          <div className="settings-group__options">
            {SPECIES_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`lang-pill ${speciesLanguages.includes(lang.code) ? 'lang-pill--active' : ''}`}
                onClick={() => toggleSpeciesLang(lang.code)}
              >
                <img src={`https://hatscripts.github.io/circle-flags/flags/${lang.flag}.svg`} alt="" className="lang-pill__flag" />
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-list">
          <div className="settings-item">
            <span>Show Profile Publicly</span>
            <input type="checkbox" defaultChecked aria-label="Show profile publicly" />
          </div>
          <div className="settings-item">
            <span>Show Sightings on Map</span>
            <input type="checkbox" defaultChecked aria-label="Show sightings on map" />
          </div>
          <div className="settings-item">
            <span>Share Location</span>
            <input type="checkbox" aria-label="Share location" />
          </div>
          <div className="settings-item">
            <span>Dark Mode</span>
            <button
              className="btn btn--small btn--secondary"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? ' Light' : ' Dark'}
            </button>
          </div>
        </div>
      </section>

      {/* Privacy & Data (GDPR) */}
      <section className="profile-page__privacy">
        <h3>Privacy &amp; Data</h3>
        <div className="profile-page__privacy-actions">
          <button
            className="btn btn--secondary btn--full"
            onClick={async () => {
              try {
                const response = await api.get('/users/me/export');
                const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'zoadex-my-data.json';
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                alert('Failed to export data');
              }
            }}
          >
            📥 Export My Data
          </button>

          <button
            className="btn btn--danger btn--full"
            onClick={() => setShowDeleteDialog(true)}
          >
            🗑️ Delete Account
          </button>
        </div>

        {showDeleteDialog && (
          <div className="profile-page__delete-dialog">
            <p>Type <strong>DELETE</strong> to permanently delete your account and all data:</p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              aria-label="Confirm deletion"
            />
            <div className="profile-page__delete-dialog-actions">
              <button
                className="btn btn--secondary btn--small"
                onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(''); }}
              >
                Cancel
              </button>
              <button
                className="btn btn--danger btn--small"
                disabled={deleteConfirm !== 'DELETE'}
                onClick={async () => {
                  try {
                    await api.delete('/users/me');
                    logout();
                    navigate('/login');
                  } catch {
                    alert('Failed to delete account');
                  }
                }}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        )}
      </section>

      <button className="btn btn--danger btn--full" onClick={handleLogout}>
        <LogOut size={16} /> {t('profile.logout')}
      </button>
    </div>
  );
}
