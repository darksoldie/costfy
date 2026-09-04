/**
 * Costfy Motion System — Tokens & Canonical Variants
 * 
 * Rules:
 * - Powered by `motion/react`.
 * - Microinterações: 100–250ms
 * - Transições de estado: 150–350ms
 * - Movimentos maiores: 300–500ms
 * - Easing: Apple-grade subtle ease-out ([0.22, 1, 0.36, 1])
 * - Springs: Subtle, no cartoonish overshoot (stiffness 380, damping 30)
 * - Zero glow, zero neon, zero futuristic jitter.
 * - Full respect for prefers-reduced-motion.
 */

import type { Transition, Variants } from "motion/react";

export const motionDurations = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;

export const motionEasings = {
  standard: [0.22, 1, 0.36, 1], // Smooth Apple-grade easeOut
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
} as const;

export const motionTransitions = {
  micro: {
    duration: motionDurations.fast,
    ease: motionEasings.standard,
  } satisfies Transition,
  standard: {
    duration: motionDurations.normal,
    ease: motionEasings.standard,
  } satisfies Transition,
  smooth: {
    duration: motionDurations.slow,
    ease: motionEasings.standard,
  } satisfies Transition,
  spring: {
    type: "spring",
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  } satisfies Transition,
  gentleSpring: {
    type: "spring",
    stiffness: 260,
    damping: 26,
  } satisfies Transition,
} as const;

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: motionTransitions.standard,
  },
  exit: {
    opacity: 0,
    transition: motionTransitions.micro,
  },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: motionTransitions.standard,
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: motionTransitions.micro,
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: motionTransitions.standard,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: motionTransitions.micro,
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};
