const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse env files
const tryLoadEnv = (filename) => {
  const filePath = path.join(process.cwd(), filename);
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        val = val.trim();
        // Remove quotes if present
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }
};

tryLoadEnv('.env.local');
tryLoadEnv('.env');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL configured:', !!supabaseUrl);
console.log('Supabase Key configured:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Supabase credentials missing.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching profiles:', error);
    } else {
      console.log('Successfully connected to profiles!');
      if (data && data.length > 0) {
        console.log('Profile columns:', Object.keys(data[0]));
      } else {
        console.log('Profiles table is empty. Data:', data);
      }
    }
  } catch (err) {
    console.error('Catch error:', err);
  }
}

checkSchema();
