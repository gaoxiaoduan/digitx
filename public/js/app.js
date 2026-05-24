/**
 * DIGITX Web 仪表盘前端核心控制逻辑 (中英双语自适应版)
 */

// 全局语言包配置
const LOCALIZATION = {
    zh: {
        appTitleTag: '<span class="pulse-dot green"></span> 极速双通道域名搜索引擎',
        lblStatTotal: '合成候选总数',
        lblStatUnchecked: '剩余待检测',
        lblStatAvailable: '未注册 (可用)',
        lblStatRegistered: '已被占用 (已注册)',
        lblBtnStart: '启动极速扫描',
        lblBtnPause: '暂停扫描',
        lblCfgDelay: 'WHOIS 核对延时 (ms)',
        lblCfgTldSelect: '域名后缀',
        optCfgTldCustom: '自定义',
        lblCfgExclude4: '智能避讳数字 "4" <i class="fa-solid fa-circle-info" id="tip-cfg-exclude4" title="全局自动剔除含 4 的平庸数字，但非常智能地保留 1024、404 等程序员专属经典组合"></i>',
        lblBtnRegenerate: '重新生成列表',
        searchInputPlaceholder: '输入你想搜索的数字（支持正则表达式，例如输入 ^888 筛选以 888 开头的域名）...',
        lblFilterStatus: '检测状态:',
        tabStatusAll: '全部',
        tabStatusAvailable: '空闲未注册',
        tabStatusRegistered: '已被占用',
        tabStatusUnchecked: '未检测',
        tabStatusError: '查询失败',
        lblFilterLength: '位数长度:',
        tabLenAll: '全部',
        tabLen6: '6位数字',
        tabLen7: '7位数字',
        tabLen8: '8位数字',
        lblFilterCategory: '特征分类:',
        lblViewportTitle: '高净值优质域名推荐列表',
        lblBtnExport: '导出可用列表',
        lblSort: '排序方式:',
        optSortScoreDesc: '域名评分从高到低',
        optSortScoreAsc: '域名评分从低到高',
        optSortLengthAsc: '域名长度从短到长',
        optSortNumberAsc: '数字数值从小到大',
        lblGridLoader: '正在使用合成算法极速生成高价值候选域名数据库...',
        lblNoResults: '没有找到符合当前筛选条件的域名。请尝试放宽筛选条件或修改搜索关键字。',
        lblTerminalTitle: '<i class="fa-solid fa-terminal"></i> 极速双通道扫描实时日志控制台',
        lblTerminalInit: '系统初始化完毕。请点击上方【启动极速扫描】按钮开启双通道引擎。',
        
        // 动态渲染文本
        categoryAll: '全部模式',
        categoryNames: {
            'Super Repeater': '至尊连号豹子',
            'Straight Sequence': '经典顺子',
            'Coder Elite': '极客神号',
            'Coder Special': '程序员优选',
            'Chinese Lucky': '国人吉祥号',
            'Double Repeater': '双重连号',
            'Pattern Pairs': '对子连号',
            'Alternating Periodic': '交替循环号',
            'Mirror Symmetry': '对称镜像号',
            'Standard': '普通推荐',
            '至尊连号豹子': '至尊连号豹子',
            '经典顺子': '经典顺子',
            '极客神号': '极客神号',
            '程序员优选': '程序员优选',
            '国人吉祥号': '国人吉祥号',
            '双重连号': '双重连号',
            '对子连号': '对子连号',
            '交替循环号': '交替循环号',
            '对称镜像号': '对称镜像号',
            '普通推荐': '普通推荐',
            '极品豹子': '极品豹子'
        },
        categoryShort: {
            '至尊连号豹子': '至尊豹子',
            '对称镜像号': '对称回文',
            '交替循环号': '交替循环',
            '国人吉祥号': '国人吉祥'
        },
        statusTexts: {
            checking: '核对中...',
            available: '空闲可用!',
            registered: '已被注册',
            error: '查询失败',
            unchecked: '未检测'
        },
        btnRegister: '一键购买',
        btnCopy: '复制',
        scoreSuffix: '分',
        gridLimitInfo: '💡 为了保证网页秒开和流畅度，网格目前仅渲染了评分前 300 个卡片（共符合条件的有 {total} 个）。建议使用上方的“特征分类”或直接输入搜索来进行精准浏览。',
        exportAlertEmpty: '当前没有发现空闲未注册的可用域名可供导出！请先启动扫描发现可用域名。',
        exportLogSuccess: '[系统] 成功导出 {count} 个可用域名到 CSV 文件中。',
        delayDisplaySuffix: '毫秒',
        confirmRegenerate: '您确定要重新生成所有候选域名吗？这将重置所有域名的检测状态并清除现有检测记录！'
    },
    en: {
        appTitleTag: '<span class="pulse-dot green"></span> Turbo Dual-Channel Domain Engine',
        lblStatTotal: 'Total Candidates',
        lblStatUnchecked: 'Remaining',
        lblStatAvailable: 'Available',
        lblStatRegistered: 'Registered',
        lblBtnStart: 'Start Scanner',
        lblBtnPause: 'Pause Scanner',
        lblCfgDelay: 'WHOIS Interval (ms)',
        lblCfgTldSelect: 'Domain Suffix',
        optCfgTldCustom: 'Custom',
        lblCfgExclude4: 'Smart Exclude "4" <i class="fa-solid fa-circle-info" id="tip-cfg-exclude4" title="Automatically filters out generic containing-4 digits while preserving developer ciphers like 1024, 404."></i>',
        lblBtnRegenerate: 'Regenerate Candidates',
        searchInputPlaceholder: 'Type numbers to search (regex supported, e.g. ^888 matches domains starting with 888)...',
        lblFilterStatus: 'Status:',
        tabStatusAll: 'All',
        tabStatusAvailable: 'Available',
        tabStatusRegistered: 'Registered',
        tabStatusUnchecked: 'Unchecked',
        tabStatusError: 'Error',
        lblFilterLength: 'Length:',
        tabLenAll: 'All',
        tabLen6: '6-Dig',
        tabLen7: '7-Dig',
        tabLen8: '8-Dig',
        lblFilterCategory: 'Category:',
        lblViewportTitle: 'Premium Domain Candidates',
        lblBtnExport: 'Export Available',
        lblSort: 'Sort by:',
        optSortScoreDesc: 'Score: High to Low',
        optSortScoreAsc: 'Score: Low to High',
        optSortLengthAsc: 'Length: Short to Long',
        optSortNumberAsc: 'Value: Small to Large',
        lblGridLoader: 'Synthesizing premium domain candidates database using mathematical templates...',
        lblNoResults: 'No domains found matching the current filters. Try relaxing filters or search terms.',
        lblTerminalTitle: '<i class="fa-solid fa-terminal"></i> Dual-Channel Realtime Scan Console',
        lblTerminalInit: 'System initialized. Click the [Start Scanner] button above to launch the dual-channel engines.',
        
        // 动态渲染英文翻译
        categoryAll: 'All Categories',
        categoryNames: {
            'Super Repeater': 'Super Repeater',
            'Straight Sequence': 'Straight Sequence',
            'Coder Elite': 'Coder Elite',
            'Coder Special': 'Coder Special',
            'Chinese Lucky': 'Chinese Lucky',
            'Double Repeater': 'Double Repeater',
            'Pattern Pairs': 'Pattern Pairs',
            'Alternating Periodic': 'Alternating Periodic',
            'Mirror Symmetry': 'Mirror Symmetry',
            'Standard': 'Recommended',
            '至尊连号豹子': 'Super Repeater',
            '经典顺子': 'Straight Sequence',
            '极客神号': 'Coder Elite',
            '程序员优选': 'Coder Special',
            '国人吉祥号': 'Chinese Lucky',
            '双重连号': 'Double Repeater',
            '对子连号': 'Pattern Pairs',
            '交替循环号': 'Alternating Periodic',
            '对称镜像号': 'Mirror Palindrome',
            '普通推荐': 'Recommended',
            '极品豹子': 'Premium Repeater'
        },
        categoryShort: {
            'Super Repeater': 'Repeater',
            'Straight Sequence': 'Straight',
            'Coder Elite': 'Coder Elite',
            'Coder Special': 'Coder Spec',
            'Chinese Lucky': 'Lucky Pun',
            'Double Repeater': 'Double Rep',
            'Pattern Pairs': 'Pairs',
            'Alternating Periodic': 'Alternating',
            'Mirror Symmetry': 'Mirror',
            'Standard': 'Recom',
            '至尊连号豹子': 'Repeater',
            '经典顺子': 'Straight',
            '极客神号': 'Coder Elite',
            '程序员优选': 'Coder Spec',
            '国人吉祥号': 'Lucky Pun',
            '双重连号': 'Double Rep',
            '对子连号': 'Pairs',
            '交替循环号': 'Alternating',
            '对称镜像号': 'Mirror',
            '普通推荐': 'Recom',
            '极品豹子': 'Prem Rep'
        },
        statusTexts: {
            checking: 'Checking...',
            available: 'Available!',
            registered: 'Registered',
            error: 'Failed',
            unchecked: 'Pending'
        },
        btnRegister: 'Register',
        btnCopy: 'Copy',
        scoreSuffix: 'pts',
        gridLimitInfo: '💡 Grid renders top 300 high-scoring cards to maintain performance ({total} matching total). Use the "Category" filters or query bar above to explore.',
        exportAlertEmpty: 'No unregistered available domains discovered yet to export! Please launch the scan first.',
        exportLogSuccess: '[System] Successfully exported {count} available domains to CSV.',
        delayDisplaySuffix: 'ms',
        confirmRegenerate: 'Are you sure you want to regenerate all candidate domains? This will reset all domain checking states and clear previous history!'
    }
};

