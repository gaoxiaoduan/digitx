import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { DomainDatabase } from '@digitx/core';
import { createEmptyDomainDatabase } from '@digitx/core/candidate-contract';

type Bindings = {
  DIGITX_KV: KVNamespace;
  SYNC_SECRET?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

// GET /api/domains - Fetch full domain database from Cloudflare KV
app.get('/api/domains', async (c) => {
  try {
    const raw = await c.env.DIGITX_KV.get('domains_db');
    if (!raw) {
      return c.json(createEmptyDomainDatabase());
    }
    const data: DomainDatabase = JSON.parse(raw);
    return c.json(data);
  } catch (error: unknown) {
    return c.json({ error: 'Failed to read domain data', message: errorMessage(error) }, 500);
  }
});

// GET /api/status - Quick stats summary
app.get('/api/status', async (c) => {
  try {
    const raw = await c.env.DIGITX_KV.get('domains_db');
    if (!raw) {
      return c.json({ total: 0, checked: 0, available: 0 });
    }
    const data: DomainDatabase = JSON.parse(raw);
    return c.json(data.stats);
  } catch (error: unknown) {
    return c.json({ error: 'Failed to read stats', message: errorMessage(error) }, 500);
  }
});

// POST /api/sync - Protected sync endpoint for GitHub Actions scanner
app.post('/api/sync', async (c) => {
  const authHeader = c.req.header('Authorization');
  const expectedSecret = c.env.SYNC_SECRET || 'digitx-sync-secret-default';

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return c.json({ error: 'Unauthorized: Invalid sync secret' }, 401);
  }

  try {
    const payload = await c.req.json<DomainDatabase>();
    if (!payload || !payload.domains) {
      return c.json({ error: 'Invalid payload structure' }, 400);
    }

    await c.env.DIGITX_KV.put('domains_db', JSON.stringify(payload));
    return c.json({ success: true, timestamp: new Date().toISOString(), stats: payload.stats });
  } catch (error: unknown) {
    return c.json({ error: 'Failed to save to KV', message: errorMessage(error) }, 500);
  }
});

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default app;
