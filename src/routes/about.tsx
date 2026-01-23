import { createFileRoute } from "@tanstack/react-router"
import { Coffee, Github } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/landing/Navigation"
import { Section } from "@/components/landing/Section"
import { Footer } from "@/components/landing/Footer"

export const Route = createFileRoute("/about")({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <Section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="mx-auto max-w-2xl">
            {/* Photo */}
            <div className="mb-8 flex justify-center">
              <img
                src="/dev_photo.png"
                alt="Anthony Sgro"
                className="h-40 w-40 rounded-full object-cover object-[20%_center] border-4 border-primary/20 shadow-lg"
              />
            </div>

            {/* Bio */}
            <div className="prose prose-neutral dark:prose-invert mx-auto text-center">
              <p className="text-muted-foreground leading-relaxed">
                Hey, I'm Anthony. I made this because my partner is a huge nerd and I wanted to make her laugh on Valentine's Day.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Folded.love takes two names, turns them into amino acids, and uses the same AI that won a Nobel Prize to fold them into a 3D protein. It's basically a love letter that's also a molecule. Is it scientifically useful? Probably not. Is it cool? I think so.
              </p>
            </div>

            {/* Links */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://github.com/anthonysgro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-5 w-5" />
                  GitHub
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://www.buymeacoffee.com/sgro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Coffee className="h-5 w-5" />
                  Buy Me a Coffee
                </a>
              </Button>
              <Button asChild size="lg" className="bg-primary text-primary-foreground">
                <a href="/create">Create Your Protein</a>
              </Button>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  )
}
