
const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
const { resolve } = require('path');

// Load env from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTopups() {
    console.log('Checking topups table...');
    const { count, error } = await supabase.from('topups').select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error counting topups:', error);
    } else {
        console.log(`Total Topups found: ${count}`);
    }

    // Also check if we can fetch one
    const { data, error: fetchError } = await supabase.from('topups').select('*').limit(1);
    if (fetchError) {
        console.error('Error fetching sample:', fetchError);
    } else if (data.length > 0) {
        console.log('Sample topup:', data[0]);
    } else {
        console.log('No topups data returned.');
    }
}

checkTopups();
