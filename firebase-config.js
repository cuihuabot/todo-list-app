// Firebase configuration
// Please replace with your own Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDAh1FFyjt2Y0LpHfCaXgBkTT4kXmdr3q4",
    authDomain: "cuihua-todolist.firebaseapp.com",
    projectId: "cuihua-todolist",
    storageBucket: "cuihua-todolist.firebasestorage.app",
    messagingSenderId: "231753597001",
    appId: "1:231753597001:web:c033010dea87a1c342bf98",
    measurementId: "G-9FLXFERRD1"
};

// Initialize Firebase with better error handling
let app, auth, db;

try {
    // Check if app is already initialized to avoid duplicate initialization error
    app = firebase.app();
    console.log("Firebase app already initialized");
} catch (error) {
    console.log("Initializing Firebase app...");
    app = firebase.initializeApp(firebaseConfig);
    console.log("Firebase app initialized with config");
}

// Initialize services after ensuring app is ready
try {
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase services initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase services:", error);
    alert("Firebase服务初始化失败: " + error.message);
}

// Authentication functions
function setupAuthHandlers(loginForm, registerForm, todoApp, authSection, userInfo, todoList) {
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      
      try {
        console.log("开始登录..."); // Debug logging
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("登录成功:", userCredential.user); // Debug logging
        
        window.currentUser = userCredential.user;
        // 通知UI层加载数据
        if (typeof window.onUserLoggedIn === 'function') {
          window.onUserLoggedIn();
        }
        showApp(todoApp, authSection, userInfo);
      } catch (error) {
        console.error("登录过程中发生错误:", error); // Debug logging
        alert(`登录失败: ${error.message}\n错误代码: ${error.code}`);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const displayName = registerForm.displayName.value;
      const email = registerForm.email.value;
      const password = registerForm.password.value;
      const confirmPassword = registerForm.confirmPassword.value;
      
      console.log("注册表单提交:", { displayName, email }); // Debug logging
      
      if (!displayName || !email || !password || !confirmPassword) {
        alert('请填写所有必填字段');
        console.log("字段验证失败"); // Debug logging
        return;
      }
      
      if (password !== confirmPassword) {
        alert('密码和确认密码不匹配');
        console.log("密码验证失败"); // Debug logging
        return;
      }
      
      if (password.length < 6) {
        alert('密码长度至少为6位');
        console.log("密码长度验证失败"); // Debug logging
        return;
      }
      
      try {
        console.log("开始创建用户..."); // Debug logging
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log("用户创建成功:", userCredential.user); // Debug logging
        
        await userCredential.user.updateProfile({ displayName });
        console.log("用户资料显示名称更新成功"); // Debug logging
        
        window.currentUser = userCredential.user;
        await initializeUserTodos();
        console.log("用户待办事项初始化成功"); // Debug logging
        
        // 通知UI层加载数据
        if (typeof window.onUserLoggedIn === 'function') {
          window.onUserLoggedIn();
        }
        showApp(todoApp, authSection, userInfo);
        console.log("应用界面切换成功"); // Debug logging
      } catch (error) {
        console.error("注册过程中发生错误:", error); // Debug logging
        alert(`注册失败: ${error.message}\n错误代码: ${error.code}`);
      }
    });
  }
}

// Data manipulation functions (only handle data, don't manipulate UI directly)
async function loadUserTodosData() {
  if (!window.currentUser) {
    console.warn("loadUserTodosData: currentUser is undefined");
    return [];
  }
  
  try {
    const todosRef = db.collection('users').doc(window.currentUser.uid).collection('todos');
    const snapshot = await todosRef.orderBy('createdAt', 'desc').get();
    
    const todos = [];
    snapshot.forEach(doc => {
      todos.push({ id: doc.id, ...doc.data() });
    });
    
    return todos;
  } catch (error) {
    console.error('Error loading todos:', error);
    throw error;
  }
}

async function addTodoData(text, description = '', priority = 'medium', category = 'personal', dueDate = '') {
  if (!window.currentUser || !text.trim()) {
    console.warn("addTodoData: currentUser is undefined or text is empty");
    return;
  }
  
  const newTodo = {
    text: text.trim(),
    description,
    completed: false,
    priority,
    category,
    dueDate,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    completedAt: null
  };
  
  try {
    const todosRef = db.collection('users').doc(window.currentUser.uid).collection('todos');
    await todosRef.add(newTodo);
    // 通知UI层刷新
    if (typeof window.onTodosChanged === 'function') {
      window.onTodosChanged();
    }
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
}

async function updateTodoData(id, updates) {
  if (!window.currentUser || !id) {
    console.warn("updateTodoData: currentUser is undefined or id is missing");
    return;
  }
  
  try {
    const todoRef = db.collection('users').doc(window.currentUser.uid).collection('todos').doc(id);
    await todoRef.update(updates);
    // 通知UI层刷新
    if (typeof window.onTodosChanged === 'function') {
      window.onTodosChanged();
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
}

async function deleteTodoData(id) {
  if (!window.currentUser || !id) {
    console.warn("deleteTodoData: currentUser is undefined or id is missing");
    return;
  }
  
  try {
    const todoRef = db.collection('users').doc(window.currentUser.uid).collection('todos').doc(id);
    await todoRef.delete();
    // 通知UI层刷新
    if (typeof window.onTodosChanged === 'function') {
      window.onTodosChanged();
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}

async function initializeUserTodos() {
  if (!window.currentUser) {
    console.warn("initializeUserTodos: currentUser is undefined");
    return;
  }
  
  try {
    const userRef = db.collection('users').doc(window.currentUser.uid);
    await userRef.set({
      uid: window.currentUser.uid,
      email: window.currentUser.email,
      displayName: window.currentUser.displayName || window.currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error initializing user:', error);
    throw error;
  }
}

function showApp(todoApp, authSection, userInfo) {
  if (authSection) authSection.style.display = 'none';
  if (todoApp) todoApp.style.display = 'block';
  if (userInfo) userInfo.textContent = `欢迎, ${window.currentUser.displayName || window.currentUser.email}`;
}

function logout(todoApp, authSection) {
  auth.signOut();
  if (authSection) authSection.style.display = 'block';
  if (todoApp) todoApp.style.display = 'none';
}

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    window.currentUser = user;
    // 通知UI层用户已登录
    if (typeof window.onUserLoggedIn === 'function') {
      window.onUserLoggedIn();
    }
    // 注意：这里不调用showApp，因为UI层会处理显示逻辑
  } else {
    // 退出登录，重置UI
    window.currentUser = null;
    if (typeof window.onUserLoggedOut === 'function') {
      window.onUserLoggedOut();
    }
  }
});

// Expose functions to global scope for use by UI layer
window.setupAuthHandlers = setupAuthHandlers;
window.loadUserTodosData = loadUserTodosData;
window.addTodoData = addTodoData;
window.updateTodoData = updateTodoData;
window.deleteTodoData = deleteTodoData;
window.initializeUserTodos = initializeUserTodos;
window.showApp = showApp;
window.logout = logout;