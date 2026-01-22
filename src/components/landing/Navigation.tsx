import * as React from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "./MobileNav"

interface NavigationProps {
  className?: string
}

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: "Home", href: "#" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
]

function Navigation({ className }: NavigationProps) {
  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <header
      data-slot="navigation"
      role="banner"
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60",
        className
      )}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10 lg:px-16"
      >
        {/* Brand Mark */}
        <a
          href="#"
          onClick={handleBrandClick}
          className="flex items-center gap-2 text-lg font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-md rounded-md"
          aria-label="FoldedHearts - scroll to top"
        >
          <span className="text-primary" aria-hidden="true">💕</span>
          <span>FoldedHearts</span>
        </a>

        {/* Desktop Navigation Links */}
        <ul
          className="hidden lg:flex lg:items-center lg:gap-6"
          role="list"
          aria-label="Site navigation links"
        >
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-md rounded-md px-2 py-1"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side: CTA + Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Desktop CTA */}
          <Button
            asChild
            className="hidden lg:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Link to="/create">
              Create Your Love Protein
            </Link>
          </Button>

          {/* Mobile Navigation */}
          <MobileNav items={navItems} className="lg:hidden" />
        </div>
      </nav>
    </header>
  )
}

export { Navigation }
export type { NavigationProps }
