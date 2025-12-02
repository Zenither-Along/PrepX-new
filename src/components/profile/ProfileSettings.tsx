"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Profile } from '@/hooks/useProfile';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ProfileSettingsProps {
  profile: Profile | null;
  onUpdateTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  loading?: boolean;
}

export function ProfileSettings({ profile, onUpdateTheme, loading }: ProfileSettingsProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sync profile theme preference with next-themes on mount
  useEffect(() => {
    setMounted(true);
    if (profile?.theme_preference && theme !== profile.theme_preference) {
      setTheme(profile.theme_preference);
    }
  }, [profile?.theme_preference]);

  const handleThemeChange = async (value: string) => {
    const newTheme = value as 'light' | 'dark' | 'system';
    
    // Apply theme immediately via next-themes
    setTheme(newTheme);
    
    // Save to database
    await onUpdateTheme(newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      {/* Theme Preference */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose how PrepX looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={theme}
            onValueChange={handleThemeChange}
            disabled={loading}
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center gap-3 cursor-pointer flex-1">
                <Sun className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-medium">Light</div>
                  <div className="text-sm text-muted-foreground">Use light theme</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center gap-3 cursor-pointer flex-1">
                <Moon className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Dark</div>
                  <div className="text-sm text-muted-foreground">Use dark theme</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center gap-3 cursor-pointer flex-1">
                <Monitor className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">System</div>
                  <div className="text-sm text-muted-foreground">Match system preference</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Role</Label>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{profile?.role}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Member Since</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {profile?.created_at && new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

