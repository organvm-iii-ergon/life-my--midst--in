#!/usr/bin/env python3
"""Collect and summarize repo-local ORGANVM soak-test snapshots."""

from __future__ import annotations

import argparse
import json
import os
import re
import shlex
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "soak-test"
PULSE_HOME = Path("/tmp/life-my--midst--in-organvm-home")

README_CHANGE_RE = re.compile(
    r"^\s*(?P<file>[^:]+):\d+\s+"
    r"(?P<variable>[A-Za-z0-9_]+):\s+'(?P<before>.*?)'\s+->\s+'(?P<after>.*?)'$"
)


def _text(value: str | bytes | None) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return value


def run_command(
    command: list[str],
    *,
    cwd: Path = ROOT,
    env: dict[str, str] | None = None,
    timeout: int | None = None,
) -> dict[str, Any]:
    """Run a command and capture stdout/stderr without raising on failures."""
    quoted = " ".join(shlex.quote(part) for part in command)
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            env=env,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        return {
            "command": quoted,
            "cwd": str(cwd),
            "returncode": None,
            "stdout": _text(exc.stdout).strip(),
            "stderr": _text(exc.stderr).strip(),
            "timed_out": True,
            "timeout_seconds": timeout,
        }

    return {
        "command": quoted,
        "cwd": str(cwd),
        "returncode": result.returncode,
        "stdout": result.stdout.strip(),
        "stderr": result.stderr.strip(),
        "timed_out": False,
    }


def organvm_pulse_env() -> dict[str, str]:
    """Build an env that lets organvm write pulse history inside the sandbox."""
    env = os.environ.copy()
    env["HOME"] = str(PULSE_HOME)
    PULSE_HOME.mkdir(parents=True, exist_ok=True)

    python_paths = []
    user_site = (
        Path.home()
        / "Library"
        / "Python"
        / f"{sys.version_info.major}.{sys.version_info.minor}"
        / "lib"
        / "python"
        / "site-packages"
    )
    brew_site = (
        Path("/opt/homebrew/lib")
        / f"python{sys.version_info.major}.{sys.version_info.minor}"
        / "site-packages"
    )
    for path in (user_site, brew_site):
        if path.exists():
            python_paths.append(str(path))
    existing = env.get("PYTHONPATH", "")
    if existing:
        python_paths.append(existing)
    if python_paths:
        env["PYTHONPATH"] = ":".join(python_paths)
    return env


def run_git(command: list[str]) -> str:
    """Run git and return stripped stdout."""
    outcome = run_command(["git", *command])
    return outcome["stdout"]


def repo_state() -> dict[str, Any]:
    """Capture the current git state for the snapshot."""
    return {
        "name": ROOT.name,
        "path": str(ROOT),
        "branch": run_git(["branch", "--show-current"]),
        "head": run_git(["rev-parse", "--short", "HEAD"]),
        "dirty": bool(run_git(["status", "--short"])),
    }


def parse_refresh_probe(outcome: dict[str, Any]) -> dict[str, Any]:
    """Extract actionable findings from a refresh dry-run outcome."""
    merged_output = "\n".join(
        part for part in [outcome.get("stdout", ""), outcome.get("stderr", "")] if part
    )
    context_blocker = None
    if "Registry validation failed. Refusing to sync context files." in merged_output:
        invalid_tier = next(
            (
                line.strip()
                for line in merged_output.splitlines()
                if "invalid tier" in line
            ),
            "",
        )
        context_blocker = {
            "status": "open",
            "reason": "shared registry validation blocker",
            "detail": invalid_tier or "Registry validation failed during context sync.",
        }

    planned_changes = []
    for line in merged_output.splitlines():
        match = README_CHANGE_RE.match(line)
        if not match:
            continue
        planned_changes.append(
            {
                "file": match.group("file"),
                "variable": match.group("variable"),
                "before": match.group("before"),
                "after": match.group("after"),
            }
        )

    return {
        "context_blocker": context_blocker,
        "planned_changes": planned_changes,
    }


