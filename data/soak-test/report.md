# Soak Test Report

**Period:** 2026-04-23 to 2026-04-23
**Snapshots:** 1
**Generated:** 2026-04-23 13:19 UTC

---

## Latest Pulse

- Manual pulse command: `organvm pulse scan --json`
- System density: **0.545**
- Total entities: **147**
- Active edges: **43**
- ORGAN-III density: **0.54** across 32 repos
- Pulse summary: `AMMOI:55% E:43 T:0 C:0 Ev24h:3 8o/147r/1654c [ORGAN-VI:76%, ORGAN-VII:75%, PERSONAL:68%]`

## Repo State

- Branch: `master`
- HEAD: `916c0105`
- Worktree clean: **no**

## Refresh Findings

- Full dry-run status: **timed out**
- Context sync blocker: `system-system--system: invalid tier 'sovereign'`
- Scoped dry-run planned changes: **3**
- `README.md` `total_repos`: `127` -> `147`
- `README.md` `total_organs`: `8` -> `10`
- `README.md` `total_words_short`: `766K+` -> `0K+`

## Remediation Status

- `refresh-context-blocked`: **open** — Full organvm refresh is blocked by shared registry validation. system-system--system: invalid tier 'sovereign'
- `scoped-refresh-drift`: **open** — Scoped refresh reports repo-local metric drift. 3 variable replacement(s) pending.

## Verification

- `ruff check .`: **passed** — All checks passed!
- `pyright`: **passed** — 0 errors, 0 warnings, 0 informations
- `pytest -v`: **passed** — 2 passed in 0.07s

