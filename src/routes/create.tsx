import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

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

export const Route = createFileRoute("/create")({
  component: CreatePage,
})

interface PartnerFormData {
  firstName: string
  middleName: string
  lastName: string
}

function CreatePage() {
  const navigate = useNavigate()

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const name1Parts = [partner1.firstName, partner1.middleName, partner1.lastName]
      .filter(Boolean)
      .join("")
    const name2Parts = [partner2.firstName, partner2.middleName, partner2.lastName]
      .filter(Boolean)
      .join("")

    if (!name1Parts || !name2Parts) return

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

      <Section className="py-12 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Create Your{" "}
              <span className="text-primary">Love Protein</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Enter both partners' names to generate your unique molecular bond
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <PartnerCard
              title="Partner 1"
              emoji="💕"
              data={partner1}
              onChange={setPartner1}
            />

            <div className="flex items-center justify-center">
              <span className="text-4xl" aria-hidden="true">
                ❤️
              </span>
            </div>

            <PartnerCard
              title="Partner 2"
              emoji="💕"
              data={partner2}
              onChange={setPartner2}
            />

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={!isValid}
                className="text-lg px-8"
              >
                Generate Love Protein 🧬
              </Button>
            </div>
          </form>
        </div>
      </Section>
    </div>
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
