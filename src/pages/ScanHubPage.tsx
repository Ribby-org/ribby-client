import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Download, Loader2, ChevronDown, MapPin, Lightbulb,
  Shield as ShieldIcon, Package, FolderOpen, Settings, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import TestCard from '../components/scanner/TestCard';
import ScanInput from '../components/scanner/ScanInput';
import HomePage from './HomePage';
import BrowsingActivity from '../components/scanner/BrowsingActivity';
import type { ScanType, ScanResult } from '../types/scan';
import type { RepoScanResult, RepoFinding } from '../types/repo';
import type { NpmScanResult } from '../types/npm';
import { useAuth } from '../hooks/useAuth';
import { useSiteIntel } from '../hooks/useSiteIntel';
import { downloadWebReport } from '../pdf/RibbyPDF';
import { Shield, Zap, Eye, Wrench, Activity, Lock, Github } from 'lucide-react';
import { apiUrl, apiHeaders } from '../utils/api';

interface TestDef {
  type: ScanType;
  title: string;
  description: string;
  icon: typeof Shield;
  iconColor: string;
  iconBg: string;
}

const TESTS: TestDef[] = [
  {
    type: 'security',
    title: 'Safety Checks',
    description: 'Scans for security vulnerabilities missing headers, HTTPS issues, exposed credentials, CORS misconfigurations.',
    icon: Shield, iconColor: 'text-red-500', iconBg: 'bg-red-50'
  },
  {
    type: 'performance',
    title: 'Performance Audit',
    description: 'Measures page weight, compression, caching, render-blocking scripts, and response time.',
    icon: Zap, iconColor: 'text-orange-500', iconBg: 'bg-orange-50'
  },
  {
    type: 'load',
    title: 'Load & Repeat Testing',
    description: 'Sends 15 repeated requests to measure average response time, P95 latency, and how the server holds up under traffic.',
    icon: Activity, iconColor: 'text-green-600', iconBg: 'bg-green-50'
  },
  {
    type: 'accessibility',
    title: 'Accessibility Check',
    description: 'Checks for WCAG violations missing alt text, unlabeled inputs, heading structure, and screen reader support.',
    icon: Eye, iconColor: 'text-blue-500', iconBg: 'bg-blue-50'
  },
  {
    type: 'functional',
    title: 'Component & Functional Test',
    description: 'Inspects forms, meta tags, open graph, deprecated HTML, CSRF protection, and error exposure in page source.',
    icon: Wrench, iconColor: 'text-violet-500', iconBg: 'bg-violet-50'
  },
  {
    type: 'crypto',
    title: 'Crypto & Breach Detection',
    description: 'Detects cryptojacking scripts, weak algorithms (MD5, SHA1, DES, RC4), exposed JWT tokens, missing SRI, and insecure cookie flags.',
    icon: Lock, iconColor: 'text-amber-500', iconBg: 'bg-amber-50'
  }
];

const CAT_META: Record<RepoFinding['category'], { icon: typeof ShieldIcon; color: string; bg: string }> = {
  secret:     { icon: ShieldIcon, color: 'text-red-400',    bg: 'bg-red-900/30' },
  dependency: { icon: Package,    color: 'text-orange-400', bg: 'bg-orange-900/30' },
  exposure:   { icon: FolderOpen, color: 'text-violet-400', bg: 'bg-violet-900/30' },
  config:     { icon: Settings,   color: 'text-blue-400',   bg: 'bg-blue-900/30' },
};

const SEV_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e', info: '#3b82f6'
};

