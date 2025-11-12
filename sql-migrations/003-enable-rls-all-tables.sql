/**
 * SQL Migration 003: Enable RLS on All User Tables
 * 
 * Description: Enables Row Level Security on all user data tables
 *              (activities, cycle_data, habits, habit_completions, reflections, user_settings)
 *              and creates comprehensive policies to protect user data
 * 
 * Status: ✅ Applied
 * Date: 2024-11-12
 * 
 * Note: This is a comprehensive RLS setup that ensures users can only access their own data
 */

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ACTIVITIES TABLE POLICIES
-- ============================================

CREATE POLICY "users_select_activities"
ON activities
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_activities"
ON activities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_activities"
ON activities
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "users_delete_activities"
ON activities
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- CYCLE_DATA TABLE POLICIES
-- ============================================

CREATE POLICY "users_select_cycle_data"
ON cycle_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_cycle_data"
ON cycle_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_cycle_data"
ON cycle_data
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "users_delete_cycle_data"
ON cycle_data
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- HABITS TABLE POLICIES
-- ============================================

CREATE POLICY "users_select_habits"
ON habits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_habits"
ON habits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_habits"
ON habits
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "users_delete_habits"
ON habits
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- HABIT_COMPLETIONS TABLE POLICIES
-- ============================================

CREATE POLICY "users_select_habit_completions"
ON habit_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_habit_completions"
ON habit_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_habit_completions"
ON habit_completions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "users_delete_habit_completions"
ON habit_completions
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- REFLECTIONS TABLE POLICIES
-- ============================================

CREATE POLICY "users_select_reflections"
ON reflections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_reflections"
ON reflections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_reflections"
ON reflections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "users_delete_reflections"
ON reflections
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- USER_SETTINGS TABLE POLICIES
-- ============================================

CREATE POLICY "users_select_settings"
ON user_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_settings"
ON user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_settings"
ON user_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "users_delete_settings"
ON user_settings
FOR DELETE
USING (auth.uid() = user_id);
