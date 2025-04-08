
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Sun, Moon, Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useContent } from '@/context/ContentContext';
import { formatDistance } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    notifications, 
    markNotificationAsRead, 
    getTagById, 
    fetchLatestContent,
    isLoading
  } = useContent();
  const { toast } = useToast();
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme');
    // Check if the user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return savedTheme ? (savedTheme as 'light' | 'dark') : (prefersDark ? 'dark' : 'light');
  });

  // Initialize theme on component mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateToTab = (tabName: string) => {
    navigate('/dashboard', { state: { defaultTab: tabName } });
  };

  const handleRefresh = () => {
    fetchLatestContent();
    toast({
      title: "Checking subscriptions",
      description: "Looking for new content from your subscribed topics...",
    });
  };

  const hasUnreadNotifications = notifications && notifications.some(n => !n.read);
  
  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    navigateToTab('notifications');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">U</span>
            </div>
            <span className="font-semibold text-lg">UserHub</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="relative"
                >
                  <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                    >
                      <Bell className="h-5 w-5" />
                      {hasUnreadNotifications && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex justify-between items-center">
                      <span>Notifications</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateToTab('notifications')}
                        className="text-xs"
                      >
                        View All
                      </Button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {notifications.length > 0 ? (
                      <>
                        {notifications.slice(0, 3).map((notification) => {
                          const tag = getTagById(notification.tagId);
                          const timeAgo = formatDistance(
                            new Date(notification.createdAt),
                            new Date(),
                            { addSuffix: true }
                          );
                          
                          return (
                            <DropdownMenuItem 
                              key={notification.id}
                              className={`flex flex-col items-start cursor-pointer p-3 ${!notification.read ? 'bg-accent/20' : ''}`}
                              onClick={() => handleNotificationClick(notification.id)}
                            >
                              <div className="flex items-start w-full">
                                <div className={`mt-1 p-1.5 rounded-full mr-2 ${notification.read ? 'bg-muted' : 'bg-primary/10'}`}>
                                  <Bell className={`h-3 w-3 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`} />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{notification.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{notification.message}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-secondary/20 px-1.5 py-0.5 rounded-full">
                                      {tag?.name || 'Unknown tag'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                                  </div>
                                </div>
                              </div>
                            </DropdownMenuItem>
                          );
                        })}
                        
                        {notifications.length > 3 && (
                          <DropdownMenuItem 
                            className="text-center text-sm text-primary py-2"
                            onClick={() => navigateToTab('notifications')}
                          >
                            See {notifications.length - 3} more notification{notifications.length - 3 > 1 ? 's' : ''}
                          </DropdownMenuItem>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateToTab('profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateToTab('address')}>
                    Address
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateToTab('payment')}>
                    Payment
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
