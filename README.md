# CTO App

An intelligent AI assistant application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Voice Module**: AI-powered voice interaction
- **Text Module**: Chat with AI through text
- **Camera Module**: Visual AI processing
- **History**: View your interaction history
- **Insights**: Analytics and AI-generated insights
- **Favorites**: Save and organize favorites
- **Settings**: Configure your preferences
- **Dark/Light Theme**: Responsive theming with Tailwind CSS
- **Framer Motion**: Smooth animations throughout the app
- **State Management**: Context API for auth and feature modules

## Tech Stack

- **Frontend Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx       # Root layout with navigation
│   ├── page.tsx         # Home page
│   ├── globals.css      # Global styles
│   └── [feature]/       # Feature pages (text, camera, etc.)
├── components/
│   ├── ui/              # Shared UI primitives (buttons, inputs, cards, loaders)
│   ├── layout/          # Layout components (navigation, main-layout)
│   ├── providers.tsx    # Context providers
│   └── theme-provider.tsx
├── context/
│   ├── auth-context.tsx     # Auth state management
│   └── feature-context.tsx  # Feature state management
├── hooks/               # Custom React hooks
├── lib/
│   ├── cn.ts            # Class name utilities
│   ├── supabase.ts      # Supabase client setup
│   └── api.ts           # API utilities
├── types/               # TypeScript types
└── __tests__/           # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cto-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`:

```
NEXT_PUBLIC_OPENROUTER_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - TypeScript type checking
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## Code Quality

### Linting

ESLint is configured to catch common issues. Run:

```bash
npm run lint
```

### Formatting

Prettier is configured for consistent code style. Format code with:

```bash
npm run format
```

### Type Checking

TypeScript strict mode is enabled. Check types with:

```bash
npm run type-check
```

### Git Hooks

Husky is configured with the following hooks:

- **pre-commit**: Runs lint-staged to format and lint staged files
- **pre-push**: Runs type-check, lint, and tests

## Configuration

### TypeScript Aliases

Convenient path aliases are configured:

- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/lib/*` → `src/lib/*`
- `@/context/*` → `src/context/*`
- `@/hooks/*` → `src/hooks/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`

### Tailwind CSS

Dark mode is enabled via class strategy. Add the `dark` class to the root element to enable dark theme.

### Environment Variables

All environment variables should be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all tests pass: `npm run test`
4. Format code: `npm run format`
5. Check types: `npm run type-check`
6. Commit and push (git hooks will run)

## License

MIT
