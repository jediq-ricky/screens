# Database & Storage

## Data Models

### Videos
Stores video metadata (actual files stored in Vercel Blob):
- **id**: Unique identifier (CUID)
- **title**: Video title
- **description**: Optional description
- **blobUrl**: Vercel Blob storage URL
- **thumbnailUrl**: Optional thumbnail URL
- **duration**: Duration in seconds
- **fileSize**: File size in bytes
- **mimeType**: Video MIME type (video/mp4, etc.)
- **createdAt**: Upload timestamp
- **updatedAt**: Last modification timestamp

### Displays
Physical display devices:
- **id**: Unique identifier (CUID)
- **name**: Display name
- **token**: Unique authentication token (indexed)
- **description**: Optional description
- **isActive**: Active status flag
- **lastSeenAt**: Last connection timestamp
- **createdAt**: Registration timestamp
- **updatedAt**: Last modification timestamp
- **Relations**: One-to-one with Playlist

### Playlists
Video playlists assigned to displays:
- **id**: Unique identifier (CUID)
- **displayId**: Foreign key to Display (unique, cascades on delete)
- **playbackMode**: LOOP | SEQUENCE | MANUAL
- **isActive**: Active status flag
- **createdAt**: Creation timestamp
- **updatedAt**: Last modification timestamp
- **Relations**: Belongs to Display, has many PlaylistItems

### PlaylistItems
Individual videos in playlists with ordering:
- **id**: Unique identifier (CUID)
- **playlistId**: Foreign key to Playlist (cascades on delete)
- **videoId**: Foreign key to Video (cascades on delete)
- **position**: Position in playlist (0-indexed)
- **createdAt**: Creation timestamp
- **updatedAt**: Last modification timestamp
- **Constraints**:
  - Unique (playlistId, videoId) - video appears once per playlist
  - Unique (playlistId, position) - each position is unique per playlist

## Storage Solutions
**Chosen Solutions:**
- **Database**: PostgreSQL via Vercel Postgres
  - Native Vercel integration
  - Excellent performance and reliability
  - Managed service (no maintenance overhead)
  - Built-in connection pooling
- **ORM**: Prisma
  - Type-safe database queries
  - Auto-generated TypeScript types
  - Easy migrations and schema management
  - Great developer experience
- **Video Storage**: Vercel Blob Storage
  - Native Vercel integration
  - Simple upload/download API
  - Cost-effective for MVP
  - CDN distribution included

## Data Persistence
- Video metadata and references
- Display configurations
- Playlist assignments
- Playback state (if needed across sessions)
