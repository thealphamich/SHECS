const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteUserByEmail(email) {
    console.log(`Searching for user with email: ${email}...`)

    // 1. List users to find the ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError.message)
        return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
        console.log(`User ${email} not found.`)
        return
    }

    console.log(`Found user ${user.id}. Deleting...`)

    // 2. Delete the user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
        console.error('Error deleting user:', deleteError.message)
    } else {
        console.log(`Successfully deleted user ${email}`)
    }
}

deleteUserByEmail('chadmichaelmich@gmail.com')
