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

/**
 * One GitHub connection per user, shared across all their orgs but only
 * "active" in the single org that connected it.
 *
 * Storage key: `ribby_gh_org_{userId}` = orgId that owns the connection.
 */
const userOrgKey = (userId: string) => `ribby_gh_org_${userId}`;

function getOwningOrg(userId: string | undefined): string | null {
  if (!userId) return null;
  return localStorage.getItem(userOrgKey(userId));
}

export function useGitHubRepos(orgId: string | undefined, userId: string | undefined) {
  const owningOrg = getOwningOrg(userId);
  const isThisOrgConnected = !!owningOrg && owningOrg === orgId;
  const connectedElsewhereOrgId = owningOrg && owningOrg !== orgId ? owningOrg : null;

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(() => isThisOrgConnected);

  const getToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.provider_token ?? null;
  };

  const connectGitHub = async () => {
    // Save return path and which org + user initiated the OAuth
    localStorage.setItem('ribby_oauth_return', window.location.pathname);
    if (orgId) localStorage.setItem('ribby_oauth_org', orgId);
    if (userId) localStorage.setItem('ribby_oauth_user', userId);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:user',
        redirectTo: window.location.origin
      }
    });
  };

  const disconnect = () => {
    if (userId) localStorage.removeItem(userOrgKey(userId));
    setConnected(false);
    setRepos([]);
    setError('');
  };

  const fetchRepos = useCallback(async () => {
    if (!orgId || !userId) return;

    // Detect return from GitHub OAuth for this user+org
    const oauthOrg = localStorage.getItem('ribby_oauth_org');
    const oauthUser = localStorage.getItem('ribby_oauth_user');
    const justReturned = oauthOrg === orgId && oauthUser === userId;

    if (justReturned) {
      // Consume flags
      localStorage.removeItem('ribby_oauth_org');
      localStorage.removeItem('ribby_oauth_user');
    }

    const currentOwner = getOwningOrg(userId);
    const thisOrgOwns = currentOwner === orgId;

    if (!thisOrgOwns && !justReturned) {
      // Not connected here — show connect or "connected elsewhere" UI
      setConnected(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const token = await getToken();
    if (!token) {
      localStorage.removeItem(userOrgKey(userId));
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
      // Record which org owns the connection for this user
      localStorage.setItem(userOrgKey(userId), orgId);
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem(userOrgKey(userId));
        setConnected(false);
        setError('GitHub token expired or missing repo scope. Please reconnect.');
      } else {
        setError('Failed to fetch repositories from GitHub.');
      }
    }

    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, userId]);

  return { repos, loading, error, connected, connectedElsewhereOrgId, fetchRepos, connectGitHub, disconnect };
}
