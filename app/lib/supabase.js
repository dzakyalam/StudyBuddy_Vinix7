// app/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Menggunakan fallback langsung untuk menghindari error undefined dari Next.js / Turbopack
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uuelyfuculctccizitgl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PFePxGG0yZF92wiy9f35jw_T1YzTr-m'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
