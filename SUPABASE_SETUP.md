# Hướng dẫn Setup Supabase

## Bước 1: Lấy Supabase Credentials

1. Truy cập [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Project Settings** (icon bánh răng góc trái)
4. Chọn **API** trong menu bên trái
5. Copy 2 giá trị sau:
   - **Project URL** (ví dụ: `https://xyzcompany.supabase.co`)
   - **anon public** key (dưới phần "Project API keys")

## Bước 2: Cấu hình Environment Variables

1. Tạo file `.env` trong thư mục gốc của project:
```bash
cp .env.example .env
```

2. Mở file `.env` và thay thế các giá trị:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

## Bước 3: Setup Database

1. Trong Supabase Dashboard, chọn **SQL Editor** (icon database)
2. Click **New query**
3. Copy và paste SQL sau:

```sql
-- Tạo bảng relief_points
CREATE TABLE relief_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'Closed', 'Full')),
  type TEXT NOT NULL,
  contact_info JSONB,
  description TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo indexes để tối ưu query
CREATE INDEX idx_relief_points_status ON relief_points(status);
CREATE INDEX idx_relief_points_verified_at ON relief_points(verified_at DESC);

-- Insert dữ liệu mẫu
INSERT INTO relief_points (lat, lng, status, type, contact_info, description, source_url)
VALUES
  (21.0285, 105.8542, 'Open', 'Điểm tập kết',
   '{"name": "Nguyễn Văn A", "phone": "0912345678", "facebook_link": "https://facebook.com/example"}',
   'Cần: Nước uống, mì tôm, thuốc men. Có thể tiếp nhận 24/7',
   'https://facebook.com/post1'),
  (20.4617, 106.1549, 'Open', 'Điểm tập kết',
   '{"name": "Trần Thị B", "phone": "0987654321", "facebook_link": "https://facebook.com/example2"}',
   'Cần gấp: Quần áo, chăn màn, nước sạch. Làm việc 8h-20h',
   'https://facebook.com/post2'),
  (20.8449, 106.6881, 'Closed', 'Điểm tập kết',
   '{"name": "Lê Văn C", "phone": "0909876543"}',
   'Đã đủ nhu yếu phẩm. Tạm ngưng nhận đồ',
   'https://facebook.com/post3'),
  (16.0544, 108.2022, 'Open', 'Cần cứu trợ',
   '{"name": "Phạm Thị D", "phone": "0923456789", "facebook_link": "https://facebook.com/example4"}',
   'Khu vực bị cô lập. Cần: Lương thực, nước uống khẩn cấp',
   'https://facebook.com/post4'),
  (18.3390, 105.9060, 'Full', 'Điểm tập kết',
   '{"name": "Hoàng Văn E", "phone": "0934567890"}',
   'Kho đã đầy. Vui lòng liên hệ điểm khác',
   'https://facebook.com/post5');
```

4. Click **Run** hoặc nhấn `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

## Bước 4: Cấu hình Row Level Security (RLS) - Optional

Nếu bạn muốn public read access (recommended cho ứng dụng này):

```sql
-- Enable RLS
ALTER TABLE relief_points ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả mọi người đọc dữ liệu
CREATE POLICY "Enable read access for all users"
ON relief_points FOR SELECT
TO public
USING (true);

-- Chỉ authenticated users mới có thể insert/update
CREATE POLICY "Enable insert for authenticated users only"
ON relief_points FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON relief_points FOR UPDATE
TO authenticated
USING (true);
```

## Bước 5: Test Connection

Chạy ứng dụng để test kết nối:

```bash
npm run dev
```

Nếu mọi thứ hoạt động đúng, bạn sẽ thấy bản đồ với các markers hiển thị các điểm cứu trợ!

## Troubleshooting

### Lỗi: "Failed to fetch relief points"
- Kiểm tra lại `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong file `.env`
- Đảm bảo bạn đã khởi động lại dev server sau khi thay đổi `.env`
- Kiểm tra RLS policies nếu đã enable

### Lỗi: Không thấy markers trên bản đồ
- Kiểm tra có dữ liệu trong bảng `relief_points` chưa
- Mở Console (F12) để xem error messages
- Verify rằng lat/lng values hợp lệ (nằm trong phạm vi Việt Nam)

### Database schema changes
Nếu cần thay đổi schema:
1. Vào SQL Editor
2. Chạy `DROP TABLE relief_points;` (⚠️ Sẽ xóa toàn bộ data)
3. Chạy lại CREATE TABLE query

## API Usage

Để fetch data từ Supabase trong code:

```javascript
import { supabase } from './lib/supabase'

// Get all points
const { data, error } = await supabase
  .from('relief_points')
  .select('*')

// Filter by status
const { data, error } = await supabase
  .from('relief_points')
  .select('*')
  .eq('status', 'Open')

// Insert new point
const { data, error } = await supabase
  .from('relief_points')
  .insert({
    lat: 16.0544,
    lng: 108.2022,
    status: 'Open',
    type: 'Điểm tập kết',
    description: 'Mô tả...',
    contact_info: { name: 'Tên', phone: '0123456789' }
  })
```

## Hữu ích

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
