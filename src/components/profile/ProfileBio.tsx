"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, X, Check } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';

interface ProfileBioProps {
  profile: Profile | null;
  onUpdateBio: (bio: string) => Promise<void>;
  loading?: boolean;
}

export function ProfileBio({ profile, onUpdateBio, loading }: ProfileBioProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdateBio(bioText);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setBioText(profile?.bio || '');
    setIsEditing(false);
  };

  const maxLength = 500;
  const remaining = maxLength - bioText.length;

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">About</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={loading}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <Textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value.slice(0, maxLength))}
              placeholder="Tell us about yourself..."
              className="min-h-[120px] resize-none"
              maxLength={maxLength}
            />
            <p className={`text-sm mt-2 ${remaining < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remaining} characters remaining
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
            >
              <Check className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={saving}
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground whitespace-pre-wrap">
          {profile?.bio || 'No bio yet. Click Edit to add one!'}
        </p>
      )}
    </div>
  );
}
