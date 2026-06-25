import { ScanResult } from '../../types/scan';
import ScoreRing from './ScoreRing';
import { Clock, Server, Globe, ArrowRight } from 'lucide-react';

interface SummaryStatsProps { scan: ScanResult; }

const SEV_LABEL: Record<string, string> = {
  critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low', info: 'Info'
};

const SEV_BAR: Record<string, string> = {
  critical: 'bg-red-500', high: 'bg-orange-500',
  medium: 'bg-amber-400', low: 'bg-green-500', info: 'bg-blue-500'
};

const SEV_BADGE: Record<string, string> = {
  critical: 'severity-critical', high: 'severity-high',
  medium: 'severity-medium', low: 'severity-low', info: 'severity-info'
};

export default function SummaryStats({ scan }: SummaryStatsProps) {
  const { summary, meta } = scan;
  const sevs = ['critical', 'high', 'medium', 'low', 'info'] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
      {/* Score */}
      <div className="card p-5 flex items-center gap-5">
        <ScoreRing score={summary.score} size={90} />
        <div>
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Health Score</p>
          <p className="text-sm text-gray-600 mb-2.5">{summary.total} total issues</p>
          <div className="flex flex-wrap gap-1">
            {sevs.filter(s => summary[s] > 0).map(s => (
              <span key={s} className={`severity-badge ${SEV_BADGE[s]}`}>
                {summary[s]} {SEV_LABEL[s]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="card p-5">
        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Breakdown</p>
        <div className="space-y-2.5">
          {sevs.map(s => (
            <div key={s} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-14">{SEV_LABEL[s]}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${SEV_BAR[s]}`}
                  style={{ width: `${summary.total ? (summary[s] / summary.total) * 100 : 0}%`, transition: 'width 0.7s ease' }}
                />
              </div>
              <span className="text-xs text-gray-400 w-4 text-right">{summary[s]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div className="card p-5">
        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Request Info</p>
        <div className="space-y-2.5">
          {[
            {
              icon: Globe,
              label: 'Status',
              value: `HTTP ${meta.statusCode}`,
              cls: meta.statusCode < 300 ? 'text-green-600' : meta.statusCode < 400 ? 'text-amber-600' : 'text-red-600'
            },
            {
              icon: Clock,
              label: 'Response',
              value: `${meta.responseTime}ms`,
              cls: meta.responseTime < 800 ? 'text-green-600' : meta.responseTime < 2000 ? 'text-amber-600' : 'text-red-600'
            },
            {
              icon: Server,
              label: 'Page size',
              value: `${(meta.contentSize / 1024).toFixed(1)} KB`,
              cls: 'text-gray-700'
            },
            {
              icon: ArrowRight,
              label: 'Redirects',
              value: String(meta.redirectCount),
              cls: meta.redirectCount > 2 ? 'text-amber-600' : 'text-gray-700'
            }
          ].map(({ icon: Icon, label, value, cls }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <Icon size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-500">{label}</span>
              <span className={`ml-auto text-xs font-medium font-mono ${cls}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
