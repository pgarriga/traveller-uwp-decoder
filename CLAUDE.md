# CLAUDE.md

## Project Overview

Mongoose Traveller UWP Decoder - A web app for decoding Universal World Profile (UWP) codes from the Mongoose Traveller 2nd Edition tabletop RPG. Supports OCR scanning of UWP codes from images.

## Tech Stack

- **React 19** - UI framework
- **Vite 6** - Build tool and dev server
- **Tesseract.js 7** - OCR engine for scanning UWP codes from images
- **No external UI libraries** - Custom components with inline styles
- **No router library** - Custom URL routing with History API

## Project Structure

```
src/
├── App.jsx      # Main application component (all views, navbar, logic)
├── i18n.js      # Translations (ES/EN) and game data (starports, sizes, etc.)
├── index.css    # Global styles and responsive breakpoints
└── main.jsx     # React entry point
```

## Commands

```bash
npm run dev      # Start dev server (usually http://localhost:5173)
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build
```

## Key Concepts

### UWP Code Format
A UWP code is 8 characters: `A123456-7`
- Position 0: Starport class (A-E, X)
- Positions 1-6: Hex digits for Size, Atmosphere, Hydrographics, Population, Government, Law Level
- Position 7 (after dash): Tech Level

### URL Routing
- `/` - Home/scan page
- `/recent` - Recent planets list
- `/planet/{UWP}` - Planet detail view (e.g., `/planet/A123456-7`)

### i18n System
- Auto-detects language from `navigator.language`
- Spanish: es, ca, gl, eu (Spanish regional languages)
- English: all other languages
- Translations in `src/i18n.js` with `useTranslation()` hook

### Data Persistence
- Recent planets stored in `localStorage` key: `traveller-recent`
- Auto-saves when viewing/editing a planet
- Synced via React effect when `recentPlanets` state changes

## Code Conventions

- **Inline styles** preferred over CSS classes (except responsive styles)
- **Flat SVG icons** as React components (aria-hidden for accessibility)
- **No emojis** in UI unless user requests
- **Spanish comments** acceptable (bilingual project)
- **Mobile-first responsive** with breakpoint at 640px for navbar, 480px for other elements

## Required Checks

**IMPORTANT**: Run these skills when appropriate before committing:

### After UI changes:
- `/check-responsive` - Verify responsive design works on all screen sizes
- `/check-a11y` - Verify accessibility compliance

### After updating dependencies or bumping version:
- `/update-badges` - Sync README.md badges with package.json versions (including project version)

These checks ensure the app works well on mobile devices, is accessible to all users, and documentation stays current.

## Important Notes

- This is an unofficial fan project, not affiliated with Mongoose Publishing
- Game data (starports, atmospheres, etc.) is from Mongoose Traveller 2e SRD
- OCR scanning works best with clear, high-contrast images
- The app works offline after initial load (no backend required)
