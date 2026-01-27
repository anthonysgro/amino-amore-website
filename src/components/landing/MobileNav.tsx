import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Coffee } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface NavItem {
  label: string
  href: string
}

interface MobileNavProps {
  items: Array<NavItem>
  className?: string
}

/**
 * Handles navigation for hash links.
 * If on homepage, scrolls smoothly. Otherwise, navigates to homepage with hash.
 */
function handleNavClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  onClose: () => void,
) {
  // Always close the menu
  onClose()

  // Only handle hash links specially
  if (!href.startsWith('#')) return

  // Check if we're on the home page
  const isHomePage = window.location.pathname === '/'

  if (!isHomePage) {
    // Navigate to home page with the hash
    e.preventDefault()
    if (href === '#') {
      window.location.href = '/'
    } else {
      window.location.href = '/' + href
    }
    return
  }

  // On homepage - do smooth scroll
  e.preventDefault()

  if (href === '#') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const targetId = href.slice(1)
  const targetElement = document.getElementById(targetId)

  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function MobileNav({ items, className }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-11 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className,
          )}
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="mobile-nav-content"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/80 backdrop-blur-sm duration-200" />
        <DialogPrimitive.Content
          id="mobile-nav-content"
          className="data-open:animate-in data-closed:animate-out data-closed:slide-out-to-right data-open:slide-in-from-right fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-background p-6 shadow-lg duration-300 focus:outline-none focus-visible:outline-none"
          aria-label="Mobile navigation menu"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-primary" aria-hidden="true">
                💕
              </span>
              <span className="text-primary">folded</span>
              <span className="text-muted-foreground">.love</span>
            </span>
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Close navigation menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </DialogPrimitive.Close>
          </div>

          {/* Navigation Links */}
          <nav
            className="mt-8 flex flex-col gap-4"
            aria-label="Mobile navigation"
          >
            <ul role="list" className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href, handleClose)}
                    className="block text-lg font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-md rounded-md px-2 py-2"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA Button */}
          <div className="mt-auto pt-6 flex flex-col gap-3">
            <a
              href="https://www.buymeacoffee.com/sgro"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md border border-border text-foreground font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Coffee className="h-5 w-5" />
              Buy Me a Coffee
            </a>
            <Button
              asChild
              className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              size="lg"
              onClick={handleClose}
            >
              <Link
                to="/create"
                params={{ names: 'Your-Love' }}
                aria-label="Create Your Love Protein - start the protein folding experience"
              >
                Fold Our Names
              </Link>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { MobileNav }
export type { MobileNavProps }
