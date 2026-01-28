# Tính Năng "Nhận Đọc Lịch Sử" - Hướng Dẫn Đầy Đủ

## 📋 Mô Tả Chung
Tính năng "Nhận Đọc Lịch Sử" cho phép người dùng ghi nhận rằng họ đã đọc một tài liệu lịch sử và xem danh sách những người đã đọc.

## 🎯 Chức Năng Chính

### 1. Ghi Nhận Đã Đọc (Mark as Read)
- **Nút "Nhận đọc"** xuất hiện trên trang bìa sách
- Chỉ hoạt động khi người dùng đã đăng nhập
- Sau khi nhấn, hệ thống sẽ lưu thông tin:
  - ID người dùng
  - Tên người dùng
  - Chức vụ/Cấp bậc
  - Đơn vị
  - ID của mốc lịch sử
  - Tên mốc lịch sử
  - Thời gian đọc

### 2. Hiển Thị Trạng Thái Đã Đọc
- Khi người dùng đã đọc một tài liệu, nút "Nhận đọc" sẽ:
  - Chuyển sang trạng thái vô hiệu hóa (disabled)
  - Hiển thị dòng chữ "Bạn đã đọc" với icon ✓

### 3. Xem Danh Sách Người Đã Đọc
- Hiển thị nút "X người đã đọc" dưới nút "Nhận đọc"
- Nhấn vào sẽ mở modal với danh sách chi tiết:
  - Số thứ tự
  - Tên người dùng
  - Chức vụ/Cấp bậc
  - Đơn vị
  - Ngày giờ đọc

## 🔧 Chi Tiết Kỹ Thuật

### Các Thay Đổi Trong Codebase

#### 1. **types.ts** - Interface Mới
```typescript
export interface ReadHistory {
  id: string;
  userId: string;
  userName: string;
  userRank: string;
  unit: string;
  milestoneId: string;
  milestoneTitle: string;
  readAt: string;
}
```

#### 2. **services/api.ts** - Các Hàm API Mới

##### `markMilestoneAsRead()`
Ghi nhận rằng một người dùng đã đọc một mốc lịch sử
```typescript
async markMilestoneAsRead(
  userId: string, 
  userName: string, 
  userRank: string, 
  unit: string, 
  milestoneId: string, 
  milestoneTitle: string
)
```

##### `getReadHistoryByMilestone()`
Lấy danh sách tất cả người dùng đã đọc một mốc lịch sử
```typescript
async getReadHistoryByMilestone(milestoneId: string): Promise<ReadHistory[]>
```

##### `checkUserHasReadMilestone()`
Kiểm tra xem người dùng có đã đọc một mốc lịch sử hay không
```typescript
async checkUserHasReadMilestone(userId: string, milestoneId: string): Promise<boolean>
```

#### 3. **pages/History.tsx** - Các Thay Đổi

**State Mới:**
- `hasReadMilestone`: Theo dõi xem người dùng đã đọc hay chưa
- `isMarkingAsRead`: Theo dõi trạng thái đang ghi nhận
- `readHistory`: Lưu danh sách người đã đọc
- `showReadersModal`: Điều khiển modal hiển thị danh sách

**Hàm Mới:**
- `handleMarkAsRead()`: Xử lý nhấn nút "Nhận đọc"
- `checkReadStatus()`: Kiểm tra trạng thái đã đọc
- `loadReadHistory()`: Tải danh sách người đã đọc

**UI Mới:**
- Nút "Nhận đọc" trên trang bìa
- Hiển thị "Bạn đã đọc" sau khi ghi nhận
- Nút "X người đã đọc" để xem danh sách
- Modal hiển thị danh sách chi tiết người đã đọc

## 📊 Cơ Sở Dữ Liệu

### Bảng `read_history`
```sql
CREATE TABLE read_history (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  user_name VARCHAR NOT NULL,
  user_rank VARCHAR,
  unit VARCHAR,
  milestone_id VARCHAR NOT NULL,
  milestone_title VARCHAR NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Cách Sử Dụng

### Cho Người Dùng
1. Mở tài liệu lịch sử (nhấn vào bất kỳ mốc lịch sử nào)
2. Trên trang bìa, nhấn nút **"Nhận đọc"**
3. Nếu muốn xem ai đã đọc, nhấn nút **"X người đã đọc"**
4. Modal sẽ hiển thị danh sách chi tiết

### Cho Admin (Nếu Cần Xem Báo Cáo)
- Có thể xem dữ liệu `read_history` trực tiếp từ Supabase
- Sắp xếp theo thời gian hoặc người dùng

## ✅ Kiểm Tra Chức Năng

1. **Đăng nhập** vào ứng dụng
2. Vào trang **"Lịch sử"**
3. **Chọn một mốc lịch sử** bất kỳ
4. Trên trang bìa, nhấn **"Nhận đọc"**
5. Kiểm tra xem:
   - Nút đã thay đổi thành "Bạn đã đọc"
   - Nút "X người đã đọc" xuất hiện/cập nhật
6. Nhấn vào **"X người đã đọc"** để xem modal

## ⚠️ Lưu Ý Quan Trọng

- **Chỉ đăng nhập mới có thể sử dụng** - Nếu không đăng nhập, nút sẽ bị vô hiệu hóa
- **Chỉ ghi nhận một lần** - Không thể ghi nhận lần thứ hai cho cùng một tài liệu
- **Lỗi mạng** - Nếu gặp lỗi, thử lại sau vài giây
- **Dữ liệu được lưu ngay lập tức** - Không cần nhấn "Lưu" thêm

## 🔌 Tích Hợp Với Supabase

Tính năng này sử dụng bảng `read_history` trong Supabase. Đảm bảo:
1. Bảng `read_history` đã được tạo trong cơ sở dữ liệu
2. Cấu hình RLS (Row Level Security) nếu cần
3. API key Supabase đã được thiết lập đúng

## 📝 Thay Đổi Tóm Tắt

| File | Thay Đổi |
|------|----------|
| `types.ts` | +Interface `ReadHistory` |
| `services/api.ts` | +3 hàm API mới |
| `pages/History.tsx` | +4 state mới, +3 hàm mới, +UI component |

---

**Phiên bản**: 1.0  
**Ngày hoàn thành**: 25/01/2026  
**Trạng thái**: ✅ Hoàn thiện
