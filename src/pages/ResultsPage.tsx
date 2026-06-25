import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { ScanResult, Category, Finding } from '../types/scan';
import ScanProgress from '../components/scanner/ScanProgress';
import SummaryStats from '../components/results/SummaryStats';
import CategoryTabs from '../components/results/CategoryTabs';
import FindingCard from '../components/results/FindingCard';

function buildEmail(scan: ScanResult): string {
  const top3 = scan.findings.slice(0, 3);
  let host = scan.url;
  try { host = new URL(scan.url).hostname; } catch { /* */ }

  return `Subject: Security Issues Found on ${host} Free Report

Hi there,

I ran a quick scan on ${scan.url} and found ${scan.summary.total} issues that could impact your users.

Top findings:
${top3.map((f, i) => `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}`).join('\n')}

Security score: ${scan.summary.score}/100

Happy to share the full report and walk through fixes. We offer comprehensive QA as a service that typically catches 3–5× more issues through in-depth testing.

Open to a quick call this week?`;
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [activeTab, setActiveTab] = useState<Category | 'all'>('all');
  const [copied, setCopied] = useState(false);

  const fetchScan = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await axios.get<ScanResult>(`/api/scan/${id}`);
      setScan(data);
      return data.status;
    } catch {
      setFetchError('Scan not found or the server is not running.');
      return 'error';
    }
  }, [id]);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    const poll = async () => {
      const status = await fetchScan();
      if (status === 'scanning') {
        iv = setInterval(async () => {
          const s = await fetchScan();
          if (s !== 'scanning') clearInterval(iv);
        }, 1200);
      }
    };
    poll();
    return () => clearInterval(iv);
  }, [fetchScan]);

  const handleCopy = () => {
    if (!scan) return;
    navigator.clipboard.writeText(buildEmail(scan));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered: Finding[] = scan
    ? activeTab === 'all' ? scan.findings : scan.findings.filter(f => f.category === activeTab)
    : [];

  if (fetchError) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-900 mb-1">Could not load scan</h2>
          <p className="text-sm text-gray-500 mb-5">{fetchError}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Scanner
          </button>
        </div>
      </div>
    );
  }

  if (!scan || scan.status === 'scanning') {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <ScanProgress progress={scan?.progress ?? 5} url={scan?.url ?? '…'} />
      </div>
    );
  }

  if (scan.status === 'error') {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-900 mb-1">Scan Failed</h2>
          <p className="text-sm text-gray-500 mb-1">{scan.error}</p>
          <p className="text-xs text-gray-400 mb-5">The URL may be unreachable, blocked, or require authentication.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            <ArrowLeft size={14} /> Try Another URL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Scan Results</h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5 max-w-xs truncate">{scan.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="btn-ghost">
            <RefreshCw size={13} /> New scan
          </button>
          <button onClick={handleCopy} className="btn-primary">
            {copied ? <><Check size={13} />Copied</> : <><Copy size={13} />Copy outreach email</>}
          </button>
        </div>
      </div>

      <SummaryStats scan={scan} />

      <CategoryTabs findings={scan.findings} active={activeTab} onChange={setActiveTab} />

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-gray-400">No issues in this category.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f, i) => <FindingCard key={f.id} finding={f} index={i} />)}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-gray-300 font-mono">
        Scanned {new Date(scan.startedAt).toLocaleString()} · {scan.summary.total} issues found
      </p>
    </div>
  );
}
