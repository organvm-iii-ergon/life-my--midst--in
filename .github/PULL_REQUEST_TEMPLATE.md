# Pull Request

## Description
<!-- Provide a clear and concise description of what this PR does -->

## Type of Change
<!-- Mark the relevant option with an "x" -->
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🔧 Configuration change
- [ ] ♻️ Refactoring (no functional changes, no API changes)
- [ ] 🎨 Style update (formatting, renaming)
- [ ] ⚡️ Performance improvement
- [ ] ✅ Test update

## Related Documentation/Specs
<!-- Link to relevant specification documents -->
- Relates to: <!-- e.g., SPEC-002, WORK-005, ARCH-003 -->
- Issue: <!-- #issue_number if applicable -->

## Changes Made
<!-- List the specific changes in bullet points -->
- 
- 
- 

## Testing Checklist
<!-- Mark completed items with an "x" -->
- [ ] All existing tests pass (`pnpm test`)
- [ ] New tests added for new functionality
- [ ] Integration tests pass (`pnpm integration`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Tested locally in development environment

## Database Changes
<!-- If this PR includes database migrations or seeds -->
- [ ] Database migrations included (in `apps/api/migrations` or `apps/orchestrator/migrations`)
- [ ] Seed data updated if necessary
- [ ] Migration tested locally
- [ ] Migration is reversible
- [ ] N/A - No database changes

## API Changes
<!-- If this PR modifies API endpoints -->
- [ ] OpenAPI spec updated (`apps/api/src/openapi.yaml`)
- [ ] Breaking changes documented
- [ ] Backward compatibility maintained
- [ ] N/A - No API changes

## Environment Variables
<!-- If new configuration is required -->
- [ ] New environment variables documented in README
- [ ] Added to `.env.example` files
- [ ] Added to GitHub Actions secrets (documented below)
- [ ] N/A - No new environment variables

## Screenshots/Demos
<!-- For UI changes, include screenshots or recordings -->

## Deployment Notes
<!-- Special instructions for deployment -->
- [ ] No special deployment steps required
- [ ] Requires infrastructure changes (document below)
- [ ] Requires manual steps (document below)

## Checklist Before Merge
- [ ] Code follows repository style guidelines (AGENTS.md)
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] No debugging code or console.logs left
- [ ] No secrets or credentials committed
- [ ] Documentation updated if needed
- [ ] All CI checks passing
- [ ] Reviewed by at least one team member

## Additional Notes
<!-- Any additional information reviewers should know -->
