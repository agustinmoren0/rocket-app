const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rmfywfargfgguqackdvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZnl3ZmFyZ2ZnZ3VxYWNrZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI2ODYsImV4cCI6MjA3ODQ2ODY4Nn0.Il_vSEpUAmp43OsXNt5cdNdSlZNXEvQEiwt3cM0ez9w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  console.log('🧪 Testing signup flow...\n');

  const testEmail = 'agustin_' + Date.now() + '@gmail.com';
  console.log('Email:', testEmail);
  console.log('Password: TestPass123\n');

  try {
    console.log('📤 Sending signup request...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPass123',
      options: {
        data: {
          display_name: 'Test User'
        }
      }
    });

    if (error) {
      console.error('❌ Error:', error.message);
      console.error('Status:', error.status);
      console.error('Code:', error.code);
      return;
    }

    console.log('✅ Signup successful!');
    console.log('User ID:', data?.user?.id);
    console.log('Email:', data?.user?.email);
    console.log('Session:', data?.session ? 'Yes' : 'No');

    // Try to fetch user profiles
    console.log('\n📋 Checking user_profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);

    if (profileError) {
      console.error('❌ Query error:', profileError.message);
      return;
    }

    console.log('✅ Table accessible');
    console.log('Records:', profiles?.length || 0);

  } catch (err) {
    console.error('❌ Exception:', err.message);
    console.error('Stack:', err.stack);
  }
}

testSignup();
