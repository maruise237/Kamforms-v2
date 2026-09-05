'use client'

import { useRef } from 'react'
import { AnimatePresence, motion, useInView, type Variants, type UseInViewOptions } from 'framer-motion'

interface BlurFadeProps {
  children: React.ReactNode
  className?: string
  variant?: Variants
  duration?: number
  delay?: number
  yOffset?: number
  blur?: string
  inViewMargin?: UseInViewOptions['margin']
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.5,
  delay = 0,
  yOffset = 10,
  blur = '6px',
  inViewMargin = '-50px' as UseInViewOptions['margin'],
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin })

  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: 0, opacity: 1, filter: 'blur(0px)' },
  }

  const combinedVariants = variant ?? defaultVariants

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inViewResult ? 'visible' : 'hidden'}
        exit="hidden"
        variants={combinedVariants}
        transition={{ delay: 0.04 + delay, duration, ease: [0.21, 1.02, 0.73, 0.99] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
