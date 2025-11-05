# Propalyst Color System

This document explains the centralized color theming system for the Propalyst application.

## Color Tokens

All colors are defined as CSS custom properties in `app/globals.css` and mapped to Tailwind utility classes via `tailwind.config.ts`.

### Brand Colors

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `--primary` | `#E6D3AF` | `39 48% 80%` | Main brand color (beige-gold), buttons, bot avatars |
| `--accent` | `#E46F61` | `6 69% 64%` | Interactive controls (coral-red), slider, CTAs |
| `--secondary` | `#D4C5B0` | `38 32% 75%` | User message bubbles (light beige) |

### Neutral Colors

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `--background` | `#FFFFFF` | `0 0% 100%` | Page background |
| `--foreground` | `#333333` | `0 0% 20%` | Main text color |
| `--muted` | `#F5F5F5` | `0 0% 96%` | Bot message bubbles, subtle backgrounds |
| `--muted-foreground` | `#737373` | `0 0% 45%` | Secondary text, labels |

## Usage in Components

### Using Tailwind Classes (Preferred)

```tsx
// ✅ CORRECT: Use semantic Tailwind classes
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click Me
</Button>

<div className="bg-accent text-accent-foreground">
  Interactive element
</div>

<div className="bg-secondary text-secondary-foreground">
  User message
</div>

<div className="bg-muted text-muted-foreground">
  Bot message
</div>
```

### Using CSS Variables (Alternative)

```tsx
// ✅ ACCEPTABLE: Direct CSS variable usage
<div style={{ color: 'hsl(var(--primary))' }}>
  Primary colored text
</div>
```

### What NOT to Do

```tsx
// ❌ WRONG: Never hardcode hex colors
<Button className="bg-[#E6D3AF]">Click Me</Button>

// ❌ WRONG: Never hardcode colors in style prop
<div style={{ backgroundColor: '#E46F61' }}>Content</div>
```

## Component Examples

### Buttons
```tsx
// Primary button
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Submit
</Button>

// Accent button (CTA)
<Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
  Get Started
</Button>
```

### Chat Messages
```tsx
// Bot message
<div className="bg-muted text-foreground">
  Bot response
</div>

// User message
<div className="bg-secondary text-secondary-foreground">
  User input
</div>
```

### Avatars
```tsx
// Bot avatar
<div className="bg-primary text-primary-foreground">
  <Bot />
</div>

// User avatar
<div className="bg-gray-600 text-white">
  <User />
</div>
```

### Interactive Controls
```tsx
// Slider (uses accent color)
<SliderPrimitive.Range className="bg-accent" />
<SliderPrimitive.Thumb className="border-accent" />
```

## Modifying Colors

To change the color scheme:

1. Open `frontend/app/globals.css`
2. Update the HSL values in the `:root` section
3. All components will automatically reflect the changes

### Converting Hex to HSL

Use this formula or an online tool:
- `#E6D3AF` → `39 48% 80%` (H=39°, S=48%, L=80%)
- `#E46F61` → `6 69% 64%` (H=6°, S=69%, L=64%)

Note: Tailwind CSS variables omit the `hsl()` wrapper, using only the values.

## Benefits

✅ **Single source of truth** - All colors defined in one place
✅ **Easy theme switching** - Change CSS variables, not component code
✅ **Consistent design** - All components use the same color tokens
✅ **No magic values** - Semantic naming makes intent clear
✅ **Type-safe** - Tailwind provides autocomplete for color classes

## File Locations

- **CSS Variables**: `frontend/app/globals.css`
- **Tailwind Config**: `frontend/tailwind.config.ts`
- **Component Usage**: All `.tsx` files in `frontend/components/`

## Related Documentation

- [CLAUDE.md](../../../CLAUDE.md) - Development guidelines (styling section)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs/customizing-colors)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
