import { supabase } from './supabase';
import { User } from '../types';

export class AuthService {
  // Kiểm tra email có trong data cũ
  private oldUsers = [
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

  // Đăng nhập với kiểm tra data cũ
  async login(email: string, password: string): Promise<User | null> {
    try {
      // Kiểm tra trong Supabase trước
      const { data: supabaseUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (supabaseUser) {
        console.log('✅ Đăng nhập thành công với tài khoản Supabase:', supabaseUser.email);
        return supabaseUser;
      }

      // Kiểm tra trong data cũ
      const oldUser = this.oldUsers.find(u => u.email === email);
      
      if (oldUser) {
        // Kiểm tra password có khớp với data cũ
        if (oldUser.password === password) {
          console.log('✅ Đăng nhập thành công với tài khoản cũ:', oldUser.email);
          
          // Tạo hoặc update user trong Supabase
          const { data: updatedUser } = await supabase
            .from('users')
            .upsert({
              id: oldUser.id,
              name: oldUser.name,
              email: oldUser.email,
              rank_name: oldUser.rank_name,
              position: oldUser.position,
              unit: oldUser.unit,
              password: oldUser.password,
              role: oldUser.role,
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          return updatedUser;
        } else {
          console.log('❌ Password không đúng cho tài khoản cũ:', oldUser.email);
          return null;
        }
      } else {
        console.log('❌ Email không tồn tại trong data cũ:', email);
        return null;
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      return null;
    }
  }

  // Đăng ký với kiểm tra trùng lặp
  async register(userData: Omit<User, 'id' | 'created_at'>): Promise<boolean> {
    try {
      // Kiểm tra trong data cũ
      const oldUser = this.oldUsers.find(u => u.email === userData.email);
      
      if (oldUser) {
        console.log('❌ Email đã tồn tại trong hệ thống cũ:', userData.email);
        return false;
      }

      // Kiểm tra trong Supabase
      const { data: existingUsers } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email);
      
      if (existingUsers && existingUsers.length > 0) {
        console.log('❌ Email đã tồn tại trong Supabase:', userData.email);
        return false;
      }

      // Tạo user mới trong Supabase
      const newUser = {
        id: 'user_' + Date.now(),
        ...userData,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (error) {
        console.error('❌ Lỗi đăng ký:', error);
        return false;
      } else {
        console.log('✅ Đăng ký thành công:', userData.email);
        return true;
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      return false;
    }
  }

  // Migration data cũ
  async migrateOldData(): Promise<void> {
    console.log('🔄 Bắt đầu migrate data cũ...');
    
    for (const oldUser of this.oldUsers) {
      try {
        // Kiểm tra user đã tồn tại trong Supabase
        const { data: existingUsers } = await supabase
          .from('users')
          .select('email')
          .eq('email', oldUser.email);
        
        if (existingUsers && existingUsers.length > 0) {
          console.log(`⚠️  User ${oldUser.email} đã tồn tại trong Supabase, bỏ qua`);
          continue;
        }
        
        // Tạo user trong Supabase với data cũ
        const { data, error } = await supabase
          .from('users')
          .upsert({
            id: oldUser.id,
            name: oldUser.name,
            email: oldUser.email,
            rank_name: oldUser.rank_name,
            position: oldUser.position,
            unit: oldUser.unit,
            password: oldUser.password,
            role: oldUser.role,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) {
          console.error(`❌ Lỗi migrate user ${oldUser.email}:`, error);
        } else {
          console.log(`✅ Đã migrate thành công user ${oldUser.email}:`, data);
        }
      } catch (error) {
        console.error('❌ Lỗi migrate:', error);
      }
    }
    
    console.log('✅ Hoàn thành migrate data cũ!');
  }

  // Thêm user cũ vào danh sách (bạn cần update với data thực tế)
  addOldUser(user: User) {
    this.oldUsers.push(user);
  }
}

export default new AuthService();
