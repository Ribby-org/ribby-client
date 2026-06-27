import { useState } from 'react';
import { ChevronDown, MapPin, Lightbulb, Bug } from 'lucide-react';
import { Finding } from '../../types/scan';

interface FindingCardProps {
  finding: Finding;
  index: number;
  onReport?: (finding: Finding) => void;
}

const BADGE: Record<string, string> = {
  critical: 'severity-critical',
  high: 'severity-high',
  medium: 'severity-medium',
  low: 'severity-low',
  info: 'severity-info'
};

const DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
  info: 'bg-blue-500'
};

export default function FindingCard({ finding, index, onReport }: FindingCardProps) {
  const [open, setOpen] = useState(index < 2);

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#2a2640', border: '1px solid #2e2a42' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-2.5 px-3.5 py-3 text-left transition-colors duration-100"
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${DOT[finding.severity]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className={`severity-badge ${BADGE[finding.severity]} flex-shrink-0`}>
              {finding.severity}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-800 mt-1 leading-snug">
            {finding.title}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-gray-400 mt-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 pt-3 space-y-2.5" style={{ borderTop: '1px solid #2e2a42' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#9390aa' }}>{finding.description}</p>

          {finding.location && (
            <div className="flex items-start gap-1.5">
              <MapPin size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#6b6880' }} />
              <span className="text-[11px] font-mono break-all" style={{ color: '#6b6880' }}>{finding.location}</span>
            </div>
          )}

          <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb size={11} style={{ color: '#a78bfa' }} />
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#a78bfa' }}>Fix</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#c4c0d8' }}>{finding.recommendation}</p>
          </div>

          {onReport && (
            <button
              onClick={() => onReport(finding)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors w-fit"
              style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.08)' }}
            >
              <Bug size={12} /> Report Bug
            </button>
          )}
        </div>
      )}
    </div>
  );
}
