import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { ScanResult, ScanType, Finding, ScanMeta } from '../types/scan';
import type { RepoScanResult, RepoFinding } from '../types/repo';

// ── Brand colors ──────────────────────────────────────────────────────────────
const B = {
  blue:      '#1e4ed8',
  blueDark:  '#0f172a',
  blueLight: '#3b82f6',
  bluePale:  '#f8fafc',
  critical:  '#dc2626',
  high:      '#ea580c',
  medium:    '#d97706',
  low:       '#16a34a',
  info:      '#1e4ed8',
  black:     '#0f172a',
  darkGray:  '#1e293b',
  midGray:   '#475569',
  gray:      '#64748b',
  lightGray: '#cbd5e1',
  ultraLight:'#f8fafc',
  white:     '#ffffff',
};

const SEV_COLOR: Record<string, string> = {
  critical: B.critical,
  high: B.high,
  medium: B.medium,
  low: B.low,
  info: B.info
};

const TYPE_LABEL: Partial<Record<ScanType, string>> = {
  security:      'Safety Checks',
  performance:   'Performance Audit',
  accessibility: 'Accessibility',
  functional:    'Functional Test',
  load:          'Load Testing',
  seo:           'SEO Audit',
  ssl:           'SSL / TLS',
  dns:           'DNS & Email Security',
  links:         'Broken Links',
  crypto:        'Crypto & Breach Detection',
};

