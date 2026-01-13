#!/usr/bin/env python3
"""
generate-monorepo.py

Scaffolds the monorepo directory structure and placeholder files for in-midst-my-life.

Usage:
    python generate-monorepo.py
    python generate-monorepo.py --force  # overwrite existing files

Source: Extracted from ARCH-005-monorepo-generator.md
"""

import argparse
from pathlib import Path
from textwrap import dedent

# ---------- Configuration ----------

# Directories to create relative to repo root
DIRS = [
    "apps",
    "apps/web",
    "apps/web/src",
    "apps/api",
    "apps/api/src",
    "apps/orchestrator",
    "apps/orchestrator/src",
    "packages",
    "packages/schema",
    "packages/schema/src",
    "packages/schema/test",
    "packages/core",
    "packages/core/src",
    "packages/core/test",
    "packages/content-model",
    "packages/content-model/src",
    "packages/content-model/test",
    "packages/design-system",
    "packages/design-system/src",
    "packages/design-system/test",
    "infra",
    "infra/terraform",
    "infra/k8s",
    "docs",
    "docs/specs",
    ".github",
    ".github/workflows",
    "scripts",
]

# Files to create: path -> content (relative to repo root)
FILES = {
    # Root gitignore (don't overwrite if exists)
    ".gitignore": dedent(
        """\
        __pycache__/
        .pytest_cache/
        .DS_Store
        node_modules/
        dist/
        build/
        .next/
        .env
        .env.local
        .venv/
        *.log
        .turbo/
        coverage/
        .vitest/
        """
    ),

    # Apps container
    "apps/README.md": dedent(
        """\
        # Apps

        This folder contains runnable applications (frontends, backends, workers).
        - `web/`          – Interactive CV UI (Next.js 15)
        - `api/`          – Backend API / orchestration (Fastify)
        - `orchestrator/` – Multi-agent workflow coordination
        """
    ),

    # Web app
    "apps/web/README.md": dedent(
        """\
        # Web App (Interactive CV)

        Frontend application for the interactive CV/résumé.
        - Tech: Next.js 15, React Server Components, TypeScript
        - Entry: `src/app/page.tsx`

        ## Development

        ```bash
        pnpm dev
        ```
        """
    ),
    "apps/web/package.json": dedent(
        """\
        {
          "name": "@in-midst-my-life/web",
          "version": "0.1.0",
          "private": true,
          "scripts": {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint",
            "typecheck": "tsc --noEmit"
          },
          "dependencies": {
            "next": "15.1.0",
            "react": "^19.0.0",
            "react-dom": "^19.0.0",
            "@in-midst-my-life/schema": "workspace:*"
          },
          "devDependencies": {
            "@types/node": "^20",
            "@types/react": "^19",
            "@types/react-dom": "^19",
            "typescript": "^5.3.3"
          }
        }
        """
    ),

    # API app
    "apps/api/README.md": dedent(
        """\
        # API Service

        Backend service powering the interactive CV/résumé.
        - Tech: Fastify, TypeScript
        - Entrypoint: `src/index.ts`
        - Responsibilities: APIs, data orchestration, VC verification
        """
    ),
    "apps/api/package.json": dedent(
        """\
        {
          "name": "@in-midst-my-life/api",
          "version": "0.1.0",
          "private": true,
          "scripts": {
            "dev": "tsx watch src/index.ts",
            "build": "tsc",
            "start": "node dist/index.js",
            "typecheck": "tsc --noEmit"
          },
          "dependencies": {
            "fastify": "^4.25.0",
            "@fastify/cors": "^8.4.2",
            "@in-midst-my-life/schema": "workspace:*",
            "@in-midst-my-life/core": "workspace:*"
          },
          "devDependencies": {
            "@types/node": "^20",
            "tsx": "^4.7.0",
            "typescript": "^5.3.3"
          }
        }
        """
    ),
    "apps/api/src/index.ts": dedent(
        """\
        import Fastify from 'fastify';
        import cors from '@fastify/cors';

        const fastify = Fastify({
          logger: true
        });

        fastify.register(cors);

        fastify.get('/health', async () => {
          return { status: 'ok' };
        });

        const start = async () => {
          try {
            await fastify.listen({ port: 3001, host: '0.0.0.0' });
          } catch (err) {
            fastify.log.error(err);
            process.exit(1);
          }
        };

        start();
        """
    ),

    # Orchestrator app
    "apps/orchestrator/README.md": dedent(
        """\
        # Orchestrator Service

        Multi-agent workflow coordination system.
        - Tech: TypeScript, Node
        - Agents: Architect, Implementer, Reviewer, Tester, Maintainer
        - Integration: GitHub webhooks and CI

        See WORK-005-autonomous-code-growth.md for complete specification.
        """
    ),

    # Packages container
    "packages/README.md": dedent(
        """\
        # Shared Packages

        Reusable libraries shared across apps:
        - `schema/`        – Canonical data model (Zod schemas, TypeScript types)
        - `core/`          – Domain logic and shared utilities
        - `content-model/` – Narrative generation and mask transformation
        - `agents/`        – AI agent definitions and coordination
        """
    ),

    # Schema package
    "packages/schema/README.md": dedent(
        """\
        # @in-midst-my-life/schema

        Core data schemas for the interactive CV system.

        ## Usage

        ```typescript
        import { ProfileSchema, MaskSchema } from '@in-midst-my-life/schema';

        const profile = ProfileSchema.parse(profileData);
        ```

        See SPEC-001-data-schema.md for complete specification.
        """
    ),
    "packages/schema/package.json": dedent(
        """\
        {
          "name": "@in-midst-my-life/schema",
          "version": "0.1.0",
          "main": "./src/index.ts",
          "types": "./src/index.ts",
          "scripts": {
            "test": "vitest run",
            "test:watch": "vitest",
            "typecheck": "tsc --noEmit"
          },
          "dependencies": {
            "zod": "^3.22.4"
          },
          "devDependencies": {
            "typescript": "^5.3.3",
            "vitest": "^1.1.0"
          }
        }
        """
    ),
    "packages/schema/src/index.ts": dedent(
        """\
        // Core schema exports
        export * from './identity';
        export * from './profile';
        export * from './mask';

        // Re-export zod for convenience
        export { z } from 'zod';
        """
    ),

    # Core package
    "packages/core/README.md": dedent(
        """\
        # Core Package

        Holds core domain logic, entities, and services for the interactive CV.
        """
    ),
    "packages/core/package.json": dedent(
        """\
        {
          "name": "@in-midst-my-life/core",
          "version": "0.1.0",
          "main": "./src/index.ts",
          "types": "./src/index.ts",
          "scripts": {
            "test": "vitest run",
            "test:watch": "vitest",
            "typecheck": "tsc --noEmit"
          },
          "dependencies": {
            "@in-midst-my-life/schema": "workspace:*"
          },
          "devDependencies": {
            "typescript": "^5.3.3",
            "vitest": "^1.1.0"
          }
        }
        """
    ),

    # Content Model package
    "packages/content-model/README.md": dedent(
        """\
        # Content Model Package

        Narrative generation and mask transformation logic.

        Responsibilities:
        - Map schema entities to narrative blocks
        - Handle mask/stage/epoch selection
        - Generate context-specific presentations
        """
    ),

    # Infra
    "infra/README.md": dedent(
        """\
        # Infrastructure

        Infrastructure-as-code and deployment configuration:
        - `terraform/` – Cloud resources
        - `k8s/`       – Kubernetes manifests
        """
    ),
    "infra/terraform/main.tf": dedent(
        """\
        # Terraform root module placeholder for interactive CV infrastructure.

        terraform {
          required_version = ">= 1.0.0"
        }

        # TODO: Configure providers as needed
        """
    ),

    # Docs
    "docs/README.md": dedent(
        """\
        # Documentation

        High-level documentation for the interactive CV system.

        See the parent directory for design documents organized as:
        - FOUND-* (Foundational concepts)
        - SPEC-* (Specifications)
        - ARCH-* (Architecture)
        - PLAN-* (Planning)
        - WORK-* (Workflows)
        - ORCH-* (Orchestration)
        - META-* (Meta-organization)
        """
    ),

    # GitHub workflows
    ".github/README.md": dedent(
        """\
        # GitHub Configuration

        GitHub-specific configuration, including Actions workflows.

        See ARCH-003-cicd-pipeline.md for CI/CD specifications.
        """
    ),

    # Scripts
    "scripts/README.md": dedent(
        """\
        # Scripts

        Utility and automation scripts for this monorepo.
        - `generate-monorepo.py` – Scaffolds the directory tree and placeholders
        """
    ),
}

