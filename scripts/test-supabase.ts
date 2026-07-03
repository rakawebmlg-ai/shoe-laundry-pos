import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local manually for the script
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndSeed() {
  console.log('Checking connection to Supabase...');
  
  // Try to query services
  const { data: services, error: fetchError } = await supabase.from('services').select('*').limit(1);
  
  if (fetchError) {
    console.error('Failed to connect or read from Supabase. Error:', fetchError.message);
    if (fetchError.message.includes('relation "public.services" does not exist')) {
      console.log('It looks like the SQL script has not been run yet to create the tables!');
    }
    return;
  }

  console.log(`Connected successfully! Found ${services?.length || 0} services.`);

  if (services && services.length === 0) {
    console.log('Database is empty. Attempting to insert a test service to verify write permissions...');
    
    const { error: insertError } = await supabase.from('services').insert({
      name: 'Cuci Deep Clean (Test)',
      description: 'Layanan test',
      price: 50000,
      category: 'deep_clean',
      estimation_days: 3,
      is_active: true
    });

    if (insertError) {
      console.error('Failed to insert data! This usually means Row Level Security (RLS) is active and blocking inserts, or the table structure is wrong. Error:', insertError.message);
    } else {
      console.log('Successfully inserted test data! Write permissions are working fine.');
    }
  }
}

checkAndSeed();
