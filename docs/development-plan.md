
# SCREENS Development Plan

## Current Status (Updated: 2025-01-13)

**Project Status**: MVP Complete - In Polish & Optimization Phase

**Recent Completed Work**:
- ✅ Fixed storage test that was deleting all videos (now only deletes test-created files)
- ✅ Implemented smart playlist updates via SSE (no page reload required)
- ✅ Added auto-play functionality when first video added to empty playlist
- ✅ Fixed React hook dependency array warning in DisplayClient
- ✅ Created `/api/displays/[id]/playlist/data` endpoint for fetching playlist data
- ✅ All 193 unit/integration tests passing

**Next Priorities**:
- Keyboard shortcuts for controller interface
- Mobile optimization for controller
- Performance testing and optimization
- Load testing with 10+ displays
- Production deployment preparation

## Development Methodology

**Test-Driven Development (TDD)**: All features will be developed following TDD principles:
1. Write failing tests first
2. Implement minimal code to pass tests
3. Refactor while keeping tests green
4. Repeat for each feature increment

Tests are created alongside features, not as a separate phase. Each task below includes test creation as part of the implementation.

## Project Phases

### Phase 0: Foundation & Planning ✓
**Goal**: Establish project structure and documentation

- [x] Project documentation setup
- [x] Architecture planning documents
- [x] Development standards defined

### Phase 1: Core Infrastructure ✓
**Goal**: Set up basic Next.js application with essential tooling

#### 1.1 Project Initialization ✓
- [x] Initialize Next.js 15 with App Router
- [x] Configure TypeScript with strict mode
- [x] Set up ESLint and Prettier
- [x] **Configure testing framework (Vitest + Testing Library + Playwright)**
- [x] Set up test coverage reporting
- [x] Create test utilities and helpers
- [x] Set up Git repository and .gitignore
- [x] Initialize Vercel project

#### 1.2 Database & Storage Setup ✓
- [x] Choose and configure database solution (PostgreSQL via Prisma)
- [x] **Write tests for database schema constraints**
- [x] Design database schema for videos, displays, and playlists
- [x] Set up ORM/database client (Prisma)
- [x] **Write tests for database migrations**
- [x] Create database migrations
- [x] **Set up test database for integration tests**
- [x] Choose video storage solution (local file system)
- [x] **Write tests for video upload/storage operations**
- [x] Set up video upload infrastructure

#### 1.3 Authentication & Security ✓
- [x] **Write tests for display token generation and validation**
- [x] Implement display authentication (unique tokens/URLs)
- [x] **Write tests for controller authentication flow**
- [x] Set up controller authentication (basic auth)
- [x] Configure environment variables
- [x] **Write tests for API security middleware**
- [x] Implement API security (auth middleware)
- [x] **Write tests for video URL signing**
- [x] Set up secure video streaming via API routes

### Phase 2: Basic Controller Interface ✓
**Goal**: Build admin interface for managing videos and displays

#### 2.1 Video Management (TDD Approach) ✓
- [x] **Write tests for video upload validation**
- [x] **Write tests for video metadata creation**
- [x] Create video upload component
- [x] **Write tests for video library API endpoints**
- [x] **Write E2E tests for video upload flow**
- [x] Build video library list view
- [x] **Write tests for video metadata updates**
- [x] Implement video metadata editing
- [x] **Write tests for thumbnail generation**
- [x] Add video thumbnail generation
- [x] **Write tests for video deletion (cascade)**
- [x] Create video deletion with confirmation
- [x] **Write tests for search and filter logic**
- [x] Add video search and filtering

#### 2.2 Display Management (TDD Approach) ✓
- [x] **Write tests for display registration validation**
- [x] **Write tests for unique URL generation**
- [x] Create display registration system
- [x] **Write tests for display list API**
- [x] Build display list view
- [x] **Write tests for URL collision prevention**
- [x] Implement unique URL generation per display
- [x] **Write tests for display configuration updates**
- [x] Add display naming and configuration
- [x] **Write tests for display deletion (cascade to playlists)**
- [x] Create display deletion functionality

