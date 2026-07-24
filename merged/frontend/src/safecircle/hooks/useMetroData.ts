import { useState, useEffect } from 'react';
import type { MetroData, Station, Disruption } from '../types';

export function useMetroData(): MetroData {
  const [stations, setStations] = useState<Station[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [disruptionMap, setDisruptionMap] = useState<Map<string, Disruption>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const base = import.meta.env.BASE_URL;
        const [stationsRes, disruptionsRes] = await Promise.all([
          fetch(base + 'safecircle-stations.json'),
          fetch(base + 'safecircle-disruptions.json')
        ]);

        if (!stationsRes.ok) throw new Error('Failed to fetch stations data');
        if (!disruptionsRes.ok) throw new Error('Failed to fetch disruptions data');

        const stationsData: Station[] = await stationsRes.json();
        const disruptionsData: Disruption[] = await disruptionsRes.json();

        if (mounted) {
          setStations(stationsData);
          setDisruptions(disruptionsData);

          const map = new Map<string, Disruption>();
          for (const d of disruptionsData) {
            map.set(d.stationId, d);
          }
          setDisruptionMap(map);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return { stations, disruptions, disruptionMap, loading, error };
}
