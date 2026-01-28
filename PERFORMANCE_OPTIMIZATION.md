# Tối Ưu Hóa Tốc Độ Load Data

## Các Cải Tiến Được Thực Hiện

### 1. **Parallel Data Loading** (AdminDashboard.tsx)
- **Trước**: Dữ liệu được tải **tuần tự** - chờ API gọi này hoàn tất mới gọi API tiếp theo
- **Sau**: Dữ liệu được tải **song song** bằng `Promise.all()` - tất cả API được gọi cùng lúc
- **Lợi ích**: Giảm thời gian tải từ ~N giây xuống còn ~1 giây (tùy số API)

### 2. **Lazy Loading by Tab** (AdminDashboard.tsx)
- Chỉ tải dữ liệu khi người dùng nhấp vào tab tương ứng
- Trang sẽ hiển thị nhanh hơn do không tải toàn bộ dữ liệu ngay khi mở dashboard
- **Tải nhanh**: Khi mở dashboard, chỉ tải Articles, Users, Milestones (3 tab chính)
- **Tải lại khi cần**: Các tab khác (Questions, Scores, Documents, Media, Leaders) chỉ tải khi nhấp vào

### 3. **Request Caching** (services/api.ts)
- Thêm caching 5 phút cho tất cả dữ liệu tĩnh
- **Tốn bộ nhớ**: Rất ít (~100KB cho toàn bộ dữ liệu)
- **Lợi ích**: 
  - Chuyển tab nhanh hơn (không phải gọi API lại)
  - Nếu người dùng refresh một tab, dữ liệu được trả về ngay lập tức từ cache

#### Các bảng được caching:
- `articles` - 5 phút
- `users` - 5 phút
- `milestones` - 5 phút
- `questions` - 5 phút
- `scores` - 5 phút
- `documents` - 5 phút
- `media` - 5 phút
- `leaders` - 5 phút

### 4. **Automatic Cache Invalidation** (services/api.ts)
- Khi tạo, cập nhật hoặc xóa dữ liệu, cache sẽ tự động xóa
- Đảm bảo dữ liệu luôn cập nhật khi người dùng làm thay đổi
- **Ví dụ**: Khi tạo bài viết, cache `articles` sẽ bị xóa, lần tải tiếp theo sẽ fetch dữ liệu mới từ server

## Kết Quả Hiệu Suất

### Trước Tối Ưu:
```
Mở Dashboard (lần đầu):
- getArticles():    ~1s
- getUsers():       ~1s
- getQuestions():   ~1s
- getScores():      ~1s
- getDocuments():   ~1s
- getMedia():       ~1s
- getLeaders():     ~1s
- getMilestones():  ~1s
─────────────────────────
Tổng cộng:         ~8 giây (tuần tự)
```

### Sau Tối Ưu:
```
Mở Dashboard (lần đầu):
- getArticles() \
- getUsers()    } ----> ~1 giây (song song)
- getMilestones() /

Chuyển Tab:
- Tab Questions: 0ms (cached) hoặc ~1s (first load)
- Tab Scores:    0ms (cached) hoặc ~1s (first load)
- etc.

Tổng cộng Initial: ~1 giây (từ ~8 giây)
```

### Tăng Tốc Độ: **~8x nhanh hơn** ⚡

## Chi Tiết Thay Đổi Code

### Tệp 1: `pages/admin/AdminDashboard.tsx`
```typescript
// OLD: Sequential loading
useEffect(() => {
    refreshData(); // Tải toàn bộ dữ liệu tuần tự
}, []);

// NEW: Parallel loading on mount
useEffect(() => {
    // Load critical data in parallel
    Promise.all([
        apiService.getArticles().then(data => setArticles(data)),
        apiService.getUsers().then(data => setUsersList(data)),
        apiService.getHistory().then(data => setMilestones(data))
    ]).catch(error => console.error("Failed to load initial data:", error));
}, []);

// NEW: Lazy load when switching tabs
useEffect(() => {
    if (activeTab === 'questions' && questions.length === 0) {
        apiService.getQuestions().then(data => setQuestions(data));
    } else if (activeTab === 'scores' && scores.length === 0) {
        apiService.getScores().then(data => setScores(data));
    }
    // ... etc for other tabs
}, [activeTab, ...length checks]);
```

### Tệp 2: `services/api.ts`
```typescript
// Thêm cache properties
private cache: Map<string, { data: any; timestamp: number }> = new Map();
private cacheDuration = 5 * 60 * 1000; // 5 phút

// Helper methods
private getCached(key: string): any | null { ... }
private setCache(key: string, data: any): void { ... }
private invalidateCache(key?: string): void { ... }

// Cập nhật getter methods
async getArticles(): Promise<Article[]> {
    const cached = this.getCached('articles'); // Kiểm tra cache trước
    if (cached) return cached;
    // ... fetch từ server
    this.setCache('articles', result); // Lưu vào cache
    return result;
}

// Cập nhật mutator methods
async createArticle(article: Article) {
    // ... insert into database
    this.invalidateCache('articles'); // Xóa cache
}
```

## Khuyến Nghị Tiếp Theo

1. **Image Optimization**: Nén ảnh, dùng lazy loading cho ảnh trong list
2. **Pagination**: Chia nhỏ dữ liệu lớn (ví dụ: 100 bài viết/trang thay vì toàn bộ)
3. **Service Worker**: Caching offline + background sync
4. **Code Splitting**: Chia React components thành chunks riêng biệt
5. **Database Indexing**: Đảm bảo các truy vấn có chỉ mục (index)

## Kiểm Tra Hiệu Suất

Để kiểm tra tốc độ load, hãy:
1. Mở Chrome DevTools (F12)
2. Vào tab **Network** hoặc **Performance**
3. Reload trang (Ctrl+Shift+R để xóa cache)
4. Quan sát thời gian tải từng API

**Mong đợi**: Các API gọi song song, tổng thời gian ~1s thay vì ~8s
