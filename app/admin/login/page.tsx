"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      toast({
        title: "Error",
        description: "Silakan masukkan password",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        throw new Error("Password salah")
      }

      const data = await response.json()

      // Store admin token in cookie (secure http-only dalam production)
      document.cookie = `admin-token=${data.token}; path=/; max-age=86400` // 24 hours

      toast({
        title: "Sukses",
        description: "Login berhasil",
      })

      router.push("/admin/dashboard")
    } catch (error) {
      toast({
        title: "Login Gagal",
        description: error instanceof Error ? error.message : "Password tidak valid",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.jpg"
              alt="Epistemic Diplomat"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Masukkan password untuk mengakses dashboard admin
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sedang login..." : "Login"}
            </Button>
          </form>

          <p className="text-xs text-foreground/50 text-center mt-4">
            Akses Admin Dashboard Epistemic Diplomat
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
