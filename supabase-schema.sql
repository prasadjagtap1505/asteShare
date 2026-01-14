-- =============================================
-- PasteShare Database Schema for Supabase
-- FRESH START - Deletes ALL existing data
-- With 5-hour TTL for shared links
-- =============================================

-- =============================================
-- STEP 1: DROP EVERYTHING (with error handling)
-- =============================================

-- Drop existing policies on file_nodes (if table exists)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own file nodes" ON file_nodes;
    DROP POLICY IF EXISTS "Anyone can view public file nodes" ON file_nodes;
    DROP POLICY IF EXISTS "Anyone can view shared file nodes" ON file_nodes;
    DROP POLICY IF EXISTS "Users can create own file nodes" ON file_nodes;
    DROP POLICY IF EXISTS "Users can update own file nodes" ON file_nodes;
    DROP POLICY IF EXISTS "Users can delete own file nodes" ON file_nodes;
    DROP POLICY IF EXISTS "Users can view own project file nodes" ON file_nodes;
    DROP POLICY IF EXISTS "Anyone can view public project file nodes" ON file_nodes;
    DROP POLICY IF EXISTS "Anyone can view shared project file nodes" ON file_nodes;
    DROP POLICY IF EXISTS "Users can create file nodes in own projects" ON file_nodes;
    DROP POLICY IF EXISTS "Users can update file nodes in own projects" ON file_nodes;
    DROP POLICY IF EXISTS "Users can delete file nodes in own projects" ON file_nodes;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Drop existing tables (this deletes ALL data)
DROP TABLE IF EXISTS file_nodes CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS get_user_email(UUID);
DROP FUNCTION IF EXISTS is_share_link_valid(TEXT);

-- =============================================
-- STEP 2: ENABLE EXTENSIONS
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STEP 3: CREATE TABLES
-- =============================================

-- File nodes table (files and folders owned directly by users)
-- share_expires_at = when the share link expires (5 hours from generation)
CREATE TABLE file_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES file_nodes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('file', 'folder')),
  name TEXT NOT NULL,
  content TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_id TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STEP 4: CREATE INDEXES
-- =============================================

CREATE INDEX idx_file_nodes_owner_id ON file_nodes(owner_id);
CREATE INDEX idx_file_nodes_parent_id ON file_nodes(parent_id);
CREATE INDEX idx_file_nodes_share_id ON file_nodes(share_id);
CREATE INDEX idx_file_nodes_is_public ON file_nodes(is_public);
CREATE INDEX idx_file_nodes_share_expires_at ON file_nodes(share_expires_at);

-- =============================================
-- STEP 5: HELPER FUNCTIONS
-- =============================================

-- Function to check if a share link is still valid (not expired)
CREATE OR REPLACE FUNCTION is_share_link_valid(p_share_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM file_nodes 
    WHERE share_id = p_share_id 
    AND (share_expires_at IS NULL OR share_expires_at > NOW())
  );
$$;

-- Function to get user email by ID
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;

-- =============================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE file_nodes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 7: CREATE RLS POLICIES
-- =============================================

-- Policy: Users can view their own files/folders
CREATE POLICY "Users can view own file nodes"
  ON file_nodes FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy: Anyone can view public files/folders
CREATE POLICY "Anyone can view public file nodes"
  ON file_nodes FOR SELECT
  USING (is_public = TRUE);

-- Policy: Anyone can view shared files/folders (only if not expired)
CREATE POLICY "Anyone can view shared file nodes"
  ON file_nodes FOR SELECT
  USING (
    share_id IS NOT NULL 
    AND (share_expires_at IS NULL OR share_expires_at > NOW())
  );

-- Policy: Users can create their own files/folders
CREATE POLICY "Users can create own file nodes"
  ON file_nodes FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own files/folders
CREATE POLICY "Users can update own file nodes"
  ON file_nodes FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can delete their own files/folders
CREATE POLICY "Users can delete own file nodes"
  ON file_nodes FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- DONE! Database is ready.
-- Share links expire 5 hours after generation.
-- =============================================
