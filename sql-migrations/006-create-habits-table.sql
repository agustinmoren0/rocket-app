-- Create habits table for storing user habits/goals
-- Uses UUID for id (same as activities)

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL, -- lucide icon name: Heart, Briefcase, Palette, Users, Book, Dumbbell, Home, Circle, Brain, etc
  color VARCHAR(7) NOT NULL, -- hex color code
  type VARCHAR(50), -- formar, romper, rastrear, etc
  goal_value INTEGER,
  goal_unit VARCHAR(50), -- minutos, veces, km, etc
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('diario', 'semanal', 'mensual', 'personalizado', 'daily', 'weekly', 'monthly', 'flexible')),
  frequency_interval INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_time VARCHAR(5), -- HH:MM format
  end_time VARCHAR(5),
  days_of_week INTEGER[], -- [0-6] for weekly habits
  dates_of_month INTEGER[], -- [1-31] for monthly habits
  is_preset BOOLEAN DEFAULT FALSE,
  minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_id VARCHAR(255),

  CONSTRAINT valid_goal_value CHECK (goal_value > 0 OR goal_value IS NULL)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habits_user_id_status_idx ON habits(user_id, status);
CREATE INDEX IF NOT EXISTS habits_status_idx ON habits(status);

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own habits
CREATE POLICY "Users can read own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_habits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_habits_updated_at_trigger ON habits;
CREATE TRIGGER update_habits_updated_at_trigger
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_habits_updated_at();
