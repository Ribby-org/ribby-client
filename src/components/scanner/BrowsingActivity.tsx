import { CheckCircle2, Chrome, Globe, Loader2, Network, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface BrowsingActivityProps {
  url: string;
  step: number;
  loading: boolean;
  error?: string;
  hostname?: string;
  detectedServices?: string[];
}

function hostFromUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

function faviconUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

export default function BrowsingActivity({ url, step, loading, error, hostname, detectedServices }: BrowsingActivityProps) {
  const host = hostname || hostFromUrl(url);
  const favicon = faviconUrl(url);
  const [faviconError, setFaviconError] = useState(false);

  const steps = [
    { icon: Sparkles, label: `Analyzing ${host}`, minStep: 0 },
    { icon: Chrome,   label: `Browsing ${host}`,  minStep: 1 },
    { icon: Globe,    label: 'Fetching response headers', minStep: 2 },
    { icon: Network,  label: 'Resolving DNS & hosting',   minStep: 3 },
  ];

  // Determine which step to display:
  // - While loading: show the active (current) step
  // - When done: show "All checks complete" summary
  const allDone = !loading && step >= 4;
  const activeStep = loading ? steps[Math.min(step, steps.length - 1)] : null;

  return (
    <div className="py-1">
      {/* Favicon + host line */}
      <div className="flex items-center gap-2 mb-2.5">
        {favicon && !faviconError ? (
          <img
            src={favicon}
            alt=""
            width={14}
            height={14}
            className="rounded-sm flex-shrink-0"
            onError={() => setFaviconError(true)}
          />
        ) : (
          <Globe size={14} style={{ color: '#6b6880' }} className="flex-shrink-0" />
        )}
        <span className="text-xs font-medium" style={{ color: '#9390aa' }}>{host}</span>
      </div>

      {/* Single-line step indicator */}
      <div
        className="flex items-center gap-2.5 transition-all duration-300"
        style={{ minHeight: '20px' }}
      >
        {allDone ? (
          <>
            <CheckCircle2 size={14} style={{ color: '#4ade80' }} className="flex-shrink-0" />
            <span className="text-sm" style={{ color: '#9390aa' }}>All checks complete</span>
          </>
        ) : activeStep ? (
          <>
            <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color: '#a78bfa' }} />
            <span
              className="text-sm transition-all duration-300"
              key={activeStep.label}
              style={{ color: '#ede9ff' }}
            >
              {activeStep.label}
            </span>
          </>
        ) : null}
      </div>

      {error && (
        <p className="text-xs pt-1 pl-6" style={{ color: '#f87171' }}>{error}</p>
      )}

      {!loading && !error && detectedServices && detectedServices.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2 pl-0">
          {detectedServices.slice(0, 6).map(svc => (
            <span
              key={svc}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ color: '#a78bfa', backgroundColor: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              {svc}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
