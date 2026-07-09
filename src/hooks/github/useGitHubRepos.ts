import { useState, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import axios from 'axios';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  default_branch: string;
  owner: { login: string; avatar_url: string };
}

// Scoped per organization so each org can connect/disconnect independently
const connectedKey = (orgId: string) => `ribby_gh_connected_${orgId}`;

export function useGitHubRepos(orgId: string | undefined) {
  const isConnectedForOrg = () =>
    orgId ? localStorage.getItem(connectedKey(orgId)) === 'true' : false;

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Start connected only if this specific org was previously connected
  const [connected, setConnected] = useState(() => isConnectedForOrg());

  const getToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.provider_token ?? null;
  };

  const connectGitHub = async () => {
    // Save current path so we can return here after OAuth
    localStorage.setItem('ribby_oauth_return', window.location.pathname);
    // Mark which org initiated the connection so we can scope it on return
    if (orgId) localStorage.setItem('ribby_oauth_org', orgId);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:user',
        redirectTo: window.location.origin
      }
    });
  };

  const disconnect = () => {
    if (orgId) localStorage.removeItem(connectedKey(orgId));
    setConnected(false);
    setRepos([]);
    setError('');
  };

  const fetchRepos = useCallback(async () => {
    if (!orgId || !isConnectedForOrg()) {
      // Only auto-fetch if this org has explicitly connected before
      setConnected(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const token = await getToken();
    if (!token) {
      // Token gone (e.g. session expired) — clear the org connection
      if (orgId) localStorage.removeItem(connectedKey(orgId));
      setConnected(false);
      setLoading(false);
      return;
    }

    try {
      const allRepos: GitHubRepo[] = [];
      let page = 1;
      while (true) {
        const { data } = await axios.get<GitHubRepo[]>('https://api.github.com/user/repos', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
          params: { per_page: 100, page, sort: 'updated', affiliation: 'owner,collaborator' }
        });
        allRepos.push(...data);
        if (data.length < 100) break;
        page++;
        if (page > 3) break;
      }

      setRepos(allRepos);
      setConnected(true);
      // Persist connected state for this org
      if (orgId) localStorage.setItem(connectedKey(orgId), 'true');
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        if (orgId) localStorage.removeItem(connectedKey(orgId));
        setConnected(false);
        setError('GitHub token expired or missing repo scope. Please reconnect.');
      } else {
        setError('Failed to fetch repositories from GitHub.');
      }
    }

    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  return { repos, loading, error, connected, fetchRepos, connectGitHub, disconnect };
}
