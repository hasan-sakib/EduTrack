import Image from "next/image"

/**
 * Decorative brand panel for the sign-in page. Animation is plain CSS (`animate-orb-*`
 * from globals.css) rather than Framer Motion — a JS-driven entrance animation here
 * previously left the whole panel stuck invisible in at least one real browser when the
 * mount effect didn't fire in time. CSS keyframes run in the browser's own animation
 * engine and always render their base state even if JS never executes.
 */
export function LoginShowcase() {
  return (
    <div className="relative hidden h-full items-center justify-center overflow-hidden bg-neutral-950 lg:flex">
      <div
        aria-hidden
        className="absolute -top-24 -left-16 size-80 animate-orb-float rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-20 top-1/3 size-96 animate-orb-drift rounded-full bg-white/[0.07] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/4 size-72 animate-orb-float rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative flex animate-side-drift flex-col items-center gap-3">
        <Image src="/logo-icon.png" alt="EduTrack" width={160} height={160} priority />
        <p className="text-2xl font-semibold tracking-tight text-white">EduTrack</p>
      </div>
    </div>
  )
}
