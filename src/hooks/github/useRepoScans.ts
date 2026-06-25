import { useState, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import type { RepoFinding } from '../../../server/scanners/repo';

export interface DbRepoScan {
  id: string;
  organization_id: string;
  user_id: string;
  repo_url: string;
  owner: string;
  repo: string;
  default_branch: string;
  score: number;
  findings: RepoFinding[];
  summary: { critical: number; high: number; medium: number; low: number; info: number; total: number; score: number };
  meta: { filesScanned: number; depsChecked: number; language: string[] };
  error: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useRepoScans(orgId: string | undefined) {
  const [scans, setScans] = useState<DbRepoScan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchScans = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('repo_scans')
      .select('*')
      .eq('organization_id', orgId)
      .order('updated_at', { ascending: false });

    if (err) setError(err.message);
    else setScans((data as DbRepoScan[]) ?? []);
    setLoading(false);
  }, [orgId]);

  const deleteRepo = async (repoUrl: string) => {
    if (!orgId) return;
    await supabase.from('repo_scans').delete().eq('organization_id', orgId).eq('repo_url', repoUrl);
    setScans(prev => prev.filter(s => s.repo_url !== repoUrl));
  };

  return { scans, loading, error, fetchScans, deleteRepo };
}
