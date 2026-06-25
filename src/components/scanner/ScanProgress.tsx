import { Shield, Zap, Eye, Wrench, Loader2 } from 'lucide-react';

interface ScanProgressProps {
  progress: number;
  url: string;
}

const stages = [
  { icon: Shield, label: 'Security', threshold: 30 },
  { icon: Zap, label: 'Performance', threshold: 55 },
  { icon: Eye, label: 'Accessibility', threshold: 75 },
  { icon: Wrench, label: 'Functional', threshold: 92 }
];

export default function ScanProgress({ progress, url }: ScanProgressProps) {
  return (
    <div className="max-w-md w-full mx-auto text-center">
      <div className="flex items-center justify-center mb-6">
        <Loader2 size={28} className="animate-spin text-blue-600" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-1">Scanning…</h2>
      <p className="text-sm text-gray-400 font-mono mb-6 truncate">{url}</p>

      <div className="mb-2">
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mb-8">
        <span>Analyzing…</span>
        <span>{progress}%</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stages.map(({ icon: Icon, label, threshold }) => {
          const done = progress >= threshold;
          return (
            <div
              key={label}
              className={`card p-3 transition-all duration-300 ${done ? 'border-blue-200 bg-blue-50' : 'opacity-40'}`}
            >
              <Icon size={15} className={`mx-auto mb-1.5 ${done ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className={`text-xs font-medium ${done ? 'text-blue-600' : 'text-gray-400'}`}>{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
