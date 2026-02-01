# 更新日志

## 2026-02-01 - 登录状态持久化功能

### 功能更新
- 实现了Cookie记住登录状态功能
- 用户Session未失效时直接进入首页
- Session失效后自动跳转到登录页
- 登录状态可维持30天（可配置）

### 技术细节
- 在firebase-config.js中添加了Cookie工具函数
- 实现了`setCookie`、`getCookie`和`eraseCookie`函数
- 修改了`onAuthStateChanged`监听器以处理持久化状态
- 在index.html中添加了页面加载时的认证状态检查

### 文件变更
1. `firebase-config.js` - 添加Cookie管理和认证状态持久化逻辑
2. `index.html` - 添加Cookie工具函数和页面加载认证检查
3. `test_auth_persistence.html` - 新增测试页面用于验证功能
4. `MEMORY.md` - 更新项目记录

### 使用说明
- 用户首次登录后，其认证信息将存储在Cookie中
- 下次访问网站时，如果Session仍然有效，将直接进入主页面
- 如果Session已过期，将自动跳转到登录页面
- Cookie有效期默认为30天，可通过修改代码调整

### 测试验证
- 访问`test_auth_persistence.html`页面验证功能
- 确认登录后能够正确存储用户信息
- 验证页面刷新后仍能保持登录状态
- 确认登出后正确清除Cookie信息