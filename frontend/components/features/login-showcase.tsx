import { CheckCircle2, GraduationCap } from "lucide-react"

/**
 * Decorative brand panel for the sign-in page. Animation is plain CSS (`animate-orb-*`,
 * `animate-card-float` from globals.css) rather than Framer Motion — a JS-driven entrance
 * animation here previously left the whole panel stuck invisible in at least one real browser
 * when the mount effect didn't fire in time. CSS keyframes run in the browser's own animation
 * engine and always render their base state even if JS never executes.
 */
export function LoginShowcase() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-10 lg:flex">
      <div
        aria-hidden
        className="absolute -top-24 -left-16 size-80 animate-orb-float rounded-full bg-indigo-500/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-20 top-1/3 size-96 animate-orb-drift rounded-full bg-violet-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/4 size-72 animate-orb-float rounded-full bg-sky-500/10 blur-3xl"
      />

      <div className="flex items-center gap-2 text-white">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="size-4" />
        </div>
        <p className="text-xl font-semibold">EduTrack</p>
      </div>

      <div className="relative flex flex-1 items-center justify-center py-12">
        <div
          style={{ "--card-rotate": "-4deg" } as React.CSSProperties}
          className="w-72 animate-card-float rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-400/30 text-xs font-semibold text-white">
              DT
            </div>
            <div>
              <p className="text-sm font-medium text-white">Demo Teacher</p>
              <p className="text-xs text-white/50">World History · 3B</p>
            </div>
          </div>
          <div className="space-y-2.5 pt-3">
            {[
              { label: "Essay: The Silk Road", status: "Graded" },
              { label: "Map Quiz — Chapter 4", status: "Submitted" },
              { label: "Reading Response #6", status: "Open" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400/80" />
                <span className="flex-1 truncate text-white/80">{row.label}</span>
                <span className="shrink-0 text-white/40">{row.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          aria-hidden
          style={{ "--card-rotate": "6deg" } as React.CSSProperties}
          className="absolute w-56 translate-x-24 translate-y-16 animate-card-float rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur-sm"
        >
          <div className="h-2 w-16 rounded-full bg-white/20" />
          <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
          <div className="mt-2 h-2 w-2/3 rounded-full bg-white/10" />
        </div>
      </div>

      <blockquote className="space-y-2 text-white">
        <p className="text-lg">
          &ldquo;EduTrack cut the time I spend chasing homework down to almost nothing —
          grading and feedback all happen in one place now.&rdquo;
        </p>
        <footer className="font-mono text-sm font-semibold text-slate-400">
          ~ Demo Teacher, EduTrack
        </footer>
      </blockquote>
    </div>
  )
}
