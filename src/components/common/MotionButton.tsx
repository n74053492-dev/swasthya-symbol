import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

export interface MotionButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const MotionButton: React.FC<MotionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  // Contrasting colors against gradient (#47C8B0 -> #F7FDB4)
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-wide rounded-xl cursor-pointer select-none transition-colors focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      // Deep contrasting navy-midnight with soft glowing shadow
      variantStyles =
        'bg-[#0E2A47] text-white hover:bg-[#143B63] shadow-md shadow-[#0E2A47]/20 border border-[#0E2A47]';
      break;
    case 'secondary':
      // White contrast card with deep navy border and text
      variantStyles =
        'bg-white/95 text-[#0E2A47] hover:bg-white hover:text-black border border-slate-300 shadow-xs shadow-slate-900/5';
      break;
    case 'outline':
      variantStyles =
        'bg-transparent text-[#0E2A47] border-2 border-[#0E2A47] hover:bg-[#0E2A47] hover:text-white';
      break;
    case 'danger':
      variantStyles =
        'bg-red-700 text-white hover:bg-red-800 shadow-md shadow-red-900/20 border border-red-700';
      break;
    case 'ghost':
      variantStyles =
        'bg-transparent text-[#0E2A47] hover:bg-black/5 hover:text-black';
      break;
  }

  const sizeStyles =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs gap-1.5'
      : size === 'lg'
      ? 'px-5 py-2.5 text-sm gap-2.5'
      : 'px-4 py-2 text-xs sm:text-sm gap-2';

  return (
    <motion.button
      whileHover={{
        scale: 1.03,
        y: -2,
        transition: { type: 'spring', stiffness: 450, damping: 17 },
      }}
      whileTap={{
        scale: 0.96,
        transition: { type: 'spring', stiffness: 500, damping: 15 },
      }}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