function RepoFindingRow({ finding, index }: { finding: RepoFinding; index: number }) {
  const [open, setOpen] = useState(index < 2);
  const cat = CAT_META[finding.category];
  const CatIcon = cat.icon;

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #2e2a42' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-2.5 px-3.5 py-3 text-left transition-colors"
        style={{ backgroundColor: open ? 'rgba(255,255,255,0.03)' : 'transparent' }}
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: SEV_COLOR[finding.severity] }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
              style={{ backgroundColor: SEV_COLOR[finding.severity] + '22', color: SEV_COLOR[finding.severity] }}
            >
              {finding.severity}
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${cat.bg} ${cat.color}`}>
              <CatIcon size={9} />{finding.category}
            </span>
            {finding.cve && (
              <span className="text-[10px] font-mono" style={{ color: '#6b6880' }}>{finding.cve}</span>
            )}
          </div>
          <p className="text-xs font-medium leading-snug" style={{ color: '#ede9ff' }}>{finding.title}</p>
          {finding.file && (
            <p className="flex items-center gap-1 mt-0.5 text-[11px] font-mono" style={{ color: '#6b6880' }}>
              <MapPin size={10} />{finding.file}{finding.line ? `:${finding.line}` : ''}
            </p>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: '#6b6880' }}
        />
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 pt-3 space-y-2.5" style={{ borderTop: '1px solid #2e2a42' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{finding.description}</p>
          {finding.fixVersion && (
            <p className="text-xs font-medium" style={{ color: '#4ade80' }}>Fix available: v{finding.fixVersion}</p>
          )}
          <div
            className="rounded-lg px-3 py-2.5"
            style={{ backgroundColor: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb size={11} className="text-violet-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-400">Fix</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#c4b5fd' }}>{finding.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScanHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useAuth();

  const STORAGE_KEY = `ribby_scanner_url_${orgId}`;
  const urlParam = searchParams.get('url') ?? '';

  const [activeUrl, setActiveUrl] = useState<string>(() => {
    if (urlParam) { localStorage.setItem(STORAGE_KEY, urlParam); return urlParam; }
    return localStorage.getItem(STORAGE_KEY) ?? '';
  });
  const [inputUrl, setInputUrl] = useState(activeUrl);

  // ── Inline repo scan state ──────────────────────────────────────────
  const [repoScanState, setRepoScanState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [repoProgress, setRepoProgress] = useState(0);
  const [repoResult, setRepoResult] = useState<RepoScanResult | null>(null);
  const [repoError, setRepoError] = useState('');

  // ── Inline NPM scan state ───────────────────────────────────────────
  const [npmScanState, setNpmScanState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [npmResult, setNpmResult] = useState<NpmScanResult | null>(null);
  const [npmError, setNpmError] = useState('');

  // Detect URL types
  const { meta, loading: intelLoading, error: intelError, step } = useSiteIntel(activeUrl || undefined);
  const directGithubMatch = activeUrl?.match(/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/i);
  const detectedRepoUrl = directGithubMatch
    ? `https://github.com/${directGithubMatch[1]}`
    : meta?.githubRepo;
  const npmPackageMatch = activeUrl?.match(/npmjs\.com\/package\/(@?[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)?)/i)
    || (activeUrl && !activeUrl.startsWith('http') && /^@?[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)?$/.test(activeUrl.trim()) ? ['', activeUrl.trim()] : null);
  const detectedNpmPackage = npmPackageMatch ? npmPackageMatch[1] : null;

  const isClearingRef = useRef(false);

  useEffect(() => {
    if (isClearingRef.current) {
      if (urlParam === '') {
        isClearingRef.current = false;
      }
      return;
    }
    if (urlParam && urlParam !== activeUrl) {
      setActiveUrl(urlParam);
      setInputUrl(urlParam);
      localStorage.setItem(STORAGE_KEY, urlParam);
    }
  }, [urlParam, activeUrl]);

  // Reset repo + npm scan when main URL changes
  useEffect(() => {
    setRepoScanState('idle');
    setRepoResult(null);
    setRepoError('');
    setRepoProgress(0);
    setNpmScanState('idle');
    setNpmResult(null);
    setNpmError('');
  }, [activeUrl]);

  const [completedScans, setCompletedScans] = useState<Partial<Record<ScanType, ScanResult>>>(() => {
    if (!activeUrl) return {};
    try { const s = localStorage.getItem(`ribby_scans_${activeUrl}`); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (activeUrl) localStorage.setItem(`ribby_scans_${activeUrl}`, JSON.stringify(completedScans));
  }, [completedScans, activeUrl]);

  useEffect(() => {
    if (activeUrl) {
      try { const s = localStorage.getItem(`ribby_scans_${activeUrl}`); setCompletedScans(s ? JSON.parse(s) : {}); }
      catch { setCompletedScans({}); }
    }
  }, [activeUrl]);

  // Auto-run repo scan if user entered a GitHub URL directly
  useEffect(() => {
    if (directGithubMatch && repoScanState === 'idle') {
      const repoUrl = `https://github.com/${directGithubMatch[1]}`;
      handleRunRepoScan(repoUrl);
    }
  }, [activeUrl, directGithubMatch, repoScanState]);

  // Auto-run npm scan if user entered an npm package URL or bare package name
  useEffect(() => {
    if (detectedNpmPackage && npmScanState === 'idle') {
      handleRunNpmScan(detectedNpmPackage);
    }
  }, [activeUrl, detectedNpmPackage, npmScanState]);

  const handleComplete = (result: ScanResult) =>
    setCompletedScans(prev => ({ ...prev, [result.type]: result }));

  const handleDownload = async () => {
    if (!activeUrl) return;
    setDownloading(true);
    try { await downloadWebReport(activeUrl, completedScans, 'Scanner Report', meta); }
    finally { setDownloading(false); }
  };

  const handleSubmitUrl = (normalized: string) => {
    if (!normalized) {
      // Cancel / clear — wipe everything and return to home
      isClearingRef.current = true;
      setActiveUrl('');
      setInputUrl('');
      setCompletedScans({});
      localStorage.removeItem(STORAGE_KEY);
      setSearchParams({}, { replace: true });
      return;
    }
    localStorage.removeItem(`ribby_scans_${normalized}`);
    setCompletedScans({});
    setInputUrl(normalized);
    setActiveUrl(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
    setSearchParams({ url: normalized }, { replace: true });
  };

  const handleRunRepoScan = async (repoUrl: string) => {
    setRepoScanState('running');
    setRepoProgress(5);
    setRepoResult(null);
    setRepoError('');
    try {
      const { data } = await axios.post<{ id: string }>(
        apiUrl('/api/repo-scan/start'),
        { repoUrl },
        { headers: apiHeaders() }
      );
      const id = data.id;
      const poll = setInterval(async () => {
        try {
          const { data: result } = await axios.get<RepoScanResult>(
            apiUrl(`/api/repo-scan/${id}`),
            { headers: apiHeaders() }
          );
          setRepoProgress(result.progress);
          if (result.status === 'complete' || result.status === 'error') {
            clearInterval(poll);
            setRepoResult(result);
            setRepoScanState(result.status === 'error' ? 'error' : 'done');
            if (result.error) setRepoError(result.error);
          }
        } catch {
          clearInterval(poll);
          setRepoScanState('error');
          setRepoError('Lost connection to scanner.');
        }
      }, 1200);
    } catch {
      setRepoScanState('error');
      setRepoError('Could not start repository scan.');
    }
  };

  const handleRunNpmScan = async (packageName: string) => {
    setNpmScanState('running');
    setNpmResult(null);
    setNpmError('');
    try {
      const { data } = await axios.post<{ id: string }>(
        apiUrl('/api/npm-scan/start'),
        { packageName },
        { headers: apiHeaders() }
      );
      const id = data.id;
      // NPM scan is synchronous on server — poll until done
      const poll = setInterval(async () => {
        try {
          const { data: result } = await axios.get<NpmScanResult>(
            apiUrl(`/api/npm-scan/${id}`),
            { headers: apiHeaders() }
          );
          if (result.status === 'complete' || result.status === 'error') {
            clearInterval(poll);
            setNpmResult(result);
            setNpmScanState(result.status === 'error' ? 'error' : 'done');
            if (result.error) setNpmError(result.error);
          }
        } catch {
          clearInterval(poll);
          setNpmScanState('error');
          setNpmError('Lost connection to scanner.');
        }
      }, 800);
    } catch {
      setNpmScanState('error');
      setNpmError('Could not start npm scan.');
    }
  };

  if (!activeUrl) return <HomePage onSubmitUrl={handleSubmitUrl} />;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Scanner</h1>
          <p className="text-sm text-gray-400 mt-0.5">Run each test independently. Results appear inline.</p>
        </div>
        {(() => {
          const done = Object.keys(completedScans).length;
          const total = 6;
          return (
            <button
              onClick={handleDownload}
              disabled={done === 0 || downloading || !!directGithubMatch}
              className="btn-primary flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              title={directGithubMatch ? 'Not applicable for code audits' : done === 0 ? 'Run at least one test to download' : `Download report with ${done} of ${total} tests`}
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {done === 0 ? 'Download PDF' : `Download PDF (${done}/${total})`}
            </button>
          );
        })()}
      </div>

      {/* ── URL input ── */}
      <div className="mb-5">
        <ScanInput compact value={inputUrl} onChange={setInputUrl} onSubmitUrl={handleSubmitUrl} submitLabel="Scan" />
      </div>

      {/* ── Browsing activity ── */}
      <div className="mb-5">
        <BrowsingActivity
          url={activeUrl}
          step={step}
          loading={intelLoading}
          error={intelError}
          hostname={meta?.hostname}
          detectedServices={meta?.detectedServices}
        />
      </div>

      {/* ── NPM Package Scanner ── */}
      {detectedNpmPackage && (
        <div className="mb-6 rounded-xl overflow-hidden" style={{ border: '1px solid #2e3d28', backgroundColor: '#0f1f0e' }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4"
            style={{ borderBottom: npmScanState !== 'idle' ? '1px solid #1e3d1c' : 'none' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1a3d18' }}>
                <Package size={16} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#d1fae5' }}>NPM Package Scan</h3>
                <p className="text-xs mt-0.5 font-mono" style={{ color: '#4ade80' }}>{detectedNpmPackage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {npmResult?.homepage && (
                <a href={npmResult.homepage} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs" style={{ color: '#4ade80' }}>
                  <ExternalLink size={11} /> npmjs.com
                </a>
              )}
              {npmScanState === 'idle' && (
                <button onClick={() => handleRunNpmScan(detectedNpmPackage)}
                  className="btn-primary text-xs py-1.5 px-3.5 flex-shrink-0">Scan Package →</button>
              )}
              {npmScanState === 'done' && (
                <button onClick={() => handleRunNpmScan(detectedNpmPackage)}
                  className="btn-ghost text-xs py-1.5 flex-shrink-0">Re-scan</button>
              )}
            </div>
          </div>

          {/* Spinner */}
          {npmScanState === 'running' && (
            <div className="px-4 py-4 flex items-center gap-2 text-xs" style={{ color: '#86efac' }}>
              <Loader2 size={13} className="animate-spin text-green-400" />
              Querying npm registry and vulnerability database…
            </div>
          )}

          {/* Error */}
          {npmScanState === 'error' && (
            <div className="mx-4 my-3 px-3 py-2 rounded-lg text-xs"
              style={{ color: '#f87171', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {npmError}
            </div>
          )}

          {/* Results */}
          {npmScanState === 'done' && npmResult && (
            <div className="p-4 space-y-4">
              {/* Meta row */}
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#86efac' }}>
                <span><b style={{ color: '#d1fae5' }}>v{npmResult.version}</b></span>
                {npmResult.license && <span>License: <b style={{ color: '#d1fae5' }}>{npmResult.license}</b></span>}
                <span>Deps: <b style={{ color: '#d1fae5' }}>{npmResult.dependenciesCount}</b></span>
                {npmResult.weeklyDownloads !== undefined && (
                  <span>↓ <b style={{ color: '#d1fae5' }}>{npmResult.weeklyDownloads.toLocaleString()}</b>/wk</span>
                )}
                {npmResult.maintainerCount !== undefined && (
                  <span>Maintainers: <b style={{ color: npmResult.maintainerCount === 1 ? '#eab308' : '#d1fae5' }}>{npmResult.maintainerCount}</b></span>
                )}
                {npmResult.daysSinceUpdate !== undefined && (
                  <span style={{ color: npmResult.daysSinceUpdate > 730 ? '#f97316' : '#86efac' }}>
                    Updated: <b>{npmResult.daysSinceUpdate > 365
                      ? `${Math.floor(npmResult.daysSinceUpdate / 365)}y ago`
                      : `${npmResult.daysSinceUpdate}d ago`}</b>
                  </span>
                )}
                {npmResult.githubRepo && (
                  <a href={npmResult.githubRepo} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 underline" style={{ color: '#4ade80' }}>
                    <Github size={11} /> Source
                  </a>
                )}
              </div>
              {npmResult.description && (
                <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{npmResult.description}</p>
              )}

              {/* Score + severity badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold"
                  style={{ color: npmResult.summary.score >= 80 ? '#4ade80' : npmResult.summary.score >= 50 ? '#eab308' : '#ef4444' }}>
                  Score {npmResult.summary.score}/100
                </span>
                {npmResult.summary.critical > 0 && <span className="severity-badge severity-critical">{npmResult.summary.critical} critical</span>}
                {npmResult.summary.high > 0 && <span className="severity-badge severity-high">{npmResult.summary.high} high</span>}
                {npmResult.summary.medium > 0 && <span className="severity-badge severity-medium">{npmResult.summary.medium} medium</span>}
                {npmResult.summary.low > 0 && <span className="severity-badge severity-low">{npmResult.summary.low} low</span>}
                {npmResult.summary.total === 0 && (
                  <p className="text-xs font-medium" style={{ color: '#4ade80' }}>✓ No known vulnerabilities found.</p>
                )}
              </div>

              {/* Findings */}
              {npmResult.findings.length > 0 && (
                <div className="space-y-2">
                  {npmResult.findings.map((f, i) => (
                    <RepoFindingRow key={f.id} finding={f} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Inline GitHub Repo Scanner ── */}
      {detectedRepoUrl && !intelLoading && (
        <div className="mb-6 rounded-xl overflow-hidden" style={{ border: '1px solid #2e2a42', backgroundColor: '#1a1730' }}>

          {/* Header */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4"
            style={{ borderBottom: repoScanState !== 'idle' ? '1px solid #2e2a42' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2e1f5e' }}>
                <Github size={16} className="text-violet-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#ede9ff' }}>
                  {directGithubMatch ? 'Repository Code Scan' : 'Linked Repository Detected'}
                </h3>
                <p className="text-xs mt-0.5 font-mono" style={{ color: '#7c6fa0' }}>{detectedRepoUrl}</p>
              </div>
            </div>
            {repoScanState === 'idle' && (
              <button
                onClick={() => handleRunRepoScan(detectedRepoUrl)}
                className="btn-primary text-xs py-1.5 px-3.5 flex-shrink-0"
              >
                Scan Code →
              </button>
            )}
            {repoScanState === 'done' && (
              <button
                onClick={() => handleRunRepoScan(detectedRepoUrl)}
                className="btn-ghost text-xs py-1.5 flex-shrink-0"
              >
                Re-scan
              </button>
            )}
          </div>

          {/* Progress bar */}
          {repoScanState === 'running' && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between text-xs mb-2" style={{ color: '#9390aa' }}>
                <span className="flex items-center gap-1.5">
                  <Loader2 size={11} className="animate-spin text-violet-400" />
                  Scanning repository files…
                </span>
                <span className="tabular-nums">{repoProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2e2a42' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${repoProgress}%`, backgroundColor: '#7c3aed' }}
                />
              </div>
            </div>
          )}

          {/* Error state */}
          {repoScanState === 'error' && (
            <div
              className="mx-4 my-3 px-3 py-2 rounded-lg text-xs"
              style={{ color: '#f87171', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {repoError}
            </div>
          )}

          {/* Results */}
          {repoScanState === 'done' && repoResult && (
            <div className="p-4 space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Score',
                    value: repoResult.summary.score,
                    suffix: '/100',
                    highlight: repoResult.summary.score >= 80 ? '#4ade80' : repoResult.summary.score >= 50 ? '#eab308' : '#ef4444'
                  },
                  { label: 'Files scanned', value: repoResult.meta.filesScanned, suffix: '', highlight: '#a78bfa' },
                  {
                    label: 'Findings',
                    value: repoResult.summary.total,
                    suffix: '',
                    highlight: repoResult.summary.total > 0 ? '#f97316' : '#4ade80'
                  },
                  { label: 'Deps checked', value: repoResult.meta.depsChecked, suffix: '', highlight: '#60a5fa' },
                ].map(({ label, value, suffix, highlight }) => (
                  <div
                    key={label}
                    className="rounded-lg px-3 py-2.5 text-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid #2e2a42' }}
                  >
                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#6b6880' }}>{label}</p>
                    <p className="text-lg font-semibold" style={{ color: highlight }}>{value}{suffix}</p>
                  </div>
                ))}
              </div>

              {/* Severity summary badges */}
              {repoResult.summary.total > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {repoResult.summary.critical > 0 && <span className="severity-badge severity-critical">{repoResult.summary.critical} critical</span>}
                  {repoResult.summary.high > 0 && <span className="severity-badge severity-high">{repoResult.summary.high} high</span>}
                  {repoResult.summary.medium > 0 && <span className="severity-badge severity-medium">{repoResult.summary.medium} medium</span>}
                  {repoResult.summary.low > 0 && <span className="severity-badge severity-low">{repoResult.summary.low} low</span>}
                  {repoResult.summary.info > 0 && <span className="severity-badge severity-info">{repoResult.summary.info} info</span>}
                </div>
              )}
              {repoResult.summary.total === 0 && (
                <p className="text-sm font-medium" style={{ color: '#4ade80' }}>✓ No issues found in this repository.</p>
              )}

              {/* Findings accordion list */}
              {repoResult.findings.length > 0 && (
                <div className="space-y-2">
                  {repoResult.findings.map((f, i) => (
                    <RepoFindingRow key={f.id} finding={f} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Web scan test cards (only rendered for non-GitHub, non-npm URLs) ── */}
      {!directGithubMatch && !detectedNpmPackage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TESTS.map((test, i) => (
            <div key={test.type} className={TESTS.length % 2 !== 0 && i === TESTS.length - 1 ? 'md:col-span-2' : ''}>
              <TestCard
                url={activeUrl}
                type={test.type}
                title={test.title}
                description={test.description}
                icon={test.icon}
                iconColor={test.iconColor}
                iconBg={test.iconBg}
                orgId={orgId ?? ''}
                userId={user?.id ?? ''}
                onComplete={handleComplete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="p-5 rounded-xl border text-center flex flex-col items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: '#2e2a42', minHeight: '180px' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3.5"
            style={{ backgroundColor: detectedNpmPackage ? 'rgba(74,222,128,0.1)' : 'rgba(124,58,237,0.1)' }}>
            {detectedNpmPackage
              ? <Package size={18} className="text-green-400" />
              : <Shield size={18} className="text-violet-400" />}
          </div>
          <h4 className="text-sm font-semibold" style={{ color: '#ede9ff' }}>
            {detectedNpmPackage ? 'Website Audits Disabled for NPM Packages' : 'Website Audits Disabled for GitHub Links'}
          </h4>
          <p className="text-xs max-w-sm mt-1.5 leading-relaxed" style={{ color: '#9390aa' }}>
            {detectedNpmPackage
              ? 'You scanned an npm package. Web diagnostics apply to live hosted websites, not package registries.'
              : 'You scanned a code repository. Web diagnostics apply only to live hosted websites.'}
          </p>
        </div>
      )}
    </div>
  );
}
