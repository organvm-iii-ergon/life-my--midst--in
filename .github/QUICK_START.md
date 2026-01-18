# CI/CD Quick Start Guide

**5-Minute Setup** for In Midst My Life CI/CD Pipeline

## Prerequisites Checklist
- [ ] GitHub CLI installed: `gh --version`
- [ ] Authenticated: `gh auth status`
- [ ] Repository access: push permissions

## Step 1: Add Required Secrets (2 min)

```bash
# Production database (required for deployments)
gh secret set POSTGRES_URL --repo 4444J99/life-my--midst--in
# Enter: postgresql://user:pass@host:5432/database

# Production cache (required for deployments)
gh secret set REDIS_URL --repo 4444J99/life-my--midst--in
# Enter: redis://host:6379/0
```

**Or via GitHub UI:**
https://github.com/4444J99/life-my--midst--in/settings/secrets/actions

## Step 2: Enable Branch Protection (1 min)

**Option A - Automated:**
```bash
./scripts/setup-github-actions.sh
# Answer 'y' when prompted
```

**Option B - Manual:**
https://github.com/4444J99/life-my--midst--in/settings/branches

## Step 3: Test CI Pipeline (2 min)

```bash
# Create test branch
git checkout -b test/ci-activation

# Make a small change
echo "# CI/CD Test" >> CI_TEST.md
git add CI_TEST.md
git commit -m "test: activate CI/CD pipeline"

# Push and create PR
git push origin test/ci-activation
gh pr create --title "Test: CI/CD Activation" \
             --body "Testing automated CI/CD pipeline with PostgreSQL and Redis"

# Watch the workflow
gh run watch
```

## What Happens Next?

✅ **Automatic Checks Run:**
1. Code Quality & Types (lint, typecheck, build)
2. Unit & Integration Tests (with PostgreSQL & Redis)
3. Security Scanning (vulnerabilities)
4. Docker Build (if on main/develop)

✅ **In CI Environment:**
- PostgreSQL 16 test database (auto-provisioned)
- Redis 7 test cache (auto-provisioned)
- Full integration test suite
- Coverage reports

## Workflow Files

- **`ci-cd.yml`** ⭐ PRIMARY - Comprehensive pipeline
- **`test.yml`** - Standalone testing
- **`deploy.yml`** - Docker + Kubernetes deployment
- **`security.yml`** - Security & compliance scanning

## Common Commands

```bash
# View recent workflow runs
gh run list --limit 10

# Watch specific run
gh run view <run-id>

# Check branch protection
gh api repos/4444J99/life-my--midst--in/branches/main/protection

# List secrets (names only)
gh secret list --repo 4444J99/life-my--midst--in
```

## Troubleshooting

**Tests fail with database connection error?**
- Check workflows have PostgreSQL service configured ✅
- Integration tests use: `postgresql://test:test@localhost:5432/midst_test`

**Branch protection not working?**
- Ensure status check names match workflow job names exactly
- Wait for at least one successful workflow run first

**Docker build fails?**
- Check Dockerfiles exist in: `apps/*/Dockerfile`
- Verify build context in workflow uses repo root

## Next Steps

1. ✅ Merge successful test PR
2. 📖 Read full guide: `.github/GITHUB_ACTIONS_SETUP.md`
3. 🔧 Customize workflows for your needs
4. 🚀 Start using the PR template for all changes

## Support

- Full Documentation: `.github/GITHUB_ACTIONS_SETUP.md`
- Architecture: `ARCH-003-cicd-pipeline.md`
- Repository Guidelines: `AGENTS.md`
- Summary: `CI_CD_ACTIVATION_SUMMARY.md`

**Ready to go!** 🚀
