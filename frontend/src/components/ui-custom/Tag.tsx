
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const Tag = ({ label, active = false, onClick, className }: TagProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 focus-ring',
        active 
          ? 'bg-primary text-white shadow-md' 
          : 'bg-secondary text-foreground hover:bg-secondary/80',
        className
      )}
    >
      {label}
      {active && (
        <motion.span 
          layoutId="tag-active-indicator"
          className="absolute inset-0 rounded-full"
          transition={{ type: 'spring', bounce: 0.2 }}
        />
      )}
    </motion.button>
  );
};

export default Tag;
