# 邮箱验证功能说明

## 功能概述

已实现完整的邮箱验证系统，包括：

### 1. 注册流程（Sign Up）
- 用户注册时自动生成验证token
- 将token存储在Google Sheets的Column AE
- 发送验证邮件到用户邮箱
- 初始验证状态为未验证（Column AF为空）

### 2. 邮箱验证
- 用户点击邮件中的验证链接
- 系统验证token并更新用户状态
- Column AF更新为"Yes"（已验证）
- Column AE的token被清空
- 发送欢迎邮件
- 重定向到登录页面

### 3. 登录流程（Sign In）
- 验证邮箱和密码
- **检查邮箱是否已验证**
- 未验证的用户无法登录（返回403错误）
- 已验证的用户正常登录

## 文件结构

### 新增文件：
- `/src/lib/email.ts` - 邮件发送工具
- `/src/app/api/auth/verify-email/route.ts` - 邮箱验证API

### 修改文件：
- `/src/lib/googleSheets.ts` - 添加验证相关函数
- `/src/app/api/auth/signup/route.ts` - 集成邮件发送
- `/src/app/api/auth/signin/route.ts` - 添加验证检查

## Google Sheets 列映射

新增两列：
- **Column AE (index 30)**: `verificationToken` - 验证token
- **Column AF (index 31)**: `isVerified` - 验证状态（"Yes"或空）

## 环境变量配置

需要在 `.env` 文件中添加：

```env
# 邮件服务器配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# 应用URL（用于生成验证链接）
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Gmail配置说明：
1. 启用两步验证
2. 生成应用专用密码
3. 使用应用专用密码作为EMAIL_PASSWORD

## API端点

### POST /api/auth/signup
注册新用户并发送验证邮件

**响应：**
```json
{
  "status": "success",
  "message": "Account created successfully. Please check your email to verify your account."
}
```

### GET /api/auth/verify-email?token={token}
验证邮箱

**成功：** 重定向到 `/signin?verified=true`

### POST /api/auth/signin
登录（需要邮箱已验证）

**错误响应（未验证）：**
```json
{
  "error": "Please verify your email before signing in. Check your inbox for the verification link."
}
```

## 邮件模板

### 1. 验证邮件
- 主题：Verify Your Email - Mentor Match
- 包含验证按钮和链接
- 24小时有效期提示

### 2. 欢迎邮件
- 主题：Welcome to Mentor Match!
- 验证成功通知
- 登录链接

## 安全特性

1. ✅ Token唯一性（随机生成）
2. ✅ 密码bcrypt加密存储
3. ✅ 未验证用户无法登录
4. ✅ 验证后自动清除token
5. ✅ 邮件发送失败不影响账户创建

## 待办事项

可选的增强功能：
- [ ] Token过期时间（目前无过期限制）
- [ ] 重发验证邮件功能
- [ ] 邮件发送队列（提高可靠性）
- [ ] 自定义邮件模板
