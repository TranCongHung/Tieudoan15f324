import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hpgyuftvxnmogbcdlymc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_58fTH5rZSW5A5Rsw1oq6Fw_XfiKAghq'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface Article {
  id: string
  title: string
  summary?: string
  content?: string
  image_url?: string
  date?: string
  author?: string
  created_at: string
}

export interface Question {
  id: string
  question_text: string
  options: any
  correct_answer_index: number
  explanation?: string
}

export interface QuizResult {
  id: string
  user_id?: string
  user_name?: string
  user_rank?: string
  unit?: string
  topic?: string
  score: number
  total_questions: number
  timestamp: string
  created_at: string
}

export interface Score {
  id: string
  unit_name: string
  military_score?: number
  political_score?: number
  logistics_score?: number
  discipline_score?: number
  total_score?: number
  date: string
}

export interface Media {
  id: string
  title?: string
  type: 'video' | 'audio'
  url?: string
  thumbnail?: string
  description?: string
  date?: string
}

export interface Milestone {
  id: string
  year?: string
  title?: string
  subtitle?: string
  content?: string
  image?: string
  icon?: string
  story?: string
  created_at: string
}

export interface Leader {
  id: string
  name?: string
  role?: string
  image?: string
}

export interface Comment {
  id: string
  article_id: string
  user_id: string
  user_name: string
  user_rank: string
  content?: string
  date: string
  created_at: string
}

export interface Document {
  id: string
  name: string
  is_folder: boolean
  parent_id?: string
  type?: string
  date?: string
  size?: string
}

export interface Setting {
  setting_key: string
  setting_value: string
}
