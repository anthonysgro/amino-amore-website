import { createFileRoute } from '@tanstack/react-router'

import { FAQSection } from '@/components/landing/FAQSection'
import { Footer } from '@/components/landing/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { Navigation } from '@/components/landing/Navigation'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
