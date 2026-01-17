
import { createClient } from '@supabase/supabase-js'

// THÔNG BÁO: Sử dụng khóa anon public key từ Supabase Dashboard
// Đường dẫn: Project Settings -> API -> anon (public)
const supabaseUrl = 'https://hpgyuftvxnmogbcdlymc.supabase.co'
const supabaseAnonKey = 'sb_publishable_58fTH5rZSW5A5Rsw1oq6Fw_XfiKAghq' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