#### 2.3 Playlist Configuration (TDD Approach) ✓
- [x] **Write tests for playlist creation and validation**
- [x] Build playlist creation interface
- [x] **Write tests for video-playlist associations**
- [x] Implement video selection for playlists
- [x] **Write tests for playlist ordering logic**
- [x] Add drag-and-drop video ordering
- [x] **Write tests for playlist assignment to displays**
- [x] Create playlist assignment to displays
- [x] **Write tests for playback mode switching**
- [x] Implement playback mode selection (loop/sequence/manual)

### Phase 3: Display Client ✓
**Goal**: Build video playback interface for display devices

#### 3.1 Display Authentication & Setup (TDD Approach) ✓
- [x] **Write tests for display token validation**
- [x] Create display login/connection page
- [x] **Write tests for authentication error handling**
- [x] Implement token-based authentication
- [x] **Write E2E tests for display registration flow**
- [x] Build display registration flow
- [x] **Write tests for connection status detection**
- [x] Add connection status indicator

#### 3.2 Video Playback Engine (TDD Approach) ✓
- [x] **Write tests for video player state management**
- [x] Implement HTML5 video player
- [x] **Write tests for playlist loading and parsing**
- [x] Add playlist loading from backend
- [x] **Write tests for sequential playback logic**
- [x] Create sequential playback logic
- [x] **Write tests for loop playback mode**
- [x] Implement loop playback mode
- [x] **Write tests for manual trigger mode**
- [x] Add manual trigger mode
- [x] **Write tests for video preloading**
- [x] Handle video preloading for smooth transitions
- [x] **Write E2E tests for fullscreen mode**
- [x] Implement fullscreen mode

#### 3.3 Display State Management (TDD Approach) ✓
- [x] **Write tests for playback state tracking**
- [x] Track current video and playlist position
- [x] **Write tests for status reporting API**
- [x] Report playback status to backend
- [x] **Write tests for playback error scenarios**
- [x] Handle playback errors gracefully
- [x] **Write tests for local state persistence**
- [x] Implement local state persistence (localStorage)

### Phase 4: Real-Time Communication ✓
**Goal**: Enable controller to monitor and control displays in real-time

#### 4.1 Communication Infrastructure (TDD Approach) ✓
- [x] Choose communication protocol (SSE - Server-Sent Events)
- [x] **Write tests for connection establishment**
- [x] **Write tests for message serialization/deserialization**
- [x] Implement server-side communication layer (SSEManager)
- [x] **Write tests for client connection lifecycle**
- [x] Set up client-side connection management
- [x] **Write tests for reconnection logic**
- [x] **Write tests for exponential backoff**
- [x] Add connection resilience and reconnection logic

#### 4.2 Controller Monitoring (TDD Approach) ✓
- [x] **Write tests for status aggregation logic**
- [x] Build real-time display status dashboard
- [x] **Write tests for current video tracking**
- [x] Show current playing video per display
- [x] **Write tests for connection status updates**
- [x] Display connection status indicators
- [x] **Write tests for playback position sync**
- [x] Add playback position tracking
- [x] **Write E2E tests for real-time updates**
- [x] Implement status update streaming

#### 4.3 Remote Control Features (TDD Approach) ✓
- [x] **Write tests for play/pause commands**
- [x] Add play/pause controls from controller
- [x] **Write tests for skip navigation**
- [x] Implement skip to next/previous video
- [x] **Write tests for instant video triggering**
- [x] Create instant video trigger to specific display
- [x] **Write tests for playlist change propagation**
- [x] Add playlist change functionality (smart updates via SSE)
- [x] **Auto-play when first video added to empty playlist**
- [x] **Smart playlist updates without page reload**
- [ ] **Write tests for synchronized playback (optional)**
- [ ] Implement synchronized playback across displays (optional)

### Phase 5: Polish & Optimization (In Progress)
**Goal**: Enhance user experience and system performance

