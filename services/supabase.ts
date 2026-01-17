
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hpgyuftvxnmogbcdlymc.supabase.co'
// API_KEY bắt buộc lấy từ biến môi trường của hệ thống
const supabaseAnonKey = process.env.API_KEY || '';

if (!supabaseAnonKey) {
  console.error("CRITICAL ERROR: Biến môi trường process.env.API_KEY không tồn tại hoặc bị trống!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
