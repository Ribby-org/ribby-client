import { CheckCircle2, XCircle } from 'lucide-react';
import type { ScanMeta } from '../../types/scan';

interface SiteIntelPanelProps {
  meta: ScanMeta;
}

const SECURITY_HEADERS = [
  { key: 'content-security-policy', label: 'Content-Security-Policy' },
  { key: 'permissions-policy', label: 'Permissions-Policy' },
  { key: 'referrer-policy', label: 'Referrer-Policy' },
  { key: 'strict-transport-security', label: 'Strict-Transport-Security' },
  { key: 'x-content-type-options', label: 'X-Content-Type-Options' },
  { key: 'x-frame-options', label: 'X-Frame-Options' },
];

export default function SiteIntelPanel({ meta }: SiteIntelPanelProps) {
  const hasServices = meta.detectedServices && meta.detectedServices.length > 0;
  const hasEndpoint = meta.hostname || meta.ipAddress || meta.hostingProvider || meta.server || meta.hostingCname;
  const hasHeaders = meta.headerSnapshot && Object.keys(meta.headerSnapshot).length > 0;

  if (!hasServices && !hasEndpoint && !hasHeaders) return null;

  // Normalize header snapshot keys to lowercase for checking
  const headersLower = meta.headerSnapshot
    ? Object.keys(meta.headerSnapshot).reduce<Record<string, string>>((acc, key) => {
        acc[key.toLowerCase()] = meta.headerSnapshot![key];
        return acc;
      }, {})
    : {};

  // Check each security header
  const headerStatus = SECURITY_HEADERS.map(h => ({
    ...h,
    present: !!headersLower[h.key],
  }));

  const presentCount = headerStatus.filter(h => h.present).length;

  // Determine strength label and color
  let statusLabel = 'Weak';
  let statusColor = '#ef4444'; // Red
  if (presentCount >= 5) {
    statusLabel = 'Strong';
    statusColor = '#10b981'; // Green
  } else if (presentCount >= 3) {
    statusLabel = 'Moderate';
    statusColor = '#f59e0b'; // Yellow/Orange
  }

  return (
    <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: '#231f35', border: '1px solid #2e2a42' }}>
      
      {/* ── Security Headers Strength Panel ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#9390aa' }}>Security Headers Strength</p>
          <span className="text-xs font-semibold transition-colors duration-300" style={{ color: statusColor }}>
            {statusLabel} ({presentCount}/6 headers present)
          </span>
        </div>
        
        {/* Gradient strength bar */}
        <div className="w-full h-2 rounded-full overflow-hidden mb-3.5" style={{ backgroundColor: '#2e2a42' }}>
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max((presentCount / 6) * 100, 8)}%`,
              background: `linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)`,
            }}
          />
        </div>

        {/* List of checked security headers */}
        <div className="flex flex-wrap gap-2">
          {headerStatus.map(h => (
            <div
              key={h.key}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors duration-200"
              style={
                h.present
                  ? {
                      color: '#34d399',
                      backgroundColor: 'rgba(16,185,129,0.08)',
                      borderColor: 'rgba(16,185,129,0.2)',
                    }
                  : {
                      color: '#f87171',
                      backgroundColor: 'rgba(239,68,68,0.06)',
                      borderColor: 'rgba(239,68,68,0.15)',
                    }
              }
            >
              {h.present ? (
                <CheckCircle2 size={12} className="flex-shrink-0" style={{ color: '#10b981' }} />
              ) : (
                <XCircle size={12} className="flex-shrink-0" style={{ color: '#ef4444' }} />
              )}
              <span>{h.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr style={{ borderColor: '#2e2a42' }} />

      {/* Detected Services */}
      {hasServices && (
        <div>
          <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: '#6b6880' }}>Detected services</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(meta.detectedServices)).slice(0, 10).map(svc => (
              <span
                key={svc}
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ color: '#ede9ff', backgroundColor: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.25)' }}
              >
                {svc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Endpoint Info */}
      {hasEndpoint && (
        <div>
          <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: '#6b6880' }}>Endpoint info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
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

      {/* Headers snapshot */}
      {hasHeaders && (
        <details className="rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #2e2a42' }}>
          <summary className="text-xs cursor-pointer select-none" style={{ color: '#9390aa' }}>
            Raw response headers ({Object.keys(meta.headerSnapshot!).length})
          </summary>
          <div className="mt-2 space-y-1">
            {Object.entries(meta.headerSnapshot!).map(([k, v]) => (
              <p key={k} className="text-[11px] leading-relaxed break-all" style={{ color: '#c4c0d8' }}>
                <span className="font-mono" style={{ color: '#a78bfa' }}>{k}</span>: <span className="font-mono">{v}</span>
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
