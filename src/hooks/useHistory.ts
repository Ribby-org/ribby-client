import { useState } from 'react';
import type { ScanResult, ScanType } from '../types/scan';

export interface HistoryEntry {
  url: string;
  lastUpdated: string;
  tests: Partial<Record<ScanType, ScanResult>>;
}

const KEY = 'ribby_history';

function load(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(load);

  const save = (result: ScanResult) => {
    setEntries(prev => {
      const next = [...prev];
      const idx = next.findIndex(e => e.url === result.url);
      const updated = result.completedAt || result.startedAt;

      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          lastUpdated: updated,
          tests: { ...next[idx].tests, [result.type]: result }
        };
      } else {
        next.unshift({ url: result.url, lastUpdated: updated, tests: { [result.type]: result } });
      }

      persist(next);
      return next;
    });
  };

  const remove = (url: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.url !== url);
      persist(next);
      return next;
    });
  };

  const clear = () => {
    localStorage.removeItem(KEY);
    setEntries([]);
  };

  return { entries, save, remove, clear };
}