// 全局应用状态
let allDomains = [];
let filteredDomains = [];
let stats = { total: 0, unchecked: 0, checked: 0, available: 0, registered: 0, error: 0 };
let isScanning = false;
let activeDomain = null;
let currentFilters = {
    status: 'all',
    length: 'all',
    category: 'all',
    search: ''
};
let currentSort = 'score-desc';
let logCursor = 0;
let updateCursor = 0;

// 自适应初始语言检测 (优先使用浏览器首选语言，默认英语)
let currentLang = navigator.language.startsWith('zh') ? 'zh' : 'en';

// 轮询定时器
let statusPollInterval = null;

// DOM 节点引用
const elements = {
    statTotal: document.getElementById('stat-total'),
    statUnchecked: document.getElementById('stat-unchecked'),
    statAvailable: document.getElementById('stat-available'),
    statRegistered: document.getElementById('stat-registered'),
    btnStart: document.getElementById('btn-start'),
    btnPause: document.getElementById('btn-pause'),
    cfgDelay: document.getElementById('cfg-delay'),
    delayVal: document.getElementById('delay-val'),
    cfgExclude4: document.getElementById('cfg-exclude4'),
    btnRegenerate: document.getElementById('btn-regenerate'),
    searchInput: document.getElementById('search-input'),
    domainsGrid: document.getElementById('domains-grid'),
    gridLoader: document.getElementById('grid-loader'),
    noResults: document.getElementById('no-results'),
    displayedCount: document.getElementById('displayed-count'),
    sortSelect: document.getElementById('sort-select'),
    terminalBody: document.getElementById('terminal-body'),
    btnClearLogs: document.getElementById('btn-clear-logs'),
    countAvail: document.getElementById('count-avail'),
    cfgTldSelect: document.getElementById('cfg-tld-select'),
    cfgTldCustom: document.getElementById('cfg-tld-custom'),
    btnExport: document.getElementById('btn-export')
};

