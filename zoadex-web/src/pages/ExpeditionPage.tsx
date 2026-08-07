import { useState, useEffect, useRef } from 'react';
import { Compass, Play, Square, Plus, MapPin, Clock } from 'lucide-react';
import { useExpedition } from '../hooks/useExpedition';
import { Expedition } from '../types/sighting';

function formatDuration(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - start);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function ExpeditionTimer({ startedAt }: { startedAt: string }) {
  const [display, setDisplay] = useState(formatDuration(startedAt));
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDisplay(formatDuration(startedAt));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt]);

  return <span className="expedition-timer">{display}</span>;
}

function ExpeditionSummary({ expedition }: { expedition: Expedition }) {
  const duration = expedition.endedAt
    ? formatDuration(expedition.startedAt)
    : '00:00:00';

  return (
    <div className="expedition-summary">
      <h3>🎉 Expedition Complete!</h3>
      <div className="expedition-summary__stats">
        <div className="expedition-summary__stat">
          <Clock size={20} />
          <span className="expedition-summary__stat-value">{duration}</span>
          <span className="expedition-summary__stat-label">Duration</span>
        </div>
        <div className="expedition-summary__stat">
          <Compass size={20} />
          <span className="expedition-summary__stat-value">{expedition.sightingCount}</span>
          <span className="expedition-summary__stat-label">Species Found</span>
        </div>
        <div className="expedition-summary__stat">
          <MapPin size={20} />
          <span className="expedition-summary__stat-value">1</span>
          <span className="expedition-summary__stat-label">Locations</span>
        </div>
      </div>
    </div>
  );
}

export function ExpeditionPage() {
  const { expedition, isActive, startExpedition, endExpedition, loading } = useExpedition();
  const [expeditionName, setExpeditionName] = useState('');
  const [completedExpedition, setCompletedExpedition] = useState<Expedition | null>(null);

  const handleStart = async () => {
    if (!expeditionName.trim()) return;
    await startExpedition(expeditionName);
    setExpeditionName('');
    setCompletedExpedition(null);
  };

  const handleEnd = async () => {
    const ended = await endExpedition();
    if (ended) {
      setCompletedExpedition(ended);
    }
  };

  if (loading) {
    return (
      <div className="page expedition-page">
        <h2><Compass size={24} /> Expedition</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page expedition-page">
      <h2>
        <Compass size={24} /> Expedition
      </h2>

      {completedExpedition && !isActive && (
        <ExpeditionSummary expedition={completedExpedition} />
      )}

      {!isActive ? (
        <div className="expedition-page__start">
          <p>Start an expedition to track a wildlife outing session.</p>
          <div className="expedition-page__start-card">
            <div className="form-group">
              <label htmlFor="expedition-name">Expedition Name</label>
              <input
                id="expedition-name"
                type="text"
                value={expeditionName}
                onChange={(e) => setExpeditionName(e.target.value)}
                placeholder="Morning bird walk..."
              />
            </div>
            <button
              className="btn btn--primary btn--full expedition-page__start-btn"
              onClick={handleStart}
              disabled={!expeditionName.trim()}
            >
              <Play size={20} /> Start Expedition
            </button>
          </div>
        </div>
      ) : (
        <div className="expedition-page__active">
          <div className="expedition-status">
            <div className="expedition-status__indicator" />
            <h3>{expedition?.name}</h3>
          </div>

          <div className="expedition-page__timer-section">
            <Clock size={18} />
            {expedition && <ExpeditionTimer startedAt={expedition.startedAt} />}
          </div>

          <div className="expedition-page__gps">
            <MapPin size={16} />
            <span>GPS tracking active</span>
          </div>

          <p className="expedition-page__count">
            Species logged: <strong>{expedition?.sightingCount ?? 0}</strong>
          </p>

          <a href="/log" className="btn btn--secondary btn--full">
            <Plus size={16} /> Quick Log Species
          </a>

          <button className="btn btn--danger btn--full" onClick={handleEnd}>
            <Square size={16} /> End Expedition
          </button>
        </div>
      )}
    </div>
  );
}
