
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useContent } from '@/context/ContentContext';
import ContentCard from '@/components/ui-custom/ContentCard';
import PageTransition from '@/components/layout/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardProfile from '@/components/dashboard/DashboardProfile';
import DashboardAddress from '@/components/dashboard/DashboardAddress';
import DashboardPayment from '@/components/dashboard/DashboardPayment';
import DashboardNotifications from '@/components/dashboard/DashboardNotifications';
import { Bell, BookmarkCheck, ChevronDown, FolderTree, List, Plus, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define interfaces for our grouped tags
interface TagGroup {
  name: string;
  items: Array<{
    id: string;
    name: string;
    subscribed: boolean;
  }>;
}

interface CategoryGroup {
  name: string;
  tags: Array<{
    id: string;
    name: string;
    subscribed: boolean;
  }>;
}

// Group tags by first letter for organizing nested views
const groupTagsByCategory = (tags: Array<{ id: string; name: string; subscribed: boolean }>): TagGroup[] => {
  const categories = tags.reduce<Record<string, TagGroup>>((acc, tag) => {
    const firstLetter = tag.name[0].toUpperCase();
    
    if (!acc[firstLetter]) {
      acc[firstLetter] = {
        name: firstLetter,
        items: []
      };
    }
    
    acc[firstLetter].items.push(tag);
    return acc;
  }, {});
  
  return Object.values(categories).sort((a, b) => a.name.localeCompare(b.name));
};

const Dashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { tags, contentItems, getTagById, subscribedTags, subscribeToTag, unsubscribeFromTag } = useContent();
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [defaultTab, setDefaultTab] = useState('subscribed-tags');
  const { toast } = useToast();
  const [showTree, setShowTree] = useState(false);
  
  const groupedTags = groupTagsByCategory(tags);
  
  // Create nested category groups for an additional level
  const nestedCategories: CategoryGroup[] = [
    { name: "Popular", tags: tags.filter((_, idx) => idx < 3) },
    { name: "Technology", tags: tags.filter(tag => ["Technology", "Science"].includes(tag.name)) },
    { name: "Lifestyle", tags: tags.filter(tag => ["Health", "Travel", "Art"].includes(tag.name)) },
    { name: "Business", tags: tags.filter(tag => ["Business", "Finance"].includes(tag.name)) },
    { name: "Other", tags: tags.filter(tag => !["Technology", "Science", "Health", "Travel", "Art", "Business", "Finance"].includes(tag.name)) }
  ];

  useEffect(() => {
    // Handle navigation from profile dropdown
    if (location.state && location.state.defaultTab) {
      setDefaultTab(location.state.defaultTab);
    }
  }, [location.state]);

  const filteredContent = activeTagId
    ? contentItems.filter(item => item.tagId === activeTagId)
    : contentItems;

  const handleTagClick = (tagId: string) => {
    setActiveTagId(prev => prev === tagId ? null : tagId);
  };

  const handleSubscribe = (tagId: string, isSubscribed: boolean) => {
    if (isSubscribed) {
      unsubscribeFromTag(tagId);
      toast({
        title: "Unsubscribed",
        description: "You have been unsubscribed from this tag",
      });
    } else {
      subscribeToTag(tagId);
      toast({
        title: "Subscribed",
        description: "You have been subscribed to this tag",
      });
    }
  };

  if (!user) {
    return null; // Will redirect via auth protected route
  }

  return (
    <PageTransition>
      <main className="min-h-screen pb-20">
        <Navbar />
        
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-6 bg-background border rounded-md">
              <TabsTrigger value="subscribed-tags" className="flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4" />
                Subscribed Tags
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Subscriptions
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="profile" className="hidden">Profile</TabsTrigger>
              <TabsTrigger value="address" className="hidden">Address</TabsTrigger>
              <TabsTrigger value="payment" className="hidden">Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="subscribed-tags">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl font-bold mb-6"
              >
                Subscribed Tags
              </motion.h1>

              <Card>
                <CardContent className="p-6">
                  {subscribedTags.length > 0 ? (
                    <div className="space-y-6">
                      {subscribedTags.map(tag => {
                        const tagContent = contentItems.filter(item => item.tagId === tag.id);
                        return (
                          <div key={tag.id} className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xl font-medium">{tag.name}</h3>
                              <Button 
                                variant="outline" 
                                onClick={() => handleSubscribe(tag.id, true)}
                                size="sm"
                              >
                                Unsubscribe
                              </Button>
                            </div>
                            <p className="text-muted-foreground">
                              {tagContent.length} items available for this tag
                            </p>
                            {tagContent.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tagContent.slice(0, 3).map(item => (
                                  <ContentCard
                                    key={item.id}
                                    title={item.title}
                                    description={item.description}
                                    imageUrl={item.imageUrl}
                                    tag={tag.name}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-2">No subscribed tags</h3>
                      <p className="text-muted-foreground">
                        Visit the Subscriptions tab to subscribe to tags
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl font-bold mb-6"
              >
                Subscriptions
              </motion.h1>

              <div className="flex items-center space-x-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTree(!showTree)}
                  className="flex items-center gap-1"
                >
                  {showTree ? (
                    <>
                      <List className="h-4 w-4" />
                      <span>Grid View</span>
                    </>
                  ) : (
                    <>
                      <FolderTree className="h-4 w-4" />
                      <span>Tree View</span>
                    </>
                  )}
                </Button>
              </div>

              {showTree ? (
                <Card>
                  <CardContent className="p-6">
                    {/* Level 1: Main Categories */}
                    <Accordion type="multiple" className="w-full">
                      {nestedCategories.map((category, idx) => (
                        <AccordionItem key={idx} value={`category-${idx}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <span className="text-base font-medium">{category.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({category.tags.length})
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            {/* Level 2: Alphabetical Groups */}
                            <div className="pl-4 space-y-3">
                              {groupTagsByCategory(category.tags).map((group, groupIdx) => (
                                <Collapsible key={groupIdx} className="border-l-2 pl-3 py-1">
                                  <CollapsibleTrigger className="flex items-center text-sm font-medium hover:text-primary transition-colors">
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    <span>{group.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ({group.items.length})
                                    </span>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="pt-2 space-y-2">
                                    {/* Level 3: Individual Tags */}
                                    {group.items.map(tag => (
                                      <div 
                                        key={tag.id} 
                                        className="flex items-center justify-between pl-6 pr-1 py-1 hover:bg-accent/20 rounded transition-colors"
                                      >
                                        <span className="text-sm">{tag.name}</span>
                                        <Button
                                          variant={tag.subscribed ? "outline" : "default"}
                                          onClick={() => handleSubscribe(tag.id, tag.subscribed)}
                                          size="sm"
                                          className="h-7 text-xs"
                                        >
                                          {tag.subscribed ? "Unsubscribe" : "Subscribe"}
                                        </Button>
                                      </div>
                                    ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tags.map(tag => (
                        <div key={tag.id} className="border rounded-lg p-4 flex flex-col justify-between">
                          <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2">{tag.name}</h3>
                            <p className="text-muted-foreground text-sm">
                              {contentItems.filter(item => item.tagId === tag.id).length} items available
                            </p>
                          </div>
                          
                          <Button
                            variant={tag.subscribed ? "outline" : "default"}
                            onClick={() => handleSubscribe(tag.id, tag.subscribed)}
                            size="sm"
                            className="self-start"
                          >
                            {tag.subscribed ? "Unsubscribe" : "Subscribe"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notifications">
              <DashboardNotifications />
            </TabsContent>

            <TabsContent value="profile">
              <DashboardProfile />
            </TabsContent>

            <TabsContent value="address">
              <DashboardAddress />
            </TabsContent>

            <TabsContent value="payment">
              <DashboardPayment />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </PageTransition>
  );
};

export default Dashboard;