// 页面加载初始化
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupEventListeners();
    updateUILanguage(); // 触发全系统双语初始化
    await loadDomains();
    startStatusPolling();
}

// 1. 获取候选域名数据库
async function loadDomains() {
    try {
        elements.gridLoader.classList.remove('hidden');
        elements.domainsGrid.classList.add('hidden');
        elements.noResults.classList.add('hidden');

        const res = await fetch('/api/domains');
        allDomains = await res.json();

        elements.gridLoader.classList.add('hidden');
        elements.domainsGrid.classList.remove('hidden');

        buildCategoryTabs();
        applyFiltersAndSort();
    } catch (err) {
        console.error('加载候选域名失败:', err);
        appendTerminalLine(`[系统错误] 加载候选域名列表失败: ${err.message}`, 'error');
    }
}

// 1b. 动态构建特征分类标签
function buildCategoryTabs() {
    const container = document.getElementById('filter-category');
    if (!container) return;
    
    // 从所有域名中提取唯一的特征分类
    const categories = new Set();
    allDomains.forEach(d => {
        if (d.category) {
            categories.add(d.category);
        }
    });
    
    const t = LOCALIZATION[currentLang];
    
    // 首选显示顺序映射列表
    const preferredOrder = [
        '极客神号',
        '程序员优选',
        '至尊连号豹子',
        '极品豹子',
        '双重连号',
        '对子连号',
        '交替循环号',
        '经典顺子',
        '对称镜像号',
        '国人吉祥号',
        '普通推荐'
    ];
    
    const sortedCategories = Array.from(categories).sort((a, b) => {
        let nameA = t.categoryNames[a] || a;
        let nameB = t.categoryNames[b] || b;
        let idxA = preferredOrder.indexOf(nameA);
        let idxB = preferredOrder.indexOf(nameB);
        if (idxA === -1) idxA = 99;
        if (idxB === -1) idxB = 99;
        return idxA - idxB;
    });
    
    // 渲染分类 Tab 按钮
    let html = `<button class="tab-btn ${currentFilters.category === 'all' ? 'active' : ''}" data-cat="all">${t.categoryAll}</button>`;
    sortedCategories.forEach(cat => {
        let displayName = t.categoryNames[cat] || cat;
        // 如果有简短英文/中文名，执行映射缩写
        const shortName = t.categoryShort[displayName] || t.categoryShort[cat];
        if (shortName) {
            displayName = shortName;
        }
        
        const activeClass = currentFilters.category === cat ? 'active' : '';
        html += `<button class="tab-btn ${activeClass}" data-cat="${cat}">${displayName}</button>`;
    });
    
    container.innerHTML = html;
}

