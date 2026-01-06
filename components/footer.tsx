import { Instagram } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo and Name */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Epistemic Diplomat Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="font-serif text-lg font-bold text-primary">Epistemic Diplomat</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/epistemic.diplomat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Epistemic Diplomat. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
