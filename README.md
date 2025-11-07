# Insights Dashboard

A comprehensive learning analytics dashboard built with Next.js, Supabase, and Tailwind CSS. Track your learning progress with streaks, topic mastery, confidence trends, and personalized highlights.

## Features

- **Streak Tracking**: Monitor consecutive learning days and maintain motivation
- **Topic Mastery**: Visualize progress across different subjects with mastery levels
- **Confidence Trends**: Track confidence levels over time with interactive charts
- **Smart Highlights**: Get personalized insights including best answers, areas to review, and achievements
- **Real-time Updates**: Insights automatically update after each learning interaction
- **Graceful Fallbacks**: Works smoothly even when data is unavailable

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd insights-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
   - Copy your Supabase URL and anon key

4. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

### Interactions Table
Stores individual learning sessions with:
- User ID
- Subject
- Confidence level (1-5)
- Summary of the session
- Timestamps

### Insights Table
Stores computed analytics including:
- Streak count
- Last active date
- Frequent subjects with counts
- Confidence trend array
- Highlighted achievements and areas to review

## Key Features

### Automatic Insights Updates
The system automatically updates insights after each interaction using database triggers and RPC functions:

- `calculate_streak()`: Computes consecutive learning days
- `get_user_insights()`: Retrieves comprehensive user analytics
- `update_insights_after_interaction()`: Updates insights after new interactions

### Interactive Components

- **Streak Card**: Visual streak representation with activity tracking
- **Topic Mastery**: Progress bars with mastery levels (Beginner to Expert)
- **Confidence Trend**: Line chart showing confidence over time
- **Highlights**: Categorized insights with visual indicators

### Demo Mode
The application includes a demo interaction feature that allows you to:
- Record mock learning sessions
- See real-time insights updates
- Test the full workflow without authentication

## Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Other Platforms
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Deploy to your preferred hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
