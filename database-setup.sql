-- Voice Mode App Database Setup
-- Run this SQL in your Supabase SQL Editor to set up the required tables

-- Create the interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('voice', 'text')),
  transcript TEXT,
  response TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_interactions_mode ON interactions(mode);

-- Optional: Create a function to update user streaks
-- This is a placeholder - implement based on your streak logic
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id TEXT)
RETURNS void AS $$
DECLARE
  last_interaction_date TIMESTAMP WITH TIME ZONE;
  current_date DATE := CURRENT_DATE;
  streak_count INTEGER := 1;
BEGIN
  -- Get the most recent interaction date for this user
  SELECT created_at INTO last_interaction_date
  FROM interactions
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If there are previous interactions, calculate streak
  IF last_interaction_date IS NOT NULL THEN
    -- If the last interaction was yesterday, increment streak
    IF DATE(last_interaction_date) = current_date - INTERVAL '1 day' THEN
      -- Get current streak (you would have a separate user_streaks table)
      -- For now, just log that streak would be updated
      RAISE NOTICE 'Streak would be updated for user %', p_user_id;
    -- If the last interaction was today, don't change streak
    ELSIF DATE(last_interaction_date) = current_date THEN
      RAISE NOTICE 'User % already has interaction today', p_user_id;
    -- Otherwise, reset streak to 1
    ELSE
      RAISE NOTICE 'Streak reset to 1 for user %', p_user_id;
    END IF;
  ELSE
    -- First interaction for this user
    RAISE NOTICE 'First interaction for user %', p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a user_streaks table to track streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_interaction_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Row Level Security (RLS) policies
-- Enable RLS on interactions table
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own interactions
CREATE POLICY "Users can view own interactions" ON interactions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy to allow users to insert their own interactions
CREATE POLICY "Users can insert own interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy to allow users to update their own interactions
CREATE POLICY "Users can update own interactions" ON interactions
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Enable RLS on user_streaks table
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own streaks
CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy to allow users to insert their own streaks
CREATE POLICY "Users can insert own streaks" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy to allow users to update their own streaks
CREATE POLICY "Users can update own streaks" ON user_streaks
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_streaks TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_streak(TEXT) TO authenticated;

-- Create a trigger to automatically update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to both tables
CREATE TRIGGER update_interactions_updated_at 
  BEFORE UPDATE ON interactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at 
  BEFORE UPDATE ON user_streaks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Database setup complete!
-- You can now use the Voice Mode App with your Supabase backend.