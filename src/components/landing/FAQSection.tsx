import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Section } from "./Section"

const faqs = [
  {
    question: "Wait, is this actually real science?",
    answer:
      "Yes! We use ESMFold, which is based on the same technology as AlphaFold — the AI that won the 2024 Nobel Prize in Chemistry. Your names get converted to amino acids, and the model predicts how that sequence would fold in 3D. It's the real deal.",
  },
  {
    question: "Will my protein look different from everyone else's?",
    answer:
      "100%. Every name combination creates a unique amino acid sequence, which folds into a unique structure. Even swapping the order of names (Alex + Jordan vs Jordan + Alex) gives you a different protein. It's like a fingerprint for your relationship.",
  },
  {
    question: "How does the name → protein thing work?",
    answer:
      "Each letter in your names maps to a specific amino acid (the building blocks of proteins). We combine both names with a flexible linker sequence in between, then send it to ESMFold to predict the 3D structure. The whole process takes about 10 seconds.",
  },
  {
    question: "Can I use this for friends, pets, or just myself?",
    answer:
      "Absolutely. It's your protein, do what you want. Best friends, you and your cat, your own name twice for maximum self-love energy — all valid.",
  },
  {
    question: "Is my data saved anywhere?",
    answer:
      "Nope. We don't store your names or proteins. Everything happens in real-time and disappears when you close the page. Your love protein exists only for you.",
  },
  {
    question: "Why is it free?",
    answer:
      "Because charging money for love proteins felt weird. ESMFold is open source, hosting is cheap, and I wanted to make something fun. That's it.",
  },
]

const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const, delay: 0.1 },
  },
}

const staticVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
}

interface FAQSectionProps extends React.ComponentProps<typeof Section> {
  className?: string
}

export function FAQSection({ className, ...props }: FAQSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const MotionDiv = prefersReducedMotion ? "div" : motion.div

  const headerVariants = prefersReducedMotion ? staticVariants : sectionHeaderVariants
  const accordionVariants = prefersReducedMotion ? staticVariants : contentVariants

  return (
    <Section id="faq" className={cn("py-24 lg:py-32", className)} {...props}>
      <MotionDiv
        className="mb-12 text-center"
        {...(!prefersReducedMotion && {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, margin: "-100px" },
          variants: headerVariants,
        })}
      >
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          Questions?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          We got answers (and they're not boring)
        </p>
      </MotionDiv>

      <MotionDiv
        className="mx-auto max-w-2xl"
        {...(!prefersReducedMotion && {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, margin: "-50px" },
          variants: accordionVariants,
        })}
      >
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MotionDiv>
    </Section>
  )
}
