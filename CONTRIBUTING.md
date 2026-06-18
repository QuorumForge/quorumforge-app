# Contributing to QuorumForge

Thank you for considering a contribution! QuorumForge is an open-source project and we welcome contributions of all sizes — bug reports, documentation improvements, new features, and test coverage.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting a Pull Request](#submitting-a-pull-request)
- [Development Setup](#development-setup)
- [Project Conventions](#project-conventions)
  - [Branch Naming](#branch-naming)
  - [Commit Messages](#commit-messages)
  - [Code Style](#code-style)
  - [TypeScript](#typescript)
- [Testing](#testing)
- [Scope of Changes](#scope-of-changes)
- [Getting Help](#getting-help)

---

## Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/). Please be respectful, constructive, and welcoming. Harassment of any kind will not be tolerated.

---

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/your-org/quorumforge-app/issues) to check if it's already reported.
2. If not, open a new issue with:
   - A clear, descriptive title
   - Steps to reproduce
   - Expected behaviour
   - Actual behaviour
   - Screenshots or logs if relevant
   - Environment (OS, browser, Node.js version)

### Suggesting Features

Open a [feature request issue](https://github.com/your-org/quorumforge-app/issues/new?template=feature_request.md) with:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you considered

For large features, open a discussion first to align on design before writing code.

### Submitting a Pull Request

1. **Fork** the repository and create your branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   # or
   git checkout -b fix/my-bugfix
   ```

2. **Make your changes.** Keep commits focused and atomic.

3. **Lint and check types:**

   ```bash
   npm run lint
   ```

4. **Commit** using the [Conventional Commits](#commit-messages) format.

5. **Push** your branch and open a PR:

   ```bash
   git push -u origin feat/my-feature
   gh pr create
   ```

6. Fill in the PR template. Link any related issues with `Closes #123`.

7. A maintainer will review your PR. Please respond to feedback within a reasonable time.

---

## Development Setup

Full setup instructions are in the [README](../README.md). Quick reference:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local
# Edit .env.local — DATABASE_URL is required

# 3. Push Prisma schema
npm run db:push

# 4. Start dev server
npm run dev
```

---

## Project Conventions

### Branch Naming

| Prefix | When to use |
|--------|------------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `refactor/` | Code refactor, no behaviour change |
| `chore/` | Tooling, dependencies, CI |
| `test/` | Tests only |

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

Examples:
```
feat(wallet): add disconnect confirmation dialog
fix(api): return 409 for duplicate contractId
docs(readme): fix Freighter setup steps
refactor(proposals): extract signature validation to utils
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`, `ci`.

### Code Style

- **ESLint**: `npm run lint` must pass with no errors.
- **Formatting**: We use Prettier defaults (2-space indent, double quotes, trailing commas). Run `npx prettier --write .` before committing if needed.
- Avoid `any` types. Use `unknown` and narrow properly.
- Prefer explicit return types on exported functions.
- Keep components small and focused. A component over ~200 lines is a signal to split.

### TypeScript

- All new files must be `.ts` or `.tsx`.
- Shared types belong in `src/types/index.ts`.
- Do not use `@ts-ignore`. If you need to suppress a type error, use `@ts-expect-error` with a comment explaining why.

---

## Testing

The project does not yet have a test suite. Contributions that add tests are especially welcome! We intend to use:

- **Unit tests**: [Vitest](https://vitest.dev/) for utilities and hooks
- **Component tests**: [Testing Library](https://testing-library.com/) for UI components
- **E2E tests**: [Playwright](https://playwright.dev/) for critical user flows

If you add a feature, please add a corresponding test if possible.

---

## Scope of Changes

- **On-chain contract changes** are out of scope for this repository. The Soroban contract lives in a separate repository. This repo is the web frontend only.
- **Database migrations**: if you change `prisma/schema.prisma`, run `npm run db:push` locally to verify the schema, and describe the migration in your PR.
- **New dependencies**: discuss in the issue first. We prefer to keep the dependency tree minimal.

---

## Getting Help

- Open a [GitHub Discussion](https://github.com/your-org/quorumforge-app/discussions) for questions.
- For security issues, see [SECURITY.md](../SECURITY.md).

We appreciate every contribution, large or small. Thank you!
