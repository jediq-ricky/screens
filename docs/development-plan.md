
# SCREENS Development Plan

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

### Phase 1: Core Infrastructure
**Goal**: Set up basic Next.js application with essential tooling

#### 1.1 Project Initialization
- [ ] Initialize Next.js 14+ with App Router
- [ ] Configure TypeScript with strict mode
- [ ] Set up ESLint and Prettier
- [ ] **Configure testing framework (Vitest + Testing Library + Playwright)**
- [ ] Set up test coverage reporting
- [ ] Create test utilities and helpers
- [ ] Set up Git repository and .gitignore
- [ ] Initialize Vercel project

#### 1.2 Database & Storage Setup
- [ ] Choose and configure database solution (Vercel Postgres, Supabase, etc.)
- [ ] **Write tests for database schema constraints**
- [ ] Design database schema for videos, displays, and playlists
- [ ] Set up ORM/database client (Prisma, Drizzle, or raw SQL)
- [ ] **Write tests for database migrations**
- [ ] Create database migrations
- [ ] **Set up test database for integration tests**
- [ ] Choose video storage solution (Vercel Blob, S3, etc.)
- [ ] **Write tests for video upload/storage operations**
- [ ] Set up video upload infrastructure

#### 1.3 Authentication & Security
- [ ] **Write tests for display token generation and validation**
- [ ] Implement display authentication (unique tokens/URLs)
- [ ] **Write tests for controller authentication flow**
- [ ] Set up controller authentication
- [ ] Configure environment variables
- [ ] **Write tests for API security middleware**
- [ ] Implement API security (rate limiting, CORS)
- [ ] **Write tests for video URL signing**
- [ ] Set up secure video URL signing

### Phase 2: Basic Controller Interface
**Goal**: Build admin interface for managing videos and displays

#### 2.1 Video Management (TDD Approach)
- [ ] **Write tests for video upload validation**
- [ ] **Write tests for video metadata creation**
- [ ] Create video upload component
- [ ] **Write tests for video library API endpoints**
- [ ] **Write E2E tests for video upload flow**
- [ ] Build video library list view
- [ ] **Write tests for video metadata updates**
- [ ] Implement video metadata editing
- [ ] **Write tests for thumbnail generation**
- [ ] Add video thumbnail generation
- [ ] **Write tests for video deletion (cascade)**
- [ ] Create video deletion with confirmation
- [ ] **Write tests for search and filter logic**
- [ ] Add video search and filtering

#### 2.2 Display Management (TDD Approach)
- [ ] **Write tests for display registration validation**
- [ ] **Write tests for unique URL generation**
- [ ] Create display registration system
- [ ] **Write tests for display list API**
- [ ] Build display list view
- [ ] **Write tests for URL collision prevention**
- [ ] Implement unique URL generation per display
- [ ] **Write tests for display configuration updates**
- [ ] Add display naming and configuration
- [ ] **Write tests for display deletion (cascade to playlists)**
- [ ] Create display deletion functionality

#### 2.3 Playlist Configuration (TDD Approach)
- [ ] **Write tests for playlist creation and validation**
- [ ] Build playlist creation interface
- [ ] **Write tests for video-playlist associations**
- [ ] Implement video selection for playlists
- [ ] **Write tests for playlist ordering logic**
- [ ] Add drag-and-drop video ordering
- [ ] **Write tests for playlist assignment to displays**
- [ ] Create playlist assignment to displays
- [ ] **Write tests for playback mode switching**
- [ ] Implement playback mode selection (loop/sequence/manual)

### Phase 3: Display Client
**Goal**: Build video playback interface for display devices

#### 3.1 Display Authentication & Setup (TDD Approach)
- [ ] **Write tests for display token validation**
- [ ] Create display login/connection page
- [ ] **Write tests for authentication error handling**
- [ ] Implement token-based authentication
- [ ] **Write E2E tests for display registration flow**
- [ ] Build display registration flow
- [ ] **Write tests for connection status detection**
- [ ] Add connection status indicator

#### 3.2 Video Playback Engine (TDD Approach)
- [ ] **Write tests for video player state management**
- [ ] Implement HTML5 video player
- [ ] **Write tests for playlist loading and parsing**
- [ ] Add playlist loading from backend
- [ ] **Write tests for sequential playback logic**
- [ ] Create sequential playback logic
- [ ] **Write tests for loop playback mode**
- [ ] Implement loop playback mode
- [ ] **Write tests for manual trigger mode**
- [ ] Add manual trigger mode
- [ ] **Write tests for video preloading**
- [ ] Handle video preloading for smooth transitions
- [ ] **Write E2E tests for fullscreen mode**
- [ ] Implement fullscreen mode

