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
        <Loader2 size={28} className="animate-spin text-violet-500" />
      </div>

      <h2 className="text-lg font-semibold mb-1" style={{ color: '#ede9ff' }}>Scanning…</h2>
      <p className="text-sm font-mono mb-6 truncate" style={{ color: '#6b6880' }}>{url}</p>

      <div className="mb-2">
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#2e2a42' }}>
          <div
            className="h-full bg-violet-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs mb-8" style={{ color: '#6b6880' }}>
        <span>Analyzing…</span>
        <span>{progress}%</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stages.map(({ icon: Icon, label, threshold }) => {
          const done = progress >= threshold;
          return (
            <div
              key={label}
              className="card p-3 transition-all duration-300"
              style={done ? { borderColor: 'rgba(124,58,237,0.4)', backgroundColor: 'rgba(124,58,237,0.1)' } : { opacity: 0.4 }}
            >
              <Icon size={15} className="mx-auto mb-1.5" style={{ color: done ? '#a78bfa' : '#6b6880' }} />
              <p className="text-xs font-medium" style={{ color: done ? '#a78bfa' : '#6b6880' }}>{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
