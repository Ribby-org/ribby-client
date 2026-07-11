import type { RepoFinding } from './repo';

export interface NpmScanResult {
  id: string;
  packageName: string;
  version: string;
  description: string;
  homepage?: string;
  githubRepo?: string;
  license?: string;
  dependenciesCount: number;
  status: 'scanning' | 'complete' | 'error';
  findings: RepoFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
    score: number;
  };
  error?: string;
}
