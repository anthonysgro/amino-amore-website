import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

import { Navigation } from '@/components/landing/Navigation'
import { Section } from '@/components/landing/Section'
import { DNAHeartLogo } from '@/components/landing/DNAHeartLogo'
import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'folded.love - Your Love Protein',
      },
      {
        name: 'description',
        content:
          'Transform your names into a unique 3D protein structure. Real science, wrapped in a love letter.',
      },
      // Open Graph
      {
        property: 'og:title',
        content: 'folded.love - Your Love Protein',
      },
      {
        property: 'og:description',
        content:
          'Transform your names into a unique 3D protein structure. Real science, wrapped in a love letter.',
      },
      {
        property: 'og:image',
        content: 'https://folded.love/preview.png',
      },
      {
        property: 'og:url',
        content: 'https://folded.love',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      // Twitter Card
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'folded.love - Your Love Protein',
      },
      {
        name: 'twitter:description',
        content:
          'Transform your names into a unique 3D protein structure. Real science, wrapped in a love letter.',
      },
      {
        name: 'twitter:image',
        content: 'https://folded.love/preview.png',
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://folded.love',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  // Inline script to prevent flash of wrong theme
  const themeScript = `
    (function() {
      const stored = localStorage.getItem('folded-love-theme');
      const theme = stored || 'dark';
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) document.documentElement.classList.add('dark');
    })();
  `

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FoldedHearts',
    url: 'https://folded.love',
    description:
      'Transform your names into a unique 3D protein structure. Real science, wrapped in a love letter.',
    applicationCategory: 'Entertainment',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
        <Analytics />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <Section className="py-16 lg:py-24">
        <div className="mx-auto max-w-lg text-center">
          {/* Broken heart DNA icon */}
          <div className="mb-8 flex justify-center opacity-60">
            <DNAHeartLogo size={80} />
          </div>

          {/* 404 message */}
          <h1 className="text-6xl font-bold text-primary sm:text-7xl">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">
            This bond doesn't exist
          </h2>
          <p className="mt-3 text-muted-foreground">
            Looks like this molecular structure got lost in the lab. Let's get
            you back to creating something beautiful.
          </p>

          {/* Navigation buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground"
            >
              <Link to="/create">Create a Love Protein</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  )
}
