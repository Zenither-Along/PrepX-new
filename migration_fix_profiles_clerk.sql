-- Enable RLS on profiles table (in case it's not enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to replace them with Clerk-compatible ones
-- We drop various potential names to be thorough
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;

-- Policy: Users can view all profiles (needed for class members, etc.)
CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert their own profile
-- Using (auth.jwt() ->> 'sub') to handle Clerk's text-based user IDs correctly
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (user_id = (auth.jwt() ->> 'sub'));
