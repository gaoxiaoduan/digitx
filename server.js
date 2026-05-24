/**
 * DIGITX Local Dashboard Server (Express API Backend)
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { generateCandidates } = require('./generator');
const { LocalStore, CheckerQueue } = require('./checker');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database File Path
const DB_PATH = path.join(__dirname, 'domains_db.json');

// Initialize Store & Queue
const store = new LocalStore(DB_PATH);

// If database has no candidates, generate initial list
const domainsCount = Object.keys(store.data.domains).length;
if (domainsCount === 0) {
    console.log('[Server] No domains found in database. Running initial generator...');
    const initialCandidates = generateCandidates({
        minLength: store.data.config.minLength,
        maxLength: store.data.config.maxLength,
        excludeUnlucky4: store.data.config.exclude4,
        minScore: store.data.config.minScore,
        tld: store.data.config.tld
    });
    store.resetDomains(initialCandidates);
    console.log(`[Server] Created ${initialCandidates.length} initial premium candidates.`);
} else {
    console.log(`[Server] Loaded ${domainsCount} existing domain candidates from database.`);
}

// Global Synced Logs & Updates queues for cursor-based polling
const serverLogs = [];
const statusUpdates = [];

// Log interceptor callback
const handleQueueLog = (msg) => {
    serverLogs.push(msg);
    // Limit log memory to last 1000 lines
    if (serverLogs.length > 1000) serverLogs.shift();
    console.log(msg); // Output to server terminal too
};

// Domain status change callback
const handleDomainUpdate = () => {
    // When a domain updates, we push all checking/available/registered updates
    // directly to clients.
    // For simplicity, we scan the domain database and collect recent changes
    // or let the queue push specific delta updates.
    // Let's implement a change notifier inside store
};

// Intercept store update status to push to client updates
const originalUpdateDomainStatus = store.updateDomainStatus;
store.updateDomainStatus = function(domain, status, detail = '') {
    originalUpdateDomainStatus.call(store, domain, status, detail);
    
    // Track delta updates
    statusUpdates.push({
        domain,
        status,
        detail,
        updatedAt: new Date().toISOString()
    });
    
    if (statusUpdates.length > 2000) statusUpdates.shift();
};

// Initialize scanner queue
const queue = new CheckerQueue(store, handleDomainUpdate, handleQueueLog);

// Log initial status
serverLogs.push(`[SYSTEM] Server booted on port ${PORT}.`);
serverLogs.push(`[SYSTEM] Loaded database with ${Object.keys(store.data.domains).length} candidate domains.`);

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Get All Candidate Domains
app.get('/api/domains', (req, res) => {
    // Returns the current domains sorted by score desc
    const list = Object.values(store.data.domains).sort((a, b) => b.score - a.score);
    res.json(list);
});

// 2. Start Scanner
app.post('/api/check/start', (req, res) => {
    if (!queue.running) {
        queue.start();
    }
    res.json({ success: true, running: queue.running });
});

// 3. Pause Scanner
app.post('/api/check/pause', (req, res) => {
    if (queue.running) {
        queue.pause();
    }
    res.json({ success: true, running: queue.running });
});

// 4. Update Queue Config
app.post('/api/config', (req, res) => {
    const { delay, exclude4, tld } = req.body;
    
    if (delay !== undefined) store.data.config.delay = parseInt(delay);
    if (exclude4 !== undefined) store.data.config.exclude4 = !!exclude4;
    if (tld !== undefined) store.data.config.tld = String(tld);
    
    store.save();
    res.json({ success: true, config: store.data.config });
});

// 5. Regenerate Candidates
app.post('/api/regenerate', (req, res) => {
    // Stop queue first
    const wasRunning = queue.running;
    if (wasRunning) {
        queue.pause();
    }

    const { delay, exclude4, tld } = req.body;
    if (delay !== undefined) store.data.config.delay = parseInt(delay);
    if (exclude4 !== undefined) store.data.config.exclude4 = !!exclude4;
    if (tld !== undefined) store.data.config.tld = String(tld);

    // Run generator
    const freshCandidates = generateCandidates({
        minLength: store.data.config.minLength,
        maxLength: store.data.config.maxLength,
        excludeUnlucky4: store.data.config.exclude4,
        minScore: store.data.config.minScore,
        tld: store.data.config.tld
    });

    store.resetDomains(freshCandidates);
    
    // Clear in-memory client update buffers
    statusUpdates.length = 0;
    serverLogs.push(`[SYSTEM] Candidates list regenerated. Total: ${freshCandidates.length}`);

    if (wasRunning) {
        // Resume queue
        queue.start();
    }

    res.json({
        success: true,
        stats: store.data.stats,
        config: store.data.config
    });
});

// 6. Get Server Queue Status and Deltas
app.get('/api/status', (req, res) => {
    const logCursor = parseInt(req.query.logCursor) || 0;
    const updateCursor = parseInt(req.query.updateCursor) || 0;

    // Slice recent arrays
    const recentLogs = serverLogs.slice(logCursor);
    const recentUpdates = statusUpdates.slice(updateCursor);

    res.json({
        stats: store.data.stats,
        running: queue.running,
        activeDomain: queue.activeDomain,
        config: store.data.config,
        recentLogs,
        recentUpdates,
        logCursor: serverLogs.length,
        updateCursor: statusUpdates.length
    });
});

// Start listening
app.listen(PORT, () => {
    const asciiBanner = `
██████╗ ██╗ ██████╗ ██╗████████╗██╗  ██╗
██╔══██╗██║██╔════╝ ██║╚══██╔══╝╚██╗██╔╝
██║  ██║██║██║  ███╗██║   ██║    ╚███╔╝ 
██║  ██║██║██║   ██║██║   ██║    ██╔██╗ 
██████╔╝██║╚██████╔╝██║   ██║   ██╔╝ ██╗
╚═════╝ ╚═╝ ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝
    `;
    console.log(asciiBanner);
    console.log(`[DIGITX] Premium domain finder server booting...`);
    console.log(`[DIGITX] Local Dashboard: http://localhost:${PORT}`);
    console.log(`[DIGITX] To stop server, press CTRL+C`);
});
