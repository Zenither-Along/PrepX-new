"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Profile } from '@/hooks/useProfile';
import { GraduationCap, BookOpen, Pencil, Check, X } from 'lucide-react';

interface ProfileHeaderProps {
  profile: Profile | null;
  onUpdateName: (name: string) => Promise<void>;
  loading?: boolean;
}

export function ProfileHeader({ profile, onUpdateName, loading }: ProfileHeaderProps) {
  const { user } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  if (!user || !profile) return null;

  const avatarUrl = profile.avatar_url || user.imageUrl;
  const displayName = profile.full_name || user.fullName || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setSaving(true);
    await onUpdateName(nameValue.trim());
    setSaving(false);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setNameValue(profile.full_name || '');
    setIsEditingName(false);
  };

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
        {/* Avatar */}
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left w-full">
          {/* Name - Editable */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="text-xl md:text-2xl font-bold h-10 md:h-12 w-full md:max-w-md"
                  placeholder="Your name"
                  disabled={saving}
                />
                <Button
                  size="sm"
                  onClick={handleSaveName}
                  disabled={saving || !nameValue.trim()}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold truncate max-w-[200px] md:max-w-none">{displayName}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNameValue(profile.full_name || '');
                    setIsEditingName(true);
                  }}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
            <Badge variant={profile.role === 'teacher' ? 'default' : 'secondary'} className="flex items-center gap-1">
              {profile.role === 'teacher' ? (
                <>
                  <GraduationCap className="h-3 w-3" />
                  Educator
                </>
              ) : (
                <>
                  <BookOpen className="h-3 w-3" />
                  Student
                </>
              )}
            </Badge>
          </div>
          
          <p className="text-muted-foreground mb-1">{profile.email}</p>
          
          <p className="text-sm text-muted-foreground">
            Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

