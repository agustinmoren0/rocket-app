/**
 * SQL Migration 002: Enable RLS and Create Policies for Period History
 * 
 * Description: Enables Row Level Security on period_history table and creates policies
 *              to ensure users can only access their own data
 * 
 * Status: ✅ Applied
 * Date: 2024-11-12
 */

-- ============================================
-- PERIOD_HISTORY TABLE POLICIES
-- ============================================

ALTER TABLE period_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_period_history"
ON period_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_period_history"
ON period_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_period_history"
ON period_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "users_delete_period_history"
ON period_history
FOR DELETE
USING (auth.uid() = user_id);
