import * as React from "react"
import { Link } from "@tanstack/react-router"
import { GithubIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "./MobileNav"

// ============================================================================
// Types
// ============================================================================

export interface NavItem {
  label: string
  href: string
}

interface NavigationProps {
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const navItems: NavItem[] = [
  { label: "Home", href: "#" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
]

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Handles smooth scrolling for anchor links
 * If on a different page, navigates to home first
 */
function handleSmoothScroll(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string
) {
  // Only handle hash links
  if (!href.startsWith("#")) return

  // Check if we're on the home page
  const isHomePage = window.location.pathname === "/"

  if (!isHomePage) {
    // Navigate to home page with the hash - let browser handle it
    if (href === "#") {
      window.location.href = "/"
    } else {
      window.location.href = "/" + href
    }
    return
  }

  e.preventDefault()

  if (href === "#") {
    // Scroll to top for home
    window.scrollTo({ top: 0, behavior: "smooth" })
    return
  }

  const targetId = href.slice(1)
  const targetElement = document.getElementById(targetId)

  if (targetElement) {
    targetElement.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * BrandMark - Logo and brand name component
 */
function BrandMark() {
  const sharedClasses = cn(
    "flex items-center gap-2 justify-self-start",
    "text-2xl md:text-3xl lg:text-[2rem] font-bold",
    "transition-opacity duration-200",
    "hover:opacity-80",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    "rounded-md"
  )

  return (
    <a
      href="#"
      onClick={(e) => handleSmoothScroll(e, "#")}
      className={sharedClasses}
      aria-label="FoldedHearts - Home"
    >
      <span className="text-2xl md:text-3xl" aria-hidden="true">
        💕
      </span>
      <span className="text-primary whitespace-nowrap">FoldedHearts</span>
    </a>
  )
}

/**
 * NavLink - Individual navigation link with underline animation
 */
interface NavLinkProps {
  href: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

function NavLink({ href, children, onClick }: NavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        // Base typography
        "text-base font-medium",
        // Color states
        "text-muted-foreground",
        // Transitions
        "transition-all duration-200",
        // Hover state
        "hover:text-foreground",
        // Underline effect
        "relative",
        "after:absolute after:bottom-0 after:left-0 after:h-px",
        "after:bg-foreground",
        "after:transition-all after:duration-200",
        "after:w-0 hover:after:w-full",
        // Focus state
        "focus:outline-none",
        "focus-visible:text-foreground",
        "focus-visible:after:w-full",
        // Touch target padding
        "py-2"
      )}
    >
      {children}
    </a>
  )
}

/**
 * CenterNavLinks - Center navigation links
 */
function CenterNavLinks() {
  return (
    <nav
      className="hidden lg:flex items-center gap-12"
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          onClick={(e) => handleSmoothScroll(e, item.href)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

/**
 * RightActions - Right-side actions (theme toggle, GitHub, CTA)
 */
function RightActions() {
  return (
    <>
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* GitHub Link - desktop only */}
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "hidden lg:inline-flex items-center justify-center",
          "h-10 w-10 min-h-[44px] min-w-[44px]",
          "rounded-md",
          "text-muted-foreground",
          "hover:text-foreground hover:bg-muted/50",
          "transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
        aria-label="View on GitHub"
      >
        <GithubIcon className="h-5 w-5" />
      </a>

      {/* CTA Button - desktop only */}
      <Button
        asChild
        className={cn(
          "hidden lg:inline-flex",
          "bg-primary text-primary-foreground",
          "hover:brightness-95 transition-all",
          "px-6 py-3 h-auto rounded-md",
          "font-semibold text-base",
          "shadow-md hover:shadow-lg"
        )}
      >
        <Link to="/create">Create Your Love Protein</Link>
      </Button>

      {/* Mobile Navigation */}
      <MobileNav items={navItems} className="lg:hidden" />
    </>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Navigation - Header component with 3-column grid layout
 *
 * Features:
 * - Sticky header with backdrop blur
 * - Large brand name on the left
 * - Center navigation links with underline animation
 * - Right actions (theme toggle, GitHub, CTA)
 * - Mobile hamburger menu
 */
function Navigation({ className }: NavigationProps) {
  return (
    <header
      data-slot="navigation"
      role="banner"
      className={cn(
        // Sticky positioning
        "sticky top-0 z-50",
        // Background with backdrop blur
        "bg-background/80 backdrop-blur-md",
        // Top padding for breathing room
        "pt-2 md:pt-3",
        className
      )}
    >
      <nav
        className={cn(
          // Full width container with padding
          "mx-auto w-full",
          "px-6 md:px-10 lg:px-16",
          // Flex on mobile, grid on desktop
          "flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] items-center",
          // Height
          "h-18 md:h-20"
        )}
      >
        {/* Left: Brand Mark */}
        <BrandMark />

        {/* Center: Nav links */}
        <CenterNavLinks />

        {/* Right: Actions */}
        <div className="flex items-center gap-3 justify-self-end">
          <RightActions />
        </div>
      </nav>
    </header>
  )
}

export { Navigation }
export type { NavigationProps }
