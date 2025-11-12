const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rmfywfargfgguqackdvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZnl3ZmFyZ2ZnZ3VxYWNrZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI2ODYsImV4cCI6MjA3ODQ2ODY4Nn0.Il_vSEpUAmp43OsXNt5cdNdSlZNXEvQEiwt3cM0ez9w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  // REEMPLAZA ESTOS VALORES CON TU EMAIL Y CONTRASEÑA
  const testEmail = 'TU_EMAIL_AQUI@gmail.com';
  const testPassword = 'TU_CONTRASEÑA_AQUI';

  console.log('🧪 Testing login flow...\n');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);
  console.log('');

  try {
    console.log('📤 Sending login request...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error('❌ Login Error:', error.message);
      console.error('Code:', error.code);
      console.error('Status:', error.status);
      console.error('\nPossible causes:');
      console.error('1. Email not confirmed (check your email for confirmation link)');
      console.error('2. Wrong password');
      console.error('3. User does not exist');
      return;
    }

    console.log('✅ Login successful!');
    console.log('User ID:', data?.user?.id);
    console.log('Email:', data?.user?.email);
    console.log('Email confirmed:', data?.user?.email_confirmed_at ? 'Yes' : 'NO - UNCONFIRMED');
    console.log('Session token:', data?.session?.access_token ? 'Yes' : 'No');
    console.log('\n✓ User is ready to use the app!');

  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

testLogin();
