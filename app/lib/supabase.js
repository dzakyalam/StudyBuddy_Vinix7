// app/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Menggunakan fallback langsung untuk menghindari error undefined dari Next.js / Turbopack
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://izzhuonjjeyruocjkaip.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_jQn6nkFzbqrXrznP3Q2oHA_NuzRS7Vc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)