# GitHub Pages 部署说明

## 重要提醒

当前实现的Firebase认证功能无法在GitHub Pages上正常工作，因为：

1. Firebase认证需要服务器端验证
2. GitHub Pages是纯静态托管服务
3. 存在跨域(CORS)限制

## 解决方案

为了让带认证功能的Todo应用正常工作，您需要：

### 选项1：部署到支持后端的平台
- Vercel
- Netlify (搭配Functions)
- Heroku
- AWS Amplify
- Google Cloud Run

### 选项2：使用静态友好的后端
- Supabase
- Airtable
- Appwrite
- Cosmic JS

### 选项3：本地运行
```bash
# 克隆项目
git clone git@github.com:cuihuabot/todo-list-app.git
cd todo-list-app

# 使用本地服务器运行
npx serve .
# 或者
python -m http.server 8000
```

## 当前GitHub Pages版本

访问 https://cuihuabot.github.io/todo-list-app/ 将显示一个基础版本，可能无法使用完整的认证功能。

## Firebase配置

如果您要在自己的环境中部署，请替换`firebase-config.js`中的配置：

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## 功能说明

本应用包含以下功能：
- 用户注册和登录
- 多用户数据隔离
- 待办事项管理（增删改查）
- 优先级和分类
- 到期日期提醒
- Cookie记住登录状态
- 移动端优化
- Tiimo风格完成动画