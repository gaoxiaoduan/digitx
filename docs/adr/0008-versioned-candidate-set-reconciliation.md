# Reconcile Scan State When Candidate Rules Change

The active candidate set carries a generator version. When that version changes, the scanner regenerates the candidate set, preserves DNS and WHOIS state only for domains that remain in the new set, marks new domains unchecked, and removes retired candidates even when they were previously available. This trades retention of obsolete scan results for a consistently high-quality active dataset while avoiding redundant checks for candidates that survive the rule change.