// 1c. 全局多语言更新核心渲染器
function updateUILanguage() {
    const t = LOCALIZATION[currentLang];
    
    // 切换按钮高亮高亮指示器
    if (currentLang === 'zh') {
        document.getElementById('btn-lang-zh').classList.add('active');
        document.getElementById('btn-lang-zh').style.background = 'rgba(0, 255, 240, 0.15)';
        document.getElementById('btn-lang-zh').style.color = 'var(--neon-cyan)';
        
        document.getElementById('btn-lang-en').classList.remove('active');
        document.getElementById('btn-lang-en').style.background = 'transparent';
        document.getElementById('btn-lang-en').style.color = 'var(--text-muted)';
    } else {
        document.getElementById('btn-lang-en').classList.add('active');
        document.getElementById('btn-lang-en').style.background = 'rgba(0, 255, 240, 0.15)';
        document.getElementById('btn-lang-en').style.color = 'var(--neon-cyan)';
        
        document.getElementById('btn-lang-zh').classList.remove('active');
        document.getElementById('btn-lang-zh').style.background = 'transparent';
        document.getElementById('btn-lang-zh').style.color = 'var(--text-muted)';
    }
    
    // 头部及静态 Label 标签
    document.getElementById('app-title-tag').innerHTML = t.appTitleTag;
    document.getElementById('lbl-stat-total').textContent = t.lblStatTotal;
    document.getElementById('lbl-stat-unchecked').textContent = t.lblStatUnchecked;
    document.getElementById('lbl-stat-available').textContent = t.lblStatAvailable;
    document.getElementById('lbl-stat-registered').textContent = t.lblStatRegistered;
    
    document.getElementById('lbl-btn-start').textContent = t.lblBtnStart;
    document.getElementById('lbl-btn-pause').textContent = t.lblBtnPause;
    
    document.getElementById('lbl-cfg-delay').textContent = t.lblCfgDelay;
    document.getElementById('lbl-cfg-tld-select').textContent = t.lblCfgTldSelect;
    document.getElementById('opt-cfg-tld-custom').textContent = t.optCfgTldCustom;
    document.getElementById('lbl-cfg-exclude4').innerHTML = t.lblCfgExclude4;
    document.getElementById('lbl-btn-regenerate').textContent = t.lblBtnRegenerate;
    
    document.getElementById('search-input').placeholder = t.searchInputPlaceholder;
    
    document.getElementById('lbl-filter-status').textContent = t.lblFilterStatus;
    
    // 检测状态 Tab
    const countAvailEl = document.getElementById('count-avail');
    const countAvailVal = countAvailEl ? countAvailEl.textContent : '0';
    document.getElementById('tab-status-all').textContent = t.tabStatusAll;
    document.getElementById('tab-status-available').innerHTML = `${t.tabStatusAvailable} (<span id="count-avail">${countAvailVal}</span>)`;
    // 重新获取动态生成的 DOM 节点，避免静态引用失效
    elements.countAvail = document.getElementById('count-avail');
    document.getElementById('tab-status-registered').textContent = t.tabStatusRegistered;
    document.getElementById('tab-status-unchecked').textContent = t.tabStatusUnchecked;
    document.getElementById('tab-status-error').textContent = t.tabStatusError;
    
    // 长度 Tab
    document.getElementById('lbl-filter-length').textContent = t.lblFilterLength;
    document.getElementById('tab-len-all').textContent = t.tabLenAll;
    document.getElementById('tab-len-6').textContent = t.tabLen6;
    document.getElementById('tab-len-7').textContent = t.tabLen7;
    document.getElementById('tab-len-8').textContent = t.tabLen8;
    
    document.getElementById('lbl-filter-category').textContent = t.lblFilterCategory;
    
    // 视图卡片区
    const dispCountText = document.getElementById('displayed-count').textContent;
    document.getElementById('lbl-viewport-title').innerHTML = `${t.lblViewportTitle} <span id="displayed-count">${dispCountText}</span>`;
    document.getElementById('lbl-btn-export').textContent = t.lblBtnExport;
    
    document.getElementById('lbl-sort').textContent = t.lblSort;
    document.getElementById('opt-sort-score-desc').textContent = t.optSortScoreDesc;
    document.getElementById('opt-sort-score-asc').textContent = t.optSortScoreAsc;
    document.getElementById('opt-sort-length-asc').textContent = t.optSortLengthAsc;
    document.getElementById('opt-sort-number-asc').textContent = t.optSortNumberAsc;
    
    document.getElementById('lbl-grid-loader').textContent = t.lblGridLoader;
    document.getElementById('lbl-no-results').textContent = t.lblNoResults;
    document.getElementById('lbl-terminal-title').innerHTML = t.lblTerminalTitle;
    
    // 动态同步初始日志行翻译
    const initLogLine = document.querySelector('.terminal-line.system');
    if (initLogLine) {
        if (currentLang === 'en' && initLogLine.textContent.includes('系统初始化完毕')) {
            initLogLine.textContent = t.lblTerminalInit;
        } else if (currentLang === 'zh' && initLogLine.textContent.includes('System initialized')) {
            initLogLine.textContent = t.lblTerminalInit;
        }
    }
    
    // 重建分类 Tabs 并重排过滤卡片
    buildCategoryTabs();
    applyFiltersAndSort();
}

// 2. 绑定交互事件监听
function setupEventListeners() {
    // 语言按钮事件绑定
    document.getElementById('btn-lang-zh').addEventListener('click', () => {
        if (currentLang !== 'zh') {
            currentLang = 'zh';
            updateUILanguage();
        }
    });
    
    document.getElementById('btn-lang-en').addEventListener('click', () => {
        if (currentLang !== 'en') {
            currentLang = 'en';
            updateUILanguage();
        }
    });

    // 扫描器动作控制
    elements.btnStart.addEventListener('click', startScanner);
    elements.btnPause.addEventListener('click', pauseScanner);
    elements.btnRegenerate.addEventListener('click', regenerateCandidates);

    // 参数滑动条与勾选框变更
    elements.cfgDelay.addEventListener('input', (e) => {
        elements.delayVal.textContent = `${e.target.value} ${LOCALIZATION[currentLang].delayDisplaySuffix}`;
    });
    elements.cfgDelay.addEventListener('change', updateScannerConfig);
    elements.cfgExclude4.addEventListener('change', updateScannerConfig);

    // 卡片特征及状态标签页点击筛选
    setupTabFilterGroup('filter-status', 'status');
    setupTabFilterGroup('filter-length', 'length');
    setupTabFilterGroup('filter-category', 'category');

    // 搜索输入防抖
    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = e.target.value.trim();
            applyFiltersAndSort();
        }, 200);
    });

    // 排序下拉框变更
    elements.sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFiltersAndSort();
    });

    // 域名后缀 TLD 选择与自定义输入切换
    elements.cfgTldSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            elements.cfgTldCustom.style.display = 'block';
            elements.cfgTldCustom.focus();
        } else {
            elements.cfgTldCustom.style.display = 'none';
            updateScannerConfig();
        }
    });

    elements.cfgTldCustom.addEventListener('change', updateScannerConfig);

    // 导出可用域名列表按钮
    elements.btnExport.addEventListener('click', exportAvailableDomains);

    // 清空终端日志
    elements.btnClearLogs.addEventListener('click', () => {
        elements.terminalBody.innerHTML = '';
        appendTerminalLine(currentLang === 'zh' ? '终端日志已清空。' : 'Terminal logs cleared.', 'system');
    });
}

