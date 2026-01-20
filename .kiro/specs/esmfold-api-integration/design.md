# Design Document

## Overview

This design integrates the Meta ESMFold API into FoldedHearts using TanStack Start's full SSR capabilities with TanStack Query. The architecture uses `prefetchQuery` in route loaders to fetch protein data on the server, automatic dehydration/hydration via `setupRouterSsrQueryIntegration`, and Nitro server functions to bypass CORS when calling the ESMFold API.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TanStack Start SSR Flow                       │
│                                                                  │
│  1. Request arrives at server                                    │
│  2. Route loader runs prefetchQuery (server-side)                │
│  3. Server function calls ESMFold API (no CORS)                  │
│  4. QueryClient populated with PDB data                          │
│  5. HTML rendered with dehydrated QueryClient state              │
│  6. Client hydrates - data available instantly!                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Server (Nitro)                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Route Loader (SSR)                          │    │
│  │  - prefetchQuery populates QueryClient                   │    │
│  │  - Calls server function for ESMFold                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         Server Function: foldProteinFn                   │    │
│  │  - createServerFn from @tanstack/react-start             │    │
│  │  - Calls ESMFold API (server-to-server, no CORS)         │    │
│  │  - Returns PDB data                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Meta ESM Atlas API                            │
│  POST https://api.esmatlas.com/foldSequence/v1/pdb/             │
│  Body: Raw amino acid sequence                                   │
│  Response: PDB format text                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  QueryClient hydrated from server state                  │    │
│  │  - useQuery returns cached data instantly                │    │
│  │  - No loading spinner on initial render!                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. QueryClient Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60, // 1 hour - proteins don't change
        gcTime: 1000 * 60 * 60 * 24, // 24 hours cache retention
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  })
}

// Query key factory for type-safe keys
export const foldProteinKeys = {
  all: ['foldProtein'] as const,
  sequence: (sequence: string) => ['foldProtein', sequence] as const,
}

// Query options factory for reuse in loader and component
export const foldProteinQueryOptions = (sequence: string) => ({
  queryKey: foldProteinKeys.sequence(sequence),
  queryFn: () => foldProteinFn({ data: sequence }),
  staleTime: 1000 * 60 * 60, // 1 hour
  enabled: !!sequence && sequence.length > 0,
})
```

### 2. Router with SSR Query Integration

```typescript
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { createQueryClient } from './lib/queryClient'

export const getRouter = () => {
  // QueryClient created per-request for SSR isolation
  const queryClient = createQueryClient()

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { queryClient },
  })

  // THE MAGIC - automatic dehydration/hydration
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    wrapQueryClient: false,
  })

  return router
}

// Type augmentation for router context
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
  interface RouterContext {
    queryClient: QueryClient
  }
}
```

### 3. Server Function for ESMFold API

```typescript
// src/api/foldProtein.ts
import { createServerFn } from '@tanstack/react-start'

export interface FoldProteinResult {
  pdb: string
  sequence: string
}

export const foldProteinFn = createServerFn({ method: 'POST' })
  .validator((sequence: string) => {
    if (!sequence || sequence.length === 0) {
      throw new Error('Sequence is required')
    }
    if (sequence.length > 400) {
      throw new Error('Sequence too long (max 400 amino acids)')
    }
    return sequence
  })
  .handler(async ({ data: sequence }): Promise<FoldProteinResult> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
      const response = await fetch(
        'https://api.esmatlas.com/foldSequence/v1/pdb/',
        {
          method: 'POST',
          body: sequence,
          headers: {
            'Content-Type': 'text/plain',
          },
          signal: controller.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`ESMFold API error: ${response.status}`)
      }

      const pdb = await response.text()
      return { pdb, sequence }
    } finally {
      clearTimeout(timeout)
    }
  })
```

### 4. Route with SSR Prefetch

```typescript
// src/routes/fold.$names.tsx (example route)
import { createFileRoute } from '@tanstack/react-router'
import { foldProteinQueryOptions } from '@/lib/queryClient'
import { createLoveSequence } from '@/utils/foldLogic'

export const Route = createFileRoute('/fold/$names')({
  loader: async ({ context, params }) => {
    const { queryClient } = context
    const [name1, name2] = params.names.split('-')
    const sequence = createLoveSequence(name1, name2)

    // prefetchQuery runs on SERVER during SSR
    await queryClient.prefetchQuery(foldProteinQueryOptions(sequence))

    return { name1, name2, sequence }
  },
  component: FoldRoute,
})
```

### 5. useFoldProtein Hook

```typescript
// src/hooks/useFoldProtein.ts
import { useQuery } from '@tanstack/react-query'
import { foldProteinQueryOptions } from '@/lib/queryClient'

