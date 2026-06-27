import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  Github, Search, Loader2, AlertTriangle, ChevronDown,
  MapPin, Lightbulb, Shield, Package, FolderOpen, Settings,
  Lock, Globe, RefreshCw, Play, X, Filter, Download
} from 'lucide-react';
import { downloadRepoReport } from '../../pdf/RibbyPDF';
import axios from 'axios';
import { apiUrl, apiHeaders } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useGitHubRepos, type GitHubRepo } from '../../hooks/github/useGitHubRepos';
import { useRepoScans, type DbRepoScan } from '../../hooks/github/useRepoScans';
import { supabase } from '../../utils/supabase';
import type { RepoScanResult, RepoFinding } from '../../types/repo';

// ── Finding detail ────────────────────────────────────────────────────────────
const CAT_META: Record<RepoFinding['category'], { label: string; icon: typeof Shield; color: string; bg: string }> = {
  secret:     { label: 'Secret',     icon: Shield,     color: 'text-red-500',    bg: 'bg-red-50' },
  dependency: { label: 'Dependency', icon: Package,    color: 'text-orange-500', bg: 'bg-orange-50' },
  exposure:   { label: 'Exposure',   icon: FolderOpen, color: 'text-violet-500', bg: 'bg-violet-50' },
  config:     { label: 'Config',     icon: Settings,   color: 'text-blue-500',   bg: 'bg-blue-50' }
};

