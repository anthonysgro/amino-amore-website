# Requirements Document

## Introduction

This feature enhances the fold page layout to make the 3D protein viewer the visual hero of the page. Currently, the protein viewer is positioned below the names card and strategy selector, making it less prominent. The goal is to reorganize the layout so users see their Love Protein immediately as the centerpiece of the experience.

## Glossary

- **Fold_Page**: The route at `/fold/$names` that displays the folded Love Protein for a couple
- **Protein_Viewer**: The 3D WebGL-based component that renders the folded protein structure
- **Names_Card**: The UI card displaying the couple's names with a heart and the amino acid sequence
- **Strategy_Selector**: The UI component allowing users to choose different linker strategies
- **Hero_Section**: The primary visual element that dominates the viewport and captures user attention

## Requirements

### Requirement 1: Protein Viewer as Page Hero

**User Story:** As a user viewing my Love Protein, I want the 3D protein structure to be the first and most prominent thing I see, so that I experience the "wow moment" immediately.

#### Acceptance Criteria

1. WHEN the fold page loads, THE Fold_Page SHALL display the Protein_Viewer as the dominant visual element
2. THE Protein_Viewer SHALL occupy a minimum height of 500px on desktop viewports
3. THE Protein_Viewer SHALL occupy a minimum height of 400px on mobile viewports
4. THE Protein_Viewer SHALL be positioned above the Strategy_Selector in the visual hierarchy

### Requirement 2: Compact Names Display

**User Story:** As a user, I want to see my names and the heart displayed elegantly without taking excessive vertical space, so that the protein viewer remains the focus.

#### Acceptance Criteria

1. THE Names_Card SHALL display the couple's names with a heart icon in a compact header format
2. THE Names_Card SHALL be positioned above the Protein_Viewer as a title element
3. WHEN displaying the amino acid sequence, THE Names_Card SHALL show it as a subtle badge below the names
4. THE Names_Card SHALL NOT exceed 120px in total height on desktop viewports

### Requirement 3: Secondary Controls Placement

**User Story:** As a user, I want to access the strategy selector and other controls without them interfering with my view of the protein, so that I can customize my experience when desired.

#### Acceptance Criteria

1. THE Strategy_Selector SHALL be positioned below the Protein_Viewer
2. THE Strategy_Selector SHALL be visually de-emphasized compared to the Protein_Viewer
3. WHEN the user scrolls, THE Strategy_Selector SHALL remain accessible below the hero section

### Requirement 4: Responsive Hero Layout

**User Story:** As a user on any device, I want the protein viewer to scale appropriately while remaining the visual hero, so that I have a great experience regardless of screen size.

#### Acceptance Criteria

1. THE Protein_Viewer SHALL scale responsively while maintaining its hero prominence
2. WHEN viewed on mobile devices, THE Fold_Page SHALL stack elements vertically with the Protein_Viewer as the largest element
3. THE Fold_Page SHALL maintain the romantic pink/purple gradient aesthetic throughout the layout
