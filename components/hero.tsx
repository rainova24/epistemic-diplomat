"use client"

import { motion } from "framer-motion"

export function Hero() {
  return (
    <section
      id="beranda"
      className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-background via-card to-background"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-5xl font-bold leading-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
          >
            Menjembatani <span className="text-primary">Nalar</span> dan <span className="text-primary">Iman</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl"
          >
            Agar nalar tidak pincang, dan iman tidak buta. Sebuah ruang dialektika untuk{" "}
            <span className="font-semibold text-foreground">Sains</span>,{" "}
            <span className="font-semibold text-foreground">Filsafat</span>, dan{" "}
            <span className="font-semibold text-foreground">Teologi</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href="#esai"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:bg-secondary hover:shadow-lg hover:shadow-primary/20"
            >
              Jelajahi Esai
            </a>
            <a
              href="#tentang"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-primary/30 bg-transparent px-8 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary/10"
            >
              Pelajari Lebih Lanjut
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  )
}