def collect_snapshot() -> dict[str, Any]:
    """Run the manual pulse workflow and return the snapshot payload."""
    pulse_outcome = run_command(
        ["organvm", "pulse", "scan", "--json"],
        env=organvm_pulse_env(),
        timeout=30,
    )
    if pulse_outcome["returncode"] != 0 or not pulse_outcome["stdout"]:
        raise RuntimeError(
            "organvm pulse scan failed: "
            f"{pulse_outcome['stderr'] or pulse_outcome['stdout'] or 'no output'}"
        )

    status_outcome = run_command(["organvm", "status"], timeout=15)
    full_refresh = run_command(
        ["organvm", "refresh", "--workspace", ".", "--dry-run"],
        timeout=8,
    )
    scoped_refresh = run_command(
        [
            "organvm",
            "refresh",
            "--workspace",
            ".",
            "--dry-run",
            "--skip-context",
            "--skip-organism",
            "--skip-legacy",
            "--skip-plans",
            "--skip-sop",
            "--skip-atoms",
        ],
        timeout=20,
    )

    pulse_data = json.loads(pulse_outcome["stdout"])
    full_analysis = parse_refresh_probe(full_refresh)
    scoped_analysis = parse_refresh_probe(scoped_refresh)

    findings = []
    if full_analysis["context_blocker"]:
        findings.append(
            {
                "id": "refresh-context-blocked",
                "severity": "warn",
                "status": "open",
                "summary": "Full organvm refresh is blocked by shared registry validation.",
                "detail": full_analysis["context_blocker"]["detail"],
            }
        )
    if scoped_analysis["planned_changes"]:
        findings.append(
            {
                "id": "scoped-refresh-drift",
                "severity": "info",
                "status": "open",
                "summary": "Scoped refresh reports repo-local metric drift.",
                "detail": f"{len(scoped_analysis['planned_changes'])} variable replacement(s) pending.",
            }
        )

    return {
        "date": datetime.now(UTC).strftime("%Y-%m-%d"),
        "collected_at": datetime.now(UTC).isoformat(),
        "repo": repo_state(),
        "manual_pulse": {
            "command": pulse_outcome["command"],
            "summary": {
                "system_density": pulse_data.get("system_density"),
                "total_entities": pulse_data.get("total_entities"),
                "active_edges": pulse_data.get("active_edges"),
                "event_frequency_24h": pulse_data.get("event_frequency_24h"),
                "compressed_text": pulse_data.get("compressed_text"),
                "organ_iii": pulse_data.get("organs", {}).get("ORGAN-III", {}),
            },
            "raw": pulse_data,
        },
        "status_command": {
            "command": status_outcome["command"],
            "returncode": status_outcome["returncode"],
            "stdout_lines": status_outcome["stdout"].splitlines(),
        },
        "refresh_probes": {
            "full": {**full_refresh, "analysis": full_analysis},
            "scoped": {**scoped_refresh, "analysis": scoped_analysis},
        },
        "findings": findings,
    }


