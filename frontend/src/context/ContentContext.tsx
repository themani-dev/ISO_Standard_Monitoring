
import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface Tag {
  id: string;
  name: string;
  subscribed: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tagId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  contentId: string;
  tagId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface ContentContextType {
  tags: Tag[];
  contentItems: ContentItem[];
  subscribedTags: Tag[];
  notifications: Notification[];
  isLoading: boolean;
  subscribeToTag: (tagId: string) => void;
  unsubscribeFromTag: (tagId: string) => void;
  getTagById: (tagId: string) => Tag | undefined;
  getContentByTag: (tagId: string) => ContentItem[];
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  fetchLatestContent: () => void;
}

// Mock data
const MOCK_TAGS: Tag[] = [
  { id: 'tag1', name: 'Technology', subscribed: true },
  { id: 'tag2', name: 'Design', subscribed: false },
  { id: 'tag3', name: 'Business', subscribed: true },
  { id: 'tag4', name: 'Health', subscribed: false },
  { id: 'tag5', name: 'Finance', subscribed: false },
  { id: 'tag6', name: 'Science', subscribed: false },
  { id: 'tag7', name: 'Art', subscribed: false },
  { id: 'tag8', name: 'Travel', subscribed: false },
];

const MOCK_CONTENT: ContentItem[] = [
  {
    id: 'content1',
    title: 'The Future of AI in Everyday Life',
    description: 'Artificial intelligence is transforming how we interact with technology. From voice assistants to personalized recommendations, AI is becoming an invisible part of our daily routines.',
    imageUrl: 'https://images.unsplash.com/photo-1677442135388-8fd2392ef512?q=80&w=2940&auto=format&fit=crop',
    tagId: 'tag1',
    createdAt: '2023-06-15T12:00:00Z'
  },
  {
    id: 'content2',
    title: 'Minimalist Design Principles for Digital Products',
    description: 'Less is more. Discover how minimalist design principles can create more intuitive, elegant, and user-friendly digital experiences.',
    imageUrl: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?q=80&w=2940&auto=format&fit=crop',
    tagId: 'tag2',
    createdAt: '2023-06-14T15:30:00Z'
  },
  {
    id: 'content3',
    title: 'Sustainable Business Models in 2023',
    description: 'How companies are adapting their business models to meet the growing demand for sustainability while maintaining profitability.',
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2940&auto=format&fit=crop',
    tagId: 'tag3',
    createdAt: '2023-06-13T09:45:00Z'
  },
  {
    id: 'content4',
    title: 'Mental Health in the Digital Age',
    description: 'Exploring the impact of digital technology on mental health and strategies for maintaining wellbeing in an always-connected world.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2880&auto=format&fit=crop',
    tagId: 'tag4',
    createdAt: '2023-06-12T14:20:00Z'
  },
  {
    id: 'content5',
    title: 'Investing in Renewable Energy',
    description: 'A look at the financial opportunities in the growing renewable energy sector and what investors should know before getting involved.',
    imageUrl: 'https://images.unsplash.com/photo-1553434227-59f71ab8a382?q=80&w=2940&auto=format&fit=crop',
    tagId: 'tag5',
    createdAt: '2023-06-11T11:15:00Z'
  },
  {
    id: 'content6',
    title: 'Breakthrough in Quantum Computing',
    description: 'Scientists have achieved a major milestone in quantum computing that could revolutionize how we process information.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2834&auto=format&fit=crop',
    tagId: 'tag6',
    createdAt: '2023-06-10T16:40:00Z'
  },
  {
    id: 'content7',
    title: 'Modern Art in the Digital Era',
    description: 'How digital tools and platforms are transforming the creation, distribution, and consumption of art in the 21st century.',
    imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2940&auto=format&fit=crop',
    tagId: 'tag7',
    createdAt: '2023-06-09T10:30:00Z'
  },
  {
    id: 'content8',
    title: 'Sustainable Tourism Destinations',
    description: 'Discover eco-friendly travel destinations that allow you to explore the world while minimizing your environmental impact.',
    imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2940&auto=format&fit=crop',
    tagId: 'tag8',
    createdAt: '2023-06-08T13:50:00Z'
  },
  {
    id: 'content9',
    title: '5G Technology and Its Applications',
    description: 'An in-depth look at how 5G technology is enabling new applications and transforming industries worldwide.',
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=2940&auto=format&fit=crop',
    tagId: 'tag1',
    createdAt: '2023-06-07T08:15:00Z'
  },
  {
    id: 'content10',
    title: 'Color Psychology in User Interface Design',
    description: 'Understanding how color choices influence user perception and behavior when interacting with digital interfaces.',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2827&auto=format&fit=crop',
    tagId: 'tag2',
    createdAt: '2023-06-06T17:20:00Z'
  },
  {
    id: 'content11',
    title: 'Remote Work Strategies for Business Leaders',
    description: 'Effective strategies for managing remote teams and maintaining productivity in distributed work environments.',
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2873&auto=format&fit=crop',
    tagId: 'tag3',
    createdAt: '2023-06-05T12:40:00Z'
  },
  {
    id: 'content12',
    title: 'Nutrition Science: Separating Fact from Fiction',
    description: 'A science-based approach to understanding nutrition and making informed dietary choices for long-term health.',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2940&auto=format&fit=crop',
    tagId: 'tag4',
    createdAt: '2023-06-04T09:10:00Z'
  }
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    contentId: 'content1',
    tagId: 'tag1',
    title: 'New Technology Article',
    message: 'Check out "The Future of AI in Everyday Life" in your subscribed Technology tag.',
    createdAt: '2023-07-01T10:30:00Z',
    read: false
  },
  {
    id: 'notif2',
    contentId: 'content3',
    tagId: 'tag3',
    title: 'New Business Article',
    message: 'Check out "Sustainable Business Models in 2023" in your subscribed Business tag.',
    createdAt: '2023-06-29T14:15:00Z',
    read: true
  },
  {
    id: 'notif3',
    contentId: 'content11',
    tagId: 'tag3',
    title: 'New Business Strategy Article',
    message: 'Check out "Remote Work Strategies for Business Leaders" in your subscribed Business tag.',
    createdAt: '2023-06-27T09:45:00Z',
    read: false
  }
];

