"use client";

import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useProfileStats } from '@/hooks/useProfileStats';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileBio } from '@/components/profile/ProfileBio';
import { ProfileSimpleStats } from '@/components/profile/ProfileSimpleStats';
import { TimeChart } from '@/components/profile/TimeChart';
import { ActivityTimeline } from '@/components/profile/ActivityTimeline';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { User, Clock, Settings, Home } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { ModeToggle } from '@/components/mode-toggle';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { profile, loading: profileLoading, updateBio, updateName, updateThemePreference } = useProfile();
  const { stats, recentActivity, loading: statsLoading } = useProfileStats();

  const handleUpdateBio = async (bio: string) => {
    await updateBio(bio);
    toast({
      variant: "success",
      title: "Bio updated!",
      description: "Your profile bio has been saved.",
    });
  };

  const handleUpdateName = async (name: string) => {
    await updateName(name);
    toast({
      variant: "success",
      title: "Name updated!",
      description: "Your profile name has been saved.",
    });
  };

  const handleUpdateTheme = async (theme: 'light' | 'dark' | 'system') => {
    await updateThemePreference(theme);
    toast({
      variant: "success",
      title: "Theme updated!",
      description: `Theme preference set to ${theme}.`,
    });
  };

  // Add app-page class for fixed viewport behavior
  useEffect(() => {
    document.body.classList.add('app-page');
    return () => {
      document.body.classList.remove('app-page');
    };
  }, []);

  if (profileLoading) {
    return (
      <div className="min-h-screen">
        {/* Navigation skeleton */}
        <nav className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
            </div>
          </div>
        </nav>
        
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-muted rounded-lg"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo width={140} height={48} />
            </Link>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9"
                  }
                }}
              />
            </div>
          </div>
        </nav>
        
        <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">
            Please create your profile to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo width={140} height={48} />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9"
                }
              }}
            />
          </div>
        </div>
      </nav>

      <div className="container max-w-6xl mx-auto py-8 px-4">
      <ProfileHeader 
        profile={profile} 
        onUpdateName={handleUpdateName}
        loading={profileLoading}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Left Column - Bio, Streak, and Settings */}
        <div className="space-y-6">
          <ProfileBio
            profile={profile}
            onUpdateBio={handleUpdateBio}
            loading={profileLoading}
          />
          <ProfileSimpleStats
            profile={profile}
            loading={profileLoading}
          />
          <ProfileSettings
            profile={profile}
            onUpdateTheme={handleUpdateTheme}
            loading={profileLoading}
          />
        </div>

        {/* Right Column - Time Chart and Activity */}
        <div className="lg:col-span-2 space-y-6">
          <TimeChart />
          <ActivityTimeline
            activities={recentActivity}
            loading={statsLoading}
          />
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <User className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Clock className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <ProfileBio
              profile={profile}
              onUpdateBio={handleUpdateBio}
              loading={profileLoading}
            />
            <ProfileSimpleStats
              profile={profile}
              loading={profileLoading}
            />
          </TabsContent>

          <TabsContent value="activity" className="mt-6 space-y-6">
            <TimeChart />
            <ActivityTimeline
              activities={recentActivity}
              loading={statsLoading}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <ProfileSettings
              profile={profile}
              onUpdateTheme={handleUpdateTheme}
              loading={profileLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}
