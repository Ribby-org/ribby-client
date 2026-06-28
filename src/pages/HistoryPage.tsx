import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Trash2, History, Shield, Zap, Eye, Wrench, Activity, ChevronDown, ChevronUp, ExternalLink, Globe, Lock, Mail, Link, KeyRound } from 'lucide-react';
import { useScans, type UrlGroup, type DbScan } from '../hooks/useScans';
import type { ScanType } from '../types/scan';
import FindingCard from '../components/results/FindingCard';
import ScoreRing from '../components/results/ScoreRing';

const TYPE_META: Record<ScanType, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  security:      { label: 'Safety',      icon: Shield,   color: 'text-red-500',     bg: 'bg-red-50' },
  performance:   { label: 'Performance', icon: Zap,      color: 'text-orange-500',  bg: 'bg-orange-50' },
  load:          { label: 'Load',        icon: Activity, color: 'text-green-600',   bg: 'bg-green-50' },
  accessibility: { label: 'Access.',     icon: Eye,      color: 'text-blue-500',    bg: 'bg-blue-50' },
  functional:    { label: 'Functional',  icon: Wrench,   color: 'text-violet-500',  bg: 'bg-violet-50' },
  seo:           { label: 'SEO',         icon: Globe,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ssl:           { label: 'SSL',         icon: Lock,     color: 'text-blue-600',    bg: 'bg-blue-50' },
  dns:           { label: 'DNS',         icon: Mail,     color: 'text-violet-600',  bg: 'bg-violet-50' },
  links:         { label: 'Links',       icon: Link,     color: 'text-rose-500',    bg: 'bg-rose-50' },
  crypto:        { label: 'Crypto',      icon: KeyRound, color: 'text-amber-500',   bg: 'bg-amber-50' }
};

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function ScanDetail({ scan }: { scan: DbScan }) {
  const meta = TYPE_META[scan.type];
  const Icon = meta.icon;
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={13} className={meta.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-gray-700">{meta.label}</span>
            <span className={`text-xs font-bold ${scoreColor(scan.score)}`}>{scan.score}/100</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {scan.summary.critical > 0 && <span className="severity-badge severity-critical">{scan.summary.critical} critical</span>}
            {scan.summary.high > 0 && <span className="severity-badge severity-high">{scan.summary.high} high</span>}
            {scan.summary.medium > 0 && <span className="severity-badge severity-medium">{scan.summary.medium} medium</span>}
            {scan.summary.low > 0 && <span className="severity-badge severity-low">{scan.summary.low} low</span>}
            {scan.summary.total === 0 && <span className="text-[11px] text-green-600 font-medium">No issues</span>}
          </div>
        </div>

        {scan.load_stats && (
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-400 mr-2">
            <span>Avg <strong className="text-gray-700">{scan.load_stats.avgTime}ms</strong></span>
            <span>P95 <strong className="text-gray-700">{scan.load_stats.p95Time}ms</strong></span>
            <span>Success <strong className={scan.load_stats.successRate >= 95 ? 'text-green-600' : 'text-red-500'}>{scan.load_stats.successRate}%</strong></span>
          </div>
        )}

        <span className="text-[11px] text-gray-400 mr-2 hidden sm:block">
          {scan.completed_at ? new Date(scan.completed_at).toLocaleTimeString() : ''}
        </span>

        {open ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
          {scan.findings.length > 0 ? (
            <div className="space-y-2">
              {scan.findings.map((f, i) => (
                <FindingCard key={f.id} finding={f} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400 py-2">No issues found in this test.</p>
          )}
        </div>
      )}
    </div>
  );
}

function UrlCard({ group, onDelete, onNavigate, onDeleting }: {
  group: UrlGroup;
  onDelete: (url: string) => void;
  onNavigate: (url: string) => void;
  onDeleting: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const tests = Object.values(group.tests).filter(Boolean) as DbScan[];
  const scores = tests.map(t => t.score);
  const worstScore = scores.length ? Math.min(...scores) : 0;
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="card overflow-hidden">
      <div className="p-4">
        {/* Top row: score + url + actions */}
        <div className="flex items-start gap-3 min-w-0">
          <ScoreRing score={worstScore} size={52} />

          <div className="flex-1 min-w-0">
            {/* URL */}
            <div
              className="flex items-center gap-1 cursor-pointer group mb-1"
              onClick={() => onNavigate(group.url)}
            >
              <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors min-w-0">
                {group.url}
              </p>
              <ExternalLink size={10} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
            </div>

            {scores.length > 1 && (
              <p className={`text-[11px] font-medium mb-1.5 ${scoreColor(avgScore)}`}>avg score: {avgScore}</p>
            )}

            {/* Test pills — wraps on small screens */}
            <div className="flex flex-wrap gap-1 mb-1.5">
              {(Object.keys(TYPE_META) as ScanType[]).map(type => {
                const scan = group.tests[type];
                const meta = TYPE_META[type];
                const Icon = meta.icon;
                if (!scan) return null;
                return (
                  <div key={type} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.bg} ${meta.color}`}>
                    <Icon size={9} />
                    {meta.label}
                    <span className="opacity-70 ml-0.5">{scan.score}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-gray-400">
              {new Date(group.lastUpdated).toLocaleDateString()} · {tests.length} of 5 tests
            </p>
          </div>

          {/* Actions — stacked to save width */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title={expanded ? 'Hide' : 'Details'}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={() => onDelete(group.url)}
              disabled={!!onDeleting && onDeleting === group.url}
              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete"
            >
              {onDeleting === group.url
                ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                : <Trash2 size={14} />
              }
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
          {(Object.keys(TYPE_META) as ScanType[]).map(type => {
            const scan = group.tests[type];
            if (!scan) return null;
            return <ScanDetail key={type} scan={scan} />;
          })}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { groups, loading, error, fetchScans, deleteUrl } = useScans(orgId);
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  const handleDelete = async (url: string) => {
    setDeleting(url);
    setDeleteError(null);
    const err = await deleteUrl(url);
    if (err) setDeleteError(`Failed to delete: ${err}`);
    setDeleting(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Scan History</h1>
          <p className="text-sm text-gray-400 mt-0.5">All scan results for this organization</p>
        </div>
        <button onClick={() => navigate(`/org/${orgId}/scanner`)} className="btn-primary">
          New Scan
        </button>
      </div>

      {(error || deleteError) && (
        <div className="card p-4 mb-4 border-red-100 bg-red-50 text-sm text-red-600">{deleteError || error}</div>
      )}

      {loading ? (
        <div className="card p-10 text-center">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : groups.length === 0 ? (
        <div className="card p-14 text-center">
          <History size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium mb-1">No scans yet</p>
          <p className="text-xs text-gray-400">Run a test to see results here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <UrlCard
              key={group.url}
              group={group}
              onDelete={handleDelete}
              onDeleting={deleting}
              onNavigate={url => navigate(`/org/${orgId}/hub`, { state: { url } })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
