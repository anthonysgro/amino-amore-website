import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

interface FooterProps extends React.ComponentProps<'footer'> {
  className?: string
}

function Footer({ className, ...props }: FooterProps) {
  return (
    <footer
      className={cn(
        'bg-background',
        'border-t border-border/50',
        'py-8',
        'px-6 md:px-12',
        className,
      )}
      {...props}
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Navigation links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-4 md:gap-6">
              <li>
                <Link
                  to="/"
                  className={cn(
                    'text-sm text-muted-foreground',
                    'hover:text-foreground',
                    'transition-colors duration-200',
                  )}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className={cn(
                    'text-sm text-muted-foreground',
                    'hover:text-foreground',
                    'transition-colors duration-200',
                  )}
                >
                  Create
                </Link>
              </li>
            </ul>
          </nav>

          {/* Powered by section */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Powered by</span>
            <a
              href="https://esmatlas.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              ESMFold by Meta AI
            </a>
            <span className="text-muted-foreground">·</span>
            <a
              href="https://www.science.org/doi/10.1126/science.ade2574"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Learn about the science
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer, type FooterProps }
