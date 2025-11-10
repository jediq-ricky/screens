# Project Structure

## Directory Layout
> **TODO**: Define as project develops

```
/screens
├── /app                    # Next.js App Router
│   ├── /api               # API routes
│   ├── /controller        # Controller interface
│   └── /display/[id]      # Display client pages
├── /components            # React components
│   ├── /controller        # Controller-specific components
│   ├── /display           # Display-specific components
│   └── /shared            # Shared components
├── /lib                   # Utility functions & shared logic
│   ├── /db               # Database utilities
│   ├── /video            # Video processing utilities
│   └── /sync             # State synchronization
├── /hooks                # Custom React hooks
├── /types                # TypeScript type definitions
├── /public               # Static assets
├── /docs                 # Project documentation
└── /tests                # Test files
```

## Key Modules

### Controller Module
- Video library management UI
- Playlist configuration UI
- Display status monitoring
- Playback controls

### Display Module
- Video playback engine
- Command reception & execution
- Status reporting
- Reconnection logic

### Sync Module
- Real-time communication layer
- State synchronization
- Event handling

## Configuration Files
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `.env.local` - Environment variables (not committed)
