import type { ScanMeta } from '../../types/scan';

interface SiteIntelPanelProps {
  meta: ScanMeta;
}

export default function SiteIntelPanel({ meta }: SiteIntelPanelProps) {
  const hasServices = meta.detectedServices && meta.detectedServices.length > 0;
  const hasEndpoint = meta.hostname || meta.ipAddress || meta.hostingProvider || meta.server || meta.hostingCname;
  const hasHeaders = meta.headerSnapshot && Object.keys(meta.headerSnapshot).length > 0;

  if (!hasServices && !hasEndpoint && !hasHeaders) return null;

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#231f35', border: '1px solid #2e2a42' }}>
      {hasServices && (
        <div className="mb-3">
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

      {hasEndpoint && (
        <div className="mb-3">
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
