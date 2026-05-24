/**
 * Optimized Dual-Stage Availability Checker & Queue Store
 * 
 * Stage 1 (DNS check): Fast, unlimited local DNS queries to detect active domains.
 * Stage 2 (WHOIS check): Queued, rate-limited queries to verify unregistered status.
 * State Persistence: Saved locally in a JSON database (domains_db.json) for easy resume.
 */

const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const whoiser = require('whoiser');

const LEGACY_CATEGORY_MAP = {
    'Unlucky 4': '避讳数字4',
    'Super Repeater': '至尊连号豹子',
    'Straight Sequence': '经典顺子',
    'Coder Elite': '极客神号',
    'Coder Special': '程序员优选',
    'Chinese Lucky': '国人吉祥号',
    'Double Repeater': '双重连号',
    'Pattern Pairs': '对子连号',
    'Alternating Periodic': '交替循环号',
    'Mirror Symmetry': '对称镜像号',
    'Standard': '普通推荐'
};

class LocalStore {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = {
            domains: {}, // domain_name -> { domain, score, category, patternDesc, status, detail, updatedAt }
            stats: {
                total: 0,
                checked: 0,
                unchecked: 0,
                available: 0,
                registered: 0,
                error: 0
            },
            config: {
                delay: 2000,
                exclude4: true,
                minLength: 6,
                maxLength: 8,
                minScore: 60,
                tld: '.xyz'
            }
        };
        this.load();
    }

    load() {
        if (fs.existsSync(this.filePath)) {
            try {
                const raw = fs.readFileSync(this.filePath, 'utf8');
                this.data = JSON.parse(raw);
                
                let migrated = false;
                
                // 1. 旧版英文特征分类平滑升级为中文，解决 Tab 栏过滤无结果的问题
                if (this.data.domains) {
                    for (const domain in this.data.domains) {
                        const item = this.data.domains[domain];
                        if (item.category && LEGACY_CATEGORY_MAP[item.category]) {
                            item.category = LEGACY_CATEGORY_MAP[item.category];
                            migrated = true;
                        }
                    }
                }
                
                // 2. 新增 TLD 后缀参数配置
                if (!this.data.config) {
                    this.data.config = {
                        delay: 2000,
                        exclude4: true,
                        minLength: 6,
                        maxLength: 8,
                        minScore: 60,
                        tld: '.xyz'
                    };
                    migrated = true;
                } else if (!this.data.config.tld) {
                    this.data.config.tld = '.xyz';
                    migrated = true;
                }
                
                if (migrated) {
                    this.recalculateStats();
                    this.save();
                    console.log('[Server] 已成功将原有数据库平滑迁移更新为中文分类与多后缀配置格式！');
                }
            } catch (err) {
                console.error('Failed to parse database file, resetting:', err.message);
            }
        }
    }

    save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (err) {
            console.error('Failed to save database file:', err.message);
        }
    }

    resetDomains(candidatesList) {
        this.data.domains = {};
        for (const cand of candidatesList) {
            this.data.domains[cand.domain] = {
                ...cand,
                status: 'unchecked',
                detail: '',
                updatedAt: null
            };
        }
        this.recalculateStats();
        this.save();
    }

    updateDomainStatus(domain, status, detail = '') {
        if (this.data.domains[domain]) {
            this.data.domains[domain].status = status;
            this.data.domains[domain].detail = detail;
            this.data.domains[domain].updatedAt = new Date().toISOString();
            this.recalculateStats();
            this.save();
        }
    }

    recalculateStats() {
        const list = Object.values(this.data.domains);
        this.data.stats.total = list.length;
        this.data.stats.unchecked = list.filter(d => d.status === 'unchecked').length;
        this.data.stats.checked = list.filter(d => ['available', 'registered'].includes(d.status)).length;
        this.data.stats.available = list.filter(d => d.status === 'available').length;
        this.data.stats.registered = list.filter(d => d.status === 'registered').length;
        this.data.stats.error = list.filter(d => d.status === 'error').length;
    }
}

