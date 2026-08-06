"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { GraduationCap, Loader2, AtSign, Lock, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { isAxiosError } from "axios"

import { useAuth } from "@/lib/auth/auth-context"
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth"
import { LoginShowcase } from "@/components/features/login-showcase"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      await login(values)
      toast.success("Welcome back")
      router.push(searchParams.get("from") ?? "/dashboard")
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.detail ?? "Invalid email or password")
        : "Something went wrong. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <LoginShowcase />

      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-sm space-y-6 rounded-xl border bg-background p-8 shadow-sm">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sign in to EduTrack</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="your.email@edutrack.local"
                          className="pl-9"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                        <AtSign
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Password"
                          className="pl-9"
                          type="password"
                          autoComplete="current-password"
                          {...field}
                        />
                        <Lock
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Contact your school administrator to reset your password.")
                  }
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                Sign in
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            Demo accounts: admin@edutrack.local · teacher@edutrack.local · student1@edutrack.local
          </p>
        </div>
      </div>
    </main>
  )
}
