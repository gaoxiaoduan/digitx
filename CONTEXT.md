# DIGITX Context

A high-performance numeric domain finder and validator, targeting premium numeric domain patterns and validating availability via multi-stage DNS and WHOIS scanning.

## Language

**Numeric Domain**:
A domain name consisting exclusively or primarily of numeric digits (e.g. `8888.xyz`, `1024.xyz`).
_Avoid_: Number domain, digital domain

**Blind Scan**:
Stage 1 validation using rapid concurrent DNS lookups to quickly filter out active domains.
_Avoid_: DNS check, quick check

**WHOIS Verification**:
Stage 2 throttled validation contacting WHOIS servers to confirm exact domain registration status.
_Avoid_: Slow scan, WHOIS check

**Scan Engine**:
The background scanning logic (running in Node.js via GitHub Actions) executing Stage 1 and Stage 2 validation.
_Avoid_: Worker, checker background
