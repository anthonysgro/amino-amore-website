# Requirements Document

## Introduction

This feature enhances the FoldedHearts protein folding logic to generate more visually unique and structurally diverse "Love Proteins" for each couple. Currently, many name combinations produce similar-looking straight tube structures. This enhancement introduces three strategies: Structural Anchors (bulky motifs), Cysteine Bridges (disulfide bonds), and pLDDT-based coloring to make each protein truly one-of-a-kind.

## Glossary

- **Fold_Logic**: The module responsible for converting names into amino acid sequences
- **Structural_Anchor**: A bulky, stiff amino acid motif (like WPHWP) inserted between names to force angular folding
- **Cysteine_Bridge**: A disulfide bond formed between two Cysteine (C) residues that can create loop or circular structures
- **pLDDT_Score**: Per-residue confidence score (0-100) from ESMFold indicating prediction reliability
- **B_Factor**: The field in PDB files where pLDDT scores are stored for visualization
- **Linker_Strategy**: The method used to connect two name sequences (flexible, anchor, or cysteine)
- **Protein_Viewer**: The 3Dmol.js-based component that renders the 3D protein structure

## Requirements

### Requirement 1: Configurable Linker Strategies

**User Story:** As a user, I want different linker options between names, so that my Love Protein has a unique structural shape.

#### Acceptance Criteria

1. THE Fold_Logic SHALL support a "flexible" linker strategy using the GGSGGS motif
2. THE Fold_Logic SHALL support an "anchor" linker strategy using the WPHWP motif
3. THE Fold_Logic SHALL support a "cysteine" linker strategy that adds C at the start of name1 and end of name2
4. WHEN the "cysteine" strategy is selected, THE Fold_Logic SHALL prepend C to the first name sequence and append C to the second name sequence
5. THE Fold_Logic SHALL default to the "anchor" strategy when no strategy is specified
6. FOR ALL valid name pairs and linker strategies, THE Fold_Logic SHALL produce a valid amino acid sequence containing only standard amino acid letters

### Requirement 2: Cysteine Bridge Formation

**User Story:** As a user, I want my Love Protein to potentially form a "True Love Bond" loop, so that the protein creates a circular or heart-like shape.

#### Acceptance Criteria

1. WHEN the cysteine strategy is used, THE Fold_Logic SHALL place Cysteine residues at positions that encourage disulfide bridge formation
2. THE Fold_Logic SHALL ensure the sequence structure is: C + [Name1_Sequence] + [Linker] + [Name2_Sequence] + C
3. FOR ALL cysteine-strategy sequences, THE sequence SHALL start with C and end with C

### Requirement 3: pLDDT Confidence Coloring

**User Story:** As a user, I want my Love Protein colored by folding confidence, so that each protein has a unique "heat map" appearance.

#### Acceptance Criteria

1. THE Protein_Viewer SHALL support coloring by B-factor (pLDDT scores)
2. WHEN pLDDT coloring is enabled, THE Protein_Viewer SHALL display high confidence regions (pLDDT > 70) in a bright color
3. WHEN pLDDT coloring is enabled, THE Protein_Viewer SHALL display low confidence regions (pLDDT < 50) in a contrasting color
4. THE Protein_Viewer SHALL use a romantic color palette (pinks, reds, purples) for the confidence gradient
5. THE Protein_Viewer SHALL provide a toggle to switch between uniform coloring and pLDDT coloring

### Requirement 4: Sequence Validation

**User Story:** As a developer, I want robust sequence validation, so that invalid inputs are handled gracefully.

#### Acceptance Criteria

1. WHEN a name contains non-alphabetic characters, THE Fold_Logic SHALL filter them out and continue processing
2. WHEN a name produces an empty sequence, THE Fold_Logic SHALL substitute a default filler sequence (AAA)
3. THE Fold_Logic SHALL enforce the ESMFold maximum sequence length of 400 amino acids
4. IF the combined sequence exceeds 400 characters, THEN THE Fold_Logic SHALL return an error with a descriptive message
5. FOR ALL valid inputs, THE Fold_Logic SHALL produce a sequence between 1 and 400 characters

### Requirement 5: Linker Strategy Selection UI

**User Story:** As a user, I want to choose my linker strategy from the interface, so that I can experiment with different protein shapes.

#### Acceptance Criteria

1. THE User_Interface SHALL display linker strategy options before folding
2. THE User_Interface SHALL show descriptive names for each strategy: "Flexible Bond", "Structural Anchor", "True Love Bond"
3. WHEN a user selects a strategy, THE User_Interface SHALL pass the selection to the Fold_Logic
4. THE User_Interface SHALL display a brief explanation of what each strategy does
