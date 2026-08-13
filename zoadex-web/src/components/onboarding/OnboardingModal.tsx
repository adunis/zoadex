import { useState } from 'react';

const STORAGE_KEY = 'zoadex_onboarding_done';

const STEPS = [
  {
    emoji: '🌍',
    title: 'Welcome to ZoaDex!',
    description: 'Your real-world Pokédex for biodiversity. Discover, catalog, and track every species around you.',
  },
  {
    emoji: '🗺️',
    title: 'Explore the Map',
    description: 'Pan around to discover species in your region. The crosshair detects nearby species.',
  },
  {
    emoji: '📸',
    title: 'Log Sightings',
    description: 'Found a species? Log it with a photo. Earn XP!',
  },
  {
    emoji: '🎨',
    title: 'Paint Your Explored Areas',
    description: 'Mark areas you\'ve visited on the map. Track your exploration coverage.',
  },
  {
    emoji: '👥',
    title: 'Connect with Explorers',
    description: 'Add friends, comment on sightings, earn badges!',
  },
];

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  };

  const current = STEPS[step];

  return (
    <div className="onboarding-modal">
      <div className="onboarding-modal__backdrop" />
      <div className="onboarding-modal__content">
        <div className="onboarding-modal__illustration">{current.emoji}</div>
        <h2 className="onboarding-modal__title">{current.title}</h2>
        <p className="onboarding-modal__description">{current.description}</p>

        <div className="onboarding-modal__dots">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`onboarding-modal__dot ${i === step ? 'onboarding-modal__dot--active' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-modal__actions">
          <button
            className="btn btn--secondary btn--small"
            onClick={handleFinish}
            type="button"
          >
            Skip
          </button>
          <div className="onboarding-modal__nav">
            {step > 0 && (
              <button
                className="btn btn--secondary btn--small"
                onClick={handlePrev}
                type="button"
              >
                Previous
              </button>
            )}
            <button
              className="btn btn--primary btn--small"
              onClick={handleNext}
              type="button"
            >
              {step < STEPS.length - 1 ? 'Next' : 'Get Started!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const isDone = localStorage.getItem(STORAGE_KEY) === 'true';
  return { showOnboarding: !isDone };
}
