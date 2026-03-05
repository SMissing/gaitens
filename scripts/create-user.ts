/**
 * Script to create a user in the database
 * Run with: npx tsx scripts/create-user.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createUser() {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      name: 'Missing',
      staffCode: '7266',
      role: 'manager',
      active: true,
    }, {
      onConflict: 'staffCode',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    process.exit(1)
  }

  console.log('✅ User created successfully:')
  console.log('  Name:', data.name)
  console.log('  Code:', data.staffCode)
  console.log('  Role:', data.role)
}

createUser()