// Create context
const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial content
  useEffect(() => {
    const loadContent = async () => {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setTags(MOCK_TAGS);
      setContentItems(MOCK_CONTENT);
      setNotifications(MOCK_NOTIFICATIONS);
      setIsLoading(false);
    };
    
    loadContent();
  }, []);

  // Simulate Kafka subscription updates
  useEffect(() => {
    // Only start the subscription after initial load
    if (!isLoading) {
      const subscription = setInterval(() => {
        const subscribedTagIds = tags.filter(tag => tag.subscribed).map(tag => tag.id);
        
        // Only generate notifications if there are subscribed tags
        if (subscribedTagIds.length > 0) {
          // Randomly decide if we should generate a new notification (30% chance)
          const shouldGenerateNotification = Math.random() < 0.3;
          
          if (shouldGenerateNotification) {
            // Randomly select one of the subscribed tags
            const randomTagIndex = Math.floor(Math.random() * subscribedTagIds.length);
            const selectedTagId = subscribedTagIds[randomTagIndex];
            const selectedTag = tags.find(tag => tag.id === selectedTagId);
            
            // Create a new content item
            const newContentId = `content-${Date.now()}`;
            const newContent: ContentItem = {
              id: newContentId,
              title: `New Update on ${selectedTag?.name || 'Topic'}`,
              description: `This is a new content item for the ${selectedTag?.name || 'unknown'} tag that was just published.`,
              imageUrl: 'https://images.unsplash.com/photo-1576153192396-180ecef2a715?q=80&w=1974&auto=format&fit=crop',
              tagId: selectedTagId,
              createdAt: new Date().toISOString()
            };
            
            // Create a new notification
            const newNotification: Notification = {
              id: `notif-${Date.now()}`,
              contentId: newContentId,
              tagId: selectedTagId,
              title: `New ${selectedTag?.name || 'Topic'} Update`,
              message: `Check out "${newContent.title}" in your subscribed ${selectedTag?.name || 'Topic'} tag.`,
              createdAt: new Date().toISOString(),
              read: false
            };
            
            // Update state with new content and notification
            setContentItems(prevContent => [newContent, ...prevContent]);
            setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
            
            // Show browser notification if supported
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`New ${selectedTag?.name} Update`, {
                body: newContent.title,
                icon: '/favicon.ico'
              });
            }
          }
        }
      }, 30000); // Check for updates every 30 seconds
      
      return () => clearInterval(subscription);
    }
  }, [isLoading, tags]);

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const subscribedTags = tags.filter(tag => tag.subscribed);

  const subscribeToTag = (tagId: string) => {
    setTags(tags.map(tag => 
      tag.id === tagId ? { ...tag, subscribed: true } : tag
    ));
  };

  const unsubscribeFromTag = (tagId: string) => {
    setTags(tags.map(tag => 
      tag.id === tagId ? { ...tag, subscribed: false } : tag
    ));
  };

  const getTagById = (tagId: string) => {
    return tags.find(tag => tag.id === tagId);
  };

  const getContentByTag = (tagId: string) => {
    return contentItems.filter(item => item.tagId === tagId);
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  // Function to manually trigger content fetch (simulating API pull)
  const fetchLatestContent = () => {
    setIsLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      // Generate a new random content item for one of the subscribed tags
      const subscribedTagIds = tags.filter(tag => tag.subscribed).map(tag => tag.id);
      
      if (subscribedTagIds.length > 0) {
        // Randomly select one of the subscribed tags
        const randomTagIndex = Math.floor(Math.random() * subscribedTagIds.length);
        const selectedTagId = subscribedTagIds[randomTagIndex];
        const selectedTag = tags.find(tag => tag.id === selectedTagId);
        
        // Create new content items
        const newContentsCount = Math.floor(Math.random() * 3) + 1; // 1-3 new items
        const newContentItems: ContentItem[] = [];
        const newNotifications: Notification[] = [];
        
        for (let i = 0; i < newContentsCount; i++) {
          const newContentId = `content-fetch-${Date.now()}-${i}`;
          const newContent: ContentItem = {
            id: newContentId,
            title: `Latest Update on ${selectedTag?.name || 'Topic'} #${i+1}`,
            description: `This is a freshly fetched content item for the ${selectedTag?.name || 'unknown'} tag.`,
            imageUrl: 'https://images.unsplash.com/photo-1579403124614-197f69d8187b?q=80&w=2064&auto=format&fit=crop',
            tagId: selectedTagId,
            createdAt: new Date().toISOString()
          };
          
          const newNotification: Notification = {
            id: `notif-fetch-${Date.now()}-${i}`,
            contentId: newContentId,
            tagId: selectedTagId,
            title: `New ${selectedTag?.name || 'Topic'} Update`,
            message: `Check out "${newContent.title}" in your subscribed ${selectedTag?.name || 'Topic'} tag.`,
            createdAt: new Date().toISOString(),
            read: false
          };
          
          newContentItems.push(newContent);
          newNotifications.push(newNotification);
        }
        
        // Update state with new content and notifications
        setContentItems(prevContent => [...newContentItems, ...prevContent]);
        setNotifications(prevNotifications => [...newNotifications, ...prevNotifications]);
      }
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <ContentContext.Provider
      value={{
        tags,
        contentItems,
        subscribedTags,
        notifications,
        isLoading,
        subscribeToTag,
        unsubscribeFromTag,
        getTagById,
        getContentByTag,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        fetchLatestContent
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
