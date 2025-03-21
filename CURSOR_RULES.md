# Subscription Manager App - Cursor Rules

## Project Stack

- Expo React Native
- TypeScript
- NativewindUI (TailwindCSS)
- Zustand
- iOS-only focus

## Project Structure and Organization

1. Follow a modular, feature-based organization:

   - `/app` - Expo Router screens and layouts
   - `/components` - Reusable UI components
   - `/components/subscription` - Subscription-specific components
   - `/components/ui` - General UI components
   - `/store` - Zustand store modules
   - `/lib` - Utility functions and services
   - `/types` - TypeScript type definitions

2. Use atomic design principles:

   - Atoms: Basic UI elements (buttons, inputs)
   - Molecules: Combinations of atoms (subscription cards, payment details)
   - Organisms: Larger components (subscription lists, analytics dashboard)
   - Templates: Page layouts
   - Pages: Full screens

3. Each component should have a single responsibility and be stored in its own file.

## Code Style

1. Use TypeScript for all files with strict type checking.
2. Use functional components with hooks instead of class components.
3. Extract reusable logic into custom hooks in a `/hooks` directory.
4. Use NativewindUI for styling with Tailwind CSS classes.
5. Prefer composition over inheritance.
6. Keep components small and focused (under 150 lines).
7. Use named exports instead of default exports for better refactoring.
8. Follow consistent naming conventions:
   - PascalCase for components
   - camelCase for variables and functions
   - snake_case for database fields
9. No code comments unless absolutely necessary for complex logic.

## Component Structure

1. Order imports as:

   - React/React Native imports
   - Third-party libraries
   - Local components
   - Types
   - Styles/constants

2. Props interface should be defined at the top of the file.

3. Component structure:
   ```tsx
   export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
     // Hooks
     // State
     // Derived values
     // Event handlers
     // Effect hooks
     // Render
     return (...);
   }
   ```

## State Management

1. Separate Zustand stores by domain:

   - `/store/subscriptionStore.ts` - Subscription data
   - `/store/userStore.ts` - User preferences and settings
   - `/store/uiStore.ts` - UI state (dark mode, etc.)

2. Use middleware like immer for immutable updates.
3. Prefer small, focused stores over a monolithic global store.
4. Keep store logic separate from UI components.
5. Use selectors to prevent unnecessary re-renders.

## Performance Optimization

1. Use memo/useMemo/useCallback to prevent unnecessary re-renders.
2. Implement virtualized lists with FlashList for subscription lists.
3. Lazy load components and screens that aren't immediately needed.
4. Use proper key props for list rendering.
5. Implement throttling and debouncing for frequently fired events.

## iOS-Specific Guidelines

1. Use platform-specific styles and components with `.ios.tsx` suffixes where needed.
2. Follow iOS Human Interface Guidelines for UI/UX decisions.
3. Properly handle safe areas and notches.
4. Implement haptic feedback for better user experience.
5. Optimize for iOS gestures (swipe, pinch, etc.).

## Testing and Quality Assurance

1. Write unit tests for business logic.
2. Use snapshot testing for UI components.
3. Set up end-to-end testing with Detox or similar.
4. Implement proper error handling and fallbacks.

## Accessibility

1. Use proper semantic elements and accessibility labels.
2. Support dynamic text sizes.
3. Ensure color contrast meets accessibility standards.

## Reusable Components

1. Create and reuse components for common UI patterns:

   - Subscription cards
   - Payment method selectors
   - Date pickers
   - Currency inputs
   - Category selectors
   - Notification badges

2. Component props should have sensible defaults.

## Git Workflow

1. Use feature branches
2. Write meaningful commit messages
3. Keep PRs small and focused
4. Regularly rebase with main branch

## Error Handling

1. Implement proper error boundaries
2. Use try/catch for async operations
3. Provide user-friendly error messages
4. Log errors for debugging
