# Development Guidelines - Programming Best Practices

---

## Quick Reference

**Check BEFORE coding:**
- **shadcn/ui Components**: https://ui.shadcn.com/docs/components
- **Project Documentation**: Review product specs and requirements docs
- **Design System**: Check `styles/design-tokens.css` for color system

**Component checklist:**
1. Check shadcn/ui → 2. Check `components/` directory → 3. Create new (if nothing exists)

---

## Core Principles

**Four principles working together:**

1. **KISS** - Keep code simple and obvious. Avoid over-engineering.

2. **AHA** - Avoid Hasty Abstractions. Wait for 3 real use cases before abstracting. Duplication > wrong abstraction.

3. **WET** - Write Everything Twice. Write similar code twice to discover true patterns before abstracting.

4. **DRY** - Don't Repeat Yourself. AFTER seeing pattern 3 times, eliminate duplication through abstraction.

**Abstraction flow:**
- Use case 1: Write it (WET)
- Use case 2: Write it again (WET)
- Use case 3: Abstract it (DRY)
- Use case 4+: Reuse it (DRY)

---

## Component Development

**ALWAYS check existing first:**
1. shadcn/ui (https://ui.shadcn.com/docs/components) - Use as-is or compose
2. Project components (`components/` directory) - Reuse or extend
3. Create new only if nothing fits

**Component guidelines:**
- One component = one concern
- Max 150 lines per file (split if larger)
- Props should be minimal and obvious
- Use variants over boolean props
- Components must be testable in isolation

---

## Using shadcn/ui Components

**IMPORTANT: Always use shadcn/ui for UI components**

```bash
# Install a component
npx shadcn@latest add button

# Install multiple components
npx shadcn@latest add button textarea checkbox slider label
```

**Usage:**
```typescript
import { Button } from '@/components/ui/button'

<Button variant="default">Click Me</Button>
<Button variant="outline">Outline</Button>
```

**When to create custom:** Only when shadcn doesn't have it or you need to compose multiple components

---

## File Organization

**Frontend structure:**

```
app/                    # Next.js App Router pages
components/
  ui/                   # shadcn/ui base components (auto-generated)
  [feature]/            # Feature-specific components grouped by domain
  common/               # Shared components (LoadingState, ErrorState, etc.)
lib/
  services/             # API service layer (abstracts fetch calls)
  hooks/                # Custom React hooks
  types/                # TypeScript type definitions
  utils/                # Utility functions
styles/
  globals.css           # Global styles + Tailwind imports
  design-tokens.css     # CSS custom properties for theming
public/                 # Static assets
```

**Key principles:**
- Group by feature/domain, not by type
- Keep related files together
- Flat is better than nested (avoid deep nesting)

---

## Services Layer (API Abstraction)

**ALWAYS abstract API calls into service classes**

Never use fetch directly in components. Use the service layer for clean separation of concerns.

### Service Structure

```typescript
// lib/services/feature.service.ts
export class FeatureService {
  static async getData(id: string): Promise<DataType> {
    const response = await fetch(`${API_BASE_URL}/api/data/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}
```

### Service Guidelines

1. **One service per feature/domain** - `property.service.ts`, `search.service.ts`, etc.
2. **Static methods** - Services are stateless utility classes
3. **Type safety** - Define request/response types in the same file
4. **Error handling** - Throw errors on HTTP failures, let components handle them
5. **Export from index** - `lib/services/index.ts` for clean imports

### Example Usage

```typescript
// ✅ GOOD: Using service layer
import { PropertyService } from '@/lib/services'

const data = await PropertyService.search({
  location: 'Whitefield',
  minPrice: 50000,
})

// ❌ BAD: Direct fetch in component
const response = await fetch(`${API_BASE_URL}/api/search`, {
  method: 'POST',
  body: JSON.stringify({ ... }),
})
```

### File Structure Example

```
lib/
  services/
    index.ts                    # Export all services
    property.service.ts         # Property search API client
    property-search.service.ts  # Property search specific client
