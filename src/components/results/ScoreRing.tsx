interface ScoreRingProps {
  score: number;
  size?: number;
}

function scoreColor(score: number) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  if (score >= 40) return '#ea580c';
  return '#dc2626';
}

function scoreLabel(score: number) {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

export default function ScoreRing({ score, size = 100 }: ScoreRingProps) {
  const stroke = size < 70 ? 5 : 7;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const c = scoreColor(score);
  const numSize = size < 70 ? 'text-base' : size < 90 ? 'text-lg' : 'text-xl';
  const lblSize = size < 70 ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#f3f4f6" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={c} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${numSize} font-bold text-gray-900 leading-none`}>{score}</span>
        <span className={`${lblSize} font-medium mt-0.5`} style={{ color: c }}>{scoreLabel(score)}</span>
      </div>
    </div>
  );
}
