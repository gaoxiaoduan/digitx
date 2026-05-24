/**
 * 可行性与有效性快速验证脚本
 * 快速生成部分域名，进行并发 DNS 盲检与 WHOIS 确认，直接找出目前可注册的空闲极品数字域名
 */

const { generateCandidates } = require('./generator');
const { checkDNS, checkWHOIS, detectDNSHijacking } = require('./checker');
const chalk = require('chalk');

// 自定义并发限制执行器
async function batchProcess(items, workerFn, concurrencyLimit) {
    const results = [];
    const executing = new Set();
    
    for (const item of items) {
        const p = Promise.resolve().then(() => workerFn(item));
        results.push(p);
        executing.add(p);
        
        const clean = () => executing.delete(p);
        p.then(clean, clean);
        
        if (executing.size >= concurrencyLimit) {
            await Promise.race(executing);
        }
    }
    return Promise.all(results);
}

async function verifyFeasibility() {
    console.log(chalk.cyan.bold('\n=================================================='));
    console.log(chalk.cyan.bold('     DIGITX 域名可用性与可行性快速验证工具        '));
    console.log(chalk.cyan.bold('==================================================\n'));

    console.log(chalk.yellow('0. 正在扫描本地网络以开启 DNS 劫持防护罩...'));
    await detectDNSHijacking();
    console.log(chalk.green('   防护罩已成功激活！\n'));

    console.log(chalk.yellow('1. 正在生成高评分数字域名候选列表...'));
    const candidates = generateCandidates({
        minLength: 6,
        maxLength: 8,
        excludeUnlucky4: true,
        minScore: 70
    });
    console.log(chalk.green(`   成功生成了 ${candidates.length} 个高评分优质候选域名。\n`));

    // 取中后排的 200 个进行测试，这些域名同样是高得分（70+分），但由于长度较长，极大概率存在未注册域名
    const testList = candidates.slice(8000, 8200);
    console.log(chalk.yellow(`2. 正在以 50 并发进行极速 DNS 盲扫（测试排名第 8000 到 8200 的域名)...`));
    
    const startTime = Date.now();
    const dnsResults = await batchProcess(testList, async (item) => {
        const active = await checkDNS(item.domain);
        return { ...item, activeInDNS: active };
    }, 50);
    const dnsDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    const inactiveDomains = dnsResults.filter(r => !r.activeInDNS);
    console.log(chalk.green(`   DNS 扫盲完毕！耗时 ${dnsDuration} 秒。`));
    console.log(`   测试的 200 个域名中，有 ${chalk.red(testList.length - inactiveDomains.length)} 个已在 DNS 激活（已注册）。`);
    console.log(`   发现 ${chalk.cyan(inactiveDomains.length)} 个域名在 DNS 中未激活，列为【高度疑似未注册】候选。\n`);

    if (inactiveDomains.length === 0) {
        console.log(chalk.red('未找到疑似未注册的域名，请调整筛选分数或更换条件。'));
        return;
    }

    // 限制取前 5 个进行 WHOIS 查询，以防请求过于频繁被限频
    const whoisTargets = inactiveDomains.slice(0, 5);
    console.log(chalk.yellow(`3. 正在对前 ${whoisTargets.length} 个【高度疑似未注册】域名进行 WHOIS 权威校对...`));
    
    const availableFound = [];
    for (const target of whoisTargets) {
        try {
            console.log(chalk.gray(`   正在核对: ${target.domain} ...`));
            const whoisRes = await checkWHOIS(target.domain);
            if (!whoisRes.registered) {
                console.log(chalk.green.bold(`   🎉 发现可注册极品域名: ${target.domain} ! (评分: ${target.score}, 模式: ${target.patternDesc})`));
                availableFound.push(target);
            } else {
                console.log(chalk.red(`   ❌ 已被占用 (WHOIS 有记录但无 DNS 解析): ${target.domain}`));
            }
            // 稍作延迟以防 WHOIS 封禁
            await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
            console.log(chalk.red(`   ⚠️ 查询出错 ${target.domain}: ${err.message}`));
        }
    }

    console.log(chalk.cyan.bold('\n=================================================='));
    console.log(chalk.cyan.bold('                 验证结果汇总                     '));
    console.log(chalk.cyan.bold('=================================================='));
    if (availableFound.length > 0) {
        console.log(chalk.green.bold(`\n可行性验证成功！为您寻找到以下可以直接注册的高价值域名：`));
        availableFound.forEach((d, idx) => {
            console.log(chalk.green(`  ${idx + 1}. 【 ${d.domain} 】- 评分: ${d.score} 分 - 特征: ${d.patternDesc}`));
        });
        console.log(chalk.gray('\n您可直接前往 Porkbun.com / Namecheap.com 等平台直接注册！'));
    } else {
        console.log(chalk.yellow('\n本次测试的几个候选均已被他人注册（属于有 WHOIS 记录但未挂 DNS 解析的情况）。'));
        console.log(chalk.yellow('这证明了双通道检验的必要性。您可以运行完整扫描以寻找更多遗珠。'));
    }
    console.log(chalk.cyan.bold('==================================================\n'));
}

verifyFeasibility();
