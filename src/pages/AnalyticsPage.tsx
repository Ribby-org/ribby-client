import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart3, Globe, Plus, Trash2, Copy, Check,
  Users, Eye, TrendingUp, Monitor, Smartphone, Tablet,
  ExternalLink, Code, X, Loader2
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

// ── Mini bar chart ─────────────────────────────────────────────────────────
function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const last7 = data.slice(-14);
  return (
    <div className="flex items-end gap-1 h-20">
      {last7.map(({ date, count }) => (
        <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full bg-blue-500 rounded-sm transition-all duration-300 group-hover:bg-blue-400 min-h-[2px]"
            style={{ height: `${Math.max((count / max) * 100, count > 0 ? 8 : 2)}%` }}
          />
          <span className="text-[9px] text-gray-400 hidden group-hover:block absolute -bottom-4 whitespace-nowrap">
            {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = 'text-blue-600', bg = 'bg-blue-50' }: {
  label: string; value: string | number; icon: typeof Eye;
  color?: string; bg?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={14} className={color} />
        </div>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}

// ── Vitals score ───────────────────────────────────────────────────────────
function VitalScore({ label, value, unit = 'ms', good = 2500, poor = 4000 }: {
  label: string; value: number; unit?: string; good?: number; poor?: number;
}) {
  const color = value <= good ? 'text-green-600' : value <= poor ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="text-center">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}{unit}</p>
    </div>
  );
}

// ── Add domain modal ───────────────────────────────────────────────────────
function AddDomainModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, domain: string) => Promise<void> }) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onAdd(name, domain);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Add Application</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
        </div>
        <form onSubmit={handle} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">App name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="My App" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Domain</label>
            <input type="text" value={domain} onChange={e => setDomain(e.target.value)}
              placeholder="myapp.com or localhost:5173"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            <p className="text-[11px] text-gray-400 mt-1">Ribby identifies your app by this domain. No key needed.</p>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={!name || !domain || loading} className="w-full btn-primary justify-center disabled:opacity-50">
            {loading ? <><Loader2 size={14} className="animate-spin" />Adding…</> : 'Add Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Code snippet ───────────────────────────────────────────────────────────
function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-gray-900 rounded-lg p-4 text-xs font-mono text-gray-200 overflow-x-auto">
      <button onClick={copy} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
        {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
      </button>
      <pre className="whitespace-pre">{code}</pre>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { sites, stats, loading, statsLoading, fetchSites, fetchStats, addDomain, removeSite } = useAnalytics(orgId);
  const [tab, setTab] = useState<'overview' | 'setup'>('overview');
  const [showAdd, setShowAdd] = useState(false);
  const [range, setRange] = useState(30);

  useEffect(() => { fetchSites(); }, [fetchSites]);
  useEffect(() => { if (sites.length) fetchStats(range); }, [sites, range, fetchStats]);

  const handleAdd = async (name: string, domain: string) => {
    const result = await addDomain(name, domain);
    if (result?.error) throw new Error(result.error);
  };

  const installSnippet = `npm install ribby-sdk`;

  const reactSnippet = `// App.tsx\nimport { Analytics } from 'ribby-sdk/analytics-react'\n\nfunction App() {\n  return (\n    <>\n      <Analytics />\n      {/* rest of your app */}\n    </>\n  )\n}`;

  const nextSnippet = `// app/layout.tsx\nimport { Analytics } from 'ribby-sdk/analytics-next'\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang="en">\n      <body>\n        <Analytics />\n        {children}\n      </body>\n    </html>\n  )\n}`;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto pb-24 md:pb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {sites.length > 0 ? `${sites.length} app${sites.length !== 1 ? 's' : ''} connected` : 'Track visitors and Web Vitals across your apps'}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={14} /> Add App
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(['overview', 'setup'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'overview' ? 'Overview' : 'Setup'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          {sites.length === 0 ? (
            <div className="card p-14 text-center">
              <BarChart3 size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">No apps connected yet</p>
              <p className="text-xs text-gray-400 mb-5">Add your app's domain and install ribby-sdk to start tracking.</p>
              <div className="flex items-center gap-2 justify-center">
                <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={14} />Add App</button>
                <button onClick={() => setTab('setup')} className="btn-ghost"><Code size={14} />View Setup</button>
              </div>
            </div>
          ) : (
            <>
              {/* Range selector */}
              <div className="flex items-center gap-2 mb-5">
                {[7, 30, 90].map(d => (
                  <button key={d} onClick={() => setRange(d)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${range === d ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                    {d}d
                  </button>
                ))}
                <span className="text-xs text-gray-400 ml-auto">
                  {sites.map(s => s.domain).join(', ')}
                </span>
              </div>

              {statsLoading ? (
                <div className="card p-10 text-center"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : stats ? (
                <>
                  {/* Stats cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <StatCard label="Total Pageviews" value={stats.totalPageviews} icon={Eye} color="text-blue-600" bg="bg-blue-50" />
                    <StatCard label="Unique Sessions" value={stats.uniqueSessions} icon={Users} color="text-violet-600" bg="bg-violet-50" />
                    <StatCard label="Today" value={stats.todayViews} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
                    <StatCard label="Apps tracked" value={sites.length} icon={Globe} color="text-orange-500" bg="bg-orange-50" />
                  </div>

                  {/* Traffic chart */}
                  <div className="card p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-gray-900">Traffic — last {Math.min(range, 14)} days</p>
                      <p className="text-xs text-gray-400">{stats.totalPageviews} total views</p>
                    </div>
                    <BarChart data={stats.dailyViews} />
                    <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
                      <span>{stats.dailyViews[Math.max(0, stats.dailyViews.length - 14)]?.date}</span>
                      <span>Today</span>
                    </div>
                  </div>

                  {/* Tables row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Top pages */}
                    <div className="card p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Top Pages</p>
                      {stats.topPages.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
                      ) : stats.topPages.map(({ url, count }) => (
                        <div key={url} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-700 truncate flex-1 font-mono">{url}</span>
                          <span className="text-xs font-semibold text-gray-500 flex-shrink-0">{count}</span>
                        </div>
                      ))}
                    </div>

                    {/* Top referrers */}
                    <div className="card p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Top Referrers</p>
                      {stats.topReferrers.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
                      ) : stats.topReferrers.map(({ referrer, count }) => (
                        <div key={referrer} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-700 truncate flex-1">{referrer === 'Direct' ? 'Direct / None' : referrer}</span>
                          <span className="text-xs font-semibold text-gray-500 flex-shrink-0">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device + Browser + Vitals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Devices */}
                    <div className="card p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Devices</p>
                      <div className="space-y-2">
                        {[
                          { key: 'desktop', icon: Monitor, label: 'Desktop' },
                          { key: 'mobile',  icon: Smartphone, label: 'Mobile' },
                          { key: 'tablet',  icon: Tablet, label: 'Tablet' },
                        ].map(({ key, icon: Icon, label }) => {
                          const entry = stats.deviceBreakdown.find(d => d.device === key);
                          const count = entry?.count ?? 0;
                          const total = stats.deviceBreakdown.reduce((a, b) => a + b.count, 0) || 1;
                          return (
                            <div key={key} className="flex items-center gap-2">
                              <Icon size={13} className="text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600 w-14">{label}</span>
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                              </div>
                              <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Browsers */}
                    <div className="card p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Browsers</p>
                      <div className="space-y-2">
                        {stats.browserBreakdown.map(({ browser, count }) => {
                          const total = stats.browserBreakdown.reduce((a, b) => a + b.count, 0) || 1;
                          return (
                            <div key={browser} className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 w-14 truncate">{browser}</span>
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                              </div>
                              <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                            </div>
                          );
                        })}
                        {stats.browserBreakdown.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No data</p>}
                      </div>
                    </div>

                    {/* Web Vitals */}
                    <div className="card p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Web Vitals</p>
                      {stats.avgVitals ? (
                        <div className="grid grid-cols-2 gap-3">
                          <VitalScore label="LCP" value={stats.avgVitals.lcp} good={2500} poor={4000} />
                          <VitalScore label="FID" value={stats.avgVitals.fid} good={100} poor={300} />
                          <VitalScore label="CLS" value={stats.avgVitals.cls} unit="" good={0.1} poor={0.25} />
                          <VitalScore label="TTFB" value={stats.avgVitals.ttfb} good={800} poor={1800} />
                          <VitalScore label="FCP" value={stats.avgVitals.fcp} good={1800} poor={3000} />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-6">No vitals data yet.<br />Make sure vitals=true in your Analytics component.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}

          {/* Connected apps list */}
          {sites.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">Connected Applications</p>
              <div className="space-y-2">
                {sites.map(site => (
                  <div key={site.id} className="card p-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Globe size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{site.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{site.domain}</p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-300 hidden md:block">{site.site_key.slice(0, 8)}…</span>
                    <a href={`https://${site.domain}`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors">
                      <ExternalLink size={13} />
                    </a>
                    <button onClick={() => removeSite(site.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── SETUP ── */}
      {tab === 'setup' && (
        <div className="space-y-6 max-w-2xl">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">How it works</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Install <code className="font-mono bg-gray-100 px-1 rounded">ribby-sdk</code> in your app.
              Ribby identifies your app by its domain. No API key, no configuration needed.
              Just register your domain above and add the component.
            </p>
            <div className="flex items-start gap-3">
              {[
                { n: '1', label: 'Register your domain', sub: 'Click "Add App" and enter your app\'s domain' },
                { n: '2', label: 'Install the package', sub: 'npm install ribby-sdk' },
                { n: '3', label: 'Add the component', sub: 'Drop <Analytics /> into your root file' },
              ].map(({ n, label, sub }) => (
                <div key={n} className="flex-1 text-center">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">{n}</div>
                  <p className="text-xs font-semibold text-gray-800 mb-0.5">{label}</p>
                  <p className="text-[11px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Install — separate block */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">1. Install</p>
            <CodeSnippet code={installSnippet} />
          </div>

          {/* React integration */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">2. React / Vite</p>
            <CodeSnippet code={reactSnippet} />
          </div>

          {/* Next.js integration */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">2. Next.js</p>
            <CodeSnippet code={nextSnippet} />
          </div>

          {/* Custom events */}
          <div className="card p-4 border-blue-100 bg-blue-50">
            <p className="text-xs font-semibold text-blue-800 mb-1">Track custom events</p>
            <p className="text-xs text-blue-700 mb-3">Use wrappers to track clicks and views without changing your existing code.</p>
            <CodeSnippet code={`import { TrackClick, TrackView } from 'ribby-sdk/analytics-react'\n\n<TrackClick event="signup_clicked">\n  <button>Sign Up</button>\n</TrackClick>\n\n<TrackView event="pricing_viewed">\n  <section>Pricing...</section>\n</TrackView>`} />
          </div>
        </div>
      )}

      {showAdd && (
        <AddDomainModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
