import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_MIN_SCORE,
  GENERATOR_VERSION,
  createEmptyDomainDatabase,
  createFileCheckpointAdapter,
  generateCandidates,
  nodeDNSAdapter,
  nodeTimingAdapter,
  nodeWHOISAdapter,
  recalculateStats,
  reconcileCandidateDatabase,
  runScanBatch,
  type DomainDatabase
} from '@digitx/core';

const DB_PATH = path.resolve(process.cwd(), 'domains_db.json');

function loadDB(): DomainDatabase {
  if (fs.existsSync(DB_PATH)) {
    try {
      const checkpoint = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DomainDatabase;
      if (checkpoint.generatorVersion === GENERATOR_VERSION) return checkpoint;
      return reconcileCandidateDatabase(
        checkpoint,
        generateCandidates({ minScore: DEFAULT_MIN_SCORE, tld: checkpoint.config.tld }),
        { delay: checkpoint.config.delay, minScore: DEFAULT_MIN_SCORE, tld: checkpoint.config.tld }
      );
    } catch {
      // Fallback
    }
  }
  return createEmptyDomainDatabase();
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

  let db = loadDB();
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
      minScore: db.config.minScore,
      tld: db.config.tld
    });
    db = reconcileCandidateDatabase(db, candidates, db.config);
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
