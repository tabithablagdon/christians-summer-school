# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is an educational React app for Christian's summer school — Tabitha's son (born 8/19/2017). The app is built from a Create React App scaffold using React 19. No features have been added yet beyond the CRA boilerplate.

## Commands

```bash
npm start        # dev server at http://localhost:3000 (hot reload)
npm test         # Jest in watch mode via react-scripts
npm run build    # production build to /build
```

To run a single test file:
```bash
npm test -- --testPathPattern=App.test.js --watchAll=false
```

## Architecture

Single-page React app. Entry point is `src/index.js`, which mounts `<App />` into `public/index.html`. All application code lives in `src/`.

Testing uses React Testing Library (`@testing-library/react`) with Jest. Tests co-locate with source files using the `.test.js` convention.

No routing, state management, or backend has been added yet — those decisions are still open as the project takes shape.
