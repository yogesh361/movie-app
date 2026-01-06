# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tMovies is a React-based movie discovery application that integrates with The Movie Database (TMDB) API. Users can search for movies and TV shows, view detailed information including cast/crew, and watch trailers.

## Development Commands

```bash
# Start development server (Vite)
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Preview production build
npm preview
```

**Note:** There are no test scripts configured in this project.

## Environment Variables

Required environment variables in `.env`:

```bash
VITE_API_KEY=<your-tmdb-api-key>              # Required - Get from themoviedb.org/settings/api
VITE_TMDB_API_BASE_URL=https://api.themoviedb.org/3  # Required - TMDB API base URL

# Optional - Analytics and Ads
VITE_GA_MEASUREMENT_ID=<google-analytics-id>
VITE_GOOGLE_AD_CLIENT=<adsense-client-id>
VITE_GOOGLE_AD_SLOT=<adsense-slot-id>
```

## Architecture Overview

### State Management Pattern

This app uses a **hybrid state management approach**:

1. **Context API** for UI/app state (primary pattern)
   - `GlobalContext` (`/src/context/globalContext.tsx`) - Manages video modal state, sidebar visibility
   - `ThemeContext` (`/src/context/themeContext.tsx`) - Manages dark/light theme with localStorage persistence

2. **Redux Toolkit Query (RTK Query)** for API data fetching only
   - `tmdbApi` (`/src/services/TMDB.ts`) - All TMDB API endpoints
   - No traditional Redux store - RTK Query handles all API caching/state
   - Endpoints: `getShows` (list), `getShow` (detail with videos/credits)

**Important:** When adding features that need global state, use Context API following the existing pattern (see ThemeContext). Only use RTK Query for new API endpoints.

### Data Flow

```
User Interaction
    ↓
Component Event Handler
    ↓
Context Method Call (for state) OR RTK Query Hook (for API data)
    ↓
State Update / Cache Update
    ↓
Component Re-render
```

### Component Architecture

**Page Components** (`/src/pages/`) - Route-level components loaded via React Router:
- `Home/` - Hero slider + content sections (trending, top-rated)
- `Catalog/` - Browse/search with pagination, query params for filtering
- `Detail/` - Individual movie/show details with cast, videos, similar content
- `NotFound/` - 404 page

**Common Components** (`/src/common/`) - Reusable UI components:
- Components are **stateless** where possible
- `MovieCard` - Core reusable card, used everywhere (home, catalog, search)
- `Section` - Content section with Swiper carousel (`MoviesSlides`)
- `VideoModal` - Global modal for YouTube trailer playback
- `Header`, `SideBar`, `Footer` - Layout components

**Component Pattern:**
- Page components use RTK Query hooks for data fetching
- Common components receive data as props (stateless)
- Contexts accessed via custom hooks (`useGlobalContext()`, `useTheme()`)

### Routing & Navigation

Routes are defined in `/src/App.tsx` with React Router v6:
- `/` - Home page
- `/movie` - Movie catalog
- `/tv` - TV show catalog
- `/search` - Search results (uses Catalog component with search query)
- `/:category/:id` - Detail page (category = "movie" or "tv")

**Navigation Links** are defined in `/src/constants/index.ts` - modify this file to add new nav items.

### Styling System

**Tailwind CSS** with custom configuration (`tailwind.config.cjs`):
- Dark mode: Class-based (`darkMode: "class"`) - toggle via `<html class="dark">`
- Custom breakpoint: `xs: 380px`
- Custom colors: `black: #191624`, text colors, background colors
- Custom shadows: `glow`, `glowLight` for hover effects

**Style Constants** (`/src/styles/index.ts`):
- Pre-defined Tailwind class combinations for consistency
- Use these instead of inline Tailwind strings: `maxWidth`, `mainHeading`, `paragraph`, `watchBtn`, etc.

**Combining Classes:**
- Use `cn()` helper from `/src/utils/helper.ts` (combines clsx + tailwind-merge)
- Handles conditional classes and merges conflicting Tailwind utilities

### API Integration Pattern

