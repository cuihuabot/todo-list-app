# Firebase 设置指南

要使应用程序正常工作，您需要在Firebase项目中完成以下设置：

## 1. 安装 Firebase CLI

```bash
npm install -g firebase-tools
```

## 2. 登录 Firebase

```bash
firebase login
```

## 3. 初始化项目

在项目根目录运行：

```bash
firebase init
```

选择以下选项：
- Firestore: 用于数据库规则
- Hosting: 用于部署网站

## 4. 部署安全规则

将以下规则部署到您的Firebase项目：

### Firestore 安全规则 (firestore.rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许用户访问自己的todos
    match /users/{userId}/todos/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 允许用户访问自己的用户文档
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

部署命令：
```bash
firebase deploy --only firestore:rules
```

## 5. 启用 Firebase 服务

在 Firebase 控制台中：

1. **Authentication** → 启用 "Email/Password" 登录方式
2. **Firestore Database** → 创建数据库（如果不存在）
3. **Project Settings** → 在 "Authorized domains" 中添加 "localhost"

## 6. 检查配置

确保您的 `firebase-config.js` 中的配置与Firebase控制台中的项目配置匹配。