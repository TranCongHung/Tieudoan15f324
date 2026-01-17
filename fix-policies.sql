-- Fix policies script - Run this after creating tables
-- This will only create policies if they don't already exist

-- Users table policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable read access for all users' AND c.relname = 'users' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable insert for all users' AND c.relname = 'users' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable update for all users' AND c.relname = 'users' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable delete for all users' AND c.relname = 'users' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable delete for all users" ON users FOR DELETE USING (true);
  END IF;
END $$;

-- Articles table policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable read access for all articles' AND c.relname = 'articles' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable read access for all articles" ON articles FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable insert for all articles' AND c.relname = 'articles' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable insert for all articles" ON articles FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable update for all articles' AND c.relname = 'articles' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable update for all articles" ON articles FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable delete for all articles' AND c.relname = 'articles' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable delete for all articles" ON articles FOR DELETE USING (true);
  END IF;
END $$;

-- Other tables policies (simplified)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable full access to milestones' AND c.relname = 'milestones' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable full access to milestones" ON milestones FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable full access to questions' AND c.relname = 'questions' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable full access to questions" ON questions FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable full access to quiz_results' AND c.relname = 'quiz_results' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable full access to quiz_results" ON quiz_results FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable full access to scores' AND c.relname = 'scores' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable full access to scores" ON scores FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable full access to media' AND c.relname = 'media' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable full access to media" ON media FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable full access to leaders' AND c.relname = 'leaders' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable full access to leaders" ON leaders FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable full access to comments' AND c.relname = 'comments' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable full access to comments" ON comments FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable full access to documents' AND c.relname = 'documents' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable full access to documents" ON documents FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'Enable full access to settings' AND c.relname = 'settings' AND n.nspname = current_schema()
  ) THEN
    CREATE POLICY "Enable full access to settings" ON settings FOR ALL USING (true);
  END IF;
END $$;