**TMDB API Service** (`/src/services/TMDB.ts`):

```typescript
// Example endpoint structure
endpoints: (builder) => ({
  getShows: builder.query({
    query: ({ category, type, page }) =>
      `${category}/${type}?api_key=${API_KEY}&page=${page}`
  })
})
```

**Usage in components:**
```typescript
const { data, isLoading, error } = useGetShowsQuery({
  category: 'movie',
  type: 'popular',
  page: 1
});
```

**Image URLs:**
- Base: `https://image.tmdb.org/t/p/original/`
- Append `poster_path` or `backdrop_path` from API response

### Data Persistence Pattern

**localStorage** is used for client-side persistence (see `/src/utils/helper.ts`):

```typescript
// Existing pattern for theme
export const saveTheme = (theme: string) => {
  localStorage.setItem("theme", theme);
};

export const getTheme = (): string | null => {
  return localStorage.getItem("theme");
};
```

**When adding new persistence features**, follow this pattern:
1. Create helper functions in `helper.ts`
2. Load initial state from localStorage in Context provider
3. Save to localStorage via `useEffect` on state changes
4. Add try-catch for error handling

### Animation Pattern

**Framer Motion** (`framer-motion`) is used for animations:
- Animation variants defined in `/src/hooks/useMotion.ts`
- Variants: `fadeIn`, `fadeDown`, `scaleUp`, `scaleDown`, `movingText`
- Check `prefers-reduced-motion` before applying animations
- Use `motion` components: `<m.div variants={fadeIn} />`

### Path Aliases

Vite is configured with path alias (`vite.config.ts`):
- `@/` maps to `/src/`
- Use: `import { helper } from "@/utils/helper"`

### TypeScript Types

Global types in `/src/types.d.ts`:
- `IMovie` - Movie/show data structure from TMDB
- `ITheme`, `IThemeContext` - Theme-related types
- `INavLink` - Navigation link structure

**When modifying data structures**, update interfaces in `types.d.ts` to maintain type safety.

### Key Patterns to Follow

1. **Adding New Pages:**
   - Create folder in `/src/pages/PageName/`
   - Add route in `/src/App.tsx`
   - Use lazy loading: `const PageName = lazy(() => import("@/pages/PageName"))`
   - Add to navigation in `/src/constants/index.ts`

2. **Adding New Context:**
   - Follow `ThemeContext` pattern in `/src/context/`
   - Create provider component with `React.createContext()`
   - Export custom hook: `export const useYourContext = () => useContext(context)`
   - Wrap in `main.tsx` alongside existing providers

3. **Adding New API Endpoints:**
   - Add to `/src/services/TMDB.ts` in `endpoints` builder
   - RTK Query auto-generates hooks: `useGetYourDataQuery`
   - Use in components, not in contexts

4. **Adding New Common Components:**
   - Create in `/src/common/ComponentName/index.tsx`
   - Export from `/src/common/index.ts` for clean imports
   - Keep stateless where possible, use props for data

5. **Modifying MovieCard:**
   - MovieCard is used everywhere (Home, Catalog, Search)
   - Changes affect all pages - test comprehensively
   - Hover overlay structure: overlay div with absolute positioning
   - Click events: use `e.stopPropagation()` to prevent navigation when needed

6. **Modal Pattern:**
   - Use existing `VideoModal` pattern from `/src/common/VideoModal/`
   - Hooks: `useOnClickOutside`, `useOnKeyPress` for UX
   - Prevent body scroll: add/remove `no-scroll` class to `<body>`
   - Global state via GlobalContext

## Development Best Practices

### Testing Strategy

**Current State:** This project has no automated tests configured.

**When implementing new features:**
1. **Manual testing checklist approach:**
   - Test each phase independently before moving to the next
   - Verify in browser DevTools (React DevTools, localStorage, Network tab)
   - Test across all breakpoints: mobile (380px), tablet (768px), desktop (1024px+)
   - Test both dark and light themes for visual consistency