// ── Styles (Sharp style with 1.5px/2px borders and no rounded corners) ───────
const s = StyleSheet.create({
  page:         { fontFamily: 'Helvetica', backgroundColor: B.white, paddingBottom: 52 },

  // ─ Header bar (Clean white background with a sharp 2px bottom border)
  header:       { borderBottom: '2px solid #0f172a', paddingHorizontal: 36, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: B.white },
  logoText:     { color: B.black, fontSize: 16, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  logoSub:      { color: B.midGray, fontSize: 8, marginTop: 2, letterSpacing: 0.3 },
  headerRight:  { alignItems: 'flex-end' },
  headerLabel:  { color: B.midGray, fontSize: 8, letterSpacing: 0.3 },
  headerValue:  { color: B.black, fontSize: 9, fontFamily: 'Helvetica-Bold', marginTop: 2 },

  // ─ Body
  body:         { paddingHorizontal: 36, paddingTop: 24 },

  // ─ Cover hero (Sharp box with 1.5px border)
  hero:         { backgroundColor: B.ultraLight, border: '1.5px solid #0f172a', padding: 20, marginBottom: 20 },
  heroTitle:    { fontSize: 20, fontFamily: 'Helvetica-Bold', color: B.black, marginBottom: 4 },
  heroUrl:      { fontSize: 10, color: B.midGray, fontFamily: 'Helvetica', marginBottom: 12 },
  heroMeta:     { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  heroChip:     { backgroundColor: B.white, border: '1px solid #0f172a', paddingHorizontal: 8, paddingVertical: 4 },
  heroChipLbl:  { fontSize: 7, color: B.midGray, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 1 },
  heroChipVal:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: B.black },

  // ─ Score row (Sharp boxes with 1.5px borders)
  scoreRow:     { flexDirection: 'row', gap: 8, marginBottom: 20 },
  scoreBox:     { flex: 1, padding: 12, alignItems: 'center', border: '1.5px solid #0f172a', backgroundColor: B.white },
  scoreNum:     { fontSize: 24, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  scoreLbl:     { fontSize: 7, color: B.midGray, textTransform: 'uppercase', letterSpacing: 0.4 },

  // ─ Section
  section:      { marginBottom: 20 },
  sectionBar:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: '1.5px solid #0f172a' },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: B.black, flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionScore: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  sectionBadges:{ flexDirection: 'row', gap: 5, marginBottom: 8, flexWrap: 'wrap' },

  // ─ Finding card (Sharp borders, clean padding)
  card:         { border: '1.5px solid #0f172a', marginBottom: 8, overflow: 'hidden' },
  cardHead:     { flexDirection: 'row', alignItems: 'flex-start', padding: '8 10', gap: 8 },
  cardStripe:   { width: 4, alignSelf: 'stretch', flexShrink: 0 },
  cardBadge:    { border: '1px solid #0f172a', paddingHorizontal: 6, paddingVertical: 2, flexShrink: 0 },
  cardBadgeTxt: { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.3 },
  cardTitle:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: B.black, flex: 1, lineHeight: 1.3 },
  cardBody:     { backgroundColor: B.ultraLight, paddingHorizontal: 10, paddingVertical: 8, borderTop: '1px solid #0f172a' },
  cardDesc:     { fontSize: 8, color: B.midGray, lineHeight: 1.5, marginBottom: 6 },
  cardLocRow:   { flexDirection: 'row', gap: 4, marginBottom: 6, alignItems: 'center' },
  cardLocDot:   { width: 4, height: 4, backgroundColor: B.black, flexShrink: 0 },
  cardLocTxt:   { fontSize: 7.5, color: B.gray, fontFamily: 'Helvetica-Oblique', flex: 1 },
  fixBox:       { backgroundColor: B.white, border: '1px solid #0f172a', padding: '6 8' },
  fixTitle:     { fontSize: 7, fontFamily: 'Helvetica-Bold', color: B.blue, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 },
  fixText:      { fontSize: 8, color: B.darkGray, lineHeight: 1.45 },

  // ─ Site Intel Grid
  intelGrid:     { border: '1.5px solid #0f172a', marginBottom: 12 },
  intelRow:      { flexDirection: 'row', borderBottom: '1px solid #e2e8f0', padding: '6 8' },
  intelKey:      { fontSize: 8, fontFamily: 'Helvetica-Bold', color: B.midGray, width: 120 },
  intelVal:      { fontSize: 8, color: B.darkGray, flex: 1 },
  intelSubTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: B.black, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  serviceBadge:  { border: '1px solid #0f172a', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: B.white, marginRight: 4, marginBottom: 4 },
  serviceBadgeTxt:{ fontSize: 8, color: B.black, fontFamily: 'Helvetica-Bold' },
  headersTable:  { border: '1.5px solid #0f172a', marginTop: 4 },
  headersRow:    { flexDirection: 'row', borderBottom: '1px solid #cbd5e1', padding: '5 8' },
  headerKeyCol:  { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: B.midGray, width: 150 },
  headerValCol:  { fontSize: 7.5, color: B.darkGray, flex: 1 },

  // ─ Load stats (Sharp grid)
  statsRow:     { flexDirection: 'row', gap: 6, marginBottom: 8 },
  statBox:      { flex: 1, border: '1px solid #0f172a', padding: '8 6', alignItems: 'center', backgroundColor: B.white },
  statVal:      { fontSize: 13, fontFamily: 'Helvetica-Bold', color: B.black, marginBottom: 1 },
  statLbl:      { fontSize: 7, color: B.midGray, textTransform: 'uppercase', letterSpacing: 0.3 },

  // ─ Footer
  footer:       { position: 'absolute', bottom: 18, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #0f172a' },
  footerTxt:    { fontSize: 7.5, color: B.gray },

  // ─ Sev badge helper
  sevChip:      { flexDirection: 'row', alignItems: 'center', border: '1px solid #0f172a', paddingHorizontal: 7, paddingVertical: 2.5, backgroundColor: B.white },
  sevDot:       { width: 5, height: 5, marginRight: 4 },
  sevTxt:       { fontSize: 7.5, fontFamily: 'Helvetica-Bold' },
});

// ── Sub-components ────────────────────────────────────────────────────────────
function SevBadge({ sev }: { sev: string }) {
  const c = SEV_COLOR[sev] || B.info;
  return (
    <View style={s.sevChip}>
      <View style={[s.sevDot, { backgroundColor: c }]} />
      <Text style={[s.sevTxt, { color: c }]}>{sev.toUpperCase()}</Text>
    </View>
  );
}

function FindingCard({ f }: { f: Finding | RepoFinding }) {
  const c = SEV_COLOR[f.severity] || B.info;
  return (
    <View style={s.card} wrap={false}>
      <View style={s.cardHead}>
        <View style={[s.cardStripe, { backgroundColor: c }]} />
        <SevBadge sev={f.severity} />
        <Text style={s.cardTitle}>{f.title}</Text>
        {'cve' in f && f.cve && (
          <View style={s.cardBadge}>
            <Text style={[s.cardBadgeTxt, { color: B.gray }]}>{f.cve}</Text>
          </View>
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardDesc}>{f.description}</Text>
        {'location' in f && f.location && (
          <View style={s.cardLocRow}>
            <View style={s.cardLocDot} />
            <Text style={s.cardLocTxt}>{f.location}</Text>
          </View>
        )}
        {'file' in f && f.file && (
          <View style={s.cardLocRow}>
            <View style={s.cardLocDot} />
            <Text style={s.cardLocTxt}>{f.file}{'line' in f && f.line ? `:${f.line}` : ''}</Text>
          </View>
        )}
        <View style={s.fixBox}>
          <Text style={s.fixTitle}>Recommendation</Text>
          <Text style={s.fixText}>{f.recommendation}</Text>
        </View>
      </View>
    </View>
  );
}

function SiteIntelSection({ meta }: { meta?: ScanMeta | null }) {
  if (!meta) return null;
  const hasServices = meta.detectedServices && meta.detectedServices.length > 0;
  const hasEndpoint = meta.hostname || meta.ipAddress || meta.hostingProvider || meta.server || meta.hostingCname;
  const hasHeaders = meta.headerSnapshot && Object.keys(meta.headerSnapshot).length > 0;

  if (!hasServices && !hasEndpoint && !hasHeaders) return null;

  return (
    <View style={s.section} wrap={false}>
      <View style={s.sectionBar}>
        <Text style={s.sectionTitle}>Site Intelligence &amp; Endpoint Details</Text>
      </View>

      {hasEndpoint && (
        <View style={s.intelGrid}>
          {meta.hostname && (
            <View style={s.intelRow}>
              <Text style={s.intelKey}>Hostname</Text>
              <Text style={s.intelVal}>{meta.hostname}</Text>
            </View>
          )}
          {meta.ipAddress && (
            <View style={s.intelRow}>
              <Text style={s.intelKey}>IP Address</Text>
              <Text style={s.intelVal}>{meta.ipAddress} {meta.ipVersion ? `(${meta.ipVersion.toUpperCase()})` : ''}</Text>
            </View>
          )}
          {meta.hostingProvider && (
            <View style={s.intelRow}>
              <Text style={s.intelKey}>Hosting Provider</Text>
              <Text style={s.intelVal}>{meta.hostingProvider}</Text>
            </View>
          )}
          {meta.hostingCname && (
            <View style={s.intelRow}>
              <Text style={s.intelKey}>CNAME Record</Text>
              <Text style={s.intelVal}>{meta.hostingCname}</Text>
            </View>
          )}
          {meta.server && (
            <View style={[s.intelRow, { borderBottom: 'none' }]}>
              <Text style={s.intelKey}>Web Server</Text>
              <Text style={s.intelVal}>{meta.server}</Text>
            </View>
          )}
        </View>
      )}

      {hasServices && (
        <View style={{ marginBottom: 12 }}>
          <Text style={s.intelSubTitle}>Detected Services &amp; Technologies</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {Array.from(new Set(meta.detectedServices)).map(svc => (
              <View key={svc} style={s.serviceBadge}>
                <Text style={s.serviceBadgeTxt}>{svc}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {hasHeaders && (
        <View wrap={false}>
          <Text style={s.intelSubTitle}>HTTP Response Headers</Text>
          <View style={s.headersTable}>
            {Object.entries(meta.headerSnapshot!).map(([k, v], i, arr) => (
              <View key={k} style={[s.headersRow, i === arr.length - 1 ? { borderBottom: 'none' } : {}]}>
                <Text style={s.headerKeyCol}>{k}</Text>
                <Text style={s.headerValCol}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function Footer({ url }: { url: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerTxt}>Ribby  |  {url}</Text>
      <Text style={s.footerTxt}>
        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>
      <Text style={s.footerTxt} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

// ── Web Scan PDF ──────────────────────────────────────────────────────────────
interface WebScanPDFProps {
  url: string;
  scans: Partial<Record<ScanType, ScanResult>>;
  reportTitle: string;
  meta?: ScanMeta | null;
}

export function WebScanPDF({ url, scans, reportTitle, meta }: WebScanPDFProps) {
  const entries = Object.entries(scans).filter(([, s]) => s?.status === 'complete') as [ScanType, ScanResult][];
  const allFindings = entries.flatMap(([, s]) => s.findings);
  const counts = {
    critical: allFindings.filter(f => f.severity === 'critical').length,
    high:     allFindings.filter(f => f.severity === 'high').length,
    medium:   allFindings.filter(f => f.severity === 'medium').length,
    low:      allFindings.filter(f => f.severity === 'low').length,
  };
  const avgScore = entries.length
    ? Math.round(entries.reduce((a, [, s]) => a + s.summary.score, 0) / entries.length)
    : 0;
  const scoreColor = avgScore >= 80 ? B.low : avgScore >= 60 ? B.medium : B.critical;

  return (
    <Document title={`Ribby — ${reportTitle}`} author="Ribby" creator="Ribby">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logoText}>Ribby</Text>
            <Text style={s.logoSub}>Web Application Scanner</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerLabel}>{reportTitle}</Text>
            <Text style={s.headerValue}>{url}</Text>
          </View>
        </View>

        <View style={s.body}>
          {/* Hero */}
          <View style={s.hero}>
            <Text style={s.heroTitle}>{reportTitle}</Text>
            <Text style={s.heroUrl}>{url}</Text>
            <View style={s.heroMeta}>
              <View style={s.heroChip}>
                <Text style={s.heroChipLbl}>Generated</Text>
                <Text style={s.heroChipVal}>{new Date().toLocaleDateString('en-GB')}</Text>
              </View>
              <View style={s.heroChip}>
                <Text style={s.heroChipLbl}>Tests run</Text>
                <Text style={s.heroChipVal}>{entries.length}</Text>
              </View>
              <View style={s.heroChip}>
                <Text style={s.heroChipLbl}>Total issues</Text>
                <Text style={s.heroChipVal}>{allFindings.length}</Text>
              </View>
            </View>
          </View>

          {/* Score row */}
          <View style={s.scoreRow}>
            <View style={[s.scoreBox, { borderLeftWidth: 3, borderLeftColor: scoreColor }]}>
              <Text style={[s.scoreNum, { color: scoreColor }]}>{avgScore}</Text>
              <Text style={s.scoreLbl}>Average Score</Text>
            </View>
            {([
              { label: 'Critical', count: counts.critical, color: B.critical },
              { label: 'High',     count: counts.high,     color: B.high },
              { label: 'Medium',   count: counts.medium,   color: B.medium },
              { label: 'Low',      count: counts.low,      color: B.low },
            ] as { label: string; count: number; color: string }[]).map(({ label, count, color }) => (
              <View key={label} style={[s.scoreBox, count > 0 ? { borderLeftWidth: 3, borderLeftColor: color } : {}]}>
                <Text style={[s.scoreNum, { color: count > 0 ? color : B.gray, fontSize: 20 }]}>{count}</Text>
                <Text style={s.scoreLbl}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Methodology note */}
          <View style={{ border: '1.5px solid #0f172a', padding: '10 14', marginBottom: 20, backgroundColor: B.ultraLight }}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: B.black, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>About This Report</Text>
            <Text style={{ fontSize: 7.5, color: B.midGray, lineHeight: 1.6 }}>
              This report was generated by Ribby by making live HTTP requests to the target URL at the time of scanning.
              All findings are based on actual server responses, response headers, HTML content, and network behaviour observed during the scan.
              No data in this report is fabricated or estimated. Findings reflect the state of the application at the exact time the scan was run.
            </Text>
          </View>

          {/* Site Intel Section (Host metadata, detected services, response headers) */}
          <SiteIntelSection meta={meta} />

          {/* Per-test sections */}
          {entries.map(([type, scan]) => (
            <View key={type} style={s.section}>
              <View style={s.sectionBar}>
                <Text style={s.sectionTitle}>{TYPE_LABEL[type] ?? type}</Text>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text style={[s.sectionScore, { color: scan.summary.score >= 80 ? B.low : scan.summary.score >= 60 ? B.medium : B.critical }]}>
                    Score  {scan.summary.score} / 100
                  </Text>
                  {scan.meta.responseTime > 0 && (
                    <Text style={{ fontSize: 7, color: B.gray }}>
                      HTTP {scan.meta.statusCode}  ·  {scan.meta.responseTime}ms  ·  scanned {scan.completedAt ? new Date(scan.completedAt).toLocaleTimeString('en-GB') : ''}
                    </Text>
                  )}
                </View>
              </View>

              {/* Summary badges */}
              <View style={s.sectionBadges}>
                {(['critical','high','medium','low'] as const).map(sev =>
                  scan.summary[sev] > 0 ? (
                    <View key={sev} style={s.sevChip}>
                      <View style={[s.sevDot, { backgroundColor: SEV_COLOR[sev] }]} />
                      <Text style={[s.sevTxt, { color: SEV_COLOR[sev] }]}>{scan.summary[sev]}  {sev.toUpperCase()}</Text>
                    </View>
                  ) : null
                )}
                {scan.summary.total === 0 && (
                  <View style={s.sevChip}>
                    <View style={[s.sevDot, { backgroundColor: B.low }]} />
                    <Text style={[s.sevTxt, { color: B.low }]}>NO ISSUES FOUND</Text>
                  </View>
                )}
              </View>

              {/* Load stats */}
              {scan.loadStats && (
                <View style={s.statsRow}>
                  {([
                    { label: 'Avg Response', value: `${scan.loadStats.avgTime} ms` },
                    { label: 'P95 Latency',  value: `${scan.loadStats.p95Time} ms` },
                    { label: 'Success Rate', value: `${scan.loadStats.successRate}%` },
                    { label: 'Requests',     value: String(scan.loadStats.requests) },
                  ] as { label: string; value: string }[]).map(({ label, value }) => (
                    <View key={label} style={s.statBox}>
                      <Text style={s.statVal}>{value}</Text>
                      <Text style={s.statLbl}>{label}</Text>
                    </View>
                  ))}
                </View>
              )}

              {scan.findings.map(f => <FindingCard key={f.id} f={f} />)}
            </View>
          ))}
        </View>

        <Footer url={url} />
      </Page>
    </Document>
  );
}

// ── Repo Scan PDF ─────────────────────────────────────────────────────────────
export function RepoScanPDF({ result }: { result: RepoScanResult }) {
  const { summary, meta } = result;
  const scoreColor = summary.score >= 80 ? B.low : summary.score >= 60 ? B.medium : B.critical;
  const categories: { key: RepoFinding['category']; label: string }[] = [
    { key: 'secret',     label: 'Secrets & Credentials' },
    { key: 'dependency', label: 'Vulnerable Dependencies' },
    { key: 'exposure',   label: 'Exposed Files' },
    { key: 'config',     label: 'Configuration Issues' },
  ];

  return (
    <Document title={`Ribby — ${result.owner}/${result.repo}`} author="Ribby" creator="Ribby">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.logoText}>Ribby</Text>
            <Text style={s.logoSub}>Repository Security Scanner</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerLabel}>{result.owner}/{result.repo}</Text>
            <Text style={s.headerValue}>Branch: {result.defaultBranch}</Text>
          </View>
        </View>

        <View style={s.body}>
          <View style={s.hero}>
            <Text style={s.heroTitle}>Repository Security Report</Text>
            <Text style={s.heroUrl}>{result.repoUrl}</Text>
            <View style={s.heroMeta}>
              <View style={s.heroChip}>
                <Text style={s.heroChipLbl}>Generated</Text>
                <Text style={s.heroChipVal}>{new Date().toLocaleDateString('en-GB')}</Text>
              </View>
              <View style={s.heroChip}>
                <Text style={s.heroChipLbl}>Files scanned</Text>
                <Text style={s.heroChipVal}>{meta.filesScanned}</Text>
              </View>
              <View style={s.heroChip}>
                <Text style={s.heroChipLbl}>Deps checked</Text>
                <Text style={s.heroChipVal}>{meta.depsChecked}</Text>
              </View>
              {meta.language.length > 0 && (
                <View style={s.heroChip}>
                  <Text style={s.heroChipLbl}>Language</Text>
                  <Text style={s.heroChipVal}>{meta.language.join(', ')}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={s.scoreRow}>
            <View style={[s.scoreBox, { borderLeftWidth: 3, borderLeftColor: scoreColor }]}>
              <Text style={[s.scoreNum, { color: scoreColor }]}>{summary.score}</Text>
              <Text style={s.scoreLbl}>Security Score</Text>
            </View>
            {([
              { label: 'Critical', count: summary.critical, color: B.critical },
              { label: 'High',     count: summary.high,     color: B.high },
              { label: 'Medium',   count: summary.medium,   color: B.medium },
              { label: 'Low',      count: summary.low,      color: B.low },
            ] as { label: string; count: number; color: string }[]).map(({ label, count, color }) => (
              <View key={label} style={[s.scoreBox, count > 0 ? { borderLeftWidth: 3, borderLeftColor: color } : {}]}>
                <Text style={[s.scoreNum, { color: count > 0 ? color : B.gray, fontSize: 20 }]}>{count}</Text>
                <Text style={s.scoreLbl}>{label}</Text>
              </View>
            ))}
          </View>

          {categories.map(({ key, label }) => {
            const findings = result.findings.filter((f: RepoFinding) => f.category === key);
            if (!findings.length) return null;
            return (
              <View key={key} style={s.section}>
                <View style={s.sectionBar}>
                  <Text style={s.sectionTitle}>{label}</Text>
                  <Text style={[s.sectionScore, { color: B.midGray }]}>{findings.length} finding{findings.length !== 1 ? 's' : ''}</Text>
                </View>
                {findings.map((f: RepoFinding) => <FindingCard key={f.id} f={f} />)}
              </View>
            );
          })}
        </View>

        <Footer url={result.repoUrl} />
      </Page>
    </Document>
  );
}

// ── Download helpers ──────────────────────────────────────────────────────────
export async function downloadWebReport(
  url: string,
  scans: Partial<Record<ScanType, ScanResult>>,
  reportTitle: string,
  meta?: ScanMeta | null
) {
  const blob = await pdf(<WebScanPDF url={url} scans={scans} reportTitle={reportTitle} meta={meta} />).toBlob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ribby-${reportTitle.toLowerCase().replace(/\s+/g,'-')}-${new Date().toISOString().slice(0,10)}.pdf`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function downloadRepoReport(result: RepoScanResult) {
  const blob = await pdf(<RepoScanPDF result={result} />).toBlob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ribby-repo-${result.repo}-${new Date().toISOString().slice(0,10)}.pdf`;
  a.click();
  URL.revokeObjectURL(a.href);
}
