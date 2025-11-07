-- Create interactions table
CREATE TABLE interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 5),
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insights table
CREATE TABLE insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  streak_count INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE,
  frequent_subjects JSONB DEFAULT '{}',
  confidence_trend INTEGER[] DEFAULT '{}',
  highlights JSONB DEFAULT '{"best_answers": [], "areas_to_review": [], "achievements": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);
CREATE INDEX idx_interactions_subject ON interactions(subject);
CREATE INDEX idx_insights_user_id ON insights(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust these based on your auth setup)
CREATE POLICY "Users can view own interactions" ON interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON insights
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  current_date DATE := CURRENT_DATE;
  last_interaction_date DATE;
  has_interaction_today BOOLEAN := FALSE;
BEGIN
  -- Check if user has interaction today
  SELECT EXISTS(
    SELECT 1 FROM interactions 
    WHERE user_id = user_uuid 
    AND DATE(created_at) = current_date
  ) INTO has_interaction_today;
  
  IF NOT has_interaction_today THEN
    -- Check if user has interaction yesterday to continue streak
    SELECT EXISTS(
      SELECT 1 FROM interactions 
      WHERE user_id = user_uuid 
      AND DATE(created_at) = current_date - INTERVAL '1 day'
    ) INTO has_interaction_today;
  END IF;
  
  IF NOT has_interaction_today THEN
    RETURN 0;
  END IF;
  
  -- Calculate streak by counting consecutive days with interactions
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM interactions 
      WHERE user_id = user_uuid 
      AND DATE(created_at) = current_date
    ) INTO has_interaction_today;
    
    IF has_interaction_today THEN
      streak_count := streak_count + 1;
      current_date := current_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
    
    EXIT WHEN current_date < (CURRENT_DATE - INTERVAL '365 days'); -- Safety limit
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user insights
CREATE OR REPLACE FUNCTION get_user_insights(user_id_param UUID)
RETURNS TABLE (
  streak_count INTEGER,
  last_active TIMESTAMP WITH TIME ZONE,
  frequent_subjects JSONB,
  confidence_trend INTEGER[],
  highlights JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(i.streak_count, 0) as streak_count,
    i.last_active,
    COALESCE(i.frequent_subjects, '{}'::jsonb) as frequent_subjects,
    COALESCE(i.confidence_trend, ARRAY[]::INTEGER[]) as confidence_trend,
    COALESCE(i.highlights, '{"best_answers": [], "areas_to_review": [], "achievements": []}'::jsonb) as highlights
  FROM insights i
  WHERE i.user_id = user_id_param;
  
  -- If no insights record exists, return default values
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      0 as streak_count,
      NULL as last_active,
      '{}'::jsonb as frequent_subjects,
      ARRAY[]::INTEGER[] as confidence_trend,
      '{"best_answers": [], "areas_to_review": [], "achievements": []}'::jsonb as highlights;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update insights after interaction
CREATE OR REPLACE FUNCTION update_insights_after_interaction(
  p_user_id UUID,
  p_subject TEXT,
  p_confidence INTEGER,
  p_summary TEXT
)
RETURNS VOID AS $$
DECLARE
  existing_insights RECORD;
  new_streak INTEGER;
  subject_count INTEGER;
  updated_subjects JSONB;
  updated_trend INTEGER[];
BEGIN
  -- Get or create insights record
  SELECT * INTO existing_insights 
  FROM insights 
  WHERE user_id = p_user_id;
  
  -- Calculate new streak
  new_streak := calculate_streak(p_user_id);
  
  -- Update frequent subjects
  IF existing_insights IS NOT NULL THEN
    updated_subjects := existing_insights.frequent_subjects;
    subject_count := COALESCE((updated_subjects->>p_subject)::INTEGER, 0) + 1;
    updated_subjects := jsonb_set(updated_subjects, ARRAY[p_subject], to_jsonb(subject_count));
    
    -- Update confidence trend (keep last 30 entries)
    updated_trend := existing_insights.confidence_trend;
    updated_trend := array_append(updated_trend, p_confidence);
    IF array_length(updated_trend, 1) > 30 THEN
      updated_trend := updated_trend[array_length(updated_trend, 1) - 29:array_length(updated_trend, 1)];
    END IF;
    
    -- Update insights
    UPDATE insights SET
      streak_count = new_streak,
      last_active = NOW(),
      frequent_subjects = updated_subjects,
      confidence_trend = updated_trend,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Create new insights record
    INSERT INTO insights (
      user_id,
      streak_count,
      last_active,
      frequent_subjects,
      confidence_trend,
      highlights
    ) VALUES (
      p_user_id,
      new_streak,
      NOW(),
      jsonb_build_object(p_subject, 1),
      ARRAY[p_confidence],
      jsonb_build_object(
        'best_answers', ARRAY[p_summary],
        'areas_to_review', CASE WHEN p_confidence <= 2 THEN ARRAY[p_subject] ELSE ARRAY[]::TEXT[] END,
        'achievements', CASE WHEN p_confidence >= 4 THEN ARRAY['High confidence achieved!'] ELSE ARRAY[]::TEXT[] END
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update insights after interaction
CREATE OR REPLACE FUNCTION trigger_update_insights()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_insights_after_interaction(
    NEW.user_id,
    NEW.subject,
    NEW.confidence,
    NEW.summary
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_insights_after_interaction
  AFTER INSERT ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_insights();