2. **Critical test scenarios:**
   - **MovieCard changes:** Test on Home, Catalog, and Search pages
   - **Context changes:** Verify in React DevTools that state updates correctly
   - **API changes:** Check Network tab for correct endpoints and responses
   - **localStorage changes:** Verify data structure in Application → Local Storage
   - **Modal interactions:** Test click-outside, ESC key, and body scroll prevention

3. **Component testing checklist:**
   - [ ] Component renders without errors
   - [ ] Props are correctly typed (TypeScript validation)
   - [ ] Handles loading state (RTK Query: `isLoading`)
   - [ ] Handles error state (RTK Query: `error`)
   - [ ] Responsive design works at all breakpoints
   - [ ] Dark mode styling is correct
   - [ ] Animations respect `prefers-reduced-motion`

### Following Existing Patterns

**Critical:** This codebase has established patterns. Always follow them for consistency.

1. **State Management:**
   - ✅ Use Context API for UI state (modals, theme, global flags)
   - ✅ Use RTK Query for API data fetching
   - ❌ Don't create Redux slices or reducers
   - ❌ Don't use component-level state for data that should be global

2. **Component Structure:**
   - ✅ Keep common components stateless (props-based)
   - ✅ Put business logic in page components
   - ✅ Use existing hooks: `useGlobalContext()`, `useTheme()`, `useMotion()`
   - ❌ Don't add state to components like MovieCard, Section, or Poster

3. **Styling:**
   - ✅ Use Tailwind utility classes
   - ✅ Use style constants from `/src/styles/index.ts` for repeated patterns
   - ✅ Use `cn()` helper for conditional/merged classes
   - ❌ Don't add CSS modules or styled-components
   - ❌ Don't write inline styles except for dynamic values (API-driven colors, etc.)

4. **File Organization:**
   - ✅ Follow existing folder structure: `/pages/`, `/common/`, `/context/`, `/hooks/`, `/utils/`
   - ✅ Use `index.tsx` for main component, sub-components in same folder
   - ✅ Export from barrel files (`/common/index.ts`)
   - ❌ Don't create new top-level directories without strong justification

5. **TypeScript:**
   - ✅ Add new interfaces to `/src/types.d.ts` for global types
   - ✅ Use interface extension: `export interface IWatchlistItem extends IMovie { ... }`
   - ✅ Define component prop types inline for local types
   - ❌ Don't use `any` type - use `unknown` and type guard if needed
   - ❌ Don't bypass TypeScript errors with `@ts-ignore`

### Code Quality Standards

1. **Before committing, always run:**
   ```bash
   npm run build  # Ensures TypeScript passes and build succeeds
   ```
   - Build failures indicate TypeScript errors or import issues
   - Fix all TypeScript errors before committing

2. **TypeScript Strictness:**
   - All props must be typed
   - All function parameters and return types should be explicit
   - No implicit `any` types
   - Update `types.d.ts` when modifying data structures

3. **Import Conventions:**
   - Use `@/` path alias for all src imports
   - Group imports: React/external libs → internal components → utils/types
   - Example:
     ```typescript
     // External
     import { useState } from "react";
     import { motion as m } from "framer-motion";

     // Internal components
     import MovieCard from "@/common/MovieCard";

     // Utils/types
     import { cn } from "@/utils/helper";
     import { IMovie } from "@/types";
     ```

4. **Error Handling:**
   - RTK Query provides `error` object - always handle it in UI
   - localStorage operations: wrap in try-catch (see `helper.ts` pattern)
   - API errors: use `getErrorMessage()` helper from `helper.ts`

5. **Performance Considerations:**
   - Use `React.memo()` for expensive pure components
   - Use `useCallback()` for functions passed as props
   - Lazy load page components (already done - continue pattern)
   - Optimize images: use lazy loading via `react-lazy-load-image-component`

### Git Commit Practices

**Commit Message Format:**
Follow conventional commits for clarity:

```
<type>: <description>

[optional body]
```

**Types specific to this project:**
- `feat:` - New feature (e.g., `feat: add watchlist context and localStorage persistence`)
- `fix:` - Bug fix (e.g., `fix: MovieCard navigation prevents modal click`)
- `style:` - Styling changes (e.g., `style: update dark mode colors for watchlist page`)
- `refactor:` - Code refactoring (e.g., `refactor: extract watchlist button to reusable component`)
- `docs:` - Documentation (e.g., `docs: add watchlist feature spec`)
- `chore:` - Build/config changes (e.g., `chore: add watchlist route to App.tsx`)