def write_snapshot(snapshot: dict[str, Any]) -> Path:
    """Write the snapshot to data/soak-test/daily-YYYY-MM-DD.json."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_path = DATA_DIR / f"daily-{snapshot['date']}.json"
    output_path.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")
    return output_path


def load_snapshots() -> list[dict[str, Any]]:
    """Load all repo-local soak snapshots in date order."""
    snapshots = []
    for path in sorted(DATA_DIR.glob("daily-*.json")):
        snapshots.append(json.loads(path.read_text(encoding="utf-8")))
    return snapshots


def generate_report(snapshots: list[dict[str, Any]], *, generated_at: datetime | None = None) -> str:
    """Build the markdown summary from stored snapshots."""
    if not snapshots:
        raise ValueError("at least one snapshot is required")

    generated = generated_at or datetime.now(UTC)
    latest = snapshots[-1]
    pulse_summary = latest["manual_pulse"]["summary"]
    organ_iii = pulse_summary.get("organ_iii", {})
    full_refresh = latest["refresh_probes"]["full"]
    scoped_refresh = latest["refresh_probes"]["scoped"]
    findings = latest.get("findings", [])
    verification = latest.get("verification", {})

    def verification_line(key: str, label: str) -> str:
        entry = verification.get(key)
        if not entry:
            return f"- `{label}`: pending"
        detail = entry.get("detail", "")
        suffix = f" — {detail}" if detail else ""
        return f"- `{label}`: **{entry.get('status', 'pending')}**{suffix}"

    lines = [
        "# Soak Test Report",
        "",
        f"**Period:** {snapshots[0]['date']} to {snapshots[-1]['date']}",
        f"**Snapshots:** {len(snapshots)}",
        f"**Generated:** {generated.strftime('%Y-%m-%d %H:%M UTC')}",
        "",
        "---",
        "",
        "## Latest Pulse",
        "",
        f"- Manual pulse command: `{latest['manual_pulse']['command']}`",
        f"- System density: **{pulse_summary.get('system_density', 0):.3f}**",
        f"- Total entities: **{pulse_summary.get('total_entities', 0)}**",
        f"- Active edges: **{pulse_summary.get('active_edges', 0)}**",
        f"- ORGAN-III density: **{organ_iii.get('density', 0):.2f}** across {organ_iii.get('repo_count', 0)} repos",
        f"- Pulse summary: `{pulse_summary.get('compressed_text', 'n/a')}`",
        "",
        "## Repo State",
        "",
        f"- Branch: `{latest['repo']['branch']}`",
        f"- HEAD: `{latest['repo']['head']}`",
        f"- Worktree clean: **{'yes' if not latest['repo']['dirty'] else 'no'}**",
        "",
        "## Refresh Findings",
        "",
        f"- Full dry-run status: **{'timed out' if full_refresh.get('timed_out') else full_refresh.get('returncode')}**",
    ]

    blocker = full_refresh["analysis"].get("context_blocker")
    if blocker:
        lines.append(f"- Context sync blocker: `{blocker['detail']}`")
    else:
        lines.append("- Context sync blocker: none detected in the latest probe")

    planned_changes = scoped_refresh["analysis"].get("planned_changes", [])
    lines.append(f"- Scoped dry-run planned changes: **{len(planned_changes)}**")
    if planned_changes:
        for change in planned_changes:
            lines.append(
                f"- `{change['file']}` `{change['variable']}`: `{change['before']}` -> `{change['after']}`"
            )
    else:
        lines.append("- Scoped refresh reported no repo-local variable drift")

    lines.extend(
        [
            "",
            "## Remediation Status",
            "",
        ]
    )
    if findings:
        for finding in findings:
            lines.append(
                f"- `{finding['id']}`: **{finding['status']}** — {finding['summary']} {finding['detail']}"
            )
    else:
        lines.append("- No open remediation items were recorded in the latest snapshot.")

    lines.extend(
        [
            "",
            "## Verification",
            "",
            verification_line("ruff_check", "ruff check ."),
            verification_line("pyright", "pyright"),
            verification_line("pytest", "pytest -v"),
            "",
        ]
    )

    return "\n".join(lines)


def write_report(days: int) -> Path:
    """Generate and persist report.md from the stored snapshots."""
    snapshots = load_snapshots()
    if not snapshots:
        raise RuntimeError("no snapshots found; run `collect` first")
    selected = snapshots[-days:]
    report = generate_report(selected)
    output_path = DATA_DIR / "report.md"
    output_path.write_text(report + "\n", encoding="utf-8")
    return output_path


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line parser."""
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("collect", help="run the manual pulse and store a daily snapshot")

    report_parser = subparsers.add_parser("report", help="generate report.md from stored snapshots")
    report_parser.add_argument("--days", type=int, default=30, help="number of recent snapshots to summarize")

    return parser


def main(argv: list[str] | None = None) -> int:
    """Entry point for the soak test monitor."""
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "collect":
        snapshot_path = write_snapshot(collect_snapshot())
        print(f"snapshot written to {snapshot_path}")
        return 0

    report_path = write_report(args.days)
    print(f"report written to {report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
