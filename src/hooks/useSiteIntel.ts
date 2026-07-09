import { useState, useEffect } from 'react';
import axios from 'axios';
import type { ScanMeta } from '../types/scan';
import { apiUrl, apiHeaders } from '../utils/api';

export function useSiteIntel(url: string | undefined) {
  const [meta, setMeta] = useState<ScanMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!url) {
      setMeta(null);
      setLoading(false);
      setError('');
      setStep(0);
      return;
    }

    let cancelled = false;
    setMeta(null);
    setLoading(true);
    setError('');
    setStep(0);

    const stepTimer = setInterval(() => {
      setStep(s => Math.min(s + 1, 3));
    }, 1200);

    axios
      .post<ScanMeta>(apiUrl('/api/site/intel'), { url }, { headers: apiHeaders() })
      .then(({ data }) => {
        if (!cancelled) {
          setMeta(data);
          setStep(4);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not reach this site. It may be down or blocking scanner requests.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        clearInterval(stepTimer);
      });

    return () => {
      cancelled = true;
      clearInterval(stepTimer);
    };
  }, [url]);

  return { meta, loading, error, step };
}
