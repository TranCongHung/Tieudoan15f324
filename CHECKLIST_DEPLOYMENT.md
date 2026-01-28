# CHECKLIST TRIỂN KHAI INFINITYFREE (10/10)

## 🔧 **BACKEND PHP**

### ✅ Security & Configuration
- [ ] `api/config.php` đã cập nhật credentials thật
- [ ] `config.php` đã thêm vào `.gitignore` (KHÔNG commit credentials)
- [ ] Environment set to `production` trên hosting
- [ ] `display_errors = Off` trong production
- [ ] Security headers đã bật (X-Frame-Options, X-Content-Type-Options)

### ✅ API Endpoints
- [ ] CORS headers đúng cho preflight requests
- [ ] JSON response headers charset UTF-8
- [ ] Error handling thống nhất (status codes + JSON)
- [ ] Rate limiting (optional nhưng recommended)

### ✅ File Structure
- [ ] `api/` folder trong `htdocs/` hoặc `public_html/`
- [ ] `.htaccess` đúng thư mục `api/`
- [ ] Permissions đúng (644 cho PHP files)

## 📱 **FRONTEND REACT**

### ✅ Build Configuration
- [ ] `npm run build` không còn warnings
- [ ] Upload contents của `dist/` (KHÔNG cả thư mục)
- [ ] Không còn `localhost` trong code production
- [ ] Dùng relative URLs: `/api/articles`

### ✅ Environment Switching
- [ ] `services/config.ts` đúng environment detection
- [ ] Import từ `services/index.ts` (unified client)
- [ ] Test cả development và production modes

## 🗄️ **DATABASE MYSQL**

### ✅ Schema & Import
- [ ] COMMENT OUT `CREATE DATABASE` trong `database.sql`
- [ ] Tất cả tables có `ENGINE=InnoDB`
- [ ] Charset `utf8mb4_unicode_ci` cho tất cả tables
- [ ] Không dùng FOREIGN KEY phức tạp (InfinityFree hay lỗi)

### ✅ Data Import
- [ ] Import qua phpMyAdmin (không qua command line)
- [ ] Check data sau import (đặc biệt JSON fields)
- [ ] Admin user đã được tạo

## 🌐 **HOSTING CONFIGURATION**

### ✅ InfinityFree Setup
- [ ] Database đã tạo và connected
- [ ] SSL certificate enabled (auto)
- [ ] Upload vào đúng thư mục (`htdocs/api/`)
- [ ] Test API endpoints qua browser

### ✅ DNS & Domain
- [ ] Domain/subdomain pointing đúng
- [ ] HTTPS working (SSL certificate)
- [ ] No mixed content warnings

## 🧪 **TESTING CRITICAL**

### ✅ API Testing
```bash
# Test các endpoint chính
GET /api/articles → 200 + JSON array
GET /api/settings → 200 + JSON object
POST /api/login → 200/401 + JSON
```

### ✅ Frontend Testing
- [ ] Login/logout working
- [ ] Load articles/milestones
- [ ] Quiz functionality
- [ ] Admin dashboard (if applicable)

### ✅ Cross-browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Mobile responsive

## 🚨 **COMMON ERRORS TO CHECK**

### ❌ **CRITICAL Errors**
- [ ] Không có `localhost` trong production code
- [ ] Không commit `api/config.php` credentials
- [ ] Không dùng `CREATE DATABASE` trong SQL import
- [ ] Không upload `node_modules/` folder

### ❌ **Performance Issues**
- [ ] Queries có LIMIT (tránh 503 errors)
- [ ] Images optimized (compress trước khi upload)
- [ ] Caching working (5 minutes cache)

### ❌ **Security Issues**
- [ ] Passwords không hardcoded
- [ ] Input validation working
- [ ] SQL injection prevention

## 📊 **FINAL VERIFICATION**

### ✅ **Load Testing**
- [ ] Test với 10+ concurrent users
- [ ] Check response times < 2 seconds
- [ ] No 503/500 errors

### ✅ **Backup Strategy**
- [ ] Database export backup
- [ ] Source code backup
- [ ] Recovery plan documented

## 🎯 **GO LIVE CHECKLIST**

### ✅ **Pre-launch**
- [ ] All checklist items completed
- [ ] Client testing approved
- [ ] Performance benchmarks met
- [ ] Security audit passed

### ✅ **Post-launch**
- [ ] Monitor logs for 24 hours
- [ ] Check user feedback
- [ ] Performance monitoring setup
- [ ] Backup schedule configured

---

## 📈 **SCORING RUBRIC**

| Category | Max Score | Required for 10/10 |
|----------|-----------|-------------------|
| Backend PHP | 2.5 | Security + Error handling |
| Frontend React | 2.5 | Environment switching + No localhost |
| Database MySQL | 2.0 | Engine + Charset + No CREATE DB |
| Hosting Setup | 2.0 | Correct structure + SSL |
| Testing & QA | 1.0 | All critical paths working |

**Total: 10/10** - Production Ready! 🚀

---

### 📞 **EMERGENCY CONTACTS**
- InfinityFree Support: https://infinityfree.com/support/
- Database Issues: phpMyAdmin dashboard
- File Issues: File Manager / FTP

### 🔄 **MAINTENANCE SCHEDULE**
- Weekly: Check error logs
- Monthly: Database backup
- Quarterly: Security audit
- Annually: Full system review
