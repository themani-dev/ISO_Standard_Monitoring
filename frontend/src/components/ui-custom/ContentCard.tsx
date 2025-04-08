
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Tag from './Tag';

interface ContentCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  tag: string;
  className?: string;
}

const ContentCard = ({ title, description, imageUrl, tag, className }: ContentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn(
        'overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition-all',
        'hover:shadow-md hover:border-gray-200 focus-within:ring-2 focus-within:ring-primary/30',
        className
      )}
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="p-5">
        <div className="mb-3">
          <Tag label={tag} active={false} />
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
          {description}
        </p>
        
        <div className="pt-2">
          <button
            className="text-primary font-medium text-sm hover:underline focus-ring rounded"
          >
            Read more
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
