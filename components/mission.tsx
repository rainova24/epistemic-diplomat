"use client"

import { motion } from "framer-motion"
import { Brain, Lightbulb, BookOpen } from "lucide-react"

export function Mission() {
  const values = [
    {
      icon: Brain,
      title: "Rigor Intelektual",
      description: "Kami berkomitmen pada analisis mendalam dan argumentasi logis yang ketat dalam setiap diskusi.",
    },
    {
      icon: Lightbulb,
      title: "Dialog Terbuka",
      description: "Menciptakan ruang aman untuk eksplorasi ide-ide kompleks tanpa dogmatisme atau prasangka.",
    },
    {
      icon: BookOpen,
      title: "Integrasi Holistik",
      description: "Menyatukan wawasan dari sains, filsafat, dan teologi untuk pemahaman yang lebih komprehensif.",
    },
  ]

  return (
    <section
      id="tentang"
      className="border-y border-border/40 bg-gradient-to-b from-background via-card to-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Misi <span className="text-primary">Kami</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-pretty text-muted-foreground">
            <span className="font-semibold text-foreground">Epistemic Diplomat</span> lahir dari keyakinan bahwa{" "}
            <span className="text-primary">sains dan agama</span> tidak perlu berkonflik. Kami percaya bahwa dialog
            mendalam antara nalar empiris dan refleksi teologis dapat menghasilkan pemahaman yang lebih kaya tentang
            realitas dan makna eksistensi manusia.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
            Platform ini adalah jembatan bagi para pemikir, ilmuwan, teolog, dan filsuf untuk berbagi perspektif mereka
            dalam semangat pencarian kebenaran yang tulus.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-lg border border-border/40 bg-card p-8 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                <value.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-bold text-foreground">{value.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
