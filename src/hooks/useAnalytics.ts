import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsSite {
  id: string;
  organization_id: string;
  name: string;
  domain: string | null;
  site_key: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  site_key: string;
  type: string;
  page_url: string | null;
  referrer: string | null;
  device: string | null;
  browser: string | null;
  session_id: string | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  created_at: string;
}

export interface AnalyticsStats {
  totalPageviews: number;
  uniqueSessions: number;
  todayViews: number;
  topPages: { url: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  dailyViews: { date: string; count: number }[];
  avgVitals: { lcp: number; fid: number; cls: number; ttfb: number; fcp: number } | null;
}

export function useAnalytics(orgId: string | undefined) {
  const [sites, setSites] = useState<AnalyticsSite[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSites = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('analytics_sites')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setSites((data as AnalyticsSite[]) ?? []);
    setLoading(false);
  }, [orgId]);

  const addDomain = async (name: string, domain: string) => {
    if (!orgId) return { error: 'Not authenticated' };
    const siteKey = uuidv4();
    const { error: err } = await supabase.from('analytics_sites').insert({
      organization_id: orgId,
      name: name.trim(),
      domain: domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''),
      site_key: siteKey
    });
    if (err) return { error: err.message };
    await fetchSites();
    return { siteKey };
  };

  const removeSite = async (id: string) => {
    await supabase.from('analytics_sites').delete().eq('id', id);
    setSites(prev => prev.filter(s => s.id !== id));
  };

  const fetchStats = useCallback(async (days = 30) => {
    if (!sites.length) return;
    setStatsLoading(true);

    const siteKeys = sites.map(s => s.site_key);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const today = new Date().toISOString().slice(0, 10);

    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .in('site_key', siteKeys)
      .gte('created_at', since)
      .eq('type', 'pageview')
      .order('created_at', { ascending: false })
      .limit(5000);

    const { data: vitalEvents } = await supabase
      .from('analytics_events')
      .select('lcp,fid,cls,ttfb,fcp')
      .in('site_key', siteKeys)
      .gte('created_at', since)
      .eq('type', 'vitals')
      .limit(1000);

    const evts = (events as AnalyticsEvent[]) ?? [];

    // Aggregate
    const sessionSet = new Set(evts.map(e => e.session_id).filter(Boolean));
    const todayEvts = evts.filter(e => e.created_at.startsWith(today));

    const pageCounts = new Map<string, number>();
    const refCounts = new Map<string, number>();
    const deviceCounts = new Map<string, number>();
    const browserCounts = new Map<string, number>();
    const dayCounts = new Map<string, number>();

    for (const e of evts) {
      const page = e.page_url ? new URL(e.page_url).pathname : '/';
      pageCounts.set(page, (pageCounts.get(page) ?? 0) + 1);

      const ref = e.referrer || 'Direct';
      refCounts.set(ref, (refCounts.get(ref) ?? 0) + 1);

      const dev = e.device || 'unknown';
      deviceCounts.set(dev, (deviceCounts.get(dev) ?? 0) + 1);

      const br = e.browser || 'unknown';
      browserCounts.set(br, (browserCounts.get(br) ?? 0) + 1);

      const day = e.created_at.slice(0, 10);
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }

    // Fill missing days
    const dailyViews: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      dailyViews.push({ date: d, count: dayCounts.get(d) ?? 0 });
    }

    // Web Vitals avg
    const vitals = (vitalEvents as Partial<AnalyticsEvent>[]) ?? [];
    const avgVitals = vitals.length > 0 ? {
      lcp:  Math.round(vitals.reduce((a, v) => a + (v.lcp ?? 0), 0) / vitals.length),
      fid:  Math.round(vitals.reduce((a, v) => a + (v.fid ?? 0), 0) / vitals.length),
      cls:  Math.round(vitals.reduce((a, v) => a + (v.cls ?? 0), 0) / vitals.length * 1000) / 1000,
      ttfb: Math.round(vitals.reduce((a, v) => a + (v.ttfb ?? 0), 0) / vitals.length),
      fcp:  Math.round(vitals.reduce((a, v) => a + (v.fcp ?? 0), 0) / vitals.length),
    } : null;

    setStats({
      totalPageviews: evts.length,
      uniqueSessions: sessionSet.size,
      todayViews: todayEvts.length,
      topPages: [...pageCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([url, count]) => ({ url, count })),
      topReferrers: [...refCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([referrer, count]) => ({ referrer, count })),
      deviceBreakdown: [...deviceCounts.entries()].map(([device, count]) => ({ device, count })),
      browserBreakdown: [...browserCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([browser, count]) => ({ browser, count })),
      dailyViews,
      avgVitals,
    });
    setStatsLoading(false);
  }, [sites]);

  return { sites, stats, loading, statsLoading, error, fetchSites, fetchStats, addDomain, removeSite };
}
