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
    
    console.log("\n🔍 检查函数可用性...");
    functionsToTest.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`- ${funcName}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
    });
    
    // 检查数据层函数
    console.log("\n🔍 检查数据层函数...");
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
    console.log("\n🔍 检查UI层函数...");
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
    console.log("\n🔍 检查DOM元素...");
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
    
    console.log("\n🎯 测试完成!");
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