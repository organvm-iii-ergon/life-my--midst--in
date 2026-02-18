# Contributing to life-my--midst--in

Thank you for your interest in contributing to this project.

## Overview

Life My Midst In is a full-stack application built as a pnpm monorepo with Turborepo orchestration. The frontend uses Next.js 16, the API layer runs Fastify 5, and the test suite uses Vitest 4. It features JWT authentication, RBAC, Stripe billing, and a PostgreSQL database (Neon).

**Stack:** pnpm monorepo, Turborepo, Next.js 16, Fastify 5, Vitest 4, TypeScript 5.3

## Prerequisites

- Git
- Node.js 20+ and pnpm 9+
- A GitHub account

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/life-my--midst--in.git
cd life-my--midst--in

# Install dependencies (pnpm required)
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, JWT_SECRET, etc.

# Run database migrations
pnpm --filter api migrate

# Start all packages in development mode
pnpm dev
```

## How to Contribute

### Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Use the provided issue templates when available
- Include clear reproduction steps for bugs
- For documentation issues, specify which file and section

### Making Changes

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create a branch** for your change:
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Make your changes** following the code style guidelines below
5. **Test** your changes:
   ```bash
   pnpm test
   ```
6. **Commit** with a clear, imperative-mood message:
   ```bash
   git commit -m "add validation for edge case in parser"
   ```
7. **Push** your branch and open a Pull Request

### Monorepo Structure

This project is a monorepo managed by Turborepo. Key packages:

- `packages/` — Shared libraries and utilities
- `apps/` — Deployable applications (web, API)

When making changes, consider which package is affected. Run tests across
all packages before submitting a PR to catch cross-package regressions:

```bash
pnpm test
pnpm build
```

### Code Style

TypeScript strict mode is enforced. Use `const` over `let`. Prefer async/await over raw Promises. Use named exports. Follow the monorepo package boundaries — changes to shared packages should be tested across all consumers.

### Commit Messages

- Use imperative mood: "add feature" not "added feature"
- Keep the title under 72 characters
- Reference issue numbers when applicable: "fix auth bug (#42)"
- Keep commits atomic and focused on a single change

## Pull Request Process

1. Fill out the PR template with a description of your changes
2. Reference any related issues
3. Ensure all CI checks pass
4. Request review from a maintainer
5. Address review feedback promptly

PRs should be focused — one feature or fix per PR. Large changes should be
discussed in an issue first.

## Code of Conduct

Be respectful, constructive, and honest. This project is part of the
[organvm system](https://github.com/organvm-iii-ergon), which values transparency
and building in public. We follow the
[Contributor Covenant](https://www.contributor-covenant.org/).

## Questions?

Open an issue on this repository or start a discussion if discussions are
enabled. For system-wide questions, see
[orchestration-start-here](https://github.com/organvm-iv-taxis/orchestration-start-here).
