import { useCallback, useEffect, useState } from 'react';
import { Expedition } from '../types/sighting';
import { sightingService } from '../services/sightingService';

export function useExpedition() {
  const [expedition, setExpedition] = useState<Expedition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpedition = async () => {
      try {
        const active = await sightingService.getActiveExpedition();
        setExpedition(active);
      } catch {
        setExpedition(null);
      } finally {
        setLoading(false);
      }
    };
    loadExpedition();
  }, []);

  const startExpedition = useCallback(async (name: string) => {
    const newExpedition = await sightingService.startExpedition(name);
    setExpedition(newExpedition);
    return newExpedition;
  }, []);

  const endExpedition = useCallback(async () => {
    if (expedition) {
      const ended = await sightingService.endExpedition(expedition.id);
      setExpedition(null);
      return ended;
    }
    return null;
  }, [expedition]);

  return {
    expedition,
    isActive: !!expedition,
    loading,
    startExpedition,
    endExpedition,
  };
}
