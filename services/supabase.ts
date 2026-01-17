
import { createClient } from '@supabase/supabase-js'

declare var process: any;

const supabaseUrl = 'https://hpgyuftvxnmogbcdlymc.supabase.co'
// API_KEY được lấy từ biến môi trường của hệ thống (Vercel/Vite Define)
const supabaseAnonKey = process.env.API_KEY || '';

if (!supabaseAnonKey || supabaseAnonKey === 'MISSING_KEY') {
  console.warn("CẢNH BÁO: Chưa tìm thấy API_KEY hợp lệ trong Environment Variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'MISSING_KEY');
