
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useContent, Tag as TagType } from '@/context/ContentContext';
import Navbar from '@/components/layout/Navbar';
import Tag from '@/components/ui-custom/Tag';
import ContentCard from '@/components/ui-custom/ContentCard';
import PageTransition from '@/components/layout/PageTransition';

const Index = () => {
  const { tags, contentItems, getTagById } = useContent();
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const filteredContent = selectedTagId
    ? contentItems.filter(item => item.tagId === selectedTagId)
    : contentItems;

  return (
    <PageTransition>
      <main className="min-h-screen pb-20">
        <Navbar />
        
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold mb-6 text-center"
            >
              Discover latest updates
            </motion.h1>
            
            <div className="flex items-center justify-center flex-wrap gap-2 mb-6 px-4">
              <Tag
                label="All"
                active={selectedTagId === null}
                onClick={() => setSelectedTagId(null)}
                className="mb-2"
              />
              
              {tags.map(tag => (
                <Tag
                  key={tag.id}
                  label={tag.name}
                  active={selectedTagId === tag.id}
                  onClick={() => setSelectedTagId(tag.id)}
                  className="mb-2"
                />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map(item => {
              const tag = getTagById(item.tagId);
              
              return (
                <ContentCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  imageUrl={item.imageUrl}
                  tag={tag?.name || 'Unknown'}
                />
              );
            })}
          </div>
          
          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-500">No content found</h3>
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
};

export default Index;
