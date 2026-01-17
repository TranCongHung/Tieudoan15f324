// Test script to check Supabase connection and create initial data
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hpgyuftvxnmogbcdlymc.supabase.co'
const supabaseKey = 'sb_publishable_58fTH5rZSW5A5Rsw1oq6Fw_XfiKAghq'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('Connection error:', error)
      return
    }
    
    console.log('✅ Connection successful!')
    
    // Check if admin user exists
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@su324.vn')
      .single()
    
    if (adminError && adminError.code === 'PGRST116') {
      console.log('Creating admin user...')
      
      // Create admin user
      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          id: 'admin_root',
          name: 'Super Admin',
          email: 'admin@su324.vn',
          rank_name: 'Đại tá',
          position: 'Chỉ huy trưởng',
          unit: 'Sư đoàn 324',
          password: 'admin',
          role: 'admin'
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating admin:', createError)
      } else {
        console.log('✅ Admin user created:', newAdmin)
      }
    } else if (adminUser) {
      console.log('✅ Admin user already exists:', adminUser)
    }
    
    // Test creating a sample article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        id: 'sample_article_1',
        title: 'Bài viết mẫu - Chào mừng đến với Tiểu đoàn 15',
        summary: 'Đây là bài viết mẫu để kiểm tra hệ thống',
        content: 'Nội dung chi tiết của bài viết mẫu...',
        author: 'Admin',
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()
    
    if (articleError) {
      console.error('Error creating article:', articleError)
    } else {
      console.log('✅ Sample article created:', article)
    }
    
    // Test creating sample questions
    const sampleQuestions = [
      {
        id: 'q1',
        question_text: 'Tiểu đoàn 15 thuộc sư đoàn nào?',
        options: JSON.stringify(['Sư đoàn 324', 'Sư đoàn 305', 'Sư đoàn 312', 'Sư đoàn 308']),
        correct_answer_index: 0,
        explanation: 'Tiểu đoàn 15 thuộc Sư đoàn 324'
      },
      {
        id: 'q2',
        question_text: 'Đơn vị nào là đơn vị chủ lực của quân đội nhân dân Việt Nam?',
        options: JSON.stringify(['Bộ đội chủ lực', 'Bộ đội địa phương', 'Dân quân tự vệ', 'Công an nhân dân']),
        correct_answer_index: 0,
        explanation: 'Bộ đội chủ lực là đơn vị chủ lực của quân đội nhân dân Việt Nam'
      }
    ]
    
    for (const question of sampleQuestions) {
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .upsert(question, { onConflict: 'id' })
        .select()
        .single()
      
      if (qError) {
        console.error(`Error creating question ${question.id}:`, qError)
      } else {
        console.log(`✅ Question ${question.id} created/updated`)
      }
    }
    
    console.log('🎉 Data setup completed!')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testConnection()
