# Favorites and Settings App

A React application with TypeScript that demonstrates favorites management and settings functionality with Supabase integration.

## Features

### Favorites Management
- ⭐ Toggle favorites in interaction views
- 📝 Create and edit notes for favorite interactions
- 📋 Favorites tab with full list view
- 🗑️ Delete favorites with confirmation
- 🔗 Foreign key relationships between favorites and interactions
- 🔄 Real-time UI state updates

### Settings Management
- 🎙️ Voice tone selection (friendly, professional, casual)
- 💬 Default interaction mode (chat, voice, text)
- 🌙 Dark mode toggle with system integration
- 💾 Persistent settings storage in Supabase
- 🔄 Optimistic updates with error handling

### User Experience
- ✅ Form validation and error handling
- 🎉 Confirmation toasts for all actions
- 📱 Responsive design for all screen sizes
- ⚡ Optimistic UI updates
- 🔄 Real-time state synchronization

### Text-to-Speech Integration
- 🔊 TTS functionality with voice tone adjustments
- 🎛️ Voice tone affects speech rate and pitch
- 🎯 Browser-based speech synthesis

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Context API
- **Build Tool**: Create React App

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd favorites-settings-app
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Get your project URL and anon key

4. Create environment variables
```bash
cp .env.example .env
```

Add your Supabase credentials:
```env
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Start the development server
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Database Schema

### Tables

#### `interactions`
- `id` (UUID, Primary Key)
- `title` (Text)
- `content` (Text)
- `user_id` (UUID, Foreign Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `favorites`
- `id` (UUID, Primary Key)
- `interaction_id` (UUID, Foreign Key to interactions)
- `note` (Text)
- `user_id` (UUID, Foreign Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `settings`
- `id` (UUID, Primary Key)
- `voice_tone` (Enum: friendly, professional, casual)
- `default_interaction_mode` (Enum: chat, voice, text)
- `dark_mode` (Boolean)
- `user_id` (UUID, Foreign Key, Unique)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Features Implementation

### Favorites System
- Each user can favorite an interaction once
- Favorites are linked via foreign key to interactions
- Notes can be added and edited for each favorite
- Optimistic updates provide instant feedback
- Rollback on errors ensures data consistency

### Settings Persistence
- Settings are stored per user in Supabase
- Voice tone affects TTS playback parameters
- Default mode determines initial tab selection
- Dark mode preference persists across sessions
- All changes use optimistic updates

### Error Handling
- Network errors trigger toast notifications
- Failed operations roll back UI state
- Loading states prevent duplicate actions
- Form validation provides immediate feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details