-- Add profile customization fields
-- Adds bio, avatar_url, and theme_preference to profiles table

-- Add bio field (max 500 characters)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add avatar_url field for custom avatars
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add theme preference (light, dark, or system)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system'
CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Add updated_at timestamp for tracking profile changes
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
