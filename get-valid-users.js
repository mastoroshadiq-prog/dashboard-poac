const { supabase } = require('./config/supabase');

async function getValidUsers() {
  console.log('🔍 Checking user tables...\n');

  // Try different user table names
  const tables = ['user', 'users', 'pengguna', 'user_profile', 'profiles'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(5);

    if (!error) {
      console.log(`✅ Table '${table}' exists:`);
      if (data && data.length > 0) {
        console.log('Sample users:');
        data.forEach(user => {
          const id = user.id || user.user_id || user.id_user;
          const name = user.name || user.nama || user.username || user.email;
          const role = user.role || user.peran || user.jabatan;
          console.log(`  - ID: ${id}, Name: ${name}, Role: ${role}`);
        });
      }
      console.log('');
    }
  }

  // Check auth.users
  console.log('\n🔍 Checking spk_tugas for existing users...');
  const { data: tasks } = await supabase
    .from('spk_tugas')
    .select('id_pelaksana')
    .not('id_pelaksana', 'is', null)
    .limit(5);

  if (tasks && tasks.length > 0) {
    console.log('Valid id_pelaksana from existing tasks:');
    const uniqueIds = [...new Set(tasks.map(t => t.id_pelaksana))];
    uniqueIds.forEach(id => console.log(`  - ${id}`));
  }
}

getValidUsers();
