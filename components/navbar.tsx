"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SubmitArticleDialog } from "@/components/submit-article-dialog"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="Epistemic Diplomat Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="font-serif text-xl font-bold text-primary">Epistemic Diplomat</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 md:flex">
              <Link href="#beranda" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
                Beranda
              </Link>
              <Link href="#esai" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
                Esai
              </Link>
              <Link href="#tentang" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
                Tentang Kami
              </Link>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-secondary"
                onClick={() => setIsSubmitDialogOpen(true)}
              >
                Kirim Tulisan
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6 text-primary" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="border-t border-border/40 py-4 md:hidden">
              <div className="flex flex-col gap-4">
                <Link
                  href="#beranda"
                  className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Beranda
                </Link>
                <Link
                  href="#esai"
                  className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Esai
                </Link>
                <Link
                  href="#tentang"
                  className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tentang Kami
                </Link>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-secondary"
                  onClick={() => {
                    setIsSubmitDialogOpen(true)
                    setIsMenuOpen(false)
                  }}
                >
                  Kirim Tulisan
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <SubmitArticleDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen} />
    </>
  )
}
