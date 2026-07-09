import { useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Globe, Lock, Mail, Link, Download, Loader2 } from 'lucide-react';
import TestCard from '../components/scanner/TestCard';
import BrowsingActivity from '../components/scanner/BrowsingActivity';
import SiteIntelPanel from '../components/scanner/SiteIntelPanel';
import { useAuth } from '../hooks/useAuth';
import { useSiteIntel } from '../hooks/useSiteIntel';
import type { ScanType, ScanResult } from '../types/scan';
import { downloadWebReport } from '../pdf/RibbyPDF';

interface AuditTest {
  type: ScanType;
  title: string;
  description: string;
  icon: typeof Globe;
  iconColor: string;
  iconBg: string;
}

const AUDIT_TESTS: AuditTest[] = [
  {
    type: 'seo',
    title: 'SEO Audit',
    description: 'Checks robots.txt, sitemap, canonical URLs, structured data, title and meta description length, Open Graph, and Twitter Card tags.',
    icon: Globe,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50'
  },
  {
    type: 'ssl',
    title: 'SSL / TLS Check',
    description: 'Inspects certificate expiry, issuer validity, HSTS configuration, TLS setup, and checks if the cert is self-signed or near expiry.',
    icon: Lock,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50'
  },
  {
    type: 'dns',
    title: 'DNS & Email Security',
    description: 'Looks up SPF, DKIM, and DMARC records to detect email spoofing risks. Also checks MX, CAA records, and DMARC policy strength.',
    icon: Mail,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50'
  },
  {
    type: 'links',
    title: 'Broken Links',
    description: 'Crawls all links on the page and sends HEAD requests to detect 404s, 5xx errors, and redirect chains across internal and external links.',
    icon: Link,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50'
  }
];

export default function AuditPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [completedScans, setCompletedScans] = useState<Partial<Record<ScanType, ScanResult>>>({});
  const [downloading, setDownloading] = useState(false);
  const { meta, loading: intelLoading, error: intelError, step } = useSiteIntel(submitted || undefined);

  const handleComplete = (result: ScanResult) => {
    setCompletedScans(prev => ({ ...prev, [result.type]: result }));
  };

  const handleDownload = async () => {
    setDownloading(true);
    try { await downloadWebReport(submitted, completedScans, 'Site Audit Report'); }
    finally { setDownloading(false); }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const normalized = url.trim().startsWith('http') ? url.trim() : 'https://' + url.trim();
    setCompletedScans({});
    setSubmitted(normalized);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-gray-900">Site Audit</h1>
          {(() => {
            const done = Object.keys(completedScans).length;
            const total = 4;
            return (
              <button
                onClick={handleDownload}
                disabled={done === 0 || downloading}
                className="btn-primary flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                title={done === 0 ? 'Run at least one audit to download' : `Download report with ${done} of ${total} audits`}
              >
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {done === 0 ? 'Download PDF' : `Download PDF (${done}/${total})`}
              </button>
            );
          })()}
        </div>
        <p className="text-sm text-gray-400 mt-0.5">
          Deep checks for SEO, SSL/TLS certificate health, DNS email security, and broken links.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim()}
          className="btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Run Audits
        </button>
      </form>

      {submitted && (
        <>
          <div className="mb-5">
            <BrowsingActivity
              url={submitted}
              step={step}
              loading={intelLoading}
              error={intelError}
              hostname={meta?.hostname}
              detectedServices={meta?.detectedServices}
            />
          </div>

          {meta && !intelLoading && (
            <div className="mb-6">
              <SiteIntelPanel meta={meta} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUDIT_TESTS.map((test, i) => (
              <div
                key={test.type}
                className={AUDIT_TESTS.length % 2 !== 0 && i === AUDIT_TESTS.length - 1 ? 'md:col-span-2' : ''}
              >
                <TestCard
                  url={submitted}
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
        </>
      )}

      {!submitted && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUDIT_TESTS.map(test => {
            const Icon = test.icon;
            return (
              <div key={test.type} className="card p-5 opacity-60">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg ${test.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={test.iconColor} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{test.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{test.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
