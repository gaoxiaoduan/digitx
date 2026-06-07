const fs = require('fs');
const path = require('path');
const { LocalStore, CheckerQueue } = require('./checker');
const { generateCandidates } = require('./generator');

const DB_PATH = path.join(__dirname, 'domains_db.json');
const PUBLIC_DIR = path.join(__dirname, 'public', 'data');
const DOMAINS_OUT = path.join(PUBLIC_DIR, 'domains.json');
const STATUS_OUT = path.join(PUBLIC_DIR, 'status.json');

if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

console.log('[Cron] Initializing LocalStore...');
const store = new LocalStore(DB_PATH);

// If database has no candidates, generate initial list
const domainsCount = Object.keys(store.data.domains).length;
if (domainsCount === 0) {
    console.log('[Cron] No domains found in database. Running initial generator...');
    const initialCandidates = generateCandidates({
        minLength: store.data.config.minLength || 6,
        maxLength: store.data.config.maxLength || 7,
        excludeUnlucky4: store.data.config.exclude4 !== undefined ? store.data.config.exclude4 : true,
        minScore: store.data.config.minScore || 60,
        tld: store.data.config.tld || '.xyz'
    });
    store.resetDomains(initialCandidates);
    console.log(`[Cron] Created ${initialCandidates.length} initial premium candidates.`);
} else {
    console.log(`[Cron] Loaded ${domainsCount} existing domain candidates from database.`);
}

const exportStaticData = () => {
    console.log('[Cron] Exporting static JSON data...');
    // Export domains list
    const list = Object.values(store.data.domains).sort((a, b) => b.score - a.score);
    fs.writeFileSync(DOMAINS_OUT, JSON.stringify(list, null, 2), 'utf8');

    // Export status and stats
    const statusData = {
        lastUpdated: new Date().toISOString(),
        stats: store.data.stats,
        config: store.data.config
    };
    fs.writeFileSync(STATUS_OUT, JSON.stringify(statusData, null, 2), 'utf8');
    console.log('[Cron] Export complete. Data saved to public/data/');
};

const handleLog = (msg) => {
    console.log(msg);
    if (msg.includes('🎉 扫描完成！')) {
        exportStaticData();
        console.log('[Cron] Exiting successfully.');
        process.exit(0);
    }
};

const handleUpdate = () => {
    // If the queue stops running but it's not because of completion (e.g. error, though processNext handles it)
    if (!queue.running) {
        // Double check
        const unchecked = store.data.stats.unchecked;
        if (unchecked === 0) {
            exportStaticData();
            process.exit(0);
        }
    }
};

const queue = new CheckerQueue(store, handleUpdate, handleLog);

// --- 自动安全退出机制 (支持通过环境变量动态配置运行时间) ---
// 优先读取环境变量，如果没有则默认运行 30 分钟
const envMinutes = process.env.MAX_RUN_TIME_MINUTES ? parseInt(process.env.MAX_RUN_TIME_MINUTES) : 30;
const MAX_RUN_TIME_MS = envMinutes * 60 * 1000; 
setTimeout(() => {
    console.log(`\n[Cron] ⏱️ Reached maximum execution time of ${envMinutes} minutes. Pausing to save progress safely...`);
    queue.pause(); // 暂停队列
    exportStaticData(); // 导出当前的进度
    console.log('[Cron] Exiting safely. The next cron run will resume from here.');
    process.exit(0);
}, MAX_RUN_TIME_MS);
// --------------------------------------------------------

const unchecked = store.data.stats.unchecked;
if (unchecked === 0) {
    console.log('[Cron] All domains are already checked. Nothing to do.');
    exportStaticData();
    process.exit(0);
}

console.log('[Cron] Starting headless scanner queue...');
queue.start();
