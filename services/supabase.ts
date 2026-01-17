
// @ts-ignore
import { createClient } from '@supabase/supabase-js'

declare var process: any;

const supabaseUrl = 'https://hpgyuftvxnmogbcdlymc.supabase.co'
// API_KEY được hệ thống tự động lấy từ Environment Variables trên Vercel
const supabaseAnonKey = process.env.API_KEY || '';

if (!supabaseAnonKey) {
  console.warn("CẢNH BÁO: Chưa tìm thấy API_KEY. Ứng dụng sẽ hoạt động ở chế độ chờ cấu hình.");
}

// Khởi tạo client với fallback để tránh crash app
export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'MISSING_KEY');
