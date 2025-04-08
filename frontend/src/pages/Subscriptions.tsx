
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Tag from '@/components/ui-custom/Tag';
import PageTransition from '@/components/layout/PageTransition';
import { useContent } from '@/context/ContentContext';
import { Check, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Subscriptions = () => {
  const { tags, subscribeToTag, unsubscribeFromTag, getContentByTag } = useContent();
  const { toast } = useToast();

  const handleSubscribe = (tagId: string, tagName: string) => {
    subscribeToTag(tagId);
    toast({
      title: `Subscribed to ${tagName}`,
      description: "You'll now receive updates from this tag."
    });
  };

  const handleUnsubscribe = (tagId: string, tagName: string) => {
    unsubscribeFromTag(tagId);
    toast({
      title: `Unsubscribed from ${tagName}`,
      description: "You'll no longer receive updates from this tag."
    });
  };

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
              className="text-3xl sm:text-4xl font-bold mb-3"
            >
              Manage Subscriptions
            </motion.h1>
            <p className="text-muted-foreground text-lg">
              Subscribe to tags that interest you to personalize your feed
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tags.map(tag => {
              const contentCount = getContentByTag(tag.id).length;
              
              return (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <Tag label={tag.name} active={tag.subscribed} />
                          <CardTitle className="mt-4 text-xl">{tag.name}</CardTitle>
                          <CardDescription>
                            {contentCount} {contentCount === 1 ? 'article' : 'articles'} available
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">
                        Stay updated with the latest {tag.name.toLowerCase()} content and news.
                      </p>
                    </CardContent>
                    <CardFooter>
                      {tag.subscribed ? (
                        <Button 
                          className="w-full" 
                          variant="outline" 
                          onClick={() => handleUnsubscribe(tag.id, tag.name)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Subscribed
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => handleSubscribe(tag.id, tag.name)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Subscribe
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </PageTransition>
  );
};

export default Subscriptions;