let hijackedIPs = new Set();
let dnsHijackDetected = false;

/**
 * Detects if the local network is hijacking DNS NXDOMAIN responses and redirecting them to a portal IP.
 * @param {object} queueLogger - Optional logger instance
 */
async function detectDNSHijacking(queueLogger = null) {
    try {
        const randomDomain = `detect-hijack-${Math.random().toString(36).substring(2, 15)}.xyz`;
        const ips = await dns.resolve(randomDomain, 'A');
        if (ips && ips.length > 0) {
            for (const ip of ips) {
                hijackedIPs.add(ip);
            }
            dnsHijackDetected = true;
            const warningMsg = `⚠️ DNS Hijacking Detected! Wildcard redirection IPs: ${Array.from(hijackedIPs).join(', ')}. Activating smart bypass filter.`;
            if (queueLogger) {
                queueLogger.log(warningMsg);
            } else {
                console.warn(`[DNS Hijack] ${warningMsg}`);
            }
            return true;
        }
    } catch (err) {
        if (queueLogger) {
            queueLogger.log('DNS is operating normally (No redirection/hijacking detected).');
        }
    }
    return false;
}

/**
 * Fast DNS validation using Name Server (NS) record resolution.
 * Highly immune to standard ISP and sandbox proxy A-record DNS hijacking redirection.
 * @param {string} domain 
 * @returns {Promise<boolean>}
 */
async function checkDNS(domain) {
    try {
        await dns.resolve(domain, 'NS');
        return true; // NS Resolves! Definitely registered.
    } catch (err) {
        // Fails NS resolution. Extremely likely to be unregistered.
        // Fallback to WHOIS query to be absolutely sure.
        return false;
    }
}

/**
 * Queries WHOIS for .xyz domains. Returns registration state.
 * @param {string} domain 
 * @returns {Promise<object>} { registered: boolean, detail: string }
 */
async function checkWHOIS(domain) {
    try {
        const whoisData = await whoiser.domain(domain);
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
    } catch (err) {
        throw new Error(`WHOIS query failed: ${err.message}`);
    }
}

class CheckerQueue {
    constructor(store, onUpdate = null, onLog = null) {
        this.store = store;
        this.onUpdate = onUpdate;
        this.onLog = onLog;
        this.running = false;
        this.currentPromise = null;
        this.activeDomain = null;
    }

    log(msg) {
        const timestamp = new Date().toLocaleTimeString();
        const formattedMsg = `[${timestamp}] ${msg}`;
        if (this.onLog) {
            this.onLog(formattedMsg);
        }
    }

    async start() {
        if (this.running) return;
        this.running = true;
        this.log('🚀 扫描服务启动...');
        
        // 运行超高并发 DNS 盲扫描，快速剔除已注册域名
        await this.runBulkDNSPrecheck();
        
        // 开始逐个对疑似空闲域名进行精准 WHOIS 核对
        this.processNext();
    }

    async runBulkDNSPrecheck() {
        const unchecked = Object.values(this.store.data.domains).filter(d => d.status === 'unchecked');
        if (unchecked.length === 0) return;

        this.log(`🚀 启动极速双通道扫描：正在对 ${unchecked.length} 个域名进行超高并发 DNS 盲检预查...`);
        
        let resolvedCount = 0;
        const total = unchecked.length;

        // 并发上限 100 个请求
        const concurrency = 100;
        const executing = new Set();
        let lastReportedPct = 0;
        let checkedCount = 0;

        for (const item of unchecked) {
            if (!this.running) {
                this.log('⚠️ DNS 并发盲检被用户暂停。');
                break;
            }
            
            const p = Promise.resolve().then(async () => {
                const registered = await checkDNS(item.domain);
                checkedCount++;
                if (registered) {
                    this.store.updateDomainStatus(item.domain, 'registered', '已注册 (DNS: 检测到活跃 NS 解析记录)');
                    resolvedCount++;
                }
                
                // 实时汇报进度 (每 10% 汇报一次)
                const pct = Math.floor((checkedCount / total) * 10);
                if (pct > lastReportedPct) {
                    lastReportedPct = pct;
                    this.log(`⚡️ DNS 盲扫进度: ${pct * 10}% (${checkedCount}/${total}) | 已剔除已注册: ${resolvedCount}`);
                    if (this.onUpdate) this.onUpdate();
                }
            });
            
            executing.add(p);
            const clean = () => executing.delete(p);
            p.then(clean, clean);
            
            if (executing.size >= concurrency) {
                await Promise.race(executing);
            }
        }
        await Promise.all(executing);
        
        this.log(`✅ 极速 DNS 盲扫完成！成功快速剔除了 ${resolvedCount} 个已注册域名。仅剩 ${total - resolvedCount} 个【疑似未注册】域名需进行 WHOIS 核对。`);
        if (this.onUpdate) this.onUpdate();
    }

