import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import type { ScanResult, ScanType } from '../types/scan';

export interface DbScan {
  id: string;
  organization_id: string;
  user_id: string;
  url: string;
  type: ScanType;
  score: number;
  findings: ScanResult['findings'];
  summary: ScanResult['summary'];
  meta: ScanResult['meta'];
  load_stats: ScanResult['loadStats'] | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UrlGroup {
  url: string;
  lastUpdated: string;
  tests: Partial<Record<ScanType, DbScan>>;
}

export function useScans(orgId: string | undefined) {
  const [groups, setGroups] = useState<UrlGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchScans = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError('');

    const { data, error: err } = await supabase
      .from('scans')
      .select('*')
      .eq('organization_id', orgId)
      .order('updated_at', { ascending: false });

    if (err) { setError(err.message); setLoading(false); return; }

    const map = new Map<string, UrlGroup>();
    for (const scan of (data as DbScan[])) {
      if (!map.has(scan.url)) {
        map.set(scan.url, { url: scan.url, lastUpdated: scan.updated_at, tests: {} });
      }
      const group = map.get(scan.url)!;
      group.tests[scan.type] = scan;
      if (scan.updated_at > group.lastUpdated) group.lastUpdated = scan.updated_at;
    }

    setGroups(Array.from(map.values()).sort((a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    ));
    setLoading(false);
  }, [orgId]);

  const saveScan = async (result: ScanResult, organizationId: string, userId: string) => {
    const { error: err } = await supabase
      .from('scans')
      .upsert({
        organization_id: organizationId,
        user_id: userId,
        url: result.url,
        type: result.type,
        score: result.summary.score,
        findings: result.findings,
        summary: result.summary,
        meta: result.meta,
        load_stats: result.loadStats ?? null,
        error: result.error ?? null,
        started_at: result.startedAt,
        completed_at: result.completedAt ?? null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'organization_id,url,type' });

    if (err) { console.error('Failed to save scan:', err.message); return; }
    await fetchScans();
  };

  // Delete a single test type for a URL — confirms DB deletion before updating UI
  const deleteScan = async (url: string, type: ScanType): Promise<string | null> => {
    if (!orgId) return 'Not authenticated';

    const { error: err } = await supabase
      .from('scans')
      .delete()
      .eq('organization_id', orgId)
      .eq('url', url)
      .eq('type', type);

    if (err) return err.message;

    // Only update local state after confirmed DB deletion
    await fetchScans();
    return null;
  };

  // Delete all test types for a URL — confirms DB deletion before updating UI
  const deleteUrl = async (url: string): Promise<string | null> => {
    if (!orgId) return 'Not authenticated';

    const { error: err } = await supabase
      .from('scans')
      .delete()
      .eq('organization_id', orgId)
      .eq('url', url);

    if (err) return err.message;

    // Only remove from local state after confirmed DB deletion
    setGroups(prev => prev.filter(g => g.url !== url));
    return null;
  };

  return { groups, loading, error, fetchScans, saveScan, deleteScan, deleteUrl };
}
