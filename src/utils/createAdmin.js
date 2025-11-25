/**
 * Script để tạo admin user đầu tiên
 *
 * Cách sử dụng:
 * 1. Import script này vào file main.jsx hoặc App.jsx
 * 2. Gọi createFirstAdmin() một lần khi khởi động app
 * 3. Sau khi tạo xong, xóa/comment code này đi
 *
 * QUAN TRỌNG: Chỉ chạy script này MỘT LẦN để tạo admin đầu tiên
 */

import { supabase } from '../lib/supabase'

export async function createFirstAdmin(email, password) {
  try {
    console.log('🔐 Đang tạo admin user...')

    // 1. Tạo auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (authError) {
      console.error('❌ Lỗi tạo auth user:', authError.message)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      console.error('❌ Không thể tạo user')
      return { success: false, error: 'User creation failed' }
    }

    console.log('✅ Auth user đã được tạo:', authData.user.id)

    // 2. Thêm vào bảng admin_users
    // Lưu ý: Cần đăng nhập bằng service role key hoặc tạo trực tiếp trong SQL
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert([
        {
          user_id: authData.user.id,
          email: email,
          role: 'admin'
        }
      ])
      .select()

    if (adminError) {
      console.error('❌ Lỗi thêm vào admin_users:', adminError.message)
      console.log('💡 Bạn có thể thêm thủ công vào database bằng SQL:')
      console.log(`
        INSERT INTO admin_users (user_id, email, role)
        VALUES ('${authData.user.id}', '${email}', 'admin');
      `)
      return {
        success: false,
        error: adminError.message,
        userId: authData.user.id
      }
    }

    console.log('✅ Admin user đã được thêm vào database')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('⚠️  Hãy lưu thông tin này và XÓA script này sau khi setup xong!')

    return {
      success: true,
      user: authData.user,
      admin: adminData
    }

  } catch (error) {
    console.error('❌ Lỗi không xác định:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Cách sử dụng thay thế: Chạy SQL trực tiếp trong Supabase SQL Editor
 *
 * Sau khi tạo auth user qua Supabase Dashboard, chạy SQL:
 *
 * INSERT INTO admin_users (user_id, email, role)
 * VALUES (
 *   'USER_ID_FROM_AUTH_USERS',  -- Lấy từ auth.users table
 *   'admin@example.com',
 *   'admin'
 * );
 */

export async function addUserToAdminRole(userId, email) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          user_id: userId,
          email: email,
          role: 'admin'
        }
      ])
      .select()

    if (error) throw error

    console.log('✅ User đã được thêm vào admin_users:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Lỗi:', error.message)
    return { success: false, error: error.message }
  }
}
