// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(503).json({ error: 'Analytics not configured' });
  }

  try {
    const event = req.body;
    const cleanDomain = (event.origin as string ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '');

    // Look up which org owns this domain
    const siteRes = await fetch(
      `${SUPABASE_URL}/rest/v1/analytics_sites?domain=eq.${encodeURIComponent(cleanDomain)}&select=id,site_key`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const sites = await siteRes.json() as { id: string; site_key: string }[];

    if (!sites?.length) {
      return res.status(202).json({ accepted: true, registered: false });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        site_key:   sites[0].site_key,
        type:       event.type,
        page_url:   event.url        ?? null,
        referrer:   event.referrer   ?? null,
        device:     event.device     ?? null,
        browser:    event.browser    ?? null,
        session_id: event.sessionId  ?? null,
        event_name: event.eventName  ?? null,
        lcp:        event.lcp        ?? null,
        fid:        event.fid        ?? null,
        cls:        event.cls        ?? null,
        ttfb:       event.ttfb       ?? null,
        fcp:        event.fcp        ?? null,
      })
    });

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Ingest failed' });
  }
}
