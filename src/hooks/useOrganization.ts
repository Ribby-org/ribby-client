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

export function useOrganization(user: User | null) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [current, setCurrent] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setFetched(true);
      return;
    }
    // Immediately mark as loading before the async fetch starts
    setLoading(true);
    setFetched(false);
    fetchOrganizations();
  }, [user?.id]); // stable dependency — only re-run when user ID changes

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setOrganizations(data ?? []);
      setCurrent(data?.[0] ?? null);
    }
    setLoading(false);
    setFetched(true);
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
    setOrganizations(prev => [...prev, org]);
    setCurrent(org);
    return { data: org };
  };

  const switchOrganization = (org: Organization) => setCurrent(org);

  return { organizations, current, loading, fetched, error, createOrganization, switchOrganization, refetch: fetchOrganizations };
}