function setupTabFilterGroup(containerId, filterKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;

        // 重置按钮激活状态
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 获取所选的筛选值
        const filterVal = btn.dataset.status || btn.dataset.len || btn.dataset.cat;
        currentFilters[filterKey] = filterVal;
        
        applyFiltersAndSort();
    });
}

// 3. 执行 API 动作请求
async function startScanner() {
    try {
        appendTerminalLine(currentLang === 'zh' ? '正在连接服务器启动扫描服务...' : 'Connecting to backend, launching scan pools...', 'system');
        const res = await fetch('/api/check/start', { method: 'POST' });
        const data = await res.json();
        
        if (data.success) {
            isScanning = true;
            elements.btnStart.disabled = true;
            elements.btnPause.disabled = false;
            appendTerminalLine(currentLang === 'zh' ? '扫描引擎已成功启动。极速双通道扫描运行中...' : 'Turbo scanning engine successfully launched. Scans in progress...', 'success');
        }
    } catch (err) {
        appendTerminalLine(`${currentLang === 'zh' ? '启动扫描引擎失败' : 'Failed to launch scanner'}: ${err.message}`, 'error');
    }
}

async function pauseScanner() {
    try {
        appendTerminalLine(currentLang === 'zh' ? '正在向服务器发送暂停信号...' : 'Sending pause signals to server...', 'system');
        const res = await fetch('/api/check/pause', { method: 'POST' });
        const data = await res.json();
        
        if (data.success) {
            isScanning = false;
            elements.btnStart.disabled = false;
            elements.btnPause.disabled = true;
            appendTerminalLine(currentLang === 'zh' ? '扫描服务已被用户暂停。已为您安全保存当前进度。' : 'Scanning service paused. Current progress safely synchronized.', 'warning');
        }
    } catch (err) {
        appendTerminalLine(`${currentLang === 'zh' ? '暂停扫描引擎失败' : 'Failed to pause scanner'}: ${err.message}`, 'error');
    }
}

function getTldValue() {
    const selectVal = elements.cfgTldSelect.value;
    if (selectVal === 'custom') {
        let val = elements.cfgTldCustom.value.trim();
        if (!val) return '.xyz';
        if (!val.startsWith('.')) {
            val = '.' + val;
        }
        return val;
    }
    return selectVal;
}

async function updateScannerConfig() {
    try {
        const delay = parseInt(elements.cfgDelay.value);
        const exclude4 = elements.cfgExclude4.checked;
        const tld = getTldValue();

        await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delay, exclude4, tld })
        });
        
        const successMsg = currentLang === 'zh'
            ? `扫描参数已同步更新: 延时 = ${delay}毫秒, 排除4 = ${exclude4 ? '启用' : '禁用'}, 后缀 = ${tld}`
            : `Sync complete: Interval = ${delay}ms, Exclude4 = ${exclude4 ? 'ON' : 'OFF'}, Suffix = ${tld}`;
        appendTerminalLine(successMsg, 'system');
    } catch (err) {
        appendTerminalLine(`${currentLang === 'zh' ? '同步扫描配置失败' : 'Failed to sync scanner configuration'}: ${err.message}`, 'error');
    }
}

async function regenerateCandidates() {
    const t = LOCALIZATION[currentLang];
    if (!confirm(t.confirmRegenerate)) {
        return;
    }
    try {
        const tld = getTldValue();
        appendTerminalLine(currentLang === 'zh' ? `正在根据最新的条件重新生成高净值候选域名列表 (${tld})...` : `Regenerating premium candidate domain index (${tld})...`, 'system');
        elements.gridLoader.classList.remove('hidden');
        elements.domainsGrid.classList.add('hidden');

        const delay = parseInt(elements.cfgDelay.value);
        const exclude4 = elements.cfgExclude4.checked;

        const res = await fetch('/api/regenerate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delay, exclude4, tld })
        });
        const data = await res.json();
        
        if (data.success) {
            const successMsg = currentLang === 'zh'
                ? `候选列表已重新生成！成功合成了 ${data.stats.total} 个高净值优质数字域名。`
                : `Generation complete! Synthesized ${data.stats.total} premium domain candidates.`;
            appendTerminalLine(successMsg, 'success');
            // 重新载入
            logCursor = 0;
            updateCursor = 0;
            await loadDomains();
        }
    } catch (err) {
        appendTerminalLine(`${currentLang === 'zh' ? '重新生成候选域名失败' : 'Failed to regenerate candidates'}: ${err.message}`, 'error');
    }
}

// 4. 数据同步与低消耗游标轮询
function startStatusPolling() {
    if (statusPollInterval) clearInterval(statusPollInterval);

    // 立即执行第一次拉取
    pollStatus();

    statusPollInterval = setInterval(pollStatus, 1000);
}

