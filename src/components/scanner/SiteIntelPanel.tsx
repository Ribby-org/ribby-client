import { CheckCircle2, XCircle } from 'lucide-react';
import type { ScanMeta } from '../../types/scan';

interface SiteIntelPanelProps {
  meta: ScanMeta;
}

const SECURITY_HEADERS = [
  {
    key: 'content-security-policy',
    label: 'Content-Security-Policy',
    description: 'Content Security Policy is an effective measure to protect your site from XSS attacks. By whitelisting sources of approved content, you can prevent the browser from loading malicious assets.',
    link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
  },
  {
    key: 'x-frame-options',
    label: 'X-Frame-Options',
    description: 'X-Frame-Options tells the browser whether you want to allow your site to be framed or not. By preventing a browser from framing your site you can defend against clickjacking attacks. Recommended value "X-Frame-Options: SAMEORIGIN".',
    link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options',
  },
  {
    key: 'x-content-type-options',
    label: 'X-Content-Type-Options',
    description: 'X-Content-Type-Options stops a browser from trying to MIME-sniff the content type and forces it to stick with the declared content-type. The only valid value for this header is "X-Content-Type-Options: nosniff".',
    link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options',
  },
  {
    key: 'strict-transport-security',
    label: 'Strict-Transport-Security',
    description: 'HTTP Strict Transport Security is an excellent feature to support on your site and strengthens your implementation of TLS by getting the User Agent to enforce the use of HTTPS.',
    link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
  },
  {
    key: 'referrer-policy',
    label: 'Referrer-Policy',
    description: 'Referrer Policy is a new header that allows a site to control how much information the browser includes with navigations away from a document and should be set by all sites.',
    link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy',
  },
  {
    key: 'permissions-policy',
    label: 'Permissions-Policy',
    description: 'Permissions Policy is a new header that allows a site to control which features and APIs can be used in the browser.',
    link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy',
  },
];

