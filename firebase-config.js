// Password encryption utilities
async function hashPassword(password) {
    // Create a salt (in a real app, you'd want to generate a random salt per password)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
      
      // Simple client-side validation
      if (!email || !password) {
        alert('请填写邮箱和密码');
        return;
      }
      
      // Clear password field after reading to prevent showing in URL
      loginForm.password.value = '';
      
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
      
      // Clear password fields after reading to prevent showing in URL
      registerForm.password.value = '';
      registerForm.confirmPassword.value = '';
      
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

// Additional helper functions for profile management
function updateProfile(displayName) {
  if (!window.currentUser) {
    console.warn("updateProfile: currentUser is undefined");
    return Promise.reject(new Error("用户未登录"));
  }
  
  return window.currentUser.updateProfile({
    displayName: displayName
  });
}

function updatePassword(currentPassword, newPassword) {
  if (!window.currentUser) {
    console.warn("updatePassword: currentUser is undefined");
    return Promise.reject(new Error("用户未登录"));
  }
  
  // 首先需要重新验证用户身份
  const credential = firebase.auth.EmailAuthProvider.credential(
    window.currentUser.email,
    currentPassword
  );
  
  return window.currentUser.reauthenticateWithCredential(credential)
    .then(() => {
      // 重新验证成功，现在可以更新密码
      return window.currentUser.updatePassword(newPassword);
    });
}

// IndexedDB Session Manager
class SessionManager {
  constructor() {
    this.dbName = 'TodoAppSessionDB';
    this.version = 2; // 增加版本号以更新数据库结构
    this.db = null;
  }

  // 初始化数据库
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB initialized successfully");
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // 如果旧版本存在，删除它
        if (db.objectStoreNames.contains('sessions')) {
          db.deleteObjectStore('sessions');
        }
        // 创建新版本的对象存储
        const objectStore = db.createObjectStore('sessions', { keyPath: 'uid' });
        objectStore.createIndex('expires', 'expires', { unique: false });
        
        // 创建页面状态存储
        if (!db.objectStoreNames.contains('pageStates')) {
          const pageStateStore = db.createObjectStore('pageStates', { keyPath: 'uid' });
          pageStateStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        
        console.log("Created sessions and pageStates object stores");
      };
    });
  }

  // 存储会话
  async storeSession(userData) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    
    const sessionData = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30天后过期
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(sessionData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取会话
  async getSession(uid) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    
    return new Promise((resolve, reject) => {
      const request = store.get(uid);
      request.onsuccess = () => {
        const session = request.result;
        // 检查是否过期
        if (session && session.expires > Date.now()) {
          console.log("Valid session found in IndexedDB");
          resolve(session);
        } else {
          // 删除过期会话
          if (session) {
            console.log("Session expired, removing from IndexedDB");
            this.clearSession(uid);
          }
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 存储页面状态
  async storePageState(userId, currentPage = 'todo') {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['pageStates'], 'readwrite');
    const store = transaction.objectStore('pageStates');
    
    const pageStateData = {
      uid: userId,
      currentPage: currentPage,
      updatedAt: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(pageStateData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取页面状态
  async getPageState(userId) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['pageStates'], 'readonly');
    const store = transaction.objectStore('pageStates');
    
    return new Promise((resolve, reject) => {
      const request = store.get(userId);
      request.onsuccess = () => {
        const pageState = request.result;
        // 检查是否过期（页面状态只保留最近24小时）
        if (pageState && pageState.updatedAt > (Date.now() - 24 * 60 * 60 * 1000)) {
          console.log("Valid page state found in IndexedDB:", pageState.currentPage);
          resolve(pageState);
        } else {
          // 删除过期的页面状态
          if (pageState) {
            console.log("Page state expired, removing from IndexedDB");
            this.clearPageState(userId);
          }
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 清除会话
  async clearSession(uid) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(uid);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 清除页面状态
  async clearPageState(uid) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['pageStates'], 'readwrite');
    const store = transaction.objectStore('pageStates');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(uid);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 清除所有过期会话
  async clearExpiredSessions() {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    const expiresIndex = store.index('expires');
    
    const request = expiresIndex.openCursor(IDBKeyRange.upperBound(Date.now()));
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          console.log("Expired sessions cleanup completed");
          resolve();
        }
      };
    });
  }
}

// 初始化会话管理器
const sessionManager = new SessionManager();

// Listen for auth state changes
auth.onAuthStateChanged(async user => {
  if (user) {
    window.currentUser = user;
    
    // Initialize session manager if needed and store user info in IndexedDB for persistence
    try {
      if (!sessionManager.db) {
        await sessionManager.init();
      }
      
      const userObj = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };
      await sessionManager.storeSession(userObj);
      console.log("Session stored in IndexedDB successfully");
    } catch (error) {
      console.error("Error storing session in IndexedDB:", error);
    }
    
    // 通知UI层用户已登录
    if (typeof window.onUserLoggedIn === 'function') {
      window.onUserLoggedIn();
    }
    // 注意：这里不调用showApp，因为UI层会处理显示逻辑
  } else {
    // 用户已登出，清除存储的会话
    try {
      if (window.currentUser) {
        await sessionManager.clearSession(window.currentUser.uid);
        console.log("Session cleared from IndexedDB");
      }
    } catch (error) {
      console.error("Error clearing session from IndexedDB:", error);
    }
    
    // 退出登录，重置UI
    window.currentUser = null;
    if (typeof window.onUserLoggedOut === 'function') {
      window.onUserLoggedOut();
    }
  }
});

// Check for stored auth state on page load (only after everything is initialized)
window.addEventListener('load', async () => {
  try {
    // 初始化IndexedDB
    await sessionManager.init();
    
    // 检查是否存在存储的会话
    // 注意：我们不主动恢复会话，而是依赖Firebase的内置持久化
    // 但我们可以检查是否有存储的会话信息
    console.log("IndexedDB session manager initialized on page load");
  } catch (error) {
    console.error("Error initializing session manager:", error);
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
window.updateProfile = updateProfile;
window.updatePassword = updatePassword;