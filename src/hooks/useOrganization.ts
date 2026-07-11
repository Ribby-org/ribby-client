import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { User } from '@supabase/supabase-js';

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

let cachedOrgs: Organization[] | null = null;
let activeFetchPromise: Promise<Organization[]> | null = null;

export function useOrganization(user: User | null) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [current, setCurrent] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setOrganizations([]);
      setCurrent(null);
      setError('');
      setLoading(false);
      setFetched(true);
      return;
    }
    setLoading(true);
    setFetched(false);
    fetchOrganizations();
  }, [user?.id]);

  const fetchOrganizations = async (forceRefetch = false) => {
    if (forceRefetch) {
      cachedOrgs = null;
      activeFetchPromise = null;
    }

    if (cachedOrgs) {
      setOrganizations(cachedOrgs);
      setCurrent(cachedOrgs[0] ?? null);
      setLoading(false);
      setFetched(true);
      return;
    }

    if (activeFetchPromise) {
      try {
        const data = await activeFetchPromise;
        setOrganizations(data);
        setCurrent(data[0] ?? null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
        setFetched(true);
      }
      return;
    }

    activeFetchPromise = (async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      cachedOrgs = data ?? [];
      return cachedOrgs;
    })();

    try {
      const data = await activeFetchPromise;
      setOrganizations(data);
      setCurrent(data[0] ?? null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      activeFetchPromise = null;
      setLoading(false);
      setFetched(true);
    }
  };

  const createOrganization = async (name: string, description: string) => {
    if (!user) return { error: 'Not authenticated' };
    if (organizations.length >= 20) return { error: 'Maximum of 20 organizations per account reached.' };

    const { data, error } = await supabase
      .from('organizations')
      .insert({ name: name.trim(), description: description.trim() || null, owner_id: user.id })
      .select()
      .single();

    if (error) return { error: error.message };

    const org = data as Organization;
    if (cachedOrgs) {
      cachedOrgs = [...cachedOrgs, org];
    }
    setOrganizations(prev => [...prev, org]);
    setCurrent(org);
    return { data: org };
  };

  const switchOrganization = (org: Organization) => setCurrent(org);

  return {
    organizations,
    current,
    loading,
    fetched,
    error,
    createOrganization,
    switchOrganization,
    refetch: () => fetchOrganizations(true)
  };
}
