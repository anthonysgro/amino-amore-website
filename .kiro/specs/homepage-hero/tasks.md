# Implementation Plan: Homepage Hero

## Overview

This plan implements the FoldedHearts homepage hero section and navigation header following the component-based architecture defined in the design. Tasks are ordered to build foundational components first, then compose them into the final landing page experience.

## Tasks

- [x] 1. Install motion library and set up landing components directory
  - Install `motion` package for animations
  - Create `src/components/landing/` directory structure
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Create Section wrapper component
  - [x] 2.1 Implement Section component with consistent padding and max-width
    - Create `src/components/landing/Section.tsx`
    - Add responsive padding (px-6 md:px-10 lg:px-16)
    - Add max-width constraint with mx-auto
    - _Requirements: 2.5, 2.6_

- [x] 3. Create Navigation component
  - [x] 3.1 Implement Navigation header with brand mark and sticky positioning
    - Create `src/components/landing/Navigation.tsx`
    - Add sticky positioning with backdrop blur
    - Implement brand mark with FoldedHearts name
    - Add smooth scroll to top on brand click
    - _Requirements: 1.1, 1.2, 1.3, 1.7_

  - [x] 3.2 Add desktop navigation links and CTA button
    - Add center navigation links (hidden on mobile)
    - Add primary CTA button with romantic palette colors
    - _Requirements: 1.5, 1.6, 3.4_

  - [x] 3.3 Implement MobileNav component with Sheet overlay
    - Create `src/components/landing/MobileNav.tsx`
    - Add hamburger menu trigger with 44px touch target
    - Implement full-screen Sheet overlay
    - Add all navigation items plus CTA
    - Handle link clicks to close overlay
    - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 3.4 Write property test for mobile navigation completeness
    - **Property 3: Mobile Navigation Completeness**
    - **Validates: Requirements 5.2**

- [-] 4. Create HeroSection component
  - [x] 4.1 Implement hero layout with headline, subheadline, and CTA
    - Create `src/components/landing/HeroSection.tsx`
    - Add large h1 headline with romantic messaging
    - Add subheadline paragraph explaining value proposition
    - Add primary CTA button linking to fold experience
    - Use min-h-[calc(100vh-5rem)] for full viewport height
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 6.2_

  - [x] 4.2 Add responsive asymmetric layout
    - Implement grid layout for desktop (text left, visual right or vice versa)
    - Stack vertically on mobile (text above visual)
    - _Requirements: 2.5, 2.6_

  - [x] 4.3 Add hero visual element
    - Add decorative visual (protein/heart imagery or gradient placeholder)
    - Apply soft shadows and romantic styling
    - Include appropriate alt text for images
    - _Requirements: 2.4, 3.1, 3.3, 3.5, 6.5_

  - [x] 4.4 Implement entrance animations with reduced motion support
    - Add motion variants for text (fade + slide)
    - Add motion variants for visual (fade + scale)
    - Use useReducedMotion hook to disable animations when preferred
    - Ensure durations are 300-500ms with ease-out easing
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 4.5 Write property test for animation duration bounds
    - **Property 1: Animation Duration Bounds**
    - **Validates: Requirements 4.3**

  - [ ]* 4.6 Write property test for reduced motion respect
    - **Property 2: Reduced Motion Respect**
    - **Validates: Requirements 4.4**

- [x] 5. Ensure accessibility compliance
  - [x] 5.1 Add semantic HTML and ARIA labels
    - Use semantic elements (header, nav, main, section)
    - Add aria-labels to navigation and interactive elements
    - Ensure proper heading hierarchy
    - _Requirements: 6.1, 6.2_

  - [x] 5.2 Add focus indicators to all interactive elements
    - Add focus-visible classes to buttons and links
    - Ensure keyboard navigation works correctly
    - _Requirements: 6.3, 4.5_

  - [ ]* 5.3 Write property test for focus indicators
    - **Property 4: Interactive Element Focus Indicators**
    - **Validates: Requirements 6.3**

- [x] 6. Wire up homepage route
  - [x] 6.1 Update index.tsx to use landing components
    - Import Navigation and HeroSection
    - Compose into homepage layout
    - _Requirements: All_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- The romantic palette colors are already defined in CSS variables (--primary, --chart-*)
- Motion library provides useReducedMotion hook for accessibility
