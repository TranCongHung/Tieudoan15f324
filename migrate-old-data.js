const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabase = createClient(
  'https://hpgyuftvxnmogbcdlymc.supabase.co',
  'sb_publishable_58fTH5rZSW5A5Rsw1oq6Fw_XfiKAghq'
);

// Sample old data (bạn cần cung cấp data thực tế)
const oldUsers = [
  {
    id: 'old_user_1',
    name: 'Nguyễn Văn Cũ 1',
    email: 'olduser1@su324.vn',
    rank_name: 'Đại úy',
    position: 'Chỉ huy trưởng',
    unit: 'Đại đội 1',
    password: 'password123',
    role: 'admin'
  },
  {
    id: 'old_user_2', 
    name: 'Nguyễn Văn Cũ 2',
    email: 'olduser2@su324.vn',
    rank_name: 'Trung úy',
    position: 'Chiến sĩ',
    unit: 'Đại đội 2',
    password: 'password456',
    role: 'user'
  }
];

async function migrateOldData() {
  console.log('🔄 Bắt đầu migrate data cũ...');
  
  for (const oldUser of oldUsers) {
    try {
      // Kiểm tra email đã tồn tại trong Supabase
      const { data: existingUsers } = await supabase
        .from('users')
        .select('email')
        .eq('email', oldUser.email);
      
      if (existingUsers && existingUsers.length > 0) {
        console.log(`⚠️  Email ${oldUser.email} đã tồn tại trong Supabase, bỏ qua migrate`);
        continue;
      }
      
      // Tạo user mới trong Supabase với data cũ
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: oldUser.id,
          name: oldUser.name,
          email: oldUser.email,
          rank_name: oldUser.rank_name,
          position: oldUser.position,
          unit: oldUser.unit,
          password: oldUser.password,
          role: oldUser.role,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Lỗi khi migrate user ${oldUser.email}:`, error);
      } else {
        console.log(`✅ Đã migrate thành công user ${oldUser.email}:`, data);
      }
    } catch (error) {
      console.error('❌ Lỗi migrate:', error);
    }
  }
  
  console.log('✅ Hoàn thành migrate data cũ!');
}

// Chạy migrate
migrateOldData();
