-- Create activities table for storing user activities
-- Part of the dual-layer persistence system (localStorage + Supabase)

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  unit VARCHAR(10) NOT NULL CHECK (unit IN ('min', 'hs')), -- minutes or hours
  categoria VARCHAR(50) NOT NULL, -- bienestar, trabajo, creatividad, social, aprendizaje, deporte, hogar, otro
  color VARCHAR(7) NOT NULL, -- hex color code
  date DATE NOT NULL, -- the date the activity occurred
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_id VARCHAR(255),

  CONSTRAINT valid_duration CHECK (duration > 0)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_user_id_date_idx ON activities(user_id, date);
CREATE INDEX IF NOT EXISTS activities_date_idx ON activities(date);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own activities
CREATE POLICY "Users can read own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_activities_updated_at_trigger ON activities;
CREATE TRIGGER update_activities_updated_at_trigger
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();
