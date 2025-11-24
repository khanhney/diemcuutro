# Bản đồ Cứu trợ Lũ Lụt Việt Nam

Ứng dụng bản đồ tương tác giúp kết nối các điểm tập kết cứu trợ và những người cần hỗ trợ sau thiên tai lũ lụt tại Việt Nam.

## Tính năng

- **Bản đồ toàn màn hình** với OpenStreetMap tập trung vào Việt Nam
- **Markers màu sắc phân loại:**
  - 🔴 Đỏ đô: Điểm đang hoạt động (Open)
  - 🟠 Cam: Điểm đã đầy (Full)
  - ⚫ Xám: Điểm đã đóng (Closed)
- **Popup thông tin chi tiết** khi click vào marker:
  - Loại điểm (Điểm tập kết / Cần cứu trợ)
  - Mô tả nhu yếu phẩm
  - Thông tin liên hệ (tên, số điện thoại, Facebook)
  - Nguồn thông tin
  - Thời gian cập nhật
  - Nút "Dẫn đường" kết nối với Google Maps
- **Responsive design** tối ưu cho cả mobile và desktop
- **Chú thích bản đồ** (Legend) để dễ dàng phân biệt trạng thái

## Công nghệ sử dụng

- **React** với Vite
- **Leaflet & React-Leaflet** cho bản đồ tương tác
- **Supabase** cho database và API
- **OpenStreetMap** cho tile maps

## Cài đặt

### 1. Clone repository

```bash
cd relief-map-app
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Supabase

Tạo file `.env` trong thư mục gốc và thêm thông tin Supabase của bạn:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Thiết lập Database

Chạy SQL sau trong Supabase SQL Editor để tạo bảng `relief_points`:

```sql
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

-- Tạo index để tăng tốc độ query
CREATE INDEX idx_relief_points_status ON relief_points(status);
CREATE INDEX idx_relief_points_verified_at ON relief_points(verified_at DESC);
```

### 5. Thêm dữ liệu mẫu (Optional)

```sql
INSERT INTO relief_points (lat, lng, status, type, contact_info, description, source_url)
VALUES
  (21.0285, 105.8542, 'Open', 'Điểm tập kết',
   '{"name": "Nguyễn Văn A", "phone": "0912345678", "facebook_link": "https://facebook.com/example"}',
   'Cần: Nước uống, mì tôm, thuốc men. Có thể tiếp nhận 24/7',
   'https://facebook.com/post1'),
  (20.4617, 106.1549, 'Open', 'Điểm tập kết',
   '{"name": "Trần Thị B", "phone": "0987654321", "facebook_link": "https://facebook.com/example2"}',
   'Cần gấp: Quần áo, chăn màn, nước sạch. Làm việc 8h-20h',
   'https://facebook.com/post2');
```

### 6. Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Cấu trúc Database

### Bảng `relief_points`

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | UUID | Primary key |
| `lat` | Float | Vĩ độ |
| `lng` | Float | Kinh độ |
| `status` | Text | Trạng thái: 'Open', 'Closed', 'Full' |
| `type` | Text | Loại điểm: 'Cần cứu trợ' / 'Điểm tập kết' |
| `contact_info` | JSONB | Thông tin liên hệ: `{name, phone, facebook_link}` |
| `description` | Text | Mô tả chi tiết về nhu yếu phẩm |
| `verified_at` | Timestamp | Thời gian cập nhật cuối |
| `source_url` | Text | Link bài đăng gốc (Facebook, v.v.) |
| `created_at` | Timestamp | Thời gian tạo |

## Build cho Production

```bash
npm run build
```

Output sẽ được tạo trong thư mục `dist/`

## Deploy

Ứng dụng có thể deploy trên:
- **Vercel** (recommended)
- **Netlify**
- **Firebase Hosting**
- **Cloudflare Pages**

Đừng quên cấu hình environment variables trên platform hosting của bạn.

## Tối ưu cho Mobile

- Full responsive design
- Touch-friendly controls
- Optimized popup size cho màn hình nhỏ
- Fast loading với lazy loading markers

## Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## License

MIT License

---

**Lưu ý:** Đây là ứng dụng mã nguồn mở phục vụ mục đích nhân đạo. Vui lòng sử dụng có trách nhiệm và cập nhật thông tin chính xác.
