# Implementation Plan: ESMFold API Integration with TanStack Start SSR

## Overview

Integrate the Meta ESMFold API into FoldedHearts using TanStack Start's SSR capabilities with TanStack Query. This includes setting up the QueryClient with router integration, creating a server function for CORS-free API calls, and implementing the `useFoldProtein` hook with SSR prefetching.

## Tasks

- [x] 1. Install TanStack Query dependencies
  - Install `@tanstack/react-query` and `@tanstack/react-router-ssr-query`
  - _Requirements: 1.1_

- [x] 2. Set up QueryClient with SSR integration
  - [x] 2.1 Create QueryClient factory and query options
    - Create `src/lib/queryClient.ts` with `createQueryClient()` function
    - Add `foldProteinKeys` query key factory
    - Add `foldProteinQueryOptions(sequence)` factory
    - Configure staleTime (1 hour), gcTime (24 hours), retry (2)
    - _Requirements: 1.3, 1.4_
  - [x] 2.2 Update router with SSR query integration
    - Modify `src/router.tsx` to create QueryClient per-request
    - Add `context: { queryClient }` to router config
    - Call `setupRouterSsrQueryIntegration({ router, queryClient })`
    - Add TypeScript type augmentation for RouterContext
    - _Requirements: 1.2_
  - [x] 2.3 Add QueryClientProvider to root route
    - Update `src/routes/__root.tsx` to wrap children with QueryClientProvider
    - Get queryClient from router context
    - _Requirements: 1.2_

- [ ] 3. Checkpoint - Verify TanStack Query setup
  - Ensure app builds and runs without errors
  - Verify QueryClient is available in router context

- [x] 4. Create ESMFold server function
  - [x] 4.1 Implement foldProteinFn server function
    - Create `src/api/foldProtein.ts`
    - Use `createServerFn({ method: 'POST' })` from @tanstack/react-start
    - Add validator for sequence (required, max 400 chars)
    - Implement handler that calls ESMFold API
    - Add 30-second timeout with AbortController
    - Return `{ pdb, sequence }` on success
    - _Requirements: 2.2, 2.3, 2.4_
  - [ ]\* 4.2 Write property test for server function passthrough
    - **Property 2: Server Function Passthrough Integrity**
    - **Validates: Requirements 2.2, 2.3**

- [x] 5. Create PDB validator utility
  - [x] 5.1 Implement validatePDB function
    - Create `src/utils/pdbValidator.ts`
    - Check for empty/null input
    - Validate presence of ATOM records
    - Return `{ isValid, error? }` result
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]\* 5.2 Write property tests for PDB validation
    - **Property 7: PDB Validation Success**
    - **Property 8: PDB Validation Failure**
    - **Validates: Requirements 5.1, 5.3**

- [x] 6. Create useFoldProtein hook
  - [x] 6.1 Implement useFoldProtein hook
    - Create `src/hooks/useFoldProtein.ts`
    - Use `useQuery` with `foldProteinQueryOptions`
    - Handle enabled state for empty/undefined sequences
    - Return `{ data, isLoading, isPending, isFetching, isError, error, refetch }`
    - _Requirements: 3.1, 3.2, 3.4, 3.5_
  - [ ]\* 6.2 Write property tests for hook behavior
    - **Property 4: Hook State Shape**
    - **Property 5: Invalid Input Rejection**
    - **Validates: Requirements 3.2, 3.5**

- [ ] 7. Checkpoint - Verify hook and server function
  - Test useFoldProtein hook with a sample sequence
  - Verify server function calls ESMFold successfully
  - Ensure all tests pass, ask the user if questions arise

- [x] 8. Add SSR prefetching to routes
  - [x] 8.1 Create example fold route with loader
    - Create `src/routes/fold.$names.tsx` (or integrate into existing route)
    - Add loader that calls `queryClient.prefetchQuery(foldProteinQueryOptions(sequence))`
    - Use `createLoveSequence` from foldLogic to generate sequence from names
    - _Requirements: 1.4, 3.3_
  - [ ]\* 8.2 Write property test for cache behavior
    - **Property 1: Cache Hit Returns Cached Data**
    - **Property 6: Cache Persistence on Error**
    - **Validates: Requirements 1.4, 3.3, 4.4**

- [ ] 9. Final checkpoint - Full SSR flow verification
  - Verify SSR prefetch populates cache before hydration
  - Test that subsequent requests use cached data
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Server function uses `createServerFn` from TanStack Start (not Amplify Lambda)
- The `setupRouterSsrQueryIntegration` handles automatic dehydration/hydration
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
