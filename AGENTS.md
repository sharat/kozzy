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

Check `.github/workflows/` for CI configuration. The `prepublishOnly` script runs build + test before publishing.
