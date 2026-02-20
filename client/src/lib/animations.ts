import type { Variants } from 'framer-motion';

const easeOutExpo: [number, number, number, number] = [0.23, 1, 0.32, 1];

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

export const cardHover: Variants = {
  rest: { y: 0, boxShadow: 'var(--shadow-card)' },
  hover: {
    y: -8,
    boxShadow: 'var(--shadow-card-hover)',
    transition: { duration: 0.4, ease: easeOutExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};
