
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useContent } from '@/context/ContentContext';
import { Button } from '@/components/ui/button';
import { Bell, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const DashboardNotifications = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    getTagById, 
    contentItems, 
    fetchLatestContent,
    isLoading 
  } = useContent();
  const { toast } = useToast();
  
  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read",
    });
  };
  
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read",
    });
  };
  
  const handleRefresh = () => {
    fetchLatestContent();
    toast({
      title: "Refreshing content",
      description: "Checking for new updates from subscriptions...",
    });
  };
  
  const getContentDetails = (contentId: string) => {
    return contentItems.find(item => item.id === contentId);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold"
        >
          Notifications
        </motion.h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          {notifications.some(n => !n.read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p>Fetching latest updates...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map(notification => {
                const tag = getTagById(notification.tagId);
                const content = getContentDetails(notification.contentId);
                const timeAgo = formatDistance(
                  new Date(notification.createdAt),
                  new Date(),
                  { addSuffix: true }
                );
                
                return (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg ${notification.read ? 'bg-background' : 'bg-accent/10'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`mt-1 p-2 rounded-full ${notification.read ? 'bg-muted' : 'bg-primary/10'}`}>
                          <Bell className={`h-4 w-4 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-secondary/20 px-2 py-0.5 rounded-full">
                              {tag?.name || 'Unknown tag'}
                            </span>
                            <span className="text-xs text-muted-foreground">{timeAgo}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {content && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground mt-1">
                When you receive notifications, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardNotifications;
