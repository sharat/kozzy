# AGENTS.md

This file provides guidance for agents working in this repository.

## Build / Lint / Test Commands

```bash
# Install dependencies
npm install

# Build (required before running CLI tests)
npm run build

# Testing
npm test                          # run all tests
npm run test:watch                # run tests in watch mode
npm run test:coverage             # run tests with coverage

# Linting
npm run lint                      # check with oxlint
npm run lint:fix                  # auto-fix issues
```

## Project Overview

kozzy is a pretty formatter for ktlint output. It transforms ktlint JSON/text output into compact, readable formats similar to ESLint stylish reporter.

### Build Output
- `dist/index.js` — ESM module
- `dist/index.cjs` — CommonJS module
- `dist/index.d.ts` — TypeScript declarations
- `dist/bin/cmd.cjs` — CLI entry point

**Note:** The `dist/` directory must be built before CLI tests will pass (tests expect `dist/bin/cmd.cjs` to exist). The directory is gitignored.

## Dependency Management

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit
```

## CI/CD

### Workflows
| Workflow | File | Purpose |
|----------|------|---------|
| CI | `.github/workflows/ci.yml` | Lint, test (Node 22, 24), coverage |
| Publish | `.github/workflows/publish.yml` | Publish to npm on git tag push |
| Dependabot | `.github/dependabot.yml` | Weekly Friday 03:30 UTC dependency updates |

### Release Process

**Automated (Dependabot):**
- Dependabot creates PRs every Friday at 03:30 UTC (09:00 IST)
- After PRs are merged, version is auto-bumped and tagged
- Tag push triggers `publish.yml` → publishes to npm

**Manual:**
```bash
# Bump version, create tag, push
npm version patch   # or minor/major
git push origin main --follow-tags
```
- Tag push (e.g., `v2.1.0`) triggers `.github/workflows/publish.yml`
- Workflow: test → build → publish to npm with provenance

### Requirements
- `NPM_AUTH_TOKEN` secret configured in GitHub (for npm publishing)

## Notes
- `prepublishOnly` script runs build + test before publishing
- Node 24 is the primary version; Node 22 is also tested
- No major version bumps via Dependabot (configured to skip)
