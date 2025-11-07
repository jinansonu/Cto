# History Module

A comprehensive history module built with Next.js, TypeScript, and Supabase that provides paginated interaction history with filtering, search, and voice replay capabilities.

## Features

- **Paginated Data Fetching**: Efficient pagination with Supabase
- **User Filtering**: Row Level Security (RLS) ensures users only see their own data
- **Mode Filters**: Filter by voice, text, or camera interactions
- **Search Functionality**: Search across questions, answers, and summaries
- **Chronological Grouping**: Interactions grouped by date
- **Voice Replay**: Text-to-speech (TTS) for voice interactions
- **Image Viewing**: Display associated camera images
- **Delete Capability**: Remove interactions with confirmation
- **Caching**: SWR integration for efficient data caching
- **Skeleton Loaders**: Loading states for better UX
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR
- **Icons**: Lucide React
- **TTS**: Web Speech API

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_create_interactions_table.sql`
3. Optionally run the seed data in `supabase/seed.sql`
4. Copy your Supabase URL and anon key

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The `interactions` table includes:

- `id`: UUID primary key
- `user_id`: User identifier (linked to auth.uid())
- `question`: User's question
- `answer`: System's response
- `summary`: Optional summary
- `confidence`: Confidence score (0-1)
- `mode`: 'voice', 'text', or 'camera'
- `image_url`: URL for camera images
- `audio_url`: URL for voice recordings
- `created_at`: Timestamp
- `updated_at`: Last updated timestamp

## RLS Policies

The application implements Row Level Security:

- Users can only view their own interactions
- Users can only insert their own interactions
- Users can only update their own interactions
- Users can only delete their own interactions

## Components

### Core Components

- **HistoryModule**: Main component with filters and pagination
- **HistoryItem**: Individual interaction display
- **HistoryItemSkeleton**: Loading skeleton

### UI Components

- **Button**: Customizable button component
- **Input**: Form input with styling
- **Select**: Dropdown select component
- **Dialog**: Modal dialog component
- **Skeleton**: Loading skeleton component

### Hooks

- **useInteractions**: SWR hook for fetching interactions
- **useTTS**: Text-to-speech functionality

## API Routes

- **GET /api/interactions**: Fetch paginated interactions with filters

## Features in Detail

### Filtering and Search

- Filter by interaction mode (voice/text/camera)
- Search across questions, answers, and summaries
- Real-time search with debouncing
- Clear filters functionality

### Voice Replay

- Uses Web Speech API for TTS
- Play/stop controls
- Only available for voice interactions
- Browser compatibility check

### Image Viewing

- Modal dialog for full-size viewing
- Only shows when image_url is present
- Responsive image display

### Pagination

- Server-side pagination
- Load more functionality
- Maintains filters across pages
- Loading states

### Delete Functionality

- Confirmation dialog
- Optimistic updates
- Error handling
- Automatic list refresh

## Styling

The application uses Tailwind CSS with a custom design system:

- Consistent color palette
- Responsive design
- Dark mode support (structure in place)
- Smooth animations and transitions
- Loading states and micro-interactions

## Performance Optimizations

- SWR caching for data fetching
- Efficient database queries with indexes
- Skeleton loading states
- Optimistic updates
- Component memoization where appropriate

## Browser Support

- Modern browsers with ES6+ support
- Web Speech API for TTS (Chrome, Edge, Safari)
- Responsive design for mobile and desktop

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── HistoryItem.tsx   # Interaction item
│   ├── HistoryItemSkeleton.tsx
│   └── HistoryModule.tsx # Main module
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── supabase/             # Database migrations and seeds
└── types/                # TypeScript type definitions
```