    pause() {
        if (!this.running) return;
        this.running = false;
        this.log('⏸ 扫描服务暂停。');
    }

    async processNext() {
        if (!this.running) return;

        // 获取下一个未检测或出错的域名
        const domains = Object.values(this.store.data.domains);
        const next = domains.find(d => d.status === 'unchecked' || d.status === 'error');

        if (!next) {
            this.running = false;
            this.log('🎉 扫描完成！所有候选域名检测完毕。');
            if (this.onUpdate) this.onUpdate();
            return;
        }

        this.activeDomain = next.domain;
        this.store.updateDomainStatus(next.domain, 'checking', '分析中...');
        if (this.onUpdate) this.onUpdate();

        try {
            await this.checkOne(next.domain);
        } catch (err) {
            this.log(`❌ 核对 ${next.domain} 出错: ${err.message}`);
            this.store.updateDomainStatus(next.domain, 'error', err.message);
        }

        this.activeDomain = null;
        if (this.onUpdate) this.onUpdate();

        // 设定下一次检测延时
        const delay = this.store.data.config.delay || 2000;
        setTimeout(() => this.processNext(), delay);
    }

    async checkOne(domain, attempt = 1) {
        this.log(`正在核对 ${domain} (第一阶段: DNS 解析快速通道)...`);
        
        // 第一阶段：DNS 解析检查
        const activeInDNS = await checkDNS(domain);
        if (activeInDNS) {
            this.log(`域名 ${domain} 已激活 DNS。快速判定为【已注册】。`);
            this.store.updateDomainStatus(domain, 'registered', '已注册 (DNS: 检测到活跃 NS 解析记录)');
            return;
        }

        // 第二阶段：WHOIS 权威检查
        this.log(`域名 ${domain} 无解析。第二阶段: 正在调用 WHOIS 核对状态...`);
        
        try {
            const result = await checkWHOIS(domain);
            if (result.registered) {
                this.log(`WHOIS 核对确认: ${domain} 【已被注册】。`);
                this.store.updateDomainStatus(domain, 'registered', '已注册 (WHOIS: 已查询到所有权记录)');
            } else {
                this.log(`⚡️ WHOIS 确认: ${domain} 【空闲未注册】！`);
                this.store.updateDomainStatus(domain, 'available', '未注册 (WHOIS: 可自由注册购买)');
            }
        } catch (err) {
            // 限频 / 连接错误处理：自动进行指数级延时退避重试
            const maxAttempts = 3;
            if (attempt < maxAttempts) {
                const backoffDelay = attempt * 5000;
                this.log(`WHOIS 查询 ${domain} 出错。准备在 ${backoffDelay / 1000} 秒后进行第 ${attempt + 1}/${maxAttempts} 次重试...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                return this.checkOne(domain, attempt + 1);
            } else {
                throw err;
            }
        }
    }
}

module.exports = {
    LocalStore,
    checkDNS,
    checkWHOIS,
    CheckerQueue,
    detectDNSHijacking
};