async function pollStatus() {
    try {
        const res = await fetch(`/api/status?logCursor=${logCursor}&updateCursor=${updateCursor}`);
        const data = await res.json();

        // 同步游标索引
        logCursor = data.logCursor;
        updateCursor = data.updateCursor;

        // 更新仪表盘统计数据
        stats = data.stats;
        updateStatsUI();

        // 按钮联动状态更新
        isScanning = data.running;
        activeDomain = data.activeDomain;
        
        if (isScanning) {
            elements.btnStart.disabled = true;
            elements.btnPause.disabled = false;
        } else {
            elements.btnStart.disabled = false;
            elements.btnPause.disabled = true;
        }

        // 当用户没有进行拖拽/操作时，同步后台的数值
        if (document.activeElement !== elements.cfgDelay) {
            elements.cfgDelay.value = data.config.delay;
            elements.delayVal.textContent = `${data.config.delay} ${LOCALIZATION[currentLang].delayDisplaySuffix}`;
        }
        if (document.activeElement !== elements.cfgExclude4) {
            elements.cfgExclude4.checked = data.config.exclude4;
        }
        if (document.activeElement !== elements.cfgTldSelect && document.activeElement !== elements.cfgTldCustom) {
            const backendTld = data.config.tld || '.xyz';
            const standardOptions = ['.xyz', '.com', '.net', '.org', '.cc'];
            if (standardOptions.includes(backendTld)) {
                elements.cfgTldSelect.value = backendTld;
                elements.cfgTldCustom.style.display = 'none';
            } else {
                elements.cfgTldSelect.value = 'custom';
                elements.cfgTldCustom.value = backendTld;
                elements.cfgTldCustom.style.display = 'block';
            }
        }

        // 输出日志行 (英文环境下执行简单替换，提升观感)
        if (data.recentLogs && data.recentLogs.length > 0) {
            data.recentLogs.forEach(logLine => {
                let displayLine = logLine;
                if (currentLang === 'en') {
                    displayLine = displayLine
                        .replace('扫描服务启动', 'Scan service started')
                        .replace('启动极速双通道扫描', 'Turbo dual-channel scanning initiated')
                        .replace('个域名进行超高并发 DNS 盲检预查', 'domains queued for high-concurrency DNS precheck')
                        .replace('DNS 盲扫进度', 'DNS Precheck Progress')
                        .replace('已剔除已注册', 'Filtered taken')
                        .replace('极速 DNS 盲扫完成！成功快速剔除了', 'Turbo DNS precheck finished! Filtered')
                        .replace('个已注册域名。仅剩', 'taken domains. Remaining')
                        .replace('个【疑似未注册】域名需进行 WHOIS 核对。', 'highly suspicious domains for WHOIS check.')
                        .replace('正在核对', 'Checking')
                        .replace('第一阶段: DNS 解析快速通道', 'Stage 1: DNS NS check')
                        .replace('已激活 DNS。快速判定为【已注册】。', 'active in DNS. Fast-marked as [Registered].')
                        .replace('已被注册', '已被注册')
                        .replace('空闲未注册', '空闲未注册')
                        .replace('扫描完成！所有候选域名检测完毕。', 'Scan complete! All candidates checked.')
                        .replace('扫描服务暂停。', 'Scanning paused.')
                        .replace('【已被注册】', '[Registered]')
                        .replace('【空闲未注册】！', '[Available]!')
                        .replace('未注册 (可用)', 'Available');
                }
                appendTerminalLine(displayLine);
            });
        }

        // 增量同步发生状态改变的卡片
        if (data.recentUpdates && data.recentUpdates.length > 0) {
            data.recentUpdates.forEach(update => {
                const idx = allDomains.findIndex(d => d.domain === update.domain);
                if (idx !== -1) {
                    // 原地修改
                    allDomains[idx] = { ...allDomains[idx], ...update };
                    updateCardDOM(allDomains[idx]);
                }
            });
            // 重新刷新页面统计数显示
            updateStatsUI();
        }
    } catch (err) {
        console.error('拉取状态更新失败:', err);
    }
}

function updateStatsUI() {
    elements.statTotal.textContent = stats.total.toLocaleString();
    elements.statUnchecked.textContent = stats.unchecked.toLocaleString();
    elements.statAvailable.textContent = stats.available.toLocaleString();
    elements.statRegistered.textContent = stats.registered.toLocaleString();
    
    // 动态获取 DOM 节点，防止语言包切换导致的缓存引用失效
    const currentCountAvail = document.getElementById('count-avail') || elements.countAvail;
    if (currentCountAvail) {
        currentCountAvail.textContent = stats.available;
    }
}

// 5. 卡片过滤与高表现虚拟渲染渲染逻辑
function applyFiltersAndSort() {
    filteredDomains = allDomains.filter(domainObj => {
        // 状态筛选
        if (currentFilters.status !== 'all' && domainObj.status !== currentFilters.status) {
            return false;
        }

        // 长度筛选
        if (currentFilters.length !== 'all' && String(domainObj.number).length !== parseInt(currentFilters.length)) {
            return false;
        }

        // 特征筛选
        if (currentFilters.category !== 'all' && domainObj.category !== currentFilters.category) {
            return false;
        }

        // 正则表达式与普通关键字模糊搜索
        if (currentFilters.search) {
            try {
                const regex = new RegExp(currentFilters.search, 'i');
                return regex.test(domainObj.number);
            } catch (err) {
                // 如果用户正在输入不完整的正则表达式，回退到纯字符串包含过滤
                return String(domainObj.number).includes(currentFilters.search);
            }
        }

        return true;
    });

    // 多维度排序机制
    filteredDomains.sort((a, b) => {
        if (currentSort === 'score-desc') return b.score - a.score;
        if (currentSort === 'score-asc') return a.score - b.score;
        if (currentSort === 'length-asc') return a.number.length - b.number.length;
        if (currentSort === 'number-asc') return parseInt(a.number) - parseInt(b.number);
        return 0;
    });

    // 多语言化显示计数标签
    const totalCountText = currentLang === 'zh'
        ? `(当前条件下显示 ${filteredDomains.length.toLocaleString()} 个 / 共 ${allDomains.length.toLocaleString()} 个候选)`
        : `(Showing ${filteredDomains.length.toLocaleString()} of ${allDomains.length.toLocaleString()} candidates)`;
    elements.displayedCount.textContent = totalCountText;

    renderGrid();
}

