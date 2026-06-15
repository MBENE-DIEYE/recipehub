import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kufnuawnetpmvauenhxr.supabase.co'
const supabaseKey = 'sb_publishable_MuQK2x03QdqhFhSUba_iuQ_rgMTpynN'

export const supabase = createClient(supabaseUrl, supabaseKey)