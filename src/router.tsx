import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import type { QueryClient } from '@tanstack/react-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { createQueryClient } from './lib/queryClient'

// Create a new router instance with QueryClient for SSR
export const getRouter = () => {
  // QueryClient created per-request for SSR isolation
  const queryClient = createQueryClient()

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { queryClient },
  })

  // Automatic dehydration/hydration for SSR
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
