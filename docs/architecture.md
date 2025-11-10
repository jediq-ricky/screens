# System Architecture

## Overview
SCREENS uses a client-server architecture with browser-based controller and display clients communicating through a Next.js backend hosted on Vercel.

## Communication Layer
> **TODO**: Define communication protocol between controller and displays
> - Options: WebSockets (real-time bidirectional), Server-Sent Events (server-to-client), or polling
> - Consider: Latency requirements, connection reliability, scalability

## State Management
> **TODO**: Define state management approach
> - Client-side state management (React Context, Zustand, Redux, etc.)
> - Server-side state persistence
> - Real-time synchronization strategy

## Data Flow
```
Controller → Backend → Display Clients
    ↑           ↓
    └─── State Sync ───┘
```

### Key Flows
1. **Video Selection**: Controller → Backend → Display
2. **Playback Control**: Controller → Backend → Display
3. **Status Updates**: Display → Backend → Controller
4. **Playlist Configuration**: Controller → Backend → Database

## Scalability Considerations
- Support for multiple concurrent displays
- Efficient video streaming/delivery
- Connection handling and recovery
- State synchronization performance
