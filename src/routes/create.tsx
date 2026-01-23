import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Navigation } from "@/components/landing/Navigation"
import { Section } from "@/components/landing/Section"
import { DNAHeartLogo } from "@/components/landing/DNAHeartLogo"
import { foldProteinQueryOptions } from "@/lib/queryClient"
import { createLoveSequence, isCreateLoveSequenceError } from "@/utils/foldLogic"

export const Route = createFileRoute("/create")({
  component: CreatePage,
})

const CUTE_MESSAGES = [
  "Working on some amino amore...",
  "Weaving your names into amino acids... 🧬",
  "Adding the heart linker... 💗",
  "Folding your love protein... 🔬",
  "Calculating molecular bonds... ⚛️",
  "Almost there, love takes time... 💫",
]

interface PartnerFormData {
  firstName: string
  middleName: string
  lastName: string
}

function CreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [partner1, setPartner1] = React.useState<PartnerFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
  })

  const [partner2, setPartner2] = React.useState<PartnerFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
  })

  const [isGenerating, setIsGenerating] = React.useState(false)
  const [messageIndex, setMessageIndex] = React.useState(0)

  // Cycle through cute messages while loading
  React.useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % CUTE_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isGenerating])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const name1Parts = [partner1.firstName, partner1.middleName, partner1.lastName]
      .filter(Boolean)
      .join("")
    const name2Parts = [partner2.firstName, partner2.middleName, partner2.lastName]
      .filter(Boolean)
      .join("")

    if (!name1Parts || !name2Parts) return

    setIsGenerating(true)
    setMessageIndex(0)

    // Create the sequence and prefetch the protein data
    const result = createLoveSequence(name1Parts, name2Parts)
    
    if (!isCreateLoveSequenceError(result)) {
      try {
        // Prefetch the protein fold data
        await queryClient.prefetchQuery(foldProteinQueryOptions(result.sequence))
      } catch {
        // Even if prefetch fails, we'll navigate and let the fold page handle it
      }
    }

    // Navigate to the fold page
    navigate({
      to: "/fold/$names",
      params: { names: `${name1Parts}-${name2Parts}` },
    })
  }

  const isValid =
    partner1.firstName.trim() !== "" && partner2.firstName.trim() !== ""

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <Section className="py-6 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <LoadingState
                key="loading"
                message={CUTE_MESSAGES[messageIndex]}
                name1={partner1.firstName}
                name2={partner2.firstName}
              />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="mb-4 lg:mb-8 text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    Create Your{" "}
                    <span className="text-primary">Love Protein</span>
                  </h1>
                  <p className="mt-2 lg:mt-4 text-base lg:text-lg text-muted-foreground">
                    Enter both partners' names to generate your unique molecular bond
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground/70">
                    💡 Add middle and last names for an even more unique protein structure
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-8">
                  <PartnerCard
                    title="Partner 1"
                    emoji="💕"
                    data={partner1}
                    onChange={setPartner1}
                  />

                  <div className="flex items-center justify-center py-1 lg:py-0">
                    <DNAHeartLogo size={32} className="lg:hidden" />
                    <DNAHeartLogo size={48} className="hidden lg:block" />
                  </div>

                  <PartnerCard
                    title="Partner 2"
                    emoji="💕"
                    data={partner2}
                    onChange={setPartner2}
                  />

                  <div className="flex justify-center pt-2 lg:pt-4">
                    <Button
                      type="submit"
                      disabled={!isValid}
                      className="bg-primary text-primary-foreground hover:brightness-95 transition-all px-8 py-4 h-auto rounded-md font-semibold text-lg shadow-md hover:shadow-lg"
                    >
                      Generate Love Protein 🧬
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>
    </div>
  )
}

// Loading state component with animations
interface LoadingStateProps {
  message: string
  name1: string
  name2: string
}

function LoadingState({ message, name1, name2 }: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-center"
    >
      {/* Animated DNA Heart */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-8"
      >
        <DNAHeartLogo size={80} />
      </motion.div>

      {/* Names with heart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          <span className="text-primary">{name1}</span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mx-3 inline-block text-pink-400"
          >
            ♥
          </motion.span>
          <span className="text-primary">{name2}</span>
        </h2>
      </motion.div>

      {/* Rotating message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-lg text-muted-foreground"
        >
          {message}
        </motion.p>
      </AnimatePresence>

      {/* Loading dots */}
      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-3 w-3 rounded-full bg-primary"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

interface PartnerCardProps {
  title: string
  emoji: string
  data: PartnerFormData
  onChange: (data: PartnerFormData) => void
}

function PartnerCard({ title, emoji, data, onChange }: PartnerCardProps) {
  const updateField = (field: keyof PartnerFormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span aria-hidden="true">{emoji}</span>
          {title}
        </CardTitle>
        <CardDescription>
          Enter the name (first name required, middle and last optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`${title}-first`}>
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${title}-first`}
              placeholder="First"
              value={data.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${title}-middle`}>Middle Name</Label>
            <Input
              id={`${title}-middle`}
              placeholder="Middle"
              value={data.middleName}
              onChange={(e) => updateField("middleName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${title}-last`}>Last Name</Label>
            <Input
              id={`${title}-last`}
              placeholder="Last"
              value={data.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
