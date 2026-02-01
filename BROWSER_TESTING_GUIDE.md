# 浏览器测试指南

## 步骤 1: 访问应用
1. 确保服务器正在运行 (`http://localhost:8081`)
2. 打开浏览器访问 `http://localhost:8081/index.html`

## 步骤 2: 打开开发者工具
1. 按 `Cmd + Option + I` (Mac) 或 `Ctrl + Shift + I` (Windows/Linux)
2. 选择 "Console" (控制台) 标签页

## 步骤 3: 运行测试脚本
复制以下代码并粘贴到浏览器控制台中，然后按回车：

```javascript
// 手动测试脚本 - 可以粘贴到浏览器控制台中运行
console.log("🚀 开始执行手动注册测试...");

// 模拟注册流程
function runManualRegistrationTest() {
    console.log("🔍 检查页面元素...");
    
    // 检查是否存在注册表单
    const registerLink = document.querySelector('a[onclick*="showRegisterForm"]');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    console.log("✅ 元素检测结果:");
    console.log("- 注册链接:", registerLink ? "存在" : "不存在");
    console.log("- 注册表单:", registerForm ? "存在" : "不存在");
    console.log("- 登录表单:", loginForm ? "存在" : "不存在");
    
    if (registerLink) {
        console.log("🖱️ 模拟点击注册链接...");
        try {
            // 通过onclick属性执行函数
            const onclickStr = registerLink.getAttribute('onclick');
            if (onclickStr && onclickStr.includes('window.showRegisterForm')) {
                console.log("✅ 发现正确的onclick处理器:", onclickStr);
                // 执行函数
                window.showRegisterForm();
                console.log("✅ showRegisterForm() 已执行");
            } else {
                console.log("❌ onclick处理器不正确:", onclickStr);
            }
        } catch (e) {
            console.error("❌ 点击注册链接时出错:", e);
        }
    }
    
    // 检查相关函数是否存在
    const functionsToTest = [
        'showRegisterForm',
        'showLoginForm', 
        'setupAuthHandlers',
        'onUserLoggedIn',
        'onUserLoggedOut',
        'onTodosChanged'
    ];
    
    console.log("\\n🔍 检查函数可用性...");
    functionsToTest.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`- ${funcName}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
    });
    
    // 检查数据层函数
    console.log("\\n🔍 检查数据层函数...");
    const dataLayerFunctions = [
        'loadUserTodosData',
        'addTodoData',
        'updateTodoData', 
        'deleteTodoData'
    ];
    
    dataLayerFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`- ${funcName}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
    });
    
    // 检查UI层函数
    console.log("\\n🔍 检查UI层函数...");
    const uiLayerFunctions = [
        'addTodo',
        'updateTodo',
        'deleteTodo',
        'toggleTodo',
        'loadUserTodos'
    ];
    
    uiLayerFunctions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`- ${funcName}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
    });
    
    // 检查DOM元素
    console.log("\\n🔍 检查DOM元素...");
    const domElements = [
        'authSection',
        'todoApp',
        'userInfo',
        'loginForm',
        'registerForm',
        'todoList',
        'loginFormContainer',
        'registerFormContainer'
    ];
    
    domElements.forEach(elementName => {
        const element = window[elementName];
        console.log(`- ${elementName}: ${element ? '✅ 存在' : '❌ 不存在'}`);
    });
    
    console.log("\\n🎯 测试完成!");
    console.log("💡 如果要手动测试注册，请:");
    console.log("   1. 在页面上点击'立即注册'");
    console.log("   2. 填入测试数据:");
    console.log("      - 显示名称: 测试用户");
    console.log("      - 邮箱: test@example.com");
    console.log("      - 密码: password123");
    console.log("      - 确认密码: password123");
    console.log("   3. 点击'注册'按钮");
    console.log("   4. 观察是否成功跳转");
}

// 运行测试
setTimeout(runManualRegistrationTest, 2000);
```

## 步骤 4: 执行注册测试
1. 运行上述脚本后，检查控制台输出的函数和元素检测结果
2. 手动点击页面上的"立即注册"链接
3. 输入以下测试数据：
   - 显示名称: `测试用户`
   - 邮箱: `test@example.com`
   - 密码: `password123`
   - 确认密码: `password123`
4. 点击"注册"按钮
5. 观察页面是否成功跳转并检查控制台是否有错误信息

## 预期结果
- 注册成功后，页面应跳转到待办事项主界面
- 控制台不应显示任何JavaScript错误
- 用户信息应正确显示在顶部