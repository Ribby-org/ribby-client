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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-2.5 px-3.5 py-3 text-left hover:bg-gray-50 transition-colors duration-100"
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
        <div className="px-3.5 pb-3.5 border-t border-gray-100 pt-3 space-y-2.5">
          <p className="text-xs text-gray-500 leading-relaxed">{finding.description}</p>

          {finding.location && (
            <div className="flex items-start gap-1.5">
              <MapPin size={11} className="mt-0.5 flex-shrink-0 text-gray-400" />
              <span className="text-[11px] font-mono text-gray-400 break-all">{finding.location}</span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb size={11} className="text-blue-600" />
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Fix</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{finding.recommendation}</p>
          </div>

          {onReport && (
            <button
              onClick={() => onReport(finding)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 transition-colors w-fit"
            >
              <Bug size={12} /> Report Bug
            </button>
          )}
        </div>
      )}
    </div>
  );
}
