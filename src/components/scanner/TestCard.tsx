import { useState } from 'react';
import { LucideIcon, Play, Loader2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import type { ScanResult, ScanType } from '../../types/scan';
import FindingCard from '../results/FindingCard';
import ScoreRing from '../results/ScoreRing';
import { useScans } from '../../hooks/useScans';

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
  const { saveScan } = useScans(orgId);

  const run = async () => {
    setState('running');
    setProgress(5);
    setResult(null);
    setErrorMsg('');
    setExpanded(false);

    try {
      const { data } = await axios.post('/api/scan/start', { url, type });
      const id: string = data.id;

      const poll = setInterval(async () => {
        try {
          const { data: scan } = await axios.get<ScanResult>(`/api/scan/${id}`);
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
    <div className={`bg-white border ${borderClass} rounded-xl shadow-sm overflow-hidden transition-colors duration-300`}>

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
          <div className="flex items-center gap-4 py-3 px-1 border-t border-b border-gray-100 my-3">
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
              <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
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
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {state === 'error' && (
          <div className="mt-1 mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
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
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 pb-4 pt-3 space-y-2">
          {result.findings.map((f, i) => (
            <FindingCard key={f.id} finding={f} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
