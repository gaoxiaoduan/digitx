import fs from 'node:fs';
import path from 'node:path';
import { generateCandidates, checkDNS, checkWHOIS, updateDomainStatus, recalculateStats } from '@digitx/core';
const DB_PATH = path.resolve(process.cwd(), 'domains_db.json');
const API_URL = process.env.API_URL || 'http://localhost:8787';
const SYNC_SECRET = process.env.SYNC_SECRET || 'digitx-sync-secret-default';
function loadDatabase() {
    if (fs.existsSync(DB_PATH)) {
        try {
            const content = fs.readFileSync(DB_PATH, 'utf-8');
            return JSON.parse(content);
        }
        catch {
            // Fallback
        }
    }
    // Initial candidate generation
    console.log('Generating initial domain candidates...');
    const candidates = generateCandidates({
        minLength: 6,
        maxLength: 8,
        excludeUnlucky4: true,
        minScore: 60,
        tld: '.xyz'
    });
    const db = {
        domains: {},
        stats: { total: 0, checked: 0, unchecked: 0, available: 0, registered: 0, error: 0 },
        config: { delay: 2000, exclude4: true, minLength: 6, maxLength: 8, minScore: 60, tld: '.xyz' }
    };
    for (const cand of candidates) {
        db.domains[cand.domain] = {
            ...cand,
            status: 'unchecked',
            detail: '',
            updatedAt: null
        };
    }
    recalculateStats(db);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return db;
}
async function syncToCloudflare(db) {
    if (!API_URL)
        return;
    console.log(`📡 Syncing domain data to Cloudflare KV API at ${API_URL}/api/sync...`);
    try {
        const res = await fetch(`${API_URL}/api/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SYNC_SECRET}`
            },
            body: JSON.stringify(db)
        });
        if (res.ok) {
            const data = await res.json();
            console.log('✅ Cloudflare KV Sync Successful:', data);
        }
        else {
            console.warn(`⚠️ Cloudflare Sync failed with status ${res.status}:`, await res.text());
        }
    }
    catch (err) {
        console.warn('⚠️ Could not sync to Cloudflare KV API:', err.message);
    }
}
async function runScan() {
    const db = loadDatabase();
    console.log(`Starting scan batch. Total domains: ${db.stats.total}, Unchecked: ${db.stats.unchecked}`);
    const uncheckedList = Object.values(db.domains).filter((d) => d.status === 'unchecked');
    if (uncheckedList.length > 0) {
        console.log(`🚀 Phase 1: High-concurrency DNS Blind Check on ${uncheckedList.length} domains...`);
        const concurrency = 50;
        let index = 0;
        while (index < uncheckedList.length) {
            const chunk = uncheckedList.slice(index, index + concurrency);
            await Promise.all(chunk.map(async (item) => {
                const isRegistered = await checkDNS(item.domain);
                if (isRegistered) {
                    updateDomainStatus(db, item.domain, 'registered', '已注册 (DNS: 检测到活跃 NS 解析)');
                }
            }));
            index += concurrency;
            console.log(`DNS Progress: ${Math.min(index, uncheckedList.length)}/${uncheckedList.length}`);
        }
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    }
    const remaining = Object.values(db.domains).filter((d) => d.status === 'unchecked');
    console.log(`🚀 Phase 2: WHOIS Verification on ${remaining.length} suspected available domains...`);
    // Process batch of WHOIS
    const maxWhoisPerRun = 50;
    let count = 0;
    for (const item of remaining) {
        if (count >= maxWhoisPerRun)
            break;
        count++;
        console.log(`[${count}/${maxWhoisPerRun}] Verifying WHOIS for ${item.domain}...`);
        try {
            const res = await checkWHOIS(item.domain);
            if (res.registered) {
                updateDomainStatus(db, item.domain, 'registered', res.detail);
            }
            else {
                updateDomainStatus(db, item.domain, 'available', res.detail);
                console.log(`✨ FOUND AVAILABLE DOMAIN: ${item.domain}!`);
            }
        }
        catch (err) {
            updateDomainStatus(db, item.domain, 'error', err.message);
        }
        // Rate limit delay
        await new Promise((resolve) => setTimeout(resolve, db.config.delay || 2000));
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    await syncToCloudflare(db);
    console.log('Batch scan finished successfully.');
}
runScan().catch((err) => {
    console.error('Fatal scan error:', err);
    process.exit(1);
});