function renderGrid() {
    elements.domainsGrid.innerHTML = '';
    
    if (filteredDomains.length === 0) {
        elements.noResults.classList.remove('hidden');
        return;
    }

    elements.noResults.classList.add('hidden');
    
    // 渲染封顶优化：为防止大批量数据直接塞入 DOM 导致浏览器卡死崩溃，
    // 我们仅渲染符合当前条件、评分最高的前 300 张卡片。
    const cardsToRender = filteredDomains.slice(0, 300);
    
    cardsToRender.forEach(domainObj => {
        const card = createCardDOMElement(domainObj);
        elements.domainsGrid.appendChild(card);
    });

    if (filteredDomains.length > 300) {
        const footerInfo = document.createElement('div');
        footerInfo.className = 'grid-limit-info';
        footerInfo.style.cssText = 'grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 15px 0; border: 1px dashed var(--border-glass); border-radius: 8px; margin-top: 10px;';
        footerInfo.textContent = LOCALIZATION[currentLang].gridLimitInfo.replace('{total}', filteredDomains.length.toLocaleString());
        elements.domainsGrid.appendChild(footerInfo);
    }
}

function getTierClass(score) {
    if (score >= 95) return 'gold-tier';
    if (score >= 85) return 'silver-tier';
    return 'bronze-tier';
}

function createCardDOMElement(domainObj) {
    const card = document.createElement('div');
    card.className = `domain-card ${getTierClass(domainObj.score)}`;
    card.id = `card-${domainObj.domain.replace('.', '-')}`;
    
    const t = LOCALIZATION[currentLang];
    
    // 状态标记与图标转换
    let statusText = t.statusTexts[domainObj.status] || t.statusTexts.unchecked;
    let statusIcon = '<i class="fa-solid fa-hourglass-half"></i>';
    if (domainObj.status === 'checking') {
        statusIcon = '<i class="fa-solid fa-arrows-rotate"></i>';
    } else if (domainObj.status === 'available') {
        statusIcon = '<i class="fa-solid fa-award"></i>';
    } else if (domainObj.status === 'registered') {
        statusIcon = '<i class="fa-solid fa-lock"></i>';
    } else if (domainObj.status === 'error') {
        statusIcon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    }

    const regLink = currentLang === 'zh'
        ? `https://www.spaceship.com/zh/domain-search/?query=${domainObj.domain}&beast=false&tab=domains`
        : `https://www.spaceship.com/domain-search/?query=${domainObj.domain}&beast=false&tab=domains`;
    const localizedCategory = t.categoryNames[domainObj.category] || domainObj.category;
    
    // Translate pattern descriptions to English dynamically if selected
    let patternDesc = domainObj.patternDesc;
    if (currentLang === 'en') {
        if (patternDesc.includes('左右完全对称回文镜像号')) {
            patternDesc = `Mirror symmetrical palindrome: ${domainObj.number}`;
        } else if (patternDesc.includes('纯全相同连号')) {
            patternDesc = `Pure repeats of digit ${domainObj.number[0]} (AAAAAA+)`;
        } else if (patternDesc.includes('经典连号顺子')) {
            patternDesc = `Consecutive straight sequence (${domainObj.number})`;
        } else if (patternDesc.includes('程序员双击')) {
            patternDesc = `Developer Double: 1024 + 404`;
        } else if (patternDesc.includes('本地环回主机')) {
            patternDesc = `Localhost loopback Host IP (127.0.0.1)`;
        } else if (patternDesc.includes('中国铁路客服')) {
            patternDesc = `China Railway API combo (${domainObj.number})`;
        } else if (patternDesc.includes('一我爱你')) {
            patternDesc = `Romantic love symbol (1314520)`;
        } else if (patternDesc.includes('一路发发发')) {
            patternDesc = `Road to Wealth with repeating 8s`;
        }
    }

    card.innerHTML = `
        <div class="card-top">
            <span class="category-tag">${localizedCategory}</span>
            <span class="score-badge">${domainObj.score} ${t.scoreSuffix}</span>
        </div>
        <div class="domain-name-wrap">
            <span class="domain-display">${domainObj.domain}</span>
            <button class="btn-copy" onclick="copyDomainToClipboard('${domainObj.domain}', this)" title="${t.btnCopy}">
                <i class="fa-regular fa-copy"></i>
            </button>
        </div>
        <p class="pattern-desc">${patternDesc}</p>
        <div class="card-footer">
            <span class="status-badge ${domainObj.status}">
                ${statusIcon} <span class="status-text">${statusText}</span>
            </span>
            ${domainObj.status === 'available' ? `
                <a href="${regLink}" target="_blank" class="btn-register">
                    ${t.btnRegister} <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            ` : ''}
        </div>
    `;

    return card;
}

