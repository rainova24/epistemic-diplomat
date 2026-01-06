import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { ArticleGrid } from "@/components/article-grid"
import { Mission } from "@/components/mission"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ArticleGrid />
      <Mission />
      <Footer />
    </main>
  )
}
