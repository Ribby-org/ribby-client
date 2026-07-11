import { useState, useEffect, useRef } from 'react';
import ScanInput from '../components/scanner/ScanInput';

const FEATURES = [
  { title: 'Security',      desc: 'Headers, HTTPS, CORS, CSP, exposed credentials' },
  { title: 'Performance',   desc: 'Response time, compression, caching, page weight' },
  { title: 'Accessibility', desc: 'WCAG violations, alt text, ARIA, heading structure' },
  { title: 'Functional',    desc: 'Broken links, form issues, meta tags, error exposure' }
];

interface HomePageProps {
  onSubmitUrl?: (url: string) => void;
}

export default function HomePage({ onSubmitUrl }: HomePageProps) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setActive(i => (i + 1) % FEATURES.length);
    }, 2500);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const go = (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActive(i);
    startTimer();
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-10 pb-24 md:pb-10">
      <ScanInput onSubmitUrl={onSubmitUrl} />

      <div className="mt-10 w-full" style={{ maxWidth: '260px' }}>
        {/* Cards — only active one visible, same design as before */}
        <div className="relative" style={{ height: '160px' }}>
          {FEATURES.map(({ title, desc }, i) => (
            <div
              key={title}
              className="card p-4 absolute inset-0 transition-all duration-500"
              style={{
                opacity: active === i ? 1 : 0,
                transform: active === i ? 'translateX(0)' : 'translateX(16px)',
                pointerEvents: active === i ? 'auto' : 'none',
              }}
            >
              <h3 className="text-sm font-medium mb-1" style={{ color: '#ede9ff' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#6b6880' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: active === i ? '20px' : '6px',
                height: '6px',
                backgroundColor: active === i ? '#7c3aed' : '#2e2a42',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
