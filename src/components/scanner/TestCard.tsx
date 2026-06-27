import { useState } from 'react';
import { LucideIcon, Play, Loader2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import type { ScanResult, ScanType, Finding } from '../../types/scan';
import FindingCard from '../results/FindingCard';
import ScoreRing from '../results/ScoreRing';
import { useScans } from '../../hooks/useScans';
import { useBugReports, type BugReportDraft } from '../../hooks/useBugReports';
import BugModal from '../bugs/BugModal';
import { apiUrl, apiHeaders } from '../../utils/api';

interface TestCardProps {
  url: string;
  type: ScanType;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  orgId: string;
  userId: string;
  onComplete?: (result: ScanResult) => void;
}

type State = 'idle' | 'running' | 'done' | 'error';

const BORDER: Record<string, string> = {
  idle: 'border-gray-200',
  running: 'border-blue-200',
  done_ok: 'border-green-200',
  done_warn: 'border-orange-200',
  done_crit: 'border-red-200',
  error: 'border-red-200'
};

export default function TestCard({ url, type, title, description, icon: Icon, iconColor, iconBg, orgId, userId, onComplete }: TestCardProps) {
  const [state, setState] = useState<State>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bugDraft, setBugDraft] = useState<BugReportDraft | null>(null);
  const [savingBug, setSavingBug] = useState(false);
  const { saveScan } = useScans(orgId);
  const { createBug } = useBugReports(orgId);

  const handleReport = (finding: Finding) => {
    setBugDraft({
      title:       finding.title,
      url,
      severity:    finding.severity,
      status:      'open',
      description: finding.description,
      steps:       '',
      expected:    '',
      actual:      finding.recommendation ? `Fix needed: ${finding.recommendation}` : '',
      category:    finding.category,
    });
  };

  const handleSaveBug = async (draft: BugReportDraft) => {
    setSavingBug(true);
    await createBug(draft);
    setSavingBug(false);
    setBugDraft(null);
  };

  const run = async () => {
    setState('running');
    setProgress(5);
    setResult(null);
    setErrorMsg('');
    setExpanded(false);

    try {
      const { data } = await axios.post(apiUrl('/api/scan/start'), { url, type }, { headers: apiHeaders() });
      const id: string = data.id;

      const poll = setInterval(async () => {
        try {
          const { data: scan } = await axios.get<ScanResult>(apiUrl(`/api/scan/${id}`), { headers: apiHeaders() });
          setProgress(scan.progress);
          if (scan.status === 'complete' || scan.status === 'error') {
            clearInterval(poll);
            setResult(scan);
            setState(scan.status === 'error' ? 'error' : 'done');
            if (scan.status === 'complete') { setExpanded(true); saveScan(scan, orgId, userId); onComplete?.(scan); }
            if (scan.error) setErrorMsg(scan.error);
          }
        } catch {
          clearInterval(poll);
          setState('error');
          setErrorMsg('Lost connection to scanner.');
        }
      }, 1000);
    } catch {
      setState('error');
      setErrorMsg('Could not start scan. Make sure the server is running.');
    }
  };

  const borderClass =
    state === 'running' ? BORDER.running :
    state === 'error' ? BORDER.error :
    state === 'done' && (result?.summary.critical ?? 0) > 0 ? BORDER.done_crit :
    state === 'done' && (result?.summary.high ?? 0) > 0 ? BORDER.done_warn :
    state === 'done' ? BORDER.done_ok :
    BORDER.idle;

  return (
    <div className="rounded-xl overflow-hidden transition-colors duration-300" style={{ backgroundColor: '#231f35' }}>

      {/* Top section */}
      <div className="p-5">

        {/* Icon + title row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <Icon size={16} className={iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">{title}</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Score ring: full width row when done */}
        {state === 'done' && result && (
          <div className="flex items-center gap-4 py-3 px-1 my-3" style={{ borderTop: '1px solid #2e2a42', borderBottom: '1px solid #2e2a42' }}>
            <ScoreRing score={result.summary.score} size={64} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1.5">Issues found</p>
              <div className="flex flex-wrap gap-1.5">
                {result.summary.critical > 0 && <span className="severity-badge severity-critical">{result.summary.critical} critical</span>}
                {result.summary.high > 0 && <span className="severity-badge severity-high">{result.summary.high} high</span>}
                {result.summary.medium > 0 && <span className="severity-badge severity-medium">{result.summary.medium} medium</span>}
                {result.summary.low > 0 && <span className="severity-badge severity-low">{result.summary.low} low</span>}
                {result.summary.info > 0 && <span className="severity-badge severity-info">{result.summary.info} info</span>}
                {result.summary.total === 0 && (
                  <span className="text-xs text-green-600 font-medium">No issues found</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Load stats */}
        {state === 'done' && result?.loadStats && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Avg response', value: `${result.loadStats.avgTime}ms` },
              { label: 'P95 latency', value: `${result.loadStats.p95Time}ms` },
              { label: 'Success rate', value: `${result.loadStats.successRate}%` }
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg px-3 py-2.5 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid #2e2a42' }}>
                <p className="text-[10px] uppercase tracking-wide leading-none mb-1" style={{ color: '#6b6880' }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: '#ede9ff' }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {state === 'running' && (
          <div className="mt-1 mb-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Loader2 size={11} className="animate-spin text-blue-500" />
                Running test…
              </span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2e2a42' }}>
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {state === 'error' && (
          <div className="mt-1 mb-3 text-xs rounded-lg px-3 py-2" style={{ color: '#f87171', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {errorMsg}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {state === 'idle' && (
            <button onClick={run} className="btn-primary text-xs py-1.5 px-3.5">
              <Play size={12} /> Run Test
            </button>
          )}
          {(state === 'done' || state === 'error') && (
            <button onClick={run} className="btn-ghost text-xs py-1.5">
              <RotateCcw size={12} /> Re-run
            </button>
          )}
          {state === 'done' && result && result.findings.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-ghost text-xs py-1.5 ml-auto"
            >
              {expanded
                ? <><ChevronUp size={12} /> Hide</>
                : <><ChevronDown size={12} /> {result.findings.length} findings</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Findings list */}
      {expanded && result && result.findings.length > 0 && (
        <div className="px-4 pb-4 pt-3 space-y-2" style={{ borderTop: '1px solid #2e2a42' }}>
          {result.findings.map((f, i) => (
            <FindingCard key={f.id} finding={f} index={i} onReport={handleReport} />
          ))}
        </div>
      )}

      {bugDraft && (
        <BugModal
          initial={bugDraft}
          onSave={handleSaveBug}
          onClose={() => setBugDraft(null)}
          saving={savingBug}
        />
      )}
    </div>
  );
}
