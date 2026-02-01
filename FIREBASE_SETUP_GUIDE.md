# Firebase配置指南

## 配置Firebase项目

### 1. 创建Firebase项目
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "添加项目" 或 "创建项目"
3. 输入项目名称（例如："todo-app-enhanced"）
4. 点击 "继续"

### 2. 配置认证系统
1. 在左侧菜单中选择 "Authentication"
2. 点击 "开始使用"
3. 选择 "电子邮件/密码" 登录方式
4. 启用该方式并点击 "保存"
5. 在 "已注册的电子邮件地址" 下方，您可以添加 `100195992@qq.com` 作为测试用户

### 3. 配置Firestore数据库
1. 在左侧菜单中选择 "Firestore Database"
2. 点击 "创建数据库"
3. 选择 "测试模式"（用于快速开始）或 "生产模式"
4. 选择合适的位置并点击 "启用"

### 4. 获取Firebase配置
1. 在左侧菜单中选择 "项目设置"
2. 向下滚动到 "您的应用" 部分
3. 点击 "Web" 图标添加Web应用
4. 输入应用名称（例如："todo-app"）
5. 记住要注册的应用，然后复制提供的配置对象

### 5. 更新应用配置
将获取的配置信息更新到 `firebase-config.js` 文件中：

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 6. 设置安全规则
在Firestore数据库中设置安全规则以确保数据隔离：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的todos
    match /users/{userId}/todos/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. 测试用户
您可以使用 `100195992@qq.com` 作为测试账户进行注册和登录测试。

### 8. 部署应用
完成以上配置后，您的应用就可以使用Firebase后端服务了。