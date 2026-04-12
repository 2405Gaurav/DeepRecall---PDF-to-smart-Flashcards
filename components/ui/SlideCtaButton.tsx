'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const slide = {
  rest: { x: '-100%' },
  hover: { x: 0 },
};

const text = {
  rest: { color: '#134e4a' },
  hover: { color: '#ffffff' },
};

type SlideCtaButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
};

export function SlideCtaButton({
  children,
  onClick,
  className = '',
  type = 'button',
}: SlideCtaButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`relative inline-flex overflow-hidden rounded-lg border-2 border-lab-ink bg-lab-amber shadow-md ${className}`}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      <motion.span
        className="absolute inset-0 bg-lab-ink"
        variants={slide}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <motion.span
        className="relative z-10 block px-7 py-3.5 text-base font-bold tracking-tight sm:px-9 sm:py-4 sm:text-lg md:text-xl"
        variants={text}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}

type SlideCtaLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function SlideCtaLink({ href, children, className = '' }: SlideCtaLinkProps) {
  return (
    <Link href={href} className={`inline-flex ${className}`}>
      <motion.span
        className="relative inline-flex overflow-hidden rounded-lg border-2 border-lab-ink bg-lab-amber shadow-md"
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          className="absolute inset-0 bg-lab-ink"
          variants={slide}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        <motion.span
          className="relative z-10 block px-7 py-3.5 text-base font-bold tracking-tight sm:px-9 sm:py-4 sm:text-lg md:text-xl"
          variants={text}
          transition={{ duration: 0.22 }}
        >
          {children}
        </motion.span>
      </motion.span>
    </Link>
  );
}
