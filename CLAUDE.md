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
