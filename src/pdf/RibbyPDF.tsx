import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { ScanResult, ScanType, Finding } from '../types/scan';
import type { RepoScanResult, RepoFinding } from '../../api/scanners/repo';

// ── Brand colors ──────────────────────────────────────────────────────────────
const B = {
  blue:      '#2563eb',
  blueDark:  '#1e3a8a',
  blueMid:   '#1d4ed8',
  blueLight: '#dbeafe',
  bluePale:  '#eff6ff',
  critical:  '#dc2626',
  high:      '#ea580c',
  medium:    '#d97706',
  low:       '#16a34a',
  info:      '#2563eb',
  black:     '#0f172a',
  darkGray:  '#1e293b',
  midGray:   '#475569',
  gray:      '#94a3b8',
  lightGray: '#e2e8f0',
  ultraLight:'#f8fafc',
  white:     '#ffffff',
};

const SEV_COLOR: Record<string, string> = {
  critical: B.critical, high: B.high, medium: B.medium, low: B.low, info: B.info
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
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:         { fontFamily: 'Helvetica', backgroundColor: B.white, paddingBottom: 52 },

  // ─ Header bar
  header:       { backgroundColor: B.blue, paddingHorizontal: 36, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoText:     { color: B.white, fontSize: 18, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  logoSub:      { color: '#93c5fd', fontSize: 8, marginTop: 3, letterSpacing: 0.3 },
  headerRight:  { alignItems: 'flex-end' },
  headerLabel:  { color: '#93c5fd', fontSize: 8, letterSpacing: 0.3 },
  headerValue:  { color: B.white, fontSize: 9, fontFamily: 'Helvetica-Bold', marginTop: 2 },

  // ─ Body
  body:         { paddingHorizontal: 36, paddingTop: 28 },

  // ─ Cover hero
  hero:         { backgroundColor: B.bluePale, borderRadius: 8, padding: 24, marginBottom: 24 },
  heroTitle:    { fontSize: 22, fontFamily: 'Helvetica-Bold', color: B.black, marginBottom: 4 },
  heroUrl:      { fontSize: 10, color: B.midGray, fontFamily: 'Helvetica', marginBottom: 16 },
  heroMeta:     { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  heroChip:     { backgroundColor: B.white, border: `1 solid ${B.lightGray}`, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  heroChipLbl:  { fontSize: 7, color: B.gray, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 1 },
  heroChipVal:  { fontSize: 10, fontFamily: 'Helvetica-Bold', color: B.black },

  // ─ Score row
  scoreRow:     { flexDirection: 'row', gap: 10, marginBottom: 24 },
  scoreBox:     { flex: 1, borderRadius: 6, padding: 14, alignItems: 'center', border: `1 solid ${B.lightGray}` },
  scoreNum:     { fontSize: 26, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  scoreLbl:     { fontSize: 7, color: B.gray, textTransform: 'uppercase', letterSpacing: 0.4 },

  // ─ Section
  section:      { marginBottom: 20 },
  sectionBar:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingBottom: 6, borderBottom: `1 solid ${B.lightGray}` },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: B.black, flex: 1 },
  sectionScore: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  sectionBadges:{ flexDirection: 'row', gap: 5, marginBottom: 10, flexWrap: 'wrap' },

  // ─ Finding card
  card:         { border: `1 solid ${B.lightGray}`, borderRadius: 6, marginBottom: 7, overflow: 'hidden' },
  cardHead:     { flexDirection: 'row', alignItems: 'flex-start', padding: '9 12', gap: 8 },
  cardStripe:   { width: 3, borderRadius: 2, alignSelf: 'stretch', flexShrink: 0 },
  cardBadge:    { borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, flexShrink: 0 },
  cardBadgeTxt: { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.3 },
  cardTitle:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: B.black, flex: 1, lineHeight: 1.4 },
  cardBody:     { backgroundColor: B.ultraLight, paddingHorizontal: 12, paddingVertical: 10, borderTop: `1 solid ${B.lightGray}` },
  cardDesc:     { fontSize: 8, color: B.midGray, lineHeight: 1.55, marginBottom: 7 },
  cardLocRow:   { flexDirection: 'row', gap: 4, marginBottom: 7, alignItems: 'center' },
  cardLocDot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: B.lightGray, flexShrink: 0, marginTop: 2 },
  cardLocTxt:   { fontSize: 7.5, color: B.gray, fontFamily: 'Helvetica-Oblique', flex: 1 },
  fixBox:       { backgroundColor: B.bluePale, border: `1 solid ${B.blueLight}`, borderRadius: 3, padding: '7 10' },
  fixTitle:     { fontSize: 7, fontFamily: 'Helvetica-Bold', color: B.blue, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 3 },
  fixText:      { fontSize: 8, color: B.darkGray, lineHeight: 1.5 },

  // ─ Load stats
  statsRow:     { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statBox:      { flex: 1, border: `1 solid ${B.lightGray}`, borderRadius: 6, padding: '10 8', alignItems: 'center' },
  statVal:      { fontSize: 14, fontFamily: 'Helvetica-Bold', color: B.black, marginBottom: 2 },
  statLbl:      { fontSize: 7, color: B.gray, textTransform: 'uppercase', letterSpacing: 0.3 },

  // ─ Footer
  footer:       { position: 'absolute', bottom: 18, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTop: `1 solid ${B.lightGray}` },
  footerTxt:    { fontSize: 7.5, color: B.gray },

  // ─ Sev badge helper
  sevChip:      { flexDirection: 'row', alignItems: 'center', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2.5 },
  sevDot:       { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
  sevTxt:       { fontSize: 7.5, fontFamily: 'Helvetica-Bold' },
});

// ── Sub-components ────────────────────────────────────────────────────────────
function SevBadge({ sev }: { sev: string }) {
  const c = SEV_COLOR[sev] || B.info;
  return (
    <View style={[s.sevChip, { backgroundColor: c + '18', border: `1 solid ${c}50` }]}>
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
          <View style={[s.cardBadge, { backgroundColor: B.ultraLight, border: `1 solid ${B.lightGray}` }]}>
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
}

export function WebScanPDF({ url, scans, reportTitle }: WebScanPDFProps) {
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
            <View style={[s.scoreBox, { backgroundColor: scoreColor + '08', borderColor: scoreColor + '40' }]}>
              <Text style={[s.scoreNum, { color: scoreColor }]}>{avgScore}</Text>
              <Text style={s.scoreLbl}>Average Score</Text>
            </View>
            {([
              { label: 'Critical', count: counts.critical, color: B.critical },
              { label: 'High',     count: counts.high,     color: B.high },
              { label: 'Medium',   count: counts.medium,   color: B.medium },
              { label: 'Low',      count: counts.low,      color: B.low },
            ] as { label: string; count: number; color: string }[]).map(({ label, count, color }) => (
              <View key={label} style={[s.scoreBox, count > 0 ? { backgroundColor: color + '08', borderColor: color + '40' } : {}]}>
                <Text style={[s.scoreNum, { color: count > 0 ? color : B.gray, fontSize: 22 }]}>{count}</Text>
                <Text style={s.scoreLbl}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Per-test sections */}
          {entries.map(([type, scan]) => (
            <View key={type} style={s.section}>
              <View style={s.sectionBar}>
                <Text style={s.sectionTitle}>{TYPE_LABEL[type] ?? type}</Text>
                <Text style={[s.sectionScore, { color: scan.summary.score >= 80 ? B.low : scan.summary.score >= 60 ? B.medium : B.critical }]}>
                  Score  {scan.summary.score} / 100
                </Text>
              </View>

              {/* Summary badges */}
              <View style={s.sectionBadges}>
                {(['critical','high','medium','low'] as const).map(sev =>
                  scan.summary[sev] > 0 ? (
                    <View key={sev} style={[s.sevChip, { backgroundColor: SEV_COLOR[sev] + '15', border: `1 solid ${SEV_COLOR[sev]}40` }]}>
                      <View style={[s.sevDot, { backgroundColor: SEV_COLOR[sev] }]} />
                      <Text style={[s.sevTxt, { color: SEV_COLOR[sev] }]}>{scan.summary[sev]}  {sev.toUpperCase()}</Text>
                    </View>
                  ) : null
                )}
                {scan.summary.total === 0 && (
                  <View style={[s.sevChip, { backgroundColor: B.low + '15', border: `1 solid ${B.low}40` }]}>
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
            <View style={[s.scoreBox, { backgroundColor: scoreColor + '08', borderColor: scoreColor + '40' }]}>
              <Text style={[s.scoreNum, { color: scoreColor }]}>{summary.score}</Text>
              <Text style={s.scoreLbl}>Security Score</Text>
            </View>
            {([
              { label: 'Critical', count: summary.critical, color: B.critical },
              { label: 'High',     count: summary.high,     color: B.high },
              { label: 'Medium',   count: summary.medium,   color: B.medium },
              { label: 'Low',      count: summary.low,      color: B.low },
            ] as { label: string; count: number; color: string }[]).map(({ label, count, color }) => (
              <View key={label} style={[s.scoreBox, count > 0 ? { backgroundColor: color + '08', borderColor: color + '40' } : {}]}>
                <Text style={[s.scoreNum, { color: count > 0 ? color : B.gray, fontSize: 22 }]}>{count}</Text>
                <Text style={s.scoreLbl}>{label}</Text>
              </View>
            ))}
          </View>

          {categories.map(({ key, label }) => {
            const findings = result.findings.filter(f => f.category === key);
            if (!findings.length) return null;
            return (
              <View key={key} style={s.section}>
                <View style={s.sectionBar}>
                  <Text style={s.sectionTitle}>{label}</Text>
                  <Text style={[s.sectionScore, { color: B.midGray }]}>{findings.length} finding{findings.length !== 1 ? 's' : ''}</Text>
                </View>
                {findings.map(f => <FindingCard key={f.id} f={f} />)}
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
  reportTitle: string
) {
  const blob = await pdf(<WebScanPDF url={url} scans={scans} reportTitle={reportTitle} />).toBlob();
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
