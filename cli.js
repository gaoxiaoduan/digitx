/**
 * DIGITX 命令行交互终端 CLI (中文本地化优化版)
 */

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const boxen = require('boxen');
const { generateCandidates } = require('./generator');
const { LocalStore, CheckerQueue } = require('./checker');

const DB_PATH = path.join(__dirname, 'domains_db.json');

async function runCLI() {
    console.clear();
    const asciiBanner = `
${chalk.cyan.bold('██████╗ ██╗ ██████╗ ██╗████████╗██╗  ██╗')}
${chalk.cyan.bold('██╔══██╗██║██╔════╝ ██║╚══██╔══╝╚██╗██╔╝')}
${chalk.cyan.bold('██║  ██║██║██║  ███╗██║   ██║    ╚███╔╝ ')}
${chalk.cyan.bold('██║  ██║██║██║   ██║██║   ██║    ██╔██╗ ')}
${chalk.cyan.bold('██████╔╝██║╚██████╔╝██║   ██║   ██╔╝ ██╗')}
${chalk.cyan.bold('╚═════╝ ╚═╝ ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝')}
    `;
    console.log(asciiBanner);
    console.log(chalk.gray('=================================================='));
    console.log(chalk.cyan.bold('      DIGITX - 极品纯数字域名极扫发现工具         '));
    console.log(chalk.gray('==================================================\n'));

    const store = new LocalStore(DB_PATH);
    const existingCount = Object.keys(store.data.domains).length;

    let resumeSession = false;
    if (existingCount > 0) {
        store.recalculateStats();
        const { unchecked, available, registered, total } = store.data.stats;
        
        console.log(chalk.yellow(`检测到本地已存在扫描进度数据:`));
        console.log(`- 候选域名总数: ${chalk.bold(total)} 个`);
        console.log(`- 剩余未核对数: ${chalk.bold(unchecked)} 个`);
        console.log(`- 已发现空闲可用: ${chalk.green.bold(available)} 个`);
        console.log(`- 已被占用数: ${chalk.red.bold(registered)} 个\n`);

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: '你想如何继续？',
                choices: [
                    { name: '恢复上一次的扫描进度 (推荐)', value: 'resume' },
                    { name: '清除旧进度，开始全新的筛选扫描', value: 'fresh' }
                ]
            }
        ]);

        if (answer.action === 'resume') {
            resumeSession = true;
        }
    }

    if (!resumeSession) {
        // 交互式收集全新的生成标准
        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'lengths',
                message: '请选择你想搜寻的数字位数 (可多选):',
                choices: [
                    { name: '6 位数字 (例如 102404)', value: 6, checked: true },
                    { name: '7 位数字 (例如 5201314)', value: 7, checked: true },
                    { name: '8 位数字 (例如 88886666)', value: 8, checked: true }
                ],
                validate: (answer) => {
                    if (answer.length < 1) {
                        return '您必须选择至少一个数字长度位数。';
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'tldChoice',
                message: '请选择你想搜寻的域名后缀 (TLD):',
                choices: [
                    { name: '.xyz (极低注册成本首选)', value: '.xyz' },
                    { name: '.com (经典国际通用后缀)', value: '.com' },
                    { name: '.net (经典网络组织后缀)', value: '.net' },
                    { name: '.org (非营利性机构后缀)', value: '.org' },
                    { name: '.cc (精简易记的极佳后缀)', value: '.cc' },
                    { name: '自定义输入其它后缀', value: 'custom' }
                ]
            },
            {
                type: 'input',
                name: 'tldCustom',
                message: '请输入你自定义的域名后缀 (必须以 . 开头，例如 .top 或 .win):',
                when: (answers) => answers.tldChoice === 'custom',
                validate: (val) => {
                    const trimmed = val.trim();
                    if (!trimmed) return '自定义后缀不能为空。';
                    if (!trimmed.startsWith('.')) return '自定义后缀必须以 "." 开头 (例如 .top)';
                    return true;
                }
            },
            {
                type: 'confirm',
                name: 'exclude4',
                message: '是否开启智能数字 "4" 避讳（全局自动排除 4，但程序员专属 1024 / 404 除外）？',
                default: true
            },
            {
                type: 'number',
                name: 'minScore',
                message: '请输入候选域名的最低价值评分门槛 (10-100，推荐 60 分以上优质筛选):',
                default: 60,
                validate: (val) => {
                    if (isNaN(val) || val < 10 || val > 100) {
                        return '请输入 10 到 100 之间的有效评分。';
                    }
                    return true;
                }
            },
            {
                type: 'number',
                name: 'delay',
                message: '请输入核对单次 WHOIS 的频率延时 (毫秒，推荐 2000ms 防封 IP):',
                default: 2000,
                validate: (val) => {
                    if (isNaN(val) || val < 1000) {
                        return '为了避免被注册局拒绝查询，频率延迟不能低于 1000 毫秒。';
                    }
                    return true;
                }
            }
        ]);

        const selectedTld = answers.tldChoice === 'custom' 
            ? answers.tldCustom.trim() 
            : answers.tldChoice;

        // 保存配置
        store.data.config.delay = answers.delay;
        store.data.config.exclude4 = answers.exclude4;
        store.data.config.minScore = answers.minScore;
        store.data.config.tld = selectedTld;

        const spinner = ora('正在以合成算法极速生成高评分高价值域名列表...').start();
        
        // 生成候选
        const minL = Math.min(...answers.lengths);
        const maxL = Math.max(...answers.lengths);
        
        const freshCandidates = generateCandidates({
            minLength: minL,
            maxLength: maxL,
            excludeUnlucky4: answers.exclude4,
            minScore: answers.minScore,
            tld: selectedTld
        });

        store.resetDomains(freshCandidates);
        spinner.succeed(`成功合成了 ${chalk.cyan.bold(freshCandidates.length)} 个符合过滤标准的高价值数字域名！`);
    }

    // 询问是否启动扫描
    const startPrompt = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmStart',
            message: '是否立即开启极速双通道扫描进行可用性实测？',
            default: true
        }
    ]);

    if (!startPrompt.confirmStart) {
        console.log(chalk.yellow('\n❌ 扫描已被中止。您可以运行 "npm start" 启动 Web 控制面板，或随时重新执行 CLI 恢复进度。'));
        process.exit(0);
    }

    console.clear();
    console.log(chalk.cyan.bold('\n⚡️ --- 极速扫描服务启动 --- ⚡️'));
    console.log(chalk.gray('  随时可以通过快捷键 CTRL+C 安全暂停扫描。\n'));

    // 进度加载提示
    const spinner = ora('正在初始化扫描通道...').start();
    
    // 日志回调
    const handleLog = (msg) => {
        if (msg.includes('【空闲未注册】') || msg.includes('空闲可用')) {
            // 当发现未注册域名时，绘制闪亮的绿色边框卡片！
            spinner.stop();
            const escapedTld = store.data.config.tld.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const domainMatch = msg.match(new RegExp(`([a-zA-Z0-9-]+${escapedTld})`));
            const rawDomain = domainMatch ? domainMatch[1] : `unknown${store.data.config.tld}`;
            console.log(
                boxen(
                    `${chalk.green.bold('🎉 发现未注册且可以直接购买的极品域名！')}\n\n` +
                    `域名地址:   ${chalk.green.bold(rawDomain)}\n` +
                    `核对状态:   ${chalk.green.bold('空闲未注册 (Available)')}\n` +
                    `注册通道:   可前往 spaceship.com 等平台一键抢注`,
                    {
                        padding: 1,
                        margin: 1,
                        borderStyle: 'double',
                        borderColor: 'green'
                    }
                )
            );
            spinner.start('正在进行 WHOIS 精准核对...');
        } else {
            spinner.text = msg;
        }
    };

    // 进度百分比汇报回调
    const handleUpdate = () => {
        store.recalculateStats();
        const { checked, total, available } = store.data.stats;
        const pct = total > 0 ? ((checked / total) * 100).toFixed(1) : 0;
        spinner.prefixText = chalk.gray(`[进度: ${checked}/${total} (${pct}%) | 发现空闲: ${chalk.green(available)} 个] `);
    };

    const queue = new CheckerQueue(store, handleUpdate, handleLog);

    // 捕获 CTRL+C 信号，支持安全保存退出
    process.on('SIGINT', () => {
        console.log('\n');
        spinner.stop();
        queue.pause();
        console.log(chalk.yellow(boxen(
            '⏸  扫描队列已安全暂停  ⏸\n\n' +
            '您的所有扫描数据与精度进度已完整保存在 domains_db.json 中。\n' +
            '想要继续：随时运行 "npm run cli" 重启或执行 "npm start" 启用 Web Dashboard。',
            { padding: 1, borderStyle: 'round', borderColor: 'yellow' }
        )));
        process.exit(0);
    });

    // 开启扫描队列
    queue.start();
}

runCLI().catch(err => {
    console.error(chalk.red('命令行启动失败:'), err);
});
