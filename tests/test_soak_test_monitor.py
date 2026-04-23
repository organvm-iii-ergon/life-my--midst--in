from __future__ import annotations

from datetime import UTC, datetime

from scripts.soak_test_monitor import generate_report, parse_refresh_probe


def test_parse_refresh_probe_extracts_context_blocker_and_planned_changes() -> None:
    outcome = {
        "stdout": "\n".join(
            [
                "[DRY RUN] [3/10] Variables resolved: 3 replacement(s) in 1/185 file(s)",
                "    README.md:7 total_repos: '127' -> '147'",
                "    README.md:7 total_organs: '8' -> '10'",
            ]
        ),
        "stderr": "\n".join(
            [
                "[DRY RUN] [6/10] Context sync error: Registry validation failed. Refusing to sync context files.",
                "Registry Validation: 147 repos checked",
                "ERRORS (1):",
                "  system-system--system: invalid tier 'sovereign'",
            ]
        ),
    }

    parsed = parse_refresh_probe(outcome)

    assert parsed["context_blocker"] == {
        "status": "open",
        "reason": "shared registry validation blocker",
        "detail": "system-system--system: invalid tier 'sovereign'",
    }
    assert parsed["planned_changes"] == [
        {
            "file": "README.md",
            "variable": "total_repos",
            "before": "127",
            "after": "147",
        },
        {
            "file": "README.md",
            "variable": "total_organs",
            "before": "8",
            "after": "10",
        },
    ]


def test_generate_report_renders_latest_snapshot_findings() -> None:
    snapshots = [
        {
            "date": "2026-04-23",
            "repo": {
                "branch": "master",
                "head": "916c0105",
                "dirty": False,
            },
            "manual_pulse": {
                "command": "organvm pulse scan --json",
                "summary": {
                    "system_density": 0.545,
                    "total_entities": 147,
                    "active_edges": 43,
                    "compressed_text": "AMMOI:55% E:43",
                    "organ_iii": {"density": 0.54, "repo_count": 32},
                },
            },
            "refresh_probes": {
                "full": {
                    "timed_out": True,
                    "returncode": None,
                    "analysis": {
                        "context_blocker": {
                            "detail": "system-system--system: invalid tier 'sovereign'"
                        }
                    },
                },
                "scoped": {
                    "analysis": {
                        "planned_changes": [
                            {
                                "file": "README.md",
                                "variable": "total_repos",
                                "before": "127",
                                "after": "147",
                            }
                        ]
                    }
                },
            },
            "findings": [
                {
                    "id": "refresh-context-blocked",
                    "status": "open",
                    "summary": "Full organvm refresh is blocked by shared registry validation.",
                    "detail": "system-system--system: invalid tier 'sovereign'",
                }
            ],
        }
    ]

    report = generate_report(
        snapshots,
        generated_at=datetime(2026, 4, 23, 13, 18, tzinfo=UTC),
    )

    assert "**Period:** 2026-04-23 to 2026-04-23" in report
    assert "- System density: **0.545**" in report
    assert "- Worktree clean: **yes**" in report
    assert "- Context sync blocker: `system-system--system: invalid tier 'sovereign'`" in report
    assert "- `README.md` `total_repos`: `127` -> `147`" in report
    assert "- `ruff check .`: pending" in report
