import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function Loader({ size = 'md', className }: LoaderProps) {
  return (
    <motion.div className={cn('relative', sizeMap[size], className)}>
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary',
          sizeMap[size],
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}