# ---------- Implementation ----------

def detect_repo_root() -> Path:
    """
    Assume this script lives in repo root or scripts/ directory.
    """
    script_path = Path(__file__).resolve()
    if script_path.parent.name == "scripts":
        return script_path.parent.parent
    return script_path.parent

def ensure_dirs(root: Path) -> None:
    """Create all required directories."""
    for rel in DIRS:
        path = root / rel
        path.mkdir(parents=True, exist_ok=True)
        print(f"📁 {rel}")

def write_files(root: Path, force: bool = False) -> None:
    """Write all placeholder files."""
    for rel, content in FILES.items():
        path = root / rel
        if path.exists() and not force:
            print(f"⏭️  SKIP (exists): {rel}")
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        print(f"✅ WRITE: {rel}")

def create_root_package_json(root: Path, force: bool = False) -> None:
    """Create root package.json for monorepo."""
    path = root / "package.json"
    if path.exists() and not force:
        print(f"⏭️  SKIP (exists): package.json")
        return

    content = dedent(
        """\
        {
          "name": "in-midst-my-life",
          "version": "0.1.0",
          "private": true,
          "workspaces": [
            "apps/*",
            "packages/*"
          ],
          "scripts": {
            "dev": "turbo run dev",
            "build": "turbo run build",
            "test": "turbo run test",
            "lint": "turbo run lint",
            "typecheck": "turbo run typecheck"
          },
          "devDependencies": {
            "turbo": "^1.11.0",
            "typescript": "^5.3.3",
            "prettier": "^3.1.1",
            "eslint": "^8.56.0"
          }
        }
        """
    )
    path.write_text(content, encoding="utf-8")
    print(f"✅ WRITE: package.json")

def main():
    parser = argparse.ArgumentParser(
        description="Scaffold the in-midst-my-life monorepo structure"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files instead of skipping them",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("  in-midst-my-life Monorepo Generator")
    print("=" * 60)
    print()

    repo_root = detect_repo_root()
    print(f"📂 Repo root: {repo_root}")
    print()

    print("Creating directories...")
    ensure_dirs(repo_root)
    print()

    print("Writing files...")
    write_files(repo_root, force=args.force)
    print()

    print("Creating root package.json...")
    create_root_package_json(repo_root, force=args.force)
    print()

    print("=" * 60)
    print("✨ Scaffolding complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. cd into the repo root")
    print("  2. Run: pnpm install")
    print("  3. Review QUICKSTART.md for implementation guide")
    print("  4. Begin Phase 1: Implement schema package")
    print()

if __name__ == "__main__":
    main()
