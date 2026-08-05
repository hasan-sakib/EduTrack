"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { GraduationCap, Loader2, Mail, Lock, Sparkles, ArrowRight, BookOpen, ClipboardCheck } from "lucide-react"
import { toast } from "sonner"
import { isAxiosError } from "axios"
import { motion } from "framer-motion"

import { useAuth } from "@/lib/auth/auth-context"
import { fadeInUp, fadeIn, transitionBase } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth"
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
    <div className="flex min-h-screen w-full bg-background">
      {/* Left — form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20 xl:px-28">
        <div className="mb-12 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">EduTrack</span>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={transitionBase}
          className="mx-auto w-full max-w-sm"
        >
          <div className="mb-8">
            <div className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" />
              Welcome back
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Sign in to your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Email"
                          autoComplete="email"
                          className="h-12 rounded-full pl-11"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="pl-4" />
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
                        <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Password"
                          autoComplete="current-password"
                          className="h-12 rounded-full pl-11"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="pl-4" />
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

              <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                Sign in
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Demo accounts: admin@edutrack.local · teacher@edutrack.local · student1@edutrack.local
          </p>
        </motion.div>
      </div>

      {/* Right — decorative panel */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-slate-950 p-10 lg:flex">
        <Starfield />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ ...transitionBase, delay: 0.15 }}
          className="relative flex h-full w-full max-w-lg flex-col items-center justify-center rounded-[2.5rem] bg-linear-to-br from-indigo-950 via-slate-900 to-slate-950 p-12 text-center shadow-2xl ring-1 ring-white/10"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative mb-8 flex size-24 items-center justify-center rounded-3xl bg-primary/20 ring-1 ring-primary/30"
          >
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl" />
            <GraduationCap className="relative size-11 text-primary-foreground" />
          </motion.div>

          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Assignments, submissions,
            <br />
            and grades — in one place.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            EduTrack keeps admins, teachers, and students in sync from assignment to feedback.
          </p>

          <div className="mt-10 flex items-center gap-6 text-slate-400">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="size-4" />
              Assignments
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-sm">
              <ClipboardCheck className="size-4" />
              Submissions
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface Star {
  id: number
  top: number
  left: number
  size: number
  opacity: number
}

function Starfield() {
  // Generated client-side only (after mount) — Math.random() during SSR would produce
  // different values on the server vs. client and trigger a hydration mismatch.
  const [stars, setStars] = React.useState<Star[]>([])

  React.useEffect(() => {
    setStars(
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() < 0.8 ? 1 : 2,
        opacity: 0.2 + Math.random() * 0.6,
      }))
    )
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {stars.map((star) => (
        <span
          key={star.id}
          className={cn("absolute rounded-full bg-white")}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  )
}
