# Requirements Document

## Introduction

Client-only 3D protein visualization component for FoldedHearts. This feature renders the "Love Protein" PDB data as an interactive 3D model using 3Dmol.js, with romantic styling (pinks, reds, purples) and user controls for rotation, screenshots, and annotations. The component must be SSR-safe, loading only in the browser to avoid `window is not defined` errors.

## Glossary

- **ProteinViewer**: React component that renders 3D protein structures from PDB data
- **3Dmol_Viewer**: The 3Dmol.js WebGL-based molecular visualization library instance
- **PDB_Data**: Protein Data Bank format text describing 3D molecular structure
- **Cartoon_Style**: Ribbon diagram representation showing protein secondary structure
- **pLDDT_Score**: Per-residue confidence score from ESMFold (0-100 scale)
- **SSR_Safe**: Code that only executes in browser environment, not during server-side rendering

## Requirements

### Requirement 1: SSR-Safe Component Loading

**User Story:** As a developer, I want the 3D viewer to load only in the browser, so that the TanStack Start SSR build doesn't crash with WebGL errors.

#### Acceptance Criteria

1. WHEN the component is imported, THE ProteinViewer SHALL NOT reference `window` or WebGL at module level
2. WHEN rendering on the server, THE ProteinViewer SHALL render a placeholder container without initializing 3Dmol
3. WHEN rendering in the browser, THE ProteinViewer SHALL dynamically import 3Dmol.js and initialize the viewer
4. IF `typeof window === 'undefined'`, THEN THE ProteinViewer SHALL skip all 3Dmol initialization code

### Requirement 2: PDB Data Rendering

**User Story:** As a user, I want to see my Love Protein as a beautiful 3D model, so that I can visualize the unique structure created from our names.

#### Acceptance Criteria

1. WHEN valid PDB_Data is provided, THE ProteinViewer SHALL parse and display the protein structure
2. THE ProteinViewer SHALL use cartoon (ribbon) style for the protein representation
3. THE ProteinViewer SHALL apply a romantic color palette (spectrum, pink, or confidence-based coloring)
4. WHEN the viewer initializes, THE ProteinViewer SHALL automatically zoom to fit the protein in view
5. WHEN PDB_Data changes, THE ProteinViewer SHALL clear the previous model and render the new one

### Requirement 3: Interactive Controls

**User Story:** As a user, I want to interact with my Love Protein, so that I can explore it from different angles and share it with my partner.

#### Acceptance Criteria

1. THE ProteinViewer SHALL support mouse/touch rotation of the 3D model
2. THE ProteinViewer SHALL support zoom in/out via scroll or pinch gestures
3. THE ProteinViewer SHALL provide a toggle button to start/stop automatic rotation (spin)
4. THE ProteinViewer SHALL provide a screenshot button that downloads the current view as PNG
5. WHEN the spin toggle is activated, THE ProteinViewer SHALL rotate the model continuously around the Y-axis

### Requirement 4: Couple Name Annotations

**User Story:** As a user, I want to see our names displayed on the Love Protein, so that it feels personal and shareable.

#### Acceptance Criteria

1. WHEN couple names are provided, THE ProteinViewer SHALL display them as 3D labels near the protein
2. THE labels SHALL use a romantic font style and color that matches the overall aesthetic
3. THE labels SHALL remain readable as the protein rotates

### Requirement 5: Loading and Error States

**User Story:** As a user, I want clear feedback while the protein loads or if something goes wrong, so that I know what's happening.

#### Acceptance Criteria

1. WHILE PDB_Data is loading, THE ProteinViewer SHALL display a loading skeleton or spinner
2. IF PDB_Data is empty or invalid, THEN THE ProteinViewer SHALL display an error message
3. IF 3Dmol fails to initialize, THEN THE ProteinViewer SHALL display a fallback message about WebGL support

### Requirement 6: Visual Styling

**User Story:** As a user, I want the protein viewer to look beautiful and romantic, so that it matches the FoldedHearts brand.

#### Acceptance Criteria

1. THE ProteinViewer container SHALL have a soft, romantic background (transparent or subtle gradient)
2. THE ProteinViewer SHALL have rounded corners and subtle shadow for a polished look
3. THE control buttons SHALL use the FoldedHearts design system (soft pinks, rounded buttons)
4. THE ProteinViewer SHALL be responsive and work on mobile devices
