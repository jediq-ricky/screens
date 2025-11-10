# SCREENS - Video Display & Control System

Multi-device video display and control application built with Next.js.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Testing

This project follows Test-Driven Development (TDD) practices.

### Unit & Integration Tests (Vitest)

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test -- --run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Test Structure

```
tests/
├── unit/          # Unit tests for utilities and business logic
└── integration/   # Integration tests for API routes and features

e2e/              # End-to-end tests with Playwright
```

## Project Structure

```
/screens
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utility functions and shared logic
├── tests/                  # Unit and integration tests
├── e2e/                    # End-to-end tests
└── docs/                   # Project documentation
```

## Documentation

See the [/docs](docs/) folder for detailed documentation:

- [development-plan.md](docs/development-plan.md) - Full development roadmap
- [architecture.md](docs/architecture.md) - System architecture
- [database.md](docs/database.md) - Database schema and storage
- [security.md](docs/security.md) - Authentication and security
- [resilience.md](docs/resilience.md) - Error handling and resilience
- [project-structure.md](docs/project-structure.md) - Project organization

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Testing Library + Playwright
- **Linting**: ESLint + Prettier
- **Hosting**: Vercel

## Development Standards

This project follows exacting standards for architecture, code quality, testing, and documentation. See [CLAUDE.md](CLAUDE.md) for AI assistant guidelines.

## License

Private project