export default function SiteIntelPanel({ meta }: SiteIntelPanelProps) {
  const hasServices = meta.detectedServices && meta.detectedServices.length > 0;
  const hasEndpoint = meta.hostname || meta.ipAddress || meta.hostingProvider || meta.server || meta.hostingCname;
  const hasHeaders = meta.headerSnapshot && Object.keys(meta.headerSnapshot).length > 0;

  if (!hasServices && !hasEndpoint && !hasHeaders) return null;

  // Normalize header snapshot keys to lowercase
  const headersLower = meta.headerSnapshot
    ? Object.keys(meta.headerSnapshot).reduce<Record<string, string>>((acc, key) => {
        acc[key.toLowerCase()] = meta.headerSnapshot![key];
        return acc;
      }, {})
    : {};

  const headerStatus = SECURITY_HEADERS.map(h => ({
    ...h,
    present: !!headersLower[h.key],
    value: headersLower[h.key] || null,
  }));

  const presentCount = headerStatus.filter(h => h.present).length;
  const missingHeaders = headerStatus.filter(h => !h.present);

  let statusLabel = 'Weak';
  let statusColor = '#ef4444';
  if (presentCount >= 5) { statusLabel = 'Strong'; statusColor = '#10b981'; }
  else if (presentCount >= 4) { statusLabel = 'Good'; statusColor = '#34d399'; }
  else if (presentCount >= 3) { statusLabel = 'Moderate'; statusColor = '#f59e0b'; }
  else if (presentCount < 1) { statusLabel = 'Failing'; statusColor = '#dc2626'; }

  return (
    <div className="space-y-4">
      {/* ── Security Headers Card ── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2e2a42' }}>
        
        {/* Summary row */}
        <div className="px-5 py-4" style={{ backgroundColor: '#231f35', borderBottom: '1px solid #2e2a42' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9390aa' }}>
              Security Headers Strength
            </p>
            <span className="text-xs font-semibold" style={{ color: statusColor }}>
              {statusLabel} ({presentCount}/6 headers present)
            </span>
          </div>
          {/* Gradient strength bar */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#2e2a42' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.max((presentCount / 6) * 100, 6)}%`,
                background: 'linear-gradient(90deg, #dc2626 0%, #f59e0b 50%, #10b981 100%)',
              }}
            />
          </div>
        </div>

        {/* Header badges */}
        <div className="px-5 py-3.5 flex flex-wrap gap-2" style={{ backgroundColor: '#1d1a2b' }}>
          {headerStatus.map(h => (
            <div
              key={h.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border"
              style={
                h.present
                  ? { color: '#34d399', backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }
                  : { color: '#f87171', backgroundColor: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)' }
              }
            >
              {h.present
                ? <CheckCircle2 size={11} style={{ color: '#10b981' }} />
                : <XCircle size={11} style={{ color: '#ef4444' }} />
              }
              {h.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Missing Headers explanation (like the reference site) ── */}
      {missingHeaders.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2e2a42' }}>
          <div className="px-5 py-3" style={{ backgroundColor: '#231f35', borderBottom: '1px solid #2e2a42' }}>
            <p className="text-sm font-semibold" style={{ color: '#ede9ff' }}>Missing Headers</p>
          </div>
          <div style={{ backgroundColor: '#1d1a2b' }}>
            {missingHeaders.map((h, i) => (
              <div
                key={h.key}
                className="flex gap-4 px-5 py-4"
                style={{ borderBottom: i < missingHeaders.length - 1 ? '1px solid #2e2a42' : undefined }}
              >
                <div className="w-44 flex-shrink-0 pt-0.5">
                  <a
                    href={h.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold hover:underline transition-colors"
                    style={{ color: '#f87171' }}
                  >
                    {h.label}
                  </a>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#9390aa' }}>
                  {h.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Detected Services ── */}
      {hasServices && (
        <div className="rounded-xl p-4" style={{ backgroundColor: '#231f35', border: '1px solid #2e2a42' }}>
          <p className="text-[10px] uppercase tracking-wide mb-2.5" style={{ color: '#6b6880' }}>Detected services</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(meta.detectedServices)).slice(0, 10).map(svc => (
              <span
                key={svc}
                className="text-[11px] px-2.5 py-0.5 rounded-full"
                style={{ color: '#ede9ff', backgroundColor: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.25)' }}
              >
                {svc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Endpoint Info ── */}
      {hasEndpoint && (
        <div className="rounded-xl p-4" style={{ backgroundColor: '#231f35', border: '1px solid #2e2a42' }}>
          <p className="text-[10px] uppercase tracking-wide mb-2.5" style={{ color: '#6b6880' }}>Endpoint info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {meta.hostname && (
              <p className="text-xs" style={{ color: '#c4c0d8' }}>
                Host: <span className="font-mono" style={{ color: '#ede9ff' }}>{meta.hostname}</span>
              </p>
            )}
            {meta.ipAddress && (
              <p className="text-xs" style={{ color: '#c4c0d8' }}>
                IP: <span className="font-mono" style={{ color: '#ede9ff' }}>{meta.ipAddress}{meta.ipVersion ? ` (${meta.ipVersion})` : ''}</span>
              </p>
            )}
            {meta.hostingProvider && (
              <p className="text-xs" style={{ color: '#c4c0d8' }}>
                Hosting: <span style={{ color: '#ede9ff' }}>{meta.hostingProvider}</span>
              </p>
            )}
            {meta.hostingCname && (
              <p className="text-xs" style={{ color: '#c4c0d8' }}>
                CNAME: <span className="font-mono break-all" style={{ color: '#ede9ff' }}>{meta.hostingCname}</span>
              </p>
            )}
            {meta.server && (
              <p className="text-xs" style={{ color: '#c4c0d8' }}>
                Server: <span className="font-mono break-all" style={{ color: '#ede9ff' }}>{meta.server}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Raw Response Headers ── */}
      {hasHeaders && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2e2a42' }}>
          <details>
            <summary
              className="flex items-center justify-between px-4 py-3 cursor-pointer select-none text-xs font-semibold"
              style={{ backgroundColor: '#231f35', color: '#9390aa' }}
            >
              Raw response headers ({Object.keys(meta.headerSnapshot!).length})
            </summary>
            <div style={{ backgroundColor: '#1d1a2b' }}>
              {Object.entries(meta.headerSnapshot!).map(([k, v]) => (
                <div key={k} className="flex gap-3 px-4 py-2">
                  <span className="font-mono text-[11px] w-48 flex-shrink-0" style={{ color: '#a78bfa' }}>{k}</span>
                  <span className="font-mono text-[11px] break-all" style={{ color: '#c4c0d8' }}>{v}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
