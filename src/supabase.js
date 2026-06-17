import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.supabaseUrl
const supabaseKey = import.meta.env.supabaseKey

export const supabase = createClient(supabaseUrl, supabaseKey)