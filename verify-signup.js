const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rmfywfargfgguqackdvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZnl3ZmFyZ2ZnZ3VxYWNrZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI2ODYsImV4cCI6MjA3ODQ2ODY4Nn0.Il_vSEpUAmp43OsXNt5cdNdSlZNXEvQEiwt3cM0ez9w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSignups() {
  console.log('🔍 Checking recent signups...\n');

  try {
    // Get all users (this requires service role, but let's try)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('Note: Cannot list all users (requires service role)');
      console.log('But we can check if a specific user exists\n');
      return;
    }

    console.log('Total users:', users?.length || 0);
    if (users && users.length > 0) {
      console.log('\nRecent users:');
      users.slice(-5).forEach(user => {
        console.log(`- ${user.email} (created: ${user.created_at})`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSignups();
