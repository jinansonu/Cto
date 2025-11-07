# CTO App

A modern web application with comprehensive error handling, accessibility features, capability detection, and robust fallback mechanisms.

## Features

### 🛡️ Error Handling & Resilience
- **Error Boundaries**: Comprehensive error catching with user-friendly fallbacks
- **Toast Notifications**: Non-intrusive feedback system for all user actions
- **Loading Placeholders**: Multiple loading states (spinner, skeleton, dots)
- **Network Retry Logic**: Automatic retry with exponential backoff for API failures
- **Offline Detection**: Clear indicators and graceful degradation when offline

### 🎤 Speech Features
- **Speech Recognition**: Convert speech to text with real-time feedback
- **Speech Synthesis**: Text-to-speech functionality with customizable voices
- **Capability Detection**: Automatic detection of browser speech API support
- **Fallback Messaging**: Clear guidance when speech features aren't available

### 📷 Camera Access
- **Camera Preview**: Real-time camera feed with device selection
- **Photo Capture**: Take and download photos directly in the browser
- **Permission Handling**: Graceful handling of camera permissions
- **Device Detection**: Support for multiple cameras with device switching

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support with shortcuts (Alt+H, Alt+S, Alt+C, Alt+,)
- **ARIA Labels**: Comprehensive screen reader support
- **Focus Management**: Proper focus handling for all interactive elements
- **Semantic HTML**: Structured markup for better accessibility
- **High Contrast**: Support for high contrast modes

### 📊 Analytics & Logging
- **Event Tracking**: Comprehensive analytics for user interactions
- **Error Logging**: Automatic error reporting and logging
- **Page View Tracking**: Monitor user navigation patterns
- **Privacy Controls**: User-controlled analytics opt-in/out

### 🧪 Testing
- **E2E Tests**: Playwright-based end-to-end test suite
- **Cross-browser**: Tests for Chrome, Firefox, Safari, and mobile
- **Accessibility Testing**: Automated accessibility testing
- **Smoke Tests**: Core functionality verification

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting**: ESLint with TypeScript support

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cto-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Browser Support

This application supports all modern browsers:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Feature Support Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Speech Recognition | ✅ | ❌ | ✅ | ✅ |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |
| Camera Access | ✅ | ✅ | ✅ | ✅ |
| Local Storage | ✅ | ✅ | ✅ | ✅ |
| WebGL | ✅ | ✅ | ✅ | ✅ |

## Environment Configuration

### Development Environment

Create a `.env.development` file:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=debug
```

### Production Environment

Create a `.env.production` file:

```env
VITE_API_BASE_URL=https://api.yourapp.com
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=error
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Docker

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy the dist folder to your web server
# The dist folder contains all static assets
```

## Security Considerations

- **HTTPS Required**: Camera and microphone access require HTTPS
- **Content Security Policy**: Configure appropriate CSP headers
- **Permission Handling**: Always check for API availability before use
- **Input Validation**: Sanitize all user inputs
- **Error Reporting**: Avoid exposing sensitive information in error messages

## Performance Optimization

- **Code Splitting**: Automatic code splitting by route
- **Image Optimization**: Lazy loading for images
- **Caching**: Service worker for offline support
- **Bundle Analysis**: Use `npm run build -- --analyze` to analyze bundle size
- **Performance Budget**: Monitor Core Web Vitals

## Troubleshooting

### Common Issues

**Camera not working**
- Ensure you're using HTTPS
- Check browser permissions
- Verify camera hardware is connected
- Try a different browser

**Speech recognition not available**
- Use Chrome or Safari for best support
- Check microphone permissions
- Ensure you're on HTTPS

**Build errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify all dependencies are installed

### Debug Mode

Enable debug mode by setting:
```env
VITE_LOG_LEVEL=debug
```

This will provide detailed console logs for troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run test && npm run test:e2e`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Add tests for new features
- Update documentation as needed

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review browser compatibility notes

---

Built with ❤️ for modern web development