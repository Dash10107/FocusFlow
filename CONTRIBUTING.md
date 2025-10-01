# Contributing to FocusFlow

Thank you for your interest in contributing to FocusFlow! We welcome contributions during Hacktoberfest and beyond.

## Before You Begin

1. **Read the Code of Conduct** in [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
2. **Review existing issues** labeled `good first issue`, `help wanted`, or `hacktoberfest`.
3. For major enhancements, **open an issue first** to discuss scope.

## Tech Stack

- Next.js (React, App Router) & TypeScript  
- Prisma & PostgreSQL (Neon)  
- Redis Pub/Sub & TTL  
- Gemini AI integration  
- Zustand (state management)  
- Tailwind CSS  
- Framer Motion (optional)  
- Vercel deployment (observability via Sentry, Logtail)

## Local Setup

```bash
# Fork and clone FocusFlow
git clone https://github.com/your-username/FocusFlow.git
cd FocusFlow

# Install dependencies
yarn install # or npm install --legacy-peer-deps
```

### Environment Variables

Copy `.env.example` to `.env` and update:
```
DATABASE_URL="postgresql://USER:PASS@HOST:PORT/dbname?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
GEMINI_API_KEY="your-gemini-key"
```

### Prisma Setup

```bash
npx prisma generate    # generate client
npx prisma migrate dev # apply migrations
```

### Start Dev Server

```bash
npm run dev # or yarn dev
```

Open http://localhost:3000 in your browser.

## Branching & Workflow

- Branch off `main`:  
  ```bash
git checkout -b feat/short-description
git push --set-upstream origin feat/short-description
```
- Keep PRs **focused** and **atomic**.
- Rebase or merge the latest `main` before opening a PR.

## Coding Standards

- **TypeScript**: Strict types where practical.
- **Lint & Type-check**:  
  ```bash
npm run lint
npm run type-check
```
- **Performance**: Minimize bundle size, optimize Redis/DB queries, maintain <200ms latency.
- **Accessibility**: ARIA labels, keyboard navigation, color contrast.

## Commit Messages

Follow Conventional Commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `chore:` tooling/config changes

Example:
```text
feat: add co-working room presence indicator
```

## Pull Requests

1. Link related issue (e.g., “Closes #5”).
2. Summarize changes and motivation.
3. Include screenshots or GIFs for UI work.
4. Outline test steps and edge cases.
5. Confirm:
   - Lint passes (`npm run lint`)
   - Type-check passes (`npm run type-check`)
   - No errors in console

## Hacktoberfest Guidelines

- Look for issues labeled **`hacktoberfest`**, **`good first issue`**, or **`help wanted`**.
- Valid contributions may be merged, approved, or labeled **`hacktoberfest-accepted`**.
- Spam or trivial PRs will be closed with **`spam`** or **`invalid`** labels.

## License

By contributing, you agree your changes will be licensed under the project’s MIT License.
