import { createFileRoute } from '@tanstack/react-router'

import { FAQSection } from '@/components/landing/FAQSection'
import { Footer } from '@/components/landing/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/HowItWorksSection'
import { ScienceSection } from '@/components/landing/ScienceSection'
import { Navigation } from '@/components/landing/Navigation'

export const Route = createFileRoute('/')({
  head: () => ({
    links: [{ rel: 'canonical', href: 'https://folded.love/' }],
  }),
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ScienceSection />
        <FeaturesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
