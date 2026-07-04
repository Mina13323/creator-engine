# Creator Engine - CI/CD Architecture

This document outlines the GitHub Actions Continuous Integration pipeline designed to ensure high code quality, robust test coverage, and strict deployment gating.

## Workflow Overview (`.github/workflows/ci.yml`)

The CI pipeline runs automatically on all Pull Requests and Pushes to the `main` and `develop` branches. It enforces the following lifecycle:

1. **Environment Setup**: Provisions Ubuntu instances with Node.js 24 and `pnpm` (v11.1.0), utilizing caching to ensure minimal dependency resolution times.
2. **Type Checking**: Runs strict TypeScript transpilation (`tsc --noEmit`) to catch type faults statically before building.
3. **Linting**: Evaluates the frontend (Next.js) against standard ESLint configurations.
4. **Backend Test Suite & Coverage**: 
   - Navigates into `apps/api` and executes the Vitest suite natively.
   - **Coverage Gating**: The workflow is hard-wired to fail if the backend coverage falls below 70% (Lines, Statements, Branches, or Functions). Vitest is natively configured in `vitest.config.ts` to throw a non-zero exit code if this threshold is breached, which automatically halts the GitHub Action.
5. **Build Application**: Compiles the Next.js `web` app and Fastify `api` servers via `pnpm build` to ensure the final production bundles are fundamentally sound.

## Strict Rules
- Pull Requests **will not** be mergeable if the coverage threshold fails.
- Developers must write tests for new endpoints, schemas, and AI integrations to maintain the >70% baseline before requesting code review.