#### 3.3 Display State Management (TDD Approach)
- [ ] **Write tests for playback state tracking**
- [ ] Track current video and playlist position
- [ ] **Write tests for status reporting API**
- [ ] Report playback status to backend
- [ ] **Write tests for playback error scenarios**
- [ ] Handle playback errors gracefully
- [ ] **Write tests for local state persistence**
- [ ] Implement local state persistence (optional)

### Phase 4: Real-Time Communication
**Goal**: Enable controller to monitor and control displays in real-time

#### 4.1 Communication Infrastructure (TDD Approach)
- [ ] Choose communication protocol (WebSockets, SSE, polling)
- [ ] **Write tests for connection establishment**
- [ ] **Write tests for message serialization/deserialization**
- [ ] Implement server-side communication layer
- [ ] **Write tests for client connection lifecycle**
- [ ] Set up client-side connection management
- [ ] **Write tests for reconnection logic**
- [ ] **Write tests for exponential backoff**
- [ ] Add connection resilience and reconnection logic

#### 4.2 Controller Monitoring (TDD Approach)
- [ ] **Write tests for status aggregation logic**
- [ ] Build real-time display status dashboard
- [ ] **Write tests for current video tracking**
- [ ] Show current playing video per display
- [ ] **Write tests for connection status updates**
- [ ] Display connection status indicators
- [ ] **Write tests for playback position sync**
- [ ] Add playback position tracking
- [ ] **Write E2E tests for real-time updates**
- [ ] Implement status update streaming

#### 4.3 Remote Control Features (TDD Approach)
- [ ] **Write tests for play/pause commands**
- [ ] Add play/pause controls from controller
- [ ] **Write tests for skip navigation**
- [ ] Implement skip to next/previous video
- [ ] **Write tests for instant video triggering**
- [ ] Create instant video trigger to specific display
- [ ] **Write tests for playlist change propagation**
- [ ] Add playlist change functionality
- [ ] **Write tests for synchronized playback (optional)**
- [ ] Implement synchronized playback across displays (optional)

### Phase 5: Polish & Optimization
**Goal**: Enhance user experience and system performance

#### 5.1 UI/UX Improvements
- [ ] **Write visual regression tests**
- [ ] Design and implement consistent UI theme
- [ ] **Write tests for loading states**
- [ ] Add loading states and skeleton screens
- [ ] **Write tests for error message display**
- [ ] Implement error messages and user feedback
- [ ] **Write E2E tests for onboarding flow**
- [ ] Create onboarding flow for new displays
- [ ] **Write tests for keyboard shortcuts**
- [ ] Add keyboard shortcuts for controller
- [ ] **Write E2E tests for mobile interface**
- [ ] Optimize for mobile controller interface

#### 5.2 Performance Optimization
- [ ] **Write performance tests for video delivery**
- [ ] Optimize video delivery (CDN, adaptive bitrate)
- [ ] **Write tests for cache hit rates**
- [ ] Implement efficient video caching
- [ ] **Write tests for query optimization**
- [ ] Optimize database queries
- [ ] **Write tests for pagination logic**
- [ ] Add pagination for large video libraries
- [ ] **Measure and test bundle size limits**
- [ ] Profile and optimize bundle size
- [ ] **Write tests for lazy loading behavior**
- [ ] Implement lazy loading for components

#### 5.3 Error Handling & Resilience (TDD Approach)
- [ ] **Write tests for error logging**
- [ ] Implement comprehensive error logging
- [ ] **Write tests for offline mode behavior**
- [ ] Add offline mode for displays
- [ ] **Write tests for automatic recovery**
- [ ] Create automatic recovery mechanisms
- [ ] **Write tests for health check endpoints**
- [ ] Add health check endpoints
- [ ] **Write tests for graceful degradation**
- [ ] Implement graceful degradation
- [ ] **Set up monitoring and alerting**

### Phase 6: Integration Testing & Quality Assurance
**Goal**: Comprehensive system testing

#### 6.1 Integration & E2E Testing
- [ ] **Write E2E tests for complete video upload → playback flow**
- [ ] **Write E2E tests for multi-display coordination**
- [ ] **Write integration tests for controller ↔ display communication**
- [ ] **Test network failure and recovery scenarios**
- [ ] **Test concurrent display operations**
- [ ] **Perform load testing (10+ displays simultaneously)**
- [ ] **Test browser compatibility (Chrome, Safari, Firefox, Edge)**
- [ ] **Test on target display devices (tablets, Smart TVs)**

#### 6.2 Test Coverage & Quality
- [ ] **Achieve 90%+ code coverage**
- [ ] **Review and improve test quality**
- [ ] **Add missing edge case tests**
- [ ] **Performance benchmark tests**
- [ ] **Security penetration testing**

#### 6.3 Documentation
- [ ] Write API documentation
- [ ] Create user guide for controller
- [ ] Document display setup process
- [ ] Add code comments and inline documentation
- [ ] Create troubleshooting guide
- [ ] Document deployment process
- [ ] **Document test strategies and patterns**

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
