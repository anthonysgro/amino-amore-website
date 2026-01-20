# Design Document

## Overview

This design integrates the Meta ESMFold API into FoldedHearts using TanStack Query for state management and an AWS Amplify serverless function as a CORS proxy. The architecture uses TanStack Query's `useQuery` for automatic caching, deduplication, and background refetching, with the Amplify Lambda handling the server-side ESMFold call to bypass CORS.

### SSR Consideration

True SSR with `prefetchQuery`/`dehydrate`/`hydrate` requires a server-rendering framework (Next.js, Remix). Since this is a Vite SPA on Amplify static hosting, we use the **proxy + client-side caching** pattern instead:

- **Proxy Lambda**: Server-to-server call bypasses CORS (the main goal)
- **TanStack Query Cache**: Aggressive caching makes repeat requests instant
- **Persistence (Optional)**: Can add `persistQueryClient` to localStorage for cross-session caching

This achieves the same user experience (fast, no CORS errors) without requiring SSR infrastructure changes.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│  ┌──────────────┐    ┌─────────────────┐    ┌────────────────┐  │
│  │  React App   │───▶│  useFoldProtein │───▶│  QueryClient   │  │
│  │  Components  │◀───│   (useQuery)    │◀───│    (Cache)     │  │
│  └──────────────┘    └─────────────────┘    └────────────────┘  │
│                                                      │           │
│  Query Flow:                                         │           │
│  1. useQuery checks cache first                      │           │
│  2. If miss, fetches from proxy                      │           │
│  3. Caches result (1hr stale, 24hr gc)               │           │
│  4. Subsequent requests return cached data           │           │
└──────────────────────────────────────────────────────│───────────┘
                                                       │
                                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS Amplify (Server)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              /api/fold-protein (Lambda)                  │    │
│  │  - Receives sequence from client                         │    │
│  │  - Forwards to ESMFold API (server-to-server, no CORS)   │    │
│  │  - Returns PDB data with CORS headers for browser        │    │
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
```

## Components and Interfaces

### 1. QueryClient Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour - proteins don't change
      gcTime: 1000 * 60 * 60 * 24, // 24 hours cache retention
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})
```

### 1b. QueryClientProvider Setup

```typescript
// src/main.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

### 1c. Optional: Persist Cache to LocalStorage

For cross-session caching (so "Romeo + Juliet" is instant even after browser restart):

```typescript
// src/lib/queryClient.ts
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'folded-hearts-cache',
})

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
})
```

### 2. Amplify Proxy Function

```typescript
// amplify/functions/fold-protein/handler.ts
interface FoldRequest {
  sequence: string
}

interface FoldResponse {
  pdb: string
}

interface ErrorResponse {
  error: string
  code: 'INVALID_SEQUENCE' | 'ESMATLAS_ERROR' | 'TIMEOUT' | 'NETWORK_ERROR'
}

// Handler forwards sequence to ESMFold and returns PDB
export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse>
```

### 3. API Client

```typescript
// src/api/foldProtein.ts
export interface FoldProteinResult {
  pdb: string
  sequence: string
}

export async function foldProtein(sequence: string): Promise<FoldProteinResult>
```

### 4. useFoldProtein Hook

```typescript
// src/hooks/useFoldProtein.ts
import { useQuery } from '@tanstack/react-query'
import { foldProtein, FoldProteinResult } from '../api/foldProtein'

export interface UseFoldProteinOptions {
  enabled?: boolean
}

