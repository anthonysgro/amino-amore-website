import { createFileRoute } from "@tanstack/react-router"
import { Github } from "lucide-react"

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
                Hey! I'm Anthony, a software engineer who loves building fun things 
                at the intersection of science and technology. I created folded.love 
                as a way to make protein folding — something usually reserved for 
                research labs — into a playful, romantic experience anyone can enjoy.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                The idea is simple: your names become amino acids, and AI folds them 
                into a unique 3D structure. It's real science wrapped in a love letter.
              </p>
            </div>

            {/* Links */}
            <div className="mt-10 flex justify-center gap-4">
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
