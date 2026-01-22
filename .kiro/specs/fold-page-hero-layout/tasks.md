# Implementation Plan: Fold Page Hero Layout

## Overview

This implementation reorganizes the fold page to make the 3D protein viewer the visual hero. The changes are primarily layout and styling modifications to the existing components.

## Tasks

- [x] 1. Update ProteinViewer component sizing
  - Increase minimum height values in container styles
  - Update responsive breakpoints for hero sizing
  - Ensure the viewer canvas scales properly with new dimensions
  - _Requirements: 1.2, 1.3, 4.1_

- [x] 2. Restructure fold page layout
  - [x] 2.1 Create compact names header section
    - Replace the Names Card with a compact centered header
    - Display names with heart icon in a single line
    - Show amino acid sequence as a subtle badge below
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 2.2 Reorder page elements for hero layout
    - Move Protein Viewer section above Strategy Selector
    - Remove the Card wrapper from the names section for compactness
    - Ensure proper spacing between sections
    - _Requirements: 1.1, 1.4, 3.1_
  
  - [x] 2.3 Update Strategy Selector positioning
    - Position below the Protein Viewer hero section
    - Maintain existing functionality and styling
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Verify responsive behavior
  - Test layout on mobile viewports (400px min-height for viewer)
  - Test layout on desktop viewports (500px+ min-height for viewer)
  - Ensure romantic gradient aesthetic is maintained
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4. Checkpoint - Verify all layout changes
  - Ensure all tests pass, ask the user if questions arise.