function updateCardDOM(domainObj) {
    const card = document.getElementById(`card-${domainObj.domain.replace('.', '-')}`);
    if (!card) return; // 如果未渲染在前 300 的可见区域内，则直接跳过 DOM 修改
    
    const t = LOCALIZATION[currentLang];
    card.className = `domain-card ${getTierClass(domainObj.score)}`;

    const badge = card.querySelector('.status-badge');
    badge.className = `status-badge ${domainObj.status}`;
    
    let statusText = t.statusTexts[domainObj.status] || t.statusTexts.unchecked;
    let statusIcon = '<i class="fa-solid fa-hourglass-half"></i>';
    if (domainObj.status === 'checking') {
        statusIcon = '<i class="fa-solid fa-arrows-rotate"></i>';
    } else if (domainObj.status === 'available') {
        statusIcon = '<i class="fa-solid fa-award"></i>';
    } else if (domainObj.status === 'registered') {
        statusIcon = '<i class="fa-solid fa-lock"></i>';
    } else if (domainObj.status === 'error') {
        statusIcon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    }

    badge.innerHTML = `${statusIcon} <span class="status-text">${statusText}</span>`;

    // 动态添加/移除“一键购买”按钮
    const footer = card.querySelector('.card-footer');
    const existingRegBtn = footer.querySelector('.btn-register');
    
    if (domainObj.status === 'available') {
        if (!existingRegBtn) {
            const regLink = currentLang === 'zh'
                ? `https://www.spaceship.com/zh/domain-search/?query=${domainObj.domain}&beast=false&tab=domains`
                : `https://www.spaceship.com/domain-search/?query=${domainObj.domain}&beast=false&tab=domains`;
            const regBtn = document.createElement('a');
            regBtn.href = regLink;
            regBtn.target = '_blank';
            regBtn.className = 'btn-register';
            regBtn.innerHTML = `${t.btnRegister} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
            footer.appendChild(regBtn);
        }
    } else {
        if (existingRegBtn) {
            existingRegBtn.remove();
        }
    }
}

// 6. 复制域名方法
function copyDomainToClipboard(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        const icon = btnElement.querySelector('i');
        icon.className = 'fa-solid fa-check';
        icon.style.color = 'var(--neon-green)';
        
        setTimeout(() => {
            icon.className = 'fa-regular fa-copy';
            icon.style.color = '';
        }, 1500);
    }).catch(err => {
        console.error('复制域名到剪贴板失败:', err);
    });
}

// 7. 实时终端日志打印适配
function appendTerminalLine(text, styleClass = '') {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    // 解析状态样式
    if (styleClass) {
        line.classList.add(styleClass);
    } else if (text.includes('⚡️') || text.includes('空闲') || text.includes('可用') || text.includes('发现可注册') || text.includes('Available') || text.includes('Available!')) {
        line.classList.add('success');
    } else if (text.includes('error') || text.includes('❌') || text.includes('⚠️') || text.includes('出错') || text.includes('失败') || text.includes('Failed') || text.includes('failed')) {
        line.classList.add('error');
    } else if (text.includes('暂停') || text.includes('退避') || text.includes('重试') || text.includes('paused') || text.includes('retry') || text.includes('backoff')) {
        line.classList.add('warning');
    } else if (text.includes('启动') || text.includes('完成') || text.includes('系统') || text.includes('检测到') || text.includes('System') || text.includes('initiated') || text.includes('complete')) {
        line.classList.add('system');
    }

    line.textContent = text;
    elements.terminalBody.appendChild(line);
    
    // 始终自动滚动至底
    elements.terminalBody.scrollTop = elements.terminalBody.scrollHeight;
}

// 8. 导出可用域名列表为 CSV 文件 (加入 UTF-8 BOM 兼容 Excel)
function exportAvailableDomains() {
    const available = allDomains.filter(d => d.status === 'available');
    const t = LOCALIZATION[currentLang];
    if (available.length === 0) {
        alert(t.exportAlertEmpty);
        return;
    }
    
    // CSV 头部字段进行国际化翻译
    let csvContent = '\ufeff';
    if (currentLang === 'zh') {
        csvContent += '域名,评分,特征分类,模式描述,状态,检测时间\n';
    } else {
        csvContent += 'Domain,Score,Category,Pattern Description,Status,Checked Time\n';
    }
    
    available.forEach(item => {
        const localizedCategory = t.categoryNames[item.category] || item.category;
        
        let patternDesc = item.patternDesc;
        if (currentLang === 'en') {
            if (patternDesc.includes('左右完全对称回文镜像号')) {
                patternDesc = `Mirror symmetrical palindrome: ${item.number}`;
            } else if (patternDesc.includes('纯全相同连号')) {
                patternDesc = `Pure repeats of digit ${item.number[0]} (AAAAAA+)`;
            } else if (patternDesc.includes('经典连号顺子')) {
                patternDesc = `Consecutive straight sequence (${item.number})`;
            } else if (patternDesc.includes('程序员双击')) {
                patternDesc = `Developer Double: 1024 + 404`;
            } else if (patternDesc.includes('本地环回主机')) {
                patternDesc = `Localhost loopback Host IP (127.0.0.1)`;
            } else if (patternDesc.includes('中国铁路客服')) {
                patternDesc = `China Railway API combo (${item.number})`;
            } else if (patternDesc.includes('一我爱你')) {
                patternDesc = `Romantic love symbol (1314520)`;
            } else if (patternDesc.includes('一路发发发')) {
                patternDesc = `Road to Wealth with repeating 8s`;
            }
        }
        
        const line = [
            item.domain,
            item.score,
            `"${localizedCategory}"`,
            `"${patternDesc || ''}"`,
            currentLang === 'zh' ? '未注册 (可用)' : 'Available',
            item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''
        ].join(',');
        csvContent += line + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = new Date().toISOString().slice(0, 10);
    const tld = getTldValue().replace('.', '');
    link.setAttribute('download', `digitx_available_domains_${tld}_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    const successMsg = t.exportLogSuccess.replace('{count}', available.length);
    appendTerminalLine(successMsg, 'success');
}
