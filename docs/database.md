# Database & Storage

## Data Models

### Videos
> **TODO**: Define video storage and metadata structure
```
- Video ID
- Title
- File path/URL
- Duration
- Thumbnail
- Upload date
- Tags/Categories
```

### Displays
> **TODO**: Define display/device registration
```
- Display ID
- Display Name
- Unique URL/Token
- Assigned Playlist
- Current Status
- Last Active
```

### Playlists
> **TODO**: Define playlist structure
```
- Playlist ID
- Display ID (reference)
- Video IDs (ordered list)
- Playback Mode (loop/sequence/manual)
- Configuration
```

## Storage Solutions
> **TODO**: Choose database and video storage
- **Database Options**: Vercel Postgres, Supabase, PlanetScale, MongoDB Atlas
- **Video Storage**: Vercel Blob, S3, Cloudflare R2, dedicated CDN
- **Considerations**: Cost, scalability, performance, Vercel integration

## Data Persistence
- Video metadata and references
- Display configurations
- Playlist assignments
- Playback state (if needed across sessions)