export interface UseFoldProteinResult {
  data: FoldProteinResult | undefined
  isLoading: boolean
  isPending: boolean
  isFetching: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useFoldProtein(
  sequence: string | undefined,
  options?: UseFoldProteinOptions
): UseFoldProteinResult {
  const query = useQuery({
    queryKey: ['foldProtein', sequence],
    queryFn: () => foldProtein(sequence!),
    enabled: !!sequence && sequence.length > 0 && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
```

**Key TanStack Query Features Used:**
- `queryKey: ['foldProtein', sequence]` - Unique cache key per sequence
- `enabled` - Prevents fetch for empty/invalid sequences
- `staleTime` - Data considered fresh for 1 hour (no background refetch)
- Automatic deduplication - Multiple components using same sequence share one request
- Automatic caching - Second request for same sequence returns cached data instantly

### 5. PDB Validator

```typescript
// src/utils/pdbValidator.ts
export interface PDBValidationResult {
  isValid: boolean
  error?: string
}

export function validatePDB(pdbText: string): PDBValidationResult
```

## Data Models

### FoldProteinResult

```typescript
interface FoldProteinResult {
  pdb: string        // Raw PDB text for 3Dmol.js
  sequence: string   // Original sequence (for cache key)
}
```

### FoldError

```typescript
interface FoldError {
  message: string
  code: 'INVALID_SEQUENCE' | 'ESMATLAS_ERROR' | 'TIMEOUT' | 'NETWORK_ERROR' | 'INVALID_PDB'
  retryable: boolean
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cache Hit Returns Cached Data

*For any* valid amino acid sequence that has been successfully fetched, requesting the same sequence again SHALL return the cached PDB data without making a new API request.

**Validates: Requirements 1.4, 3.3**

### Property 2: Proxy Passthrough Integrity

*For any* valid sequence sent to the proxy function, the proxy SHALL forward it to ESMFold and return the PDB response unchanged (data integrity preserved).

**Validates: Requirements 2.2, 2.3**

### Property 3: Proxy Error Transformation

*For any* error response from the ESMFold API, the proxy SHALL return a structured error object with a descriptive message and error code.

**Validates: Requirements 2.4**

### Property 4: CORS Headers Present

*For any* response from the proxy function (success or error), the response SHALL include `Access-Control-Allow-Origin` and related CORS headers.

**Validates: Requirements 2.5**

### Property 5: Hook State Shape

*For any* sequence input (valid, invalid, or undefined), the `useFoldProtein` hook SHALL return an object containing `data`, `isLoading`, `isError`, and `error` properties.

**Validates: Requirements 3.2**

### Property 6: Invalid Input Rejection

*For any* empty string or undefined sequence, the hook SHALL NOT trigger an API request and SHALL return an idle state.

**Validates: Requirements 3.5**

### Property 7: Cache Persistence on Error

*For any* error that occurs during a fetch, previously cached successful results for other sequences SHALL remain accessible and unchanged.

**Validates: Requirements 4.4**

### Property 8: PDB Validation Success

*For any* valid PDB text containing required headers (HEADER, ATOM records), the validator SHALL return `{ isValid: true }`.

**Validates: Requirements 5.1**

### Property 9: PDB Validation Failure

*For any* malformed or empty PDB text, the validator SHALL return `{ isValid: false, error: <description> }`.

**Validates: Requirements 5.3**

## Error Handling

### Client-Side Errors

| Error Type | Detection | User Message | Action |
|------------|-----------|--------------|--------|
| Network unreachable | fetch throws | "Unable to connect. Check your internet connection." | Show retry button |
| Timeout (>30s) | AbortController | "Folding is taking longer than expected. Try again?" | Show retry button |
| Invalid sequence | Pre-validation | "Please enter valid names to create your Love Protein." | Highlight input |
| Sequence too long | API 400 response | "Names are too long! Try shorter names or nicknames." | Highlight input |

### Server-Side Errors (Proxy)

| Error Type | Detection | Response Code | Response Body |
|------------|-----------|---------------|---------------|
| Missing sequence | !event.body | 400 | `{ error: "Sequence required", code: "INVALID_SEQUENCE" }` |
| ESMFold 4xx | Response status | 400 | `{ error: "Invalid sequence", code: "ESMATLAS_ERROR" }` |
| ESMFold 5xx | Response status | 502 | `{ error: "Folding service unavailable", code: "ESMATLAS_ERROR" }` |
| Timeout | AbortController | 504 | `{ error: "Folding timed out", code: "TIMEOUT" }` |

## Testing Strategy

### Unit Tests

- **PDB Validator**: Test with valid PDB samples, malformed data, empty strings
- **API Client**: Test request formatting, response parsing, error handling (mocked)
- **Hook**: Test state transitions, enabled/disabled behavior (React Testing Library)

### Property-Based Tests

Using `fast-check` for property-based testing:

1. **Cache Hit Property**: Generate random valid sequences, fetch twice, verify second fetch uses cache
2. **Invalid Input Rejection**: Generate empty/whitespace strings, verify no API calls
3. **PDB Validation**: Generate valid/invalid PDB-like strings, verify correct validation results
4. **Hook State Shape**: Generate various inputs, verify return object always has required properties

### Integration Tests

- **Proxy Function**: Test with real ESMFold API (limited runs to avoid rate limiting)
- **End-to-End**: Test full flow from name input to PDB retrieval

### Test Configuration

```typescript
// Property tests should run minimum 100 iterations
// Tag format: Feature: esmfold-api-integration, Property N: <property_text>
```
