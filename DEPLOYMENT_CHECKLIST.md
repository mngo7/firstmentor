# 🚀 Deployment Checklist for www.firstmentor.org

## 问题诊断：新用户数据在生产环境不显示

### ✅ 已修复的代码问题

1. **API缓存配置** (`src/app/api/profiles/route.ts`)
   - ✅ 添加 `export const dynamic = 'force-dynamic'`
   - ✅ 添加 `export const revalidate = 0`
   - ✅ 添加响应头禁用缓存

2. **客户端fetch缓存** (`src/app/mentor-match/page.tsx`)
   - ✅ fetch添加 `cache: 'no-store'`
   - ✅ 添加 `Cache-Control: no-cache` 请求头

---

## 📋 部署步骤

### 1. 提交代码更改
```bash
git add .
git commit -m "Fix: Disable API caching to ensure real-time data from Google Sheets"
git push origin main
```

### 2. 重新部署到生产环境

**如果使用 Vercel:**
```bash
# 方法1: 通过Vercel CLI
vercel --prod

# 方法2: 通过Git push（自动部署）
# Push后等待Vercel自动部署完成
```

**如果使用其他平台:**
- 确保触发新的构建
- 等待构建完成
- 确认新版本已部署

### 3. 清除生产环境缓存

部署完成后，需要清除各层缓存：

#### A. CDN/服务器缓存
**Vercel平台:**
1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择项目 → Deployments
3. 点击最新部署 → "..." → "Redeploy"
4. 或在项目设置中清除缓存

#### B. 浏览器缓存
在访问 www.firstmentor.org 时：
- **Chrome/Edge**: `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac)
- **Safari**: `Cmd+Option+R`

或者：
1. 打开开发者工具 (F12)
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

#### C. API响应缓存
清除浏览器后，访问：
```
https://www.firstmentor.org/api/profiles
```
检查响应中是否包含新用户 "Junfeng"

---

## 🔍 验证新数据是否生效

### 步骤1: 检查API直接响应
```bash
curl -H "Cache-Control: no-cache" https://www.firstmentor.org/api/profiles
```
在返回的JSON中搜索 "Junfeng"

### 步骤2: 检查网站搜索页面
1. 访问 https://www.firstmentor.org/mentor-match
2. 在 "Search by First Name" 输入 "Junfeng"
3. 应该能看到该用户

### 步骤3: 检查浏览器Network请求
1. 打开 www.firstmentor.org/mentor-match
2. 打开开发者工具 (F12) → Network标签
3. 刷新页面
4. 找到 `profiles` 请求
5. 检查Response Headers中：
   - ✅ `Cache-Control: no-store, no-cache, must-revalidate`
   - ✅ `Pragma: no-cache`
   - ✅ `Expires: 0`

---

## 🐛 如果问题仍然存在

### 可能原因1: Google Sheets权限
检查环境变量是否正确：
- `GOOGLE_SHEETS_ID`
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`

### 可能原因2: Google Sheets数据格式
确认新用户数据：
- ✅ Column D (Name) 有值
- ✅ 行不是空行
- ✅ 没有被过滤器隐藏

### 可能原因3: 环境变量未同步
在部署平台（如Vercel）检查：
1. 项目设置 → Environment Variables
2. 确认所有变量都已设置
3. 确认变量值与本地 `.env.local` 一致
4. 修改后需要重新部署

### 可能原因4: 构建缓存
完全重新构建：
```bash
# 本地测试
rm -rf .next
npm run build
npm run start

# Vercel平台
# 在部署设置中勾选 "Clear build cache"
```

---

## 📊 测试对比

| 环境 | URL | 能找到Junfeng? |
|------|-----|---------------|
| Local | http://localhost:3000/mentor-match | ✅ 是 |
| Production | https://www.firstmentor.org/mentor-match | ❓ 待确认 |

---

## 💡 长期解决方案

考虑添加以下功能：

1. **实时数据同步**
   - 使用 Google Sheets API Webhooks
   - 或定时轮询刷新数据

2. **管理员刷新按钮**
   - 添加手动刷新缓存的按钮
   - 仅管理员可见

3. **数据版本标识**
   - 在Sheet中添加"最后更新时间"
   - 前端显示数据时间戳

4. **增量更新**
   - 只获取新增/修改的数据
   - 减少API调用次数

---

## 📝 部署后确认清单

- [ ] 代码已推送到main分支
- [ ] 生产环境已重新部署
- [ ] 部署成功（无错误）
- [ ] CDN缓存已清除
- [ ] 浏览器缓存已清除
- [ ] API直接访问能看到新数据
- [ ] 网站搜索能找到新用户
- [ ] Response Headers包含正确的缓存控制

---

## 🆘 紧急联系

如果上述步骤都不能解决问题，请检查：
1. Google Sheets API配额是否超限
2. 服务账号权限是否正确
3. Sheet ID是否正确
4. 部署日志中是否有错误信息

**查看部署日志:**
- Vercel: Dashboard → Deployments → 点击部署 → Function Logs
- 其他平台: 查看相应的日志系统
