import dns from 'node:dns/promises';
import whoiser from 'whoiser';
import { DomainDatabase, CheckStatus } from './types.js';

export async function checkDNS(domain: string): Promise<boolean> {
  try {
    await dns.resolve(domain, 'NS');
    return true; // Active NS -> Registered
  } catch {
    return false; // No NS -> Likely available
  }
}

export async function checkWHOIS(domain: string): Promise<{ registered: boolean; detail: string }> {
  try {
    const whoisFn = (whoiser as any).domain || whoiser;
    const whoisData = await whoisFn(domain);

    let rawText = '';

    for (const server in whoisData) {
      if (whoisData[server] && whoisData[server].text) {
        rawText += whoisData[server].text + '\n';
      }
      if (typeof whoisData[server] === 'string') {
        rawText += whoisData[server] + '\n';
      }
    }

    if (!rawText && typeof whoisData === 'object') {
      rawText = JSON.stringify(whoisData);
    }

    const rawTextUpper = rawText.toUpperCase();

    const isNotFound =
      rawTextUpper.includes('DOMAIN NOT FOUND') ||
      rawTextUpper.includes('NO MATCH FOR') ||
      rawTextUpper.includes('NO ENTRIES FOUND') ||
      rawTextUpper.includes('NOT FOUND') ||
      rawTextUpper.includes('NO OBJECT FOUND') ||
      rawTextUpper.includes('NOT REGISTERED');

    if (isNotFound) {
      return { registered: false, detail: 'Available (WHOIS: Domain not found)' };
    }

    const isRegistered =
      rawTextUpper.includes('REGISTRAR') ||
      rawTextUpper.includes('CREATION DATE') ||
      rawTextUpper.includes('REGISTRY DOMAIN ID') ||
      rawTextUpper.includes('EXPIRY DATE') ||
      rawTextUpper.includes('UPDATED DATE') ||
      rawTextUpper.includes('NAME SERVER:');

    if (isRegistered) {
      return { registered: true, detail: 'Registered (WHOIS: Found active record)' };
    }

    return { registered: true, detail: 'Uncertain WHOIS response. Assumed registered.' };
  } catch (err: any) {
    throw new Error(`WHOIS query failed: ${err.message}`);
  }
}

export function recalculateStats(database: DomainDatabase): void {
  const list = Object.values(database.domains);
  database.stats.total = list.length;
  database.stats.unchecked = list.filter((d) => d.status === 'unchecked').length;
  database.stats.checked = list.filter((d) => ['available', 'registered'].includes(d.status)).length;
  database.stats.available = list.filter((d) => d.status === 'available').length;
  database.stats.registered = list.filter((d) => d.status === 'registered').length;
  database.stats.error = list.filter((d) => d.status === 'error').length;
}

export function updateDomainStatus(
  database: DomainDatabase,
  domain: string,
  status: CheckStatus,
  detail: string = ''
): void {
  if (database.domains[domain]) {
    database.domains[domain].status = status;
    database.domains[domain].detail = detail;
    database.domains[domain].updatedAt = new Date().toISOString();
    recalculateStats(database);
  }
}
