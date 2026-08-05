import type { Transition, Variants } from "framer-motion"

/** Standard durations (seconds) and easing — reused everywhere so motion feels like one system. */
export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const

export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

export const transitionBase: Transition = { duration: DURATION.base, ease: EASE_OUT }
export const transitionFast: Transition = { duration: DURATION.fast, ease: EASE_OUT }

/** Page/section entrance — content settles up and in. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transitionBase },
}

/** Simple opacity-only fade, for content that shouldn't shift position. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitionBase },
}

/** Dialog/popover-style entrance. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitionFast },
}

/** Wrap a list with this, give each child `fadeInUp`, and they cascade in. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
}
