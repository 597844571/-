import gsap from 'gsap'

export const createIntroTimeline = (
  onComplete?: () => void
) => {
  const tl = gsap.timeline({ onComplete })
  return tl
}

export const createPresentationTimeline = (
  steps: (() => void)[],
  onComplete?: () => void
) => {
  const tl = gsap.timeline({ onComplete })
  steps.forEach((step, i) => {
    tl.call(step, [], i * 8)
  })
  return tl
}

export const fadeIn = (
  element: HTMLElement | string,
  duration = 1,
  delay = 0
) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration, delay, ease: 'power2.out' }
  )
}

export const fadeOut = (
  element: HTMLElement | string,
  duration = 0.6,
  delay = 0
) => {
  return gsap.to(element, {
    opacity: 0,
    y: -10,
    duration,
    delay,
    ease: 'power2.in',
  })
}

export const scaleIn = (
  element: HTMLElement | string,
  duration = 0.8,
  delay = 0
) => {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration, delay, ease: 'back.out(1.4)' }
  )
}

export const slideInRight = (
  element: HTMLElement | string,
  duration = 0.8,
  delay = 0
) => {
  return gsap.fromTo(
    element,
    { opacity: 0, x: 60 },
    { opacity: 1, x: 0, duration, delay, ease: 'power3.out' }
  )
}

export const slideInLeft = (
  element: HTMLElement | string,
  duration = 0.8,
  delay = 0
) => {
  return gsap.fromTo(
    element,
    { opacity: 0, x: -60 },
    { opacity: 1, x: 0, duration, delay, ease: 'power3.out' }
  )
}

export const glowPulse = (
  element: HTMLElement | string,
  duration = 2,
  repeat = -1
) => {
  return gsap.to(element, {
    boxShadow: '0 0 30px rgba(74, 184, 255, 0.6), 0 0 80px rgba(74, 184, 255, 0.2)',
    duration: duration / 2,
    yoyo: true,
    repeat,
    ease: 'sine.inOut',
  })
}

export const killTimeline = (tl: gsap.core.Timeline | null) => {
  if (tl) {
    tl.kill()
  }
}