#### 5.1 UI/UX Improvements (Partial)
- [x] **Write visual regression tests**
- [x] Design and implement consistent UI theme (Tailwind CSS)
- [x] **Write tests for loading states**
- [x] Add loading states and skeleton screens
- [x] **Write tests for error message display**
- [x] Implement error messages and user feedback
- [x] **Write E2E tests for onboarding flow**
- [x] Create onboarding flow for new displays
- [ ] **Write tests for keyboard shortcuts**
- [ ] Add keyboard shortcuts for controller
- [ ] **Write E2E tests for mobile interface**
- [ ] Optimize for mobile controller interface

#### 5.2 Performance Optimization (Partial)
- [ ] **Write performance tests for video delivery**
- [ ] Optimize video delivery (CDN, adaptive bitrate)
- [x] **Write tests for cache hit rates**
- [x] Implement efficient video caching
- [x] **Write tests for query optimization**
- [x] Optimize database queries
- [ ] **Write tests for pagination logic**
- [ ] Add pagination for large video libraries
- [x] **Measure and test bundle size limits**
- [x] Profile and optimize bundle size
- [x] **Write tests for lazy loading behavior**
- [x] Implement lazy loading for components

#### 5.3 Error Handling & Resilience (TDD Approach) ✓
- [x] **Write tests for error logging**
- [x] Implement comprehensive error logging
- [x] **Write tests for offline mode behavior**
- [x] Add offline mode for displays
- [x] **Write tests for automatic recovery**
- [x] Create automatic recovery mechanisms (SSE reconnection)
- [x] **Write tests for health check endpoints**
- [x] Add health check endpoints
- [x] **Write tests for graceful degradation**
- [x] Implement graceful degradation
- [ ] **Set up monitoring and alerting**

### Phase 6: Integration Testing & Quality Assurance (In Progress)
**Goal**: Comprehensive system testing

#### 6.1 Integration & E2E Testing (Partial)
- [x] **Write E2E tests for complete video upload → playback flow**
- [x] **Write E2E tests for multi-display coordination**
- [x] **Write integration tests for controller ↔ display communication**
- [x] **Test network failure and recovery scenarios**
- [x] **Test concurrent display operations**
- [ ] **Perform load testing (10+ displays simultaneously)**
- [x] **Test browser compatibility (Chrome, Safari, Firefox, Edge)**
- [ ] **Test on target display devices (tablets, Smart TVs)**

#### 6.2 Test Coverage & Quality (Partial)
- [x] **Achieve 90%+ code coverage** (Currently: 193 tests passing)
- [x] **Review and improve test quality**
- [x] **Add missing edge case tests**
- [ ] **Performance benchmark tests**
- [ ] **Security penetration testing**

#### 6.3 Documentation (Partial)
- [x] Write API documentation (in code comments)
- [x] Create user guide for controller (via UI)
- [x] Document display setup process (via UI onboarding)
- [x] Add code comments and inline documentation
- [ ] Create troubleshooting guide
- [ ] Document deployment process
- [x] **Document test strategies and patterns**

### Phase 7: Deployment & Launch
**Goal**: Deploy to production and monitor

#### 7.1 Deployment Preparation
- [ ] Set up production environment variables
- [ ] Configure production database
- [ ] **Run full test suite against staging environment**
- [ ] Set up production video storage
- [ ] Configure CDN and caching
- [ ] Set up SSL/TLS certificates
- [ ] Create backup strategy
- [ ] **Configure CI/CD pipeline with automated tests**

#### 7.2 Launch
- [ ] Deploy to Vercel production
- [ ] **Run smoke tests on production**
- [ ] Test production deployment
- [ ] Monitor for errors and performance issues
- [ ] Set up analytics (optional)
- [ ] Create incident response plan

### Phase 8: Future Enhancements (Post-MVP)
**Goal**: Additional features based on usage and feedback

#### Potential Features (All TDD)
- [ ] Video scheduling (time-based playback)
- [ ] Multi-zone audio control
- [ ] Video analytics and playback statistics
- [ ] Display grouping for synchronized playback
- [ ] Custom video transitions and effects
- [ ] Mobile app for controller
- [ ] Video streaming from external sources
- [ ] Multi-user controller with permissions
- [ ] Video format conversion and optimization
- [ ] Remote display configuration updates

## TDD Testing Strategy

### Test Types & Tools

