-- Create interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  summary TEXT,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  mode TEXT NOT NULL CHECK (mode IN ('voice', 'text', 'camera')),
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_mode ON interactions(mode);
CREATE INDEX IF NOT EXISTS idx_interactions_user_created ON interactions(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own interactions
CREATE POLICY "Users can view their own interactions" ON interactions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Create policy for users to insert their own interactions
CREATE POLICY "Users can insert their own interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create policy for users to update their own interactions
CREATE POLICY "Users can update their own interactions" ON interactions
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create policy for users to delete their own interactions
CREATE POLICY "Users can delete their own interactions" ON interactions
  FOR DELETE USING (auth.uid()::text = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();