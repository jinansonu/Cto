# Voice Mode App

A modern voice-powered AI assistant built with Next.js, TypeScript, and Tailwind CSS. Features speech-to-text, AI processing, text-to-speech, and data persistence via Supabase.

## Features

### 🎤 Voice Input
- **Speech Recognition**: Uses Web Speech API for real-time speech-to-text
- **Multiple Languages**: Support for 9+ languages including English, Spanish, French, German, and more
- **Recording Status**: Visual feedback with Framer Motion animations
- **Error Handling**: Graceful handling of permissions, timeouts, and network errors

### 🤖 AI Processing
- **Smart Responses**: Contextual AI responses with confidence scores
- **Summary Generation**: Automatic summary generation for interactions
- **Fallback Handling**: Mock AI service for demonstration (easily replaceable with real API)

### 🔊 Voice Output
- **Text-to-Speech**: Speech Synthesis API for voice responses
- **Voice Tones**: Multiple voice options (default, male, female, robotic)
- **Playback Controls**: Play, pause, stop, and replay functionality
- **Auto-Replay**: Optional automatic response playback

### 💾 Data Persistence
- **Supabase Integration**: Store interactions with mode=voice
- **Streak Tracking**: Update user streak insights automatically
- **User Analytics**: Track confidence scores and interaction metadata

### 🎨 User Interface
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Micro-interactions**: Smooth animations with Framer Motion
- **Settings Panel**: Customizable voice preferences
- **Status Indicators**: Real-time feedback for all operations

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: Supabase
- **Icons**: Lucide React
- **Speech APIs**: Web Speech Recognition & Speech Synthesis

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for data persistence)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voice-mode-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Create an `interactions` table in your Supabase database:
   ```sql
   CREATE TABLE interactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     mode TEXT NOT NULL CHECK (mode IN ('voice', 'text')),
     transcript TEXT,
     response TEXT NOT NULL,
     confidence DECIMAL(3,2),
     summary TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE INDEX idx_interactions_user_id ON interactions(user_id);
   CREATE INDEX idx_interactions_created_at ON interactions(created_at);
   CREATE INDEX idx_interactions_mode ON interactions(mode);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Voice Interaction

1. **Allow microphone permissions** when prompted
2. **Click the microphone button** to start recording
3. **Speak clearly** - you'll see real-time transcription
4. **Click the microphone again** to stop recording
5. **Wait for AI processing** - the response will appear with confidence scores
6. **Listen to the response** (auto-replay if enabled) or use manual controls

### Settings Customization

- **Voice Tone**: Choose between default, male, female, or robotic voices
- **Language**: Select from 9+ supported languages
- **Auto Replay**: Toggle automatic response playback

### Browser Compatibility

**Best Experience**: Chrome, Edge, Safari (latest versions)
**Limited Support**: Firefox (no speech recognition)

## Project Structure

```
voice-mode-app/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── VoiceTab.tsx      # Main voice interface
├── lib/                   # Utility libraries
│   ├── ai-service.ts     # AI processing service
│   ├── speech-recognition.ts # Speech recognition hook
│   ├── speech-synthesis.ts   # Speech synthesis hook
│   └── supabase.ts       # Database integration
├── types/                 # TypeScript definitions
│   └── voice.ts          # Voice-related types
└── README.md             # This file
```

## Key Features Explained

### Speech Recognition
- Uses Web Speech API with fallback messaging
- 30-second timeout with automatic reset on speech detection
- Comprehensive error handling for permissions, network, and hardware issues

### AI Integration
- Mock AI service with keyword-based responses
- Easily replaceable with real AI API (OpenAI, Claude, etc.)
- Confidence scoring and summary generation

### Data Persistence
- All voice interactions stored in Supabase
- Automatic streak insights updates
- User interaction analytics

### Animations & UX
- Recording pulse animation using Framer Motion
- Smooth transitions for all state changes
- Visual feedback for loading, error, and success states

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

Create `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check browser compatibility
- Verify microphone permissions
- Ensure Supabase configuration is correct
- Review browser console for errors