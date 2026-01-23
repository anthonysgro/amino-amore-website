# Design Document: Homepage Hero

## Overview

This design document outlines the implementation of the FoldedHearts homepage hero section and navigation header. The design follows the established patterns from the codebase while introducing a romantic, science-themed visual identity using the existing Tailwind CSS setup with the romantic color palette (pinks, reds, purples) already defined in the CSS variables.

The implementation will create reusable, composable components that can be extended for future landing page sections while maintaining accessibility and responsive design principles.

## Architecture

The homepage hero feature follows a component-based architecture with clear separation of concerns:

```
src/
├── components/
│   ├── landing/
│   │   ├── Navigation.tsx      # Header with brand, nav links, CTA
│   │   ├── HeroSection.tsx     # Main hero with headline, visual, CTA
│   │   ├── MobileNav.tsx       # Mobile navigation overlay
│   │   └── Section.tsx         # Reusable section wrapper
│   └── ui/
│       └── (existing shadcn components)
├── routes/
│   └── index.tsx               # Homepage route using landing components
└── styles.css                  # Existing styles with romantic palette
```

### Design Decisions

1. **Motion Library**: Use `motion/react` (Framer Motion) for animations - it's lightweight and provides excellent reduced-motion support
2. **Component Composition**: Follow the template pattern with separate Navigation, HeroSection, and MobileNav components
3. **CSS Variables**: Leverage existing `--primary`, `--chart-*` variables which already use the romantic pink/red/purple palette
4. **Responsive Strategy**: Mobile-first with breakpoints at `lg` (1024px) for desktop layouts

## Components and Interfaces

### Navigation Component

```typescript
interface NavigationProps {
  className?: string
}

interface NavItem {
  label: string
  href: string
}
```

The Navigation component renders a sticky header with:

- Brand mark (logo + "FoldedHearts" text) on the left
- Center navigation links (desktop only)
- Primary CTA button + hamburger menu on the right
- Backdrop blur effect for visual polish

### HeroSection Component

```typescript
interface HeroSectionProps extends React.ComponentProps<'section'> {
  className?: string
}
```

The HeroSection component renders:

- Large headline with romantic messaging
- Subheadline explaining the value proposition
- Primary CTA button linking to the fold experience
- Visual element (decorative protein/heart imagery)
- Entrance animations with reduced-motion support

### MobileNav Component

```typescript
interface MobileNavProps {
  items: NavItem[]
  className?: string
}
```

The MobileNav component provides:

- Hamburger menu trigger button
- Full-screen overlay using Sheet component
- Navigation links with smooth scroll behavior
- Keyboard accessibility and focus management

### Section Component

```typescript
interface SectionProps extends React.ComponentProps<'section'> {
  className?: string
  children: React.ReactNode
}
```

A reusable wrapper providing consistent padding and max-width constraints.

## Data Models

### Navigation Items

```typescript
const navItems: NavItem[] = [
  { label: 'Home', href: '#' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
]
```

### Animation Variants

```typescript
const heroTextVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const heroVisualVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 },
  },
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Animation Duration Bounds

_For any_ animation variant defined in the hero section, the duration value should be between 300ms and 500ms (0.3 to 0.5 seconds).

**Validates: Requirements 4.3**

### Property 2: Reduced Motion Respect

_For any_ user with reduced motion preferences enabled (useReducedMotion returns true), the hero section should render without motion animations applied to its elements.

**Validates: Requirements 4.4**

### Property 3: Mobile Navigation Completeness

_For any_ set of navigation items defined for the landing page, all items should be present and accessible in the mobile navigation overlay.

**Validates: Requirements 5.2**

### Property 4: Interactive Element Focus Indicators

_For any_ interactive element (buttons, links) in the Navigation and HeroSection components, the element should have focus-visible CSS classes that provide visible focus indicators.

**Validates: Requirements 6.3**

## Error Handling

### Missing Assets

- If hero visual images fail to load, display a fallback gradient background
- Use CSS background-image with fallback colors

### Animation Failures

- If motion library fails to load, components render without animations
- Reduced motion preference is checked before applying any animations

### Navigation Errors

- Smooth scroll gracefully degrades to instant scroll if not supported
- Hash links work even if JavaScript fails (native browser behavior)

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

- Navigation renders with correct structure and elements
- HeroSection renders headline, subheadline, and CTA
- Mobile navigation opens and closes correctly
- Smooth scroll handler is called on brand mark click
- Correct CSS classes are applied for responsive breakpoints

### Property-Based Tests

Property-based tests will verify universal properties using `fast-check`:

1. **Animation Duration Property**: Generate random animation variant objects and verify all duration values fall within 300-500ms range
2. **Reduced Motion Property**: Test that when reduced motion is enabled, motion components render as static divs
3. **Mobile Nav Completeness Property**: Generate random sets of nav items and verify all appear in mobile overlay
4. **Focus Indicator Property**: Query all interactive elements and verify each has focus-visible classes

### Testing Configuration

- Use Vitest as the test runner (already configured in project)
- Use `@testing-library/react` for component testing
- Use `fast-check` for property-based testing
- Minimum 100 iterations per property test
- Tag format: **Feature: homepage-hero, Property {number}: {property_text}**
