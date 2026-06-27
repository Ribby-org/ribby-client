import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';

export type BugSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type BugStatus   = 'open' | 'in_progress' | 'fixed' | 'closed' | 'wont_fix';

export interface BugReport {
  id: string;
  organization_id: string;
  user_id: string | null;
  title: string;
  url: string | null;
  severity: BugSeverity;
  status: BugStatus;
  description: string | null;
  steps: string | null;
  expected: string | null;
  actual: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface BugReportDraft {
  title: string;
  url: string;
  severity: BugSeverity;
  status: BugStatus;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  category: string;
}

export function useBugReports(orgId: string | undefined) {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBugs = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('bug_reports')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setBugs((data as BugReport[]) ?? []);
    setLoading(false);
  }, [orgId]);

  const createBug = async (draft: BugReportDraft) => {
    if (!orgId) return { error: 'Not authenticated' };
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: err } = await supabase
      .from('bug_reports')
      .insert({
        organization_id: orgId,
        user_id: user?.id ?? null,
        title:       draft.title.trim(),
        url:         draft.url.trim()         || null,
        severity:    draft.severity,
        status:      draft.status,
        description: draft.description.trim() || null,
        steps:       draft.steps.trim()       || null,
        expected:    draft.expected.trim()    || null,
        actual:      draft.actual.trim()      || null,
        category:    draft.category.trim()    || null,
      })
      .select()
      .single();
    if (err) return { error: err.message };
    setBugs(prev => [data as BugReport, ...prev]);
    return { bug: data as BugReport };
  };

  const updateBug = async (id: string, patch: Partial<BugReportDraft & { status: BugStatus }>) => {
    const { error: err } = await supabase
      .from('bug_reports')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) return { error: err.message };
    setBugs(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
    return {};
  };

  const deleteBug = async (id: string) => {
    await supabase.from('bug_reports').delete().eq('id', id);
    setBugs(prev => prev.filter(b => b.id !== id));
  };

  return { bugs, loading, error, fetchBugs, createBug, updateBug, deleteBug };
}
