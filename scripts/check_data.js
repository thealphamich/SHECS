
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
    const { data: topups, error: topupError } = await supabase.from('topups').select('*');
    if (topupError) {
        console.error('Error fetching topups:', topupError);
    } else {
        console.log('Topups count:', topups.length);
        if (topups.length > 0) {
            console.log('Sample topup:', topups[0]);
        }
    }

    const { data: alerts, error: alertError } = await supabase.from('alerts').select('*');
    if (alertError) {
        console.error('Error fetching alerts:', alertError);
    } else {
        console.log('Alerts count:', alerts.length);
    }
}

checkData();
