// Quick debugging script to test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rmfywfargfgguqackdvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZnl3ZmFyZ2ZnZ3VxYWNrZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI2ODYsImV4cCI6MjA3ODQ2ODY4Nn0.Il_vSEpUAmp43OsXNt5cdNdSlZNXEvQEiwt3cM0ez9w';

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key (first 50 chars):', supabaseAnonKey.substring(0, 50) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('1️⃣  Testing auth signup...');
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@gmail.com`;
    console.log('Using email:', testEmail);

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
    });

    if (error) {
      console.error('❌ Auth Error:', error);
      console.error('Error code:', error.status);
      console.error('Error message:', error.message);
      return;
    }

    console.log('✅ Auth Success');
    console.log('User:', data?.user?.id);
    console.log('Session:', data?.session?.access_token ? 'Yes' : 'No');

    console.log('\n2️⃣  Testing user_profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.error('❌ Query Error:', profileError);
      return;
    }

    console.log('✅ Table Access Success');
    console.log('Records found:', profiles?.length || 0);

  } catch (err) {
    console.error('❌ Unexpected Error:', err);
  }
}

testConnection();
