# DIGITX - Project Context for Agents

Welcome, Agent! This document provides the necessary context, architecture, and design principles for the **DIGITX** project. Read this before modifying the codebase.

## 1. Project Background
DIGITX is a high-performance, dual-channel domain finder and validator designed specifically for hunting "premium numeric domains" (e.g., repeating numbers, sequences, lucky numbers). It generates potential high-value numeric domains, scores them based on specific patterns, and rapidly checks their availability.

## 2. Core Architecture
The system employs a dual-mode architecture to ensure flexibility:
- **Local Mode**: Runs via an Express backend (`server.js`) or CLI (`cli.js`). It allows real-time interactive scanning, configuration, and terminal logs inside the browser.
- **Static Mode (Production)**: Hosted entirely statically (e.g., on Cloudflare Pages). The frontend (`public/js/app.js`) automatically detects this mode and hides interactive scanning tools, instead loading pre-compiled JSON data.
- **Automation Pipeline**: A headless Node.js script (`cron_scan.js`) runs periodically via GitHub Actions (`.github/workflows/scheduled_scan.yml`). It performs the heavy lifting of domain validation in small batches and commits the updated data (`public/data/domains.json` and `public/data/status.json`) back to the repository, which triggers a Cloudflare Pages deployment.

## 3. The Scanning Engine (Dual-Channel)
The domain validation utilizes a two-stage process in `checker.js`:
1. **Stage 1 (DNS Blind Scan)**: Extremely fast concurrent DNS checks (`dns.resolveAny`). It filters out actively used domains immediately without hitting WHOIS servers.
2. **Stage 2 (WHOIS Verification)**: The remaining domains are verified using WHOIS. This is artificially throttled (default 2000ms delay) to prevent WHOIS server IP bans.

## 4. Key Files & Structure
- **`generator.js`**: Generates numeric domains based on length, filters out unlucky numbers (e.g., '4', unless it's a programmer special like '1024' or '404'), categorizes them (e.g., 'Super Repeater', 'Chinese Lucky'), and scores them.
- **`checker.js`**: Core validation logic (DNS + WHOIS). Includes `CheckerQueue` for asynchronous, throttled processing, and `LocalStore` to persist state.
- **`server.js`**: Express backend for local mode. Serves the UI, provides APIs to start/pause scanning, and streams SSE logs.
- **`cli.js`**: Command-line interface using `inquirer` to kick off the generation and scanning process directly in the terminal.
- **`cron_scan.js`**: Headless scanning script for GitHub Actions. Implements a timeout safeguard (e.g., pauses and exits gracefully before the Action gets forcefully killed by GitHub's time limits).
- **`public/index.html`**: The UI entry point. Uses modern CSS (glassmorphism, neon glows) and supports English/Chinese localization.
- **`public/js/app.js`**: The frontend logic. Automatically toggles between English and Chinese (`LOCALIZATION`), handles the filtering/sorting of domains, and adapts the UI for Local vs. Static mode.
- **`domains_db.json`**: The single source of truth for the database state (tracked in git to persist GitHub Actions progress).

## 5. Development Guidelines
- **UI Aesthetics**: The project relies on a premium, dark-themed, "cyberpunk" aesthetic. Ensure any new UI components utilize existing CSS variables (`--neon-cyan`, `--glass-bg`, etc.).
- **Localization**: All UI text must be implemented using the `LOCALIZATION` dictionary in `app.js`. Hardcoded text in `index.html` should be dynamically replaced by JS to support bilingual users.
- **Stateless Cloud Execution**: Remember that GitHub Actions provides ephemeral environments. Any state changes must be saved to `domains_db.json` and committed back to the repository before the process exits.
- **Throttling is Critical**: Never bypass the WHOIS delay in `checker.js` or `cron_scan.js`. Bypassing this will result in IP blacklisting by the WHOIS registries.

## Agent skills

### Issue tracker

Issues and PRDs for this repo live as GitHub issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles mapped to GitHub label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` + `docs/adr/` at root). See `docs/agents/domain.md`.

