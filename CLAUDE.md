# SCREENS: Video Controlling App

## Project Overview
SCREENS is a Next.js application for displaying and controlling multiple videos across different devices from a single controller interface. Videos can be looped, sequenced, or manually triggered.

## Core Functionality
- **Multi-device video display**: Each device displays videos from a curated subset of a master video library
- **Centralized control**: Single controller interface monitors and controls all connected displays
- **Playback modes**: Support for looped playback, sequential playback, and manual triggering
- **Real-time monitoring**: Controller tracks current playback state of all devices
- **Unique display URLs**: Each display device has its own URL for connection

## Technical Architecture

### Stack
- **Framework**: Next.js
- **Hosting**: Vercel
- **Interface**: Browser-based (both controller and displays)
- **Access**: Unique URL per display device

### Key Components
- Controller interface for managing all displays
- Display clients for video playback
- Master video library management
- Per-device video playlist configuration
- Real-time state synchronization

## Development Standards
This project follows exacting standards for:
- **Architecture**: Well-designed, scalable system structure
- **Code Quality**: Clean, maintainable code following best practices
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear, thorough documentation for all components

## Documentation
For detailed information about specific aspects of this project, see the [/docs](docs/) folder:

- **[architecture.md](docs/architecture.md)** - System architecture, communication protocols, data flow
- **[database.md](docs/database.md)** - Database schema, storage solutions, data models
- **[security.md](docs/security.md)** - Authentication, authorization, API security
- **[resilience.md](docs/resilience.md)** - Error handling, offline behavior, monitoring
- **[project-structure.md](docs/project-structure.md)** - Directory layout, key modules, configuration

**When working on this app, always reference the `/docs` folder for architectural decisions and implementation details.**

## Development Guidelines
When working on this project:
1. Maintain high code quality and architectural standards
2. Ensure all features are properly tested
3. Document new functionality and architectural decisions in the appropriate `/docs` file
4. Consider scalability for multiple concurrent displays
5. Prioritize real-time synchronization and reliability
6. Review relevant documentation in `/docs` before implementing new features

## Testing Requirements
**CRITICAL**: All tests must pass before committing code.
- Zero tolerance for failing tests
- If tests fail, fix them immediately - do not commit
- Do not skip, disable, or ignore failing tests
- Do not create tests that are "known to fail"
- If a test approach isn't working, refactor the test or implementation
- Run `npm run test -- --run` before every commit to verify all tests pass
- Test failures block all commits - no exceptions

### E2E Test Cleanup
**CRITICAL**: E2E tests MUST clean up all test data automatically.
- All E2E test data (displays, playlists, videos) MUST use the "E2E" prefix in their names
- Playwright global teardown automatically cleans up all data with "E2E" prefix
- Global teardown runs after ALL tests complete, regardless of pass/fail/timeout
- Never use try-finally blocks or afterAll hooks for cleanup - they fail when tests timeout
- Test naming convention: `E2E Test ${Date.now()}`, `E2E Playlist ${Date.now()}`, etc.
- Global teardown is configured in [playwright.config.ts](playwright.config.ts)
- Cleanup implementation is in [e2e/global-teardown.ts](e2e/global-teardown.ts)
- This ensures zero leftover test data even when tests fail or timeout

## Git Commit Guidelines
When creating git commits:
- Write clear, concise commit messages that describe the changes
- Focus on what was changed and why
- Do NOT include AI attribution, co-author tags, or "Generated with Claude Code" footers
- Keep commit messages professional and to the point