```

**Benefits:**
- Single source of truth for API endpoints
- Easy to mock for testing
- Centralized error handling
- Type-safe requests/responses
- Easy to update API calls across entire app

---

## Naming Conventions

**Files:**
- Components: `UserProfile.tsx` (PascalCase)
- Hooks: `useAuth.ts` (camelCase with 'use' prefix)
- Utils: `formatDate.ts` (camelCase)
- Types: `user.ts` (singular noun, camelCase)

**Code:**
- Variables: `userList`, `isLoading` (camelCase)
- Constants: `MAX_RETRY_COUNT`, `API_BASE_URL` (UPPER_SNAKE_CASE)
- Functions: `getUserById()`, `calculateTotal()` (camelCase, verb prefix: get/set/calculate/fetch/update)
- Components: `UserProfile()`, `DataTable()` (PascalCase)
- Hooks: `useAuth()`, `useLocalStorage()` (camelCase with 'use' prefix)

---

## TypeScript

- **Use explicit types** - No `any`, use `unknown` if truly unknown then narrow with type guards
- **Types location** - `lib/types/` directory, one file per domain (e.g., `user.ts`, `api.ts`)
- **Interfaces for objects** - `interface User { id: string; name: string; }`
- **Types for unions/primitives** - `type Status = 'idle' | 'loading' | 'success' | 'error'`
- **Prefer interfaces for extensibility** - Interfaces can be extended/merged, types cannot

---

## Styling

**IMPORTANT - Use design tokens (CSS custom properties):**
```typescript
✅ Good: className="bg-surface-primary text-primary"
✅ Good: <Button variant="outline">Secondary</Button>
✅ Good: style={{ color: 'var(--text-primary)' }}
❌ Bad: className="bg-[#D4C5B0]" // Never hardcode hex colors
❌ Bad: style={{ color: '#FF0000' }} // Never hardcode colors
```

**Design token structure:**
- Define all colors in `styles/design-tokens.css` as CSS custom properties
- Use semantic naming: `--surface-primary`, `--text-primary`, `--interactive-primary`
- Support light/dark themes by overriding token values, not component styles
- Use Tailwind utilities when possible: `bg-surface-primary` maps to `var(--surface-primary)`

**Benefits:**
- Single source of truth for colors
- Easy theme switching (just swap CSS variables)
- Consistent design across app
- No magic hex values scattered in code

---

## Animations

**IMPORTANT - Use subtle, slow animations with proper easing:**

```typescript
// ✅ GOOD: Subtle, slow animation with cubic-bezier easing
<motion.div
  animate={{ width: expanded ? "80vw" : "896px" }}
  transition={{
    duration: 1.2,
    ease: [0.4, 0, 0.2, 1] // Material Design standard easing
  }}
>

// ✅ GOOD: Different properties can have different timings
<motion.div
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    opacity: { duration: 1.5, ease: "easeInOut" },
    scale: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
  }}
>

// ❌ BAD: Too fast, jarring
<motion.div
  animate={{ width: expanded ? "80vw" : "896px" }}
  transition={{ duration: 0.3 }}
>

// ❌ BAD: No easing specified
<motion.div
  animate={{ width: expanded ? "80vw" : "896px" }}
  transition={{ duration: 1.2 }}
>
```

**Animation guidelines:**
- **Duration**: Use 1.0s - 1.5s for major layout changes (width, height)
- **Duration**: Use 0.3s - 0.5s for micro-interactions (hover, focus)
- **Easing**: Use `[0.4, 0, 0.2, 1]` (Material Design cubic-bezier) for most animations
- **Easing**: Use `"easeInOut"` for opacity and fade effects
- **Principle**: Animations should be FELT, not SEEN - they should be subtle and natural

**Common easing curves:**
- `[0.4, 0, 0.2, 1]` - Standard easing (most animations)
- `[0, 0, 0.2, 1]` - Deceleration (entering elements)
- `[0.4, 0, 1, 1]` - Acceleration (exiting elements)
- `"easeInOut"` - Smooth fade effects

**Why this matters:**
- Fast animations feel jarring and cheap
- Slow, subtle animations feel premium and polished
- Proper easing makes animations feel natural
- Good animations enhance UX without calling attention to themselves

---

## State Management

**Choose the right tool for the job:**

- **Local UI state:** `useState` - Form inputs, toggles, modals
- **Shared logic:** Custom hooks - Reusable stateful logic across components
- **Global app state:** React Context - Theme, auth, user preferences (use sparingly)
- **Server state:** React Query or SWR - API data, caching, invalidation
- **Form state:** React Hook Form or similar - Complex forms with validation
- **Avoid:** Redux, Zustand, MobX (unless project complexity truly demands it)

**State management hierarchy (start simple, add complexity only when needed):**
1. Local state (useState)
2. Lifting state up to parent
3. Custom hooks for shared logic
4. Context for truly global state
5. External state manager (last resort)

---

## Code Readability

**Readability > cleverness > brevity**

- Use full words, not abbreviations (except: `id`, `url`, etc.)
- Extract complex conditions into named variables
- Add whitespace to group related logic
- If you need a comment to explain code, rewrite the code to be clearer
- Write as if explaining to a junior developer

---

## Error Handling

**Always handle errors gracefully:**
- Catch all async operation errors
- Show user-friendly messages
- Log technical errors to console
- Provide retry mechanisms
- Use error boundaries for unhandled errors

**States required:** Loading, Error, Empty, Success

---

## Git Commits

**Use conventional commits:**
```
feat: add user authentication flow
fix: correct form validation logic
refactor: extract API client into separate module
docs: update API documentation
test: add unit tests for utility functions
chore: update dependencies
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`

**Rules:**
- One logical change per commit
- Imperative mood ("add" not "added" or "adds")
- First line < 50 chars (summary)
- Blank line, then detailed explanation if needed
- Reference issue numbers when applicable (`fixes #123`)

---

## Summary

**Golden Rules:**
1. **KISS** - Keep it simple
2. **AHA** - Wait for 3 use cases before abstracting
3. **WET→DRY** - Write twice, then eliminate duplication
4. **Check existing first** - shadcn/ui, then project components
5. **Readability over brevity** - Clear names, explicit types
6. **Use design tokens** - Never hardcode colors
7. **No hardcoded colors** - Always use design tokens from `design-tokens.css`
8. **Services layer** - Abstract all API calls into service classes
9. **Remember:** Code is read 10x more than it's written. Optimize for the next developer (including future you).

---

**End of Development Guidelines**
