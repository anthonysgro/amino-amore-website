# Requirements Document

## Introduction

ESMFold API integration for FoldedHearts - enabling protein structure prediction from amino acid sequences. This feature calls the Meta ESM Atlas API to fold "Love Protein" sequences into 3D structures (PDB format). The integration uses TanStack Query for data fetching, caching, and state management, with an AWS Amplify serverless function as a proxy to bypass browser CORS restrictions.

## Glossary

- **ESMFold_API**: Meta's ESM Atlas protein folding API at `https://api.esmatlas.com/foldSequence/v1/pdb/`
- **PDB_Data**: Protein Data Bank format text describing 3D molecular structure
- **TanStack_Query**: Data fetching and caching library (formerly React Query)
- **Proxy_Function**: AWS Amplify serverless function that forwards requests to ESMFold API
- **Love_Sequence**: Amino acid sequence generated from two names using the existing foldLogic

## Requirements

### Requirement 1: TanStack Query Setup

**User Story:** As a developer, I want TanStack Query configured in the application, so that I can manage API state with caching and automatic refetching.

#### Acceptance Criteria

1. THE Application SHALL include @tanstack/react-query as a dependency
2. THE Application SHALL wrap the root component with QueryClientProvider
3. THE QueryClient SHALL be configured with appropriate default options for caching
4. THE QueryClient SHALL cache successful fold results to avoid redundant API calls

### Requirement 2: Amplify Proxy Function

**User Story:** As a user, I want the protein folding to work without CORS errors, so that I can see my Love Protein without technical issues.

#### Acceptance Criteria

1. THE Project SHALL include an Amplify serverless function at `amplify/functions/fold-protein/`
2. WHEN the Proxy_Function receives a sequence, THE Proxy_Function SHALL forward it to the ESMFold_API
3. WHEN the ESMFold_API returns PDB_Data, THE Proxy_Function SHALL return it to the client
4. IF the ESMFold_API returns an error, THEN THE Proxy_Function SHALL return a descriptive error response
5. THE Proxy_Function SHALL set appropriate CORS headers for browser requests

### Requirement 3: Fold Protein Hook

**User Story:** As a developer, I want a React hook to fetch protein structures, so that I can easily integrate folding into any component.

#### Acceptance Criteria

1. THE Application SHALL provide a `useFoldProtein` hook
2. WHEN the hook is called with a Love_Sequence, THE hook SHALL return loading, error, and data states
3. WHEN the same sequence is requested again, THE hook SHALL return cached data without re-fetching
4. THE hook SHALL provide a mutation function for on-demand folding
5. IF the sequence is invalid or empty, THEN THE hook SHALL not make an API request

### Requirement 4: Error Handling

**User Story:** As a user, I want clear feedback when folding fails, so that I understand what went wrong and can try again.

#### Acceptance Criteria

1. IF the Proxy_Function is unreachable, THEN THE Application SHALL display a network error message
2. IF the ESMFold_API times out, THEN THE Application SHALL display a timeout message with retry option
3. IF the sequence is too long for ESMFold, THEN THE Application SHALL display a sequence length error
4. WHEN an error occurs, THE Application SHALL preserve any previously cached successful results

### Requirement 5: API Response Handling

**User Story:** As a developer, I want the PDB response properly parsed and validated, so that I can safely pass it to the 3D viewer.

#### Acceptance Criteria

1. WHEN PDB_Data is received, THE Application SHALL validate it contains required PDB headers
2. THE Application SHALL store the raw PDB text for the 3D visualization library
3. IF the PDB_Data is malformed, THEN THE Application SHALL return a parsing error
