export interface RepoFinding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'secret' | 'dependency' | 'exposure' | 'config';
  file?: string;
  line?: number;
  cve?: string;
  fixVersion?: string;
  recommendation: string;
}

export interface RepoScanResult {
  id: string;
  repoUrl: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  status: 'scanning' | 'complete' | 'error';
  progress: number;
  startedAt: string;
  completedAt?: string;
  findings: RepoFinding[];
  summary: { critical: number; high: number; medium: number; low: number; info: number; total: number; score: number };
  meta: { filesScanned: number; depsChecked: number; language: string[] };
  error?: string;
}