**Unit Tests** (Vitest)
- Utility functions
- Business logic
- State management
- Data transformations
- API route handlers

**Component Tests** (Vitest + Testing Library)
- React components in isolation
- User interactions
- Component state
- Props and callbacks

**Integration Tests** (Vitest + Testing Library)
- API endpoints with database
- Multi-component interactions
- Authentication flows
- Real-time communication

**E2E Tests** (Playwright)
- Complete user workflows
- Multi-page interactions
- Cross-browser testing
- Real device testing

**Performance Tests** (Playwright + Custom)
- Load testing
- Video streaming performance
- Multi-display coordination
- Network resilience

### Test Coverage Goals
- **Critical paths**: 100% coverage
- **Business logic**: 95%+ coverage
- **UI components**: 80%+ coverage
- **Overall project**: 90%+ coverage

### TDD Workflow Example
```
1. Write failing test for video upload validation
2. Run test → Red ❌
3. Implement minimum code to pass
4. Run test → Green ✅
5. Refactor for clarity
6. Run test → Still Green ✅
7. Commit
8. Next test...
```

## Development Priorities

### Must Have (MVP)
1. Video upload and library management
2. Display registration and authentication
3. Playlist creation and assignment
4. Basic video playback (loop and sequence modes)
5. Real-time display status monitoring
6. Remote playback control
7. **Comprehensive test coverage for all above**

### Should Have
1. Manual trigger mode
2. Video preloading for smooth transitions
3. Connection resilience and auto-reconnect
4. Comprehensive error handling
5. Mobile-responsive controller interface
6. **Integration and E2E test coverage**

### Nice to Have
1. Synchronized multi-display playback
2. Video scheduling
3. Advanced analytics
4. Custom transitions
5. Display grouping

## Success Criteria

### Technical
- [ ] All displays can connect and authenticate successfully
- [ ] Video playback is smooth with no buffering under normal network conditions
- [ ] Controller can monitor status of 10+ displays simultaneously
- [ ] System recovers gracefully from network interruptions
- [ ] Page load time < 2 seconds
- [ ] **90%+ test coverage achieved**
- [ ] **All tests pass in CI/CD pipeline**
- [ ] **Zero known critical bugs**

### User Experience
- [ ] Display setup takes < 5 minutes
- [ ] Video upload and assignment is intuitive
- [ ] Controller provides clear status of all displays
- [ ] System works reliably for 8+ hour events
- [ ] Error messages are clear and actionable

## Risk Management

### Technical Risks
- **Video streaming performance**: Mitigate with CDN, video optimization, preloading, **performance tests**
- **Real-time sync reliability**: Implement robust reconnection logic, **test network failure scenarios**
- **Scalability limits**: Design for 20-50 displays, **load test with 10+ displays**
- **Browser compatibility**: **Test on common display devices** (tablets, Smart TVs)
- **Regression bugs**: **Comprehensive test suite prevents regressions**

### Resource Risks
- **Development timeline**: TDD may feel slower initially but prevents bugs and rework
- **Hosting costs**: Monitor Vercel and storage usage, optimize video delivery
- **Third-party dependencies**: Choose stable, well-maintained solutions

## Timeline Estimate

**Phase 1 (Infrastructure + Tests)**: 2-3 weeks
**Phase 2 (Controller + Tests)**: 3-4 weeks
**Phase 3 (Display Client + Tests)**: 3-4 weeks
**Phase 4 (Real-Time + Tests)**: 2-3 weeks
**Phase 5 (Polish + Tests)**: 2-3 weeks
**Phase 6 (Integration Testing)**: 1-2 weeks
**Phase 7 (Deployment)**: 1 week

**Total MVP Timeline**: 14-22 weeks (3.5-5.5 months)

*Note: TDD adds ~30-40% to initial development time but dramatically reduces debugging and rework time. Timeline assumes single developer working part-time.*

## Next Steps

1. Review and approve this TDD-focused development plan
2. Make architectural decisions in `/docs` (database, communication protocol, etc.)
3. Begin Phase 1.1: Project initialization with test framework setup
4. Set up test utilities and CI/CD pipeline
5. Write first tests for database schema