export function useFoldProtein(sequence: string | undefined) {
  return useQuery({
    ...foldProteinQueryOptions(sequence ?? ''),
    enabled: !!sequence && sequence.length > 0,
  })
}
```

### 6. PDB Validator

```typescript
// src/utils/pdbValidator.ts
export interface PDBValidationResult {
  isValid: boolean
  error?: string
}

export function validatePDB(pdbText: string): PDBValidationResult {
  if (!pdbText || pdbText.trim().length === 0) {
    return { isValid: false, error: 'PDB data is empty' }
  }

  // Check for required PDB records
  const hasAtomRecords = /^ATOM\s+/m.test(pdbText)
  
  if (!hasAtomRecords) {
    return { isValid: false, error: 'PDB missing ATOM records' }
  }

  return { isValid: true }
}
```

## Data Models

### FoldProteinResult

```typescript
interface FoldProteinResult {
  pdb: string        // Raw PDB text for 3Dmol.js
  sequence: string   // Original sequence (for cache key verification)
}
```

### FoldError

```typescript
interface FoldError {
  message: string
  code: 'INVALID_SEQUENCE' | 'SEQUENCE_TOO_LONG' | 'ESMATLAS_ERROR' | 'TIMEOUT' | 'NETWORK_ERROR' | 'INVALID_PDB'
  retryable: boolean
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cache Hit Returns Cached Data

*For any* valid amino acid sequence that has been successfully fetched, requesting the same sequence again SHALL return the cached PDB data without making a new API request.

**Validates: Requirements 1.4, 3.3**

### Property 2: Server Function Passthrough Integrity

*For any* valid sequence sent to the server function, it SHALL forward to ESMFold and return the PDB response unchanged (data integrity preserved).

**Validates: Requirements 2.2, 2.3**

### Property 3: Server Function Error Transformation

*For any* error response from the ESMFold API, the server function SHALL throw an error with a descriptive message.

**Validates: Requirements 2.4**

### Property 4: Hook State Shape

*For any* sequence input (valid, invalid, or undefined), the `useFoldProtein` hook SHALL return an object containing `data`, `isLoading`, `isError`, and `error` properties.

**Validates: Requirements 3.2**

### Property 5: Invalid Input Rejection

*For any* empty string or undefined sequence, the hook SHALL NOT trigger an API request and SHALL return an idle state.

**Validates: Requirements 3.5**

### Property 6: Cache Persistence on Error

*For any* error that occurs during a fetch, previously cached successful results for other sequences SHALL remain accessible and unchanged.

**Validates: Requirements 4.4**

### Property 7: PDB Validation Success

*For any* valid PDB text containing ATOM records, the validator SHALL return `{ isValid: true }`.

**Validates: Requirements 5.1**

### Property 8: PDB Validation Failure

*For any* malformed or empty PDB text, the validator SHALL return `{ isValid: false, error: <description> }`.

**Validates: Requirements 5.3**

## Error Handling

### Server Function Errors

| Error Type | Detection | Thrown Error |
|------------|-----------|--------------|
| Empty sequence | Validator | "Sequence is required" |
| Sequence too long | Validator | "Sequence too long (max 400 amino acids)" |
| ESMFold 4xx | Response status | "ESMFold API error: {status}" |
| ESMFold 5xx | Response status | "ESMFold API error: {status}" |
| Timeout | AbortController | "AbortError" |

### Client-Side Error Display

| Error Type | User Message | Action |
|------------|--------------|--------|
| Network unreachable | "Unable to connect. Check your internet connection." | Show retry button |
| Timeout | "Folding is taking longer than expected. Try again?" | Show retry button |
| Sequence too long | "Names are too long! Try shorter names or nicknames." | Highlight input |
| ESMFold error | "The folding service is having issues. Please try again." | Show retry button |

## Testing Strategy

### Unit Tests

- **PDB Validator**: Test with valid PDB samples, malformed data, empty strings
- **Server Function**: Test validation logic, error handling (mocked fetch)
- **Query Options Factory**: Test key generation, enabled logic

### Property-Based Tests

Using `fast-check` for property-based testing:

1. **Cache Hit Property**: Generate random valid sequences, fetch twice, verify second fetch uses cache
2. **Invalid Input Rejection**: Generate empty/whitespace strings, verify no API calls
3. **PDB Validation**: Generate valid/invalid PDB-like strings, verify correct validation results
4. **Hook State Shape**: Generate various inputs, verify return object always has required properties

### Integration Tests

- **Server Function**: Test with real ESMFold API (limited runs to avoid rate limiting)
- **SSR Flow**: Test that prefetchQuery populates cache before hydration

### Test Configuration

```typescript
// Property tests should run minimum 100 iterations
// Tag format: Feature: esmfold-api-integration, Property N: <property_text>
```
