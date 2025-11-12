/**
 * SQL Migration 001: Create Period History Table
 * 
 * Description: Creates the period_history table for tracking menstrual cycle history
 * 
 * Status: ✅ Applied
 * Date: 2024-11-12
 */

-- Create period_history table
CREATE TABLE period_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  timestamp TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_period_history_user_id ON period_history(user_id);
CREATE INDEX idx_period_history_date ON period_history(date);
