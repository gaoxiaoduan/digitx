import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import fs from 'node:fs';
import path from 'node:path';
import {
  createFileCheckpointAdapter,
  generateCandidates,
  nodeDNSAdapter,
  nodeTimingAdapter,
  nodeWHOISAdapter,
  recalculateStats,
  runScanBatch,
  type DomainDatabase
} from '@digitx/core';

const DB_PATH = path.resolve(process.cwd(), 'domains_db.json');

function loadDB(): DomainDatabase {
  if (fs.existsSync(DB_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch {
      // Fallback
    }
  }
  return {
    domains: {},
    stats: { total: 0, checked: 0, unchecked: 0, available: 0, registered: 0, error: 0 },
    config: { delay: 2000, exclude4: true, minLength: 6, maxLength: 8, minScore: 60, tld: '.xyz' }
  };
}

function saveDB(db: DomainDatabase) {
  recalculateStats(db);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

async function main() {
  console.log(
    boxen(chalk.cyan.bold('DIGITX - High-Performance Numeric Domain Finder CLI'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan'
    })
  );

  const db = loadDB();
  console.log(chalk.gray(`Loaded ${db.stats.total} total domains. Available: ${chalk.green(db.stats.available)}`));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select action:',
      choices: [
        { name: '1. Generate domain candidates', value: 'generate' },
        { name: '2. Run batch scanning', value: 'scan' },
        { name: '3. View available domains list', value: 'list' },
        { name: '4. Exit', value: 'exit' }
      ]
    }
  ]);

  if (action === 'generate') {
    const spinner = ora('Generating numeric domain candidates...').start();
    const candidates = generateCandidates({
      minLength: db.config.minLength,
      maxLength: db.config.maxLength,
      excludeUnlucky4: db.config.exclude4,
      minScore: db.config.minScore,
      tld: db.config.tld
    });
    db.domains = {};
    for (const cand of candidates) {
      db.domains[cand.domain] = {
        ...cand,
        status: 'unchecked',
        detail: '',
        updatedAt: null
      };
    }
    saveDB(db);
    spinner.succeed(`Generated ${candidates.length} candidates! Saved to database.`);
  } else if (action === 'scan') {
    const unchecked = Object.values(db.domains).filter((d) => d.status === 'unchecked');
    console.log(chalk.yellow(`Scanning ${unchecked.length} unchecked domains...`));

    const spinner = ora('Starting Scan Engine...').start();
    const outcome = await runScanBatch(
      db,
      { maxWhois: null, whoisDelayMs: db.config.delay },
      {
        dns: nodeDNSAdapter,
        whois: nodeWHOISAdapter,
        timing: nodeTimingAdapter,
        checkpoint: createFileCheckpointAdapter(DB_PATH),
        progress: {
          report: ({ stage, processed, total, domain }) => {
            const label = stage === 'blind-scan' ? 'DNS Blind Scan' : 'WHOIS Verification';
            spinner.text = `${label} ${processed}/${total}: ${domain}`;
          }
        }
      }
    );

    const summary = `Scan Engine finished: ${outcome.blindScan.registered} DNS registered, ${outcome.whois.available} available, ${outcome.whois.errors} errors.`;
    if (outcome.whois.errors > 0) spinner.warn(chalk.yellow(summary));
    else spinner.succeed(summary);
  } else if (action === 'list') {
    const availableList = Object.values(db.domains).filter((d) => d.status === 'available');
    console.log(chalk.green.bold(`\nAvailable Domains (${availableList.length}):`));
    for (const item of availableList) {
      console.log(`- ${chalk.cyan(item.domain)} | Score: ${item.score} | Category: ${item.category} (${item.patternDesc})`);
    }
  } else {
    console.log(chalk.gray('Goodbye!'));
    process.exit(0);
  }
}

main().catch(console.error);
