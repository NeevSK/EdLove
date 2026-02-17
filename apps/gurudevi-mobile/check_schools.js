const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qzoawolfkuwiuyaoiybz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6b2F3b2xma3V3aXV5YW9peWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTU3ODAsImV4cCI6MjA4NTY5MTc4MH0.4j4R6ELxvvSQD73EDHE1o8UraehRX8dVIOC2pear9to';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchools() {
    console.log('Querying schools...');
    const { data, error } = await supabase
        .from('schools')
        .select('id, name, type');

    if (error) {
        console.error('Error fetching schools:', error);
    } else {
        console.log('Found schools:', data);
    }
}

checkSchools();