**Good commit examples:**
```bash
feat: add WatchlistContext with localStorage persistence

- Create context/watchlistContext.tsx following ThemeContext pattern
- Add saveWatchlist/getWatchlist helpers to utils/helper.ts
- Add IWatchlistItem and IWatchlistContext types to types.d.ts
- Wrap app with WatchlistProvider in main.tsx

fix: prevent MovieCard navigation when clicking watchlist button

- Add e.stopPropagation() to bookmark icon click handler
- Ensures clicking bookmark doesn't navigate to detail page
- Tested on Home, Catalog, and Search pages

style: add watchlist button to MovieCard hover overlay

- Position bookmark icon below YouTube icon
- Use yellow color scheme (text-yellow-400)
- Show filled icon when in watchlist, outline when not
- Maintains existing hover animation pattern
```

**Bad commit examples:**
```bash
❌ "updates"
❌ "fix stuff"
❌ "wip"
❌ "changes to watchlist"
```

**Commit Granularity:**
- Each commit should be a logical, self-contained change
- For multi-phase features, commit after each phase
- Example for watchlist feature:
  1. `feat: add watchlist context and helpers`
  2. `feat: add watchlist button to MovieCard`
  3. `feat: add watchlist button to detail page`
  4. `feat: create watchlist page with empty state`
  5. `feat: add watchlist navigation link`

### Incremental Development

**For complex features, implement in phases:**

1. **Phase 1 - Foundation:**
   - Set up data structures (types, interfaces)
   - Create core logic (context, helpers, API endpoints)
   - Verify with manual console testing
   - Commit: `feat: add [feature] foundation`

2. **Phase 2 - UI Integration:**
   - Add UI components one at a time
   - Test each component independently
   - Commit after each component: `feat: add [feature] to [component]`

3. **Phase 3 - Navigation & Routes:**
   - Add routes, navigation links
   - Test full user flow
   - Commit: `feat: add [feature] navigation`

4. **Phase 4 - Polish:**
   - Error handling, edge cases, animations
   - Accessibility improvements
   - Commit: `fix: handle [edge case] in [feature]`

**Why this matters:**
- Easier to debug issues (smaller changesets)
- Easier to review and understand changes
- Can roll back individual phases if needed
- Aligns with manual testing approach (test each phase)

### Code Review Checklist

Before considering a feature "done", verify:

- [ ] TypeScript compiles (`npm run build`)
- [ ] No ESLint errors in terminal during dev
- [ ] Follows existing architectural patterns (Context API, RTK Query usage)
- [ ] New types added to `types.d.ts`
- [ ] Style constants used where applicable
- [ ] Responsive design tested (xs, sm, md, lg breakpoints)
- [ ] Dark mode tested and working
- [ ] No hardcoded API keys or secrets
- [ ] localStorage data structure documented (if applicable)
- [ ] Error states handled in UI
- [ ] Loading states handled in UI
- [ ] Accessibility: keyboard navigation, screen reader support
- [ ] Framer Motion respects `prefers-reduced-motion`
- [ ] Commits follow conventional commit format
- [ ] Each commit is self-contained and logical

## Important Files

- `/src/App.tsx` - Route definitions, lazy-loaded pages
- `/src/main.tsx` - App entry point, context providers
- `/src/services/TMDB.ts` - All API endpoint definitions
- `/src/context/` - Global state management (contexts)
- `/src/constants/index.ts` - Nav links, content sections, theme options
- `/src/types.d.ts` - Global TypeScript interfaces
- `/src/utils/helper.ts` - Utility functions (localStorage, classnames, errors)
- `/src/utils/config.ts` - Environment variable exports

## Deployment

- Deployed on Vercel (see `vercel.json`)
- Build command: `npm run build`
- Output directory: `dist/`
- TypeScript must pass type-checking before build succeeds