function FindingRow({ finding, index }: { finding: RepoFinding; index: number }) {
  const [open, setOpen] = useState(index < 1);
  const cat = CAT_META[finding.category];
  const CatIcon = cat.icon;
  const SEV_DOT: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-amber-400', low: 'bg-green-500', info: 'bg-blue-500' };
  const SEV_BADGE: Record<string, string> = { critical: 'severity-critical', high: 'severity-high', medium: 'severity-medium', low: 'severity-low', info: 'severity-info' };

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-2.5 px-3.5 py-3 text-left hover:bg-gray-50 transition-colors">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${SEV_DOT[finding.severity]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className={`severity-badge ${SEV_BADGE[finding.severity]}`}>{finding.severity}</span>
            <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${cat.bg} ${cat.color}`}>
              <CatIcon size={9} />{cat.label}
            </span>
            {finding.cve && <span className="text-[10px] font-mono text-gray-400">{finding.cve}</span>}
          </div>
          <p className="text-xs font-medium text-gray-800 leading-snug">{finding.title}</p>
          {finding.file && <p className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400 font-mono"><MapPin size={10} />{finding.file}{finding.line ? `:${finding.line}` : ''}</p>}
        </div>
        <ChevronDown size={14} className={`flex-shrink-0 text-gray-400 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 border-t border-gray-100 pt-3 space-y-2.5">
          <p className="text-xs text-gray-500 leading-relaxed">{finding.description}</p>
          {finding.fixVersion && <p className="text-xs text-green-600 font-medium">Fix available: v{finding.fixVersion}</p>}
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1"><Lightbulb size={11} className="text-blue-600" /><span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Fix</span></div>
            <p className="text-xs text-gray-600 leading-relaxed">{finding.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Severity circles ──────────────────────────────────────────────────────────
function SevDot({ n, ring }: { n: number; ring: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold border ${n > 0 ? ring : 'text-[#4e4b60] border-[#2e2a42]'}`}
      style={n === 0 ? { backgroundColor: '#1d1a2b' } : undefined}>
      {n}
    </span>
  );
}

// ── Table row ─────────────────────────────────────────────────────────────────
function RepoTableRow({
  repo, dbScan, onScan, scanning
}: {
  repo: GitHubRepo;
  dbScan?: DbRepoScan;
  onScan: (repo: GitHubRepo) => void;
  scanning: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const s = dbScan?.summary;

  return (
    <>
      <tr className="transition-colors" style={{ borderBottom: '1px solid #2e2a42' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
        {/* Repo name */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <a href={repo.html_url} target="_blank" rel="noreferrer"
                  className="text-sm font-medium hover:text-blue-400 transition-colors truncate"
                  style={{ color: '#ede9ff' }}
                  onClick={e => e.stopPropagation()}
                >
                  {repo.name}
                </a>
                {repo.private ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ backgroundColor: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.3)' }}>
                    <Lock size={9} /> Private
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
                    <Globe size={9} /> Public
                  </span>
                )}
              </div>
              {repo.description && (
                <p className="text-[11px] truncate max-w-xs" style={{ color: '#6b6880' }}>{repo.description}</p>
              )}
            </div>
          </div>
        </td>

        {/* Language */}
        <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: '#9390aa' }}>
          {repo.language ?? <span style={{ color: '#4e4b60' }}>—</span>}
        </td>

        {/* Issues */}
        <td className="px-5 py-3.5">
          {s ? (
            <div className="flex items-center gap-1.5">
              <SevDot n={s.critical} ring="bg-red-950/60 text-red-400 border-red-800" />
              <SevDot n={s.high}     ring="bg-orange-950/60 text-orange-400 border-orange-800" />
              <SevDot n={s.medium}   ring="bg-amber-950/60 text-amber-400 border-amber-800" />
              <SevDot n={s.low}      ring="bg-green-950/60 text-green-400 border-green-800" />
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Not scanned</span>
          )}
        </td>

        {/* Last scan */}
        <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: '#6b6880' }}>
          {dbScan?.completed_at
            ? new Date(dbScan.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : <span style={{ color: '#4e4b60' }}>—</span>
          }
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5 whitespace-nowrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onScan(repo)}
              disabled={scanning}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 ${
                scanning ? 'cursor-not-allowed' : ''
              } ${!dbScan && !scanning ? 'bg-violet-700 hover:bg-violet-800 text-white' : ''}`}
              style={scanning
                ? { backgroundColor: 'rgba(255,255,255,0.06)', color: '#6b6880' }
                : dbScan
                ? { backgroundColor: 'rgba(255,255,255,0.06)', color: '#9390aa', border: '1px solid #2e2a42' }
                : undefined}
            >
              {scanning
                ? <><Loader2 size={11} className="animate-spin" /> Scanning…</>
                : dbScan
                ? <><RefreshCw size={11} /> Re-scan</>
                : <><Play size={11} /> Scan</>
              }
            </button>

            {dbScan && dbScan.findings.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap underline underline-offset-2"
              >
                {expanded ? 'Hide' : `${dbScan.findings.length} findings`}
              </button>
            )}

            {dbScan && (
              <button
                onClick={() => downloadRepoReport(dbScan as unknown as RepoScanResult)}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: '#6b6880' }}
                title="Download PDF report"
              >
                <Download size={13} />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded findings */}
      {expanded && dbScan && (
        <tr style={{ borderBottom: '1px solid #2e2a42' }}>
          <td colSpan={5} className="px-5 py-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {dbScan.findings.map((f, i) => <FindingRow key={f.id} finding={f} index={i} />)}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Mobile card (must be a component so it can use useState) ─────────────────
function RepoMobileCard({ repo, dbScan, onScan, scanning }: {
  repo: GitHubRepo;
  dbScan?: DbRepoScan;
  onScan: (repo: GitHubRepo) => void;
  scanning: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const s = dbScan?.summary;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <a href={repo.html_url} target="_blank" rel="noreferrer"
              className="text-sm font-semibold text-gray-800 hover:text-blue-600 truncate">
              {repo.name}
            </a>
            {repo.private ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
                <Lock size={9} /> Private
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 border border-blue-100 flex-shrink-0">
                <Globe size={9} /> Public
              </span>
            )}
          </div>
          {repo.language && <span className="text-[11px] text-gray-400">{repo.language}</span>}
        </div>
        <button
          onClick={() => onScan(repo)}
          disabled={scanning}
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            scanning ? 'bg-gray-100 text-gray-400' :
            dbScan ? 'bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600' :
            'bg-violet-700 hover:bg-violet-800 text-white'
          }`}
        >
          {scanning ? <Loader2 size={11} className="animate-spin" /> : dbScan ? <RefreshCw size={11} /> : <Play size={11} />}
          {scanning ? 'Scanning…' : dbScan ? 'Re-scan' : 'Scan'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        {s ? (
          <div className="flex items-center gap-1">
            {([
              { n: s.critical, ring: 'bg-red-50 text-red-600 border-red-200' },
              { n: s.high,     ring: 'bg-orange-50 text-orange-600 border-orange-200' },
              { n: s.medium,   ring: 'bg-amber-50 text-amber-600 border-amber-200' },
              { n: s.low,      ring: 'bg-green-50 text-green-600 border-green-200' }
            ] as { n: number; ring: string }[]).map(({ n, ring }, i) => (
              <SevDot key={i} n={n} ring={ring} />
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Not scanned</span>
        )}
        <div className="flex items-center gap-2">
          {dbScan?.completed_at && (
            <span className="text-[11px] text-gray-400">{new Date(dbScan.completed_at).toLocaleDateString()}</span>
          )}
          {dbScan && dbScan.findings.length > 0 && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 underline underline-offset-2">
              {expanded ? 'Hide' : `${dbScan.findings.length} findings`}
            </button>
          )}
        </div>
      </div>

      {expanded && dbScan && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 max-h-72 overflow-y-auto">
          {dbScan.findings.map((f, i) => <FindingRow key={f.id} finding={f} index={i} />)}
        </div>
      )}
    </div>
  );
}

// ── Connect banner ────────────────────────────────────────────────────────────
function ConnectBanner({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="card p-14 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4">
        <Github size={24} className="text-white" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Connect your GitHub account</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
        Grant Ribby access to your repositories to list and scan them for vulnerabilities, secrets, and dependency issues.
      </p>
      <button onClick={onConnect} className="btn-primary mx-auto">
        <Github size={15} /> Connect GitHub
      </button>
      <p className="text-xs text-gray-400 mt-4">
        Requires <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">repo</code> scope. Only used for scanning — we never write to your repos.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RepoScanPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useAuth();
  const { repos, loading: ghLoading, error: ghError, connected, fetchRepos, connectGitHub, disconnect } = useGitHubRepos(orgId);
  const { scans, fetchScans } = useRepoScans(orgId);

  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [scanningUrl, setScanningUrl] = useState<string | null>(null);
  const [scanError, setScanError] = useState('');

  useEffect(() => { fetchRepos(); }, [fetchRepos]);
  useEffect(() => { fetchScans(); }, [fetchScans]);

  const handleConnect = () => connectGitHub();

  const handleScan = async (repo: GitHubRepo) => {
    const repoUrl = repo.html_url;
    setScanningUrl(repoUrl);
    setScanError('');

    try {
      // Send GitHub token for authenticated API calls (5000 req/hr vs 60)
      const { data: session } = await supabase.auth.getSession();
      const githubToken = session.session?.provider_token ?? undefined;
      const { data } = await axios.post(apiUrl('/api/repo-scan/start'), { repoUrl, githubToken }, { headers: apiHeaders() });
      const id: string = data.id;

      const poll = setInterval(async () => {
        try {
          const { data: result } = await axios.get<RepoScanResult>(apiUrl(`/api/repo-scan/${id}`), { headers: apiHeaders() });
          if (result.status === 'complete' || result.status === 'error') {
            clearInterval(poll);
            setScanningUrl(null);
            if (result.status === 'complete' && orgId && user) {
              await supabase.from('repo_scans').upsert({
                organization_id: orgId, user_id: user.id,
                repo_url: result.repoUrl, owner: result.owner, repo: result.repo,
                default_branch: result.defaultBranch, score: result.summary.score,
                findings: result.findings, summary: result.summary, meta: result.meta,
                completed_at: result.completedAt, updated_at: new Date().toISOString()
              }, { onConflict: 'organization_id,repo_url' });
              await fetchScans();
            } else if (result.error) {
              setScanError(result.error);
            }
          }
        } catch { clearInterval(poll); setScanningUrl(null); setScanError('Scan failed.'); }
      }, 1200);
    } catch { setScanningUrl(null); setScanError('Could not start scan.'); }
  };

  // Merge repos with scan data
  const scanMap = new Map(scans.map(s => [s.repo_url, s]));

  // Unique languages for filter
  const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean))) as string[];

  const filtered = repos.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || (r.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchLang = !langFilter || r.language === langFilter;
    return matchSearch && matchLang;
  });

  const scannedCount = repos.filter(r => scanMap.has(r.html_url)).length;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-6 min-w-0">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#ede9ff' }}>Repositories</h1>
          {connected && repos.length > 0 && (
            <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {repos.length} repos connected
            </span>
          )}
        </div>
        {connected && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRepos()}
              className="btn-ghost text-xs"
              disabled={ghLoading}
              title="Refresh repo list"
            >
              {ghLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Refresh
            </button>
            <button
              onClick={disconnect}
              className="btn-ghost text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
              title="Disconnect GitHub"
            >
              <X size={13} /> Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Scan error */}
      {scanError && (
        <div className="flex items-center gap-2 mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertTriangle size={14} />
          {scanError}
          <button onClick={() => setScanError('')} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {/* Not connected */}
      {!ghLoading && !connected && (
        <ConnectBanner onConnect={handleConnect} />
      )}

      {/* Loading */}
      {ghLoading && (
        <div className="card p-10 text-center">
          <Loader2 size={22} className="animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading repositories from GitHub…</p>
        </div>
      )}

      {/* Error */}
      {ghError && !ghLoading && (
        <div className="card p-6 text-center border-red-100">
          <AlertTriangle size={22} className="text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600 mb-4">{ghError}</p>
          <button onClick={handleConnect} className="btn-primary mx-auto">
            <Github size={14} /> Reconnect GitHub
          </button>
        </div>
      )}

      {/* Table */}
      {connected && !ghLoading && repos.length > 0 && (
        <>
          {/* Search + filter */}
          <div className="flex flex-wrap items-center gap-2 mb-5 mt-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#6b6880' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search repositories…"
                className="w-full rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                style={{ backgroundColor: '#1d1a2b', border: '1px solid #2e2a42', color: '#ede9ff' }}
              />
            </div>
            {languages.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={14} style={{ color: '#6b6880' }} />
                <select
                  value={langFilter}
                  onChange={e => setLangFilter(e.target.value)}
                  className="text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  style={{ backgroundColor: '#1d1a2b', border: '1px solid #2e2a42', color: '#ede9ff' }}
                >
                  <option value="">All languages</option>
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}
            <p className="text-xs ml-auto" style={{ color: '#6b6880' }}>
              {scannedCount} of {repos.length} scanned
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <colgroup>
                <col className="w-auto" />
                <col className="w-32" />
                <col className="w-52" />
                <col className="w-36" />
                <col className="w-44" />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: '1px solid #2e2a42', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  {[
                    { label: 'Repo name' },
                    { label: 'Language' },
                    { label: 'Issues', sub: ['C','H','M','L'] },
                    { label: 'Last scan' },
                    { label: '' }
                  ].map(({ label, sub }, i) => (
                    <th key={i} className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: '#6b6880' }}>
                      {sub
                        ? <span className="flex items-center gap-2">{label}<span className="flex gap-1 font-normal normal-case tracking-normal" style={{ color: '#4e4b60' }}>{sub.map(l => <span key={l} className="w-7 text-center">{l}</span>)}</span></span>
                        : label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No repositories match your search.</td></tr>
                ) : filtered.map(repo => (
                  <RepoTableRow key={repo.id} repo={repo} dbScan={scanMap.get(repo.html_url)} onScan={handleScan} scanning={scanningUrl === repo.html_url} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="card p-8 text-center text-sm text-gray-400">No repositories match your search.</div>
            ) : filtered.map(repo => (
              <RepoMobileCard
                key={repo.id}
                repo={repo}
                dbScan={scanMap.get(repo.html_url)}
                onScan={handleScan}
                scanning={scanningUrl === repo.html_url}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
