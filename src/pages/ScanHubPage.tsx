import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Zap, Eye, Wrench, Activity, Download, Loader2, Lock } from 'lucide-react';
import TestCard from '../components/scanner/TestCard';
import type { ScanType, ScanResult } from '../types/scan';
import { useAuth } from '../hooks/useAuth';
import { downloadWebReport } from '../pdf/RibbyPDF';

interface TestDef {
  type: ScanType;
  title: string;
  description: string;
  icon: typeof Shield;
  iconColor: string;
  iconBg: string;
}

const TESTS: TestDef[] = [
  {
    type: 'security',
    title: 'Safety Checks',
    description: 'Scans for security vulnerabilities missing headers, HTTPS issues, exposed credentials, CORS misconfigurations.',
    icon: Shield,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50'
  },
  {
    type: 'performance',
    title: 'Performance Audit',
    description: 'Measures page weight, compression, caching, render-blocking scripts, and response time.',
    icon: Zap,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50'
  },
  {
    type: 'load',
    title: 'Load & Repeat Testing',
    description: 'Sends 15 repeated requests to measure average response time, P95 latency, and how the server holds up under traffic.',
    icon: Activity,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50'
  },
  {
    type: 'accessibility',
    title: 'Accessibility Check',
    description: 'Checks for WCAG violations missing alt text, unlabeled inputs, heading structure, and screen reader support.',
    icon: Eye,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50'
  },
  {
    type: 'functional',
    title: 'Component & Functional Test',
    description: 'Inspects forms, meta tags, open graph, deprecated HTML, CSRF protection, and error exposure in page source.',
    icon: Wrench,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-50'
  },
  {
    type: 'crypto',
    title: 'Crypto & Breach Detection',
    description: 'Detects cryptojacking scripts, weak algorithms (MD5, SHA1, DES, RC4), exposed JWT tokens, missing SRI, and insecure cookie flags.',
    icon: Lock,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50'
  }
];

export default function ScanHubPage() {
  const { state } = useLocation() as { state: { url: string } };
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useAuth();
  const url = state?.url;
  const [completedScans, setCompletedScans] = useState<Partial<Record<ScanType, ScanResult>>>({});
  const [downloading, setDownloading] = useState(false);

  const handleComplete = (result: ScanResult) => {
    setCompletedScans(prev => ({ ...prev, [result.type]: result }));
  };

  const handleDownload = async () => {
    setDownloading(true);
    try { await downloadWebReport(url, completedScans, 'Scanner Report'); }
    finally { setDownloading(false); }
  };

  if (!url) {
    navigate(`/org/${orgId}/scanner`);
    return null;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 mb-0.5">Testing</p>
          <p className="text-sm font-medium text-gray-800 truncate font-mono">{url}</p>
        </div>
        {(() => {
          const done = Object.keys(completedScans).length;
          const total = 6;
          return (
            <button
              onClick={handleDownload}
              disabled={done === 0 || downloading}
              className="btn-primary flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              title={done === 0 ? 'Run at least one test to download' : `Download report with ${done} of ${total} tests`}
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {done === 0 ? 'Download PDF' : `Download PDF (${done}/${total})`}
            </button>
          );
        })()}
      </div>

      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Select a test to run</h1>
        <p className="text-sm text-gray-400 mt-0.5">Run each test independently. Results appear inline no page reload needed.</p>
      </div>

      {/* Test cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TESTS.map((test, i) => (
          <div key={test.type} className={TESTS.length % 2 !== 0 && i === TESTS.length - 1 ? 'md:col-span-2' : ''}>
            <TestCard
              url={url}
              type={test.type}
              title={test.title}
              description={test.description}
              icon={test.icon}
              iconColor={test.iconColor}
              iconBg={test.iconBg}
              orgId={orgId ?? ''}
              userId={user?.id ?? ''}
              onComplete={handleComplete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
