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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// 在外部JS文件中，我们不直接获取DOM元素
// 而是在主HTML文件中获取后传递给这里定义的函数

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
        await loadUserTodos(todoList);
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
        
        showApp(todoApp, authSection, userInfo);
        console.log("应用界面切换成功"); // Debug logging
      } catch (error) {
        console.error("注册过程中发生错误:", error); // Debug logging
        alert(`注册失败: ${error.message}\n错误代码: ${error.code}`);
      }
    });
  }
}

// Todo functions
async function loadUserTodos(todoList) {
  if (!window.currentUser) return;
  
  const todosRef = db.collection('users').doc(window.currentUser.uid).collection('todos');
  const snapshot = await todosRef.orderBy('createdAt', 'desc').get();
  
  window.todos = [];
  snapshot.forEach(doc => {
    window.todos.push({ id: doc.id, ...doc.data() });
  });
  
  renderTodos(window.todos, todoList);
}

async function addTodo(text, description = '', priority = 'medium', category = 'personal', dueDate = '', todoList) {
  if (!window.currentUser) return;
  
  const newTodo = {
    text,
    description,
    completed: false,
    priority,
    category,
    dueDate,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    completedAt: null
  };
  
  const todosRef = db.collection('users').doc(window.currentUser.uid).collection('todos');
  await todosRef.add(newTodo);
  await loadUserTodos(todoList);
}

async function updateTodo(id, updates, todoList) {
  if (!window.currentUser) return;
  
  const todoRef = db.collection('users').doc(window.currentUser.uid).collection('todos').doc(id);
  await todoRef.update(updates);
  await loadUserTodos(todoList);
}

async function deleteTodo(id, todoList) {
  if (!window.currentUser) return;
  
  const todoRef = db.collection('users').doc(window.currentUser.uid).collection('todos').doc(id);
  await todoRef.delete();
  await loadUserTodos(todoList);
}

function renderTodos(todos, todoList) {
  if (!todoList) return;
  
  todoList.innerHTML = '';
  
  if (todos.length === 0) {
    todoList.innerHTML = '<p>暂无待办事项，添加一个开始吧！</p>';
    return;
  }
  
  todos.forEach(todo => {
    const todoElement = document.createElement('div');
    todoElement.className = 'todo-item';
    todoElement.innerHTML = `
      <div class="todo-header">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="window.toggleComplete('${todo.id}', ${!todo.completed}, window.todoList)">
        <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
        <div class="todo-actions">
          <button onclick="window.editTodo('${todo.id}', '${todo.text}', '${todo.description}', '${todo.priority}', '${todo.category}', '${todo.dueDate}', window.todoList)">编辑</button>
          <button onclick="window.deleteTodo('${todo.id}', window.todoList)">删除</button>
        </div>
      </div>
      ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
      <div class="todo-meta">
        <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
        <span class="todo-category">${todo.category}</span>
        ${todo.dueDate ? `<span class="todo-due">到期: ${todo.dueDate}</span>` : ''}
      </div>
    `;
    todoList.appendChild(todoElement);
  });
}

async function toggleComplete(id, completed, todoList) {
  await updateTodo(id, { 
    completed, 
    completedAt: completed ? firebase.firestore.FieldValue.serverTimestamp() : null 
  }, todoList);
}

function editTodo(id, text, description, priority, category, dueDate, todoList) {
  // Implementation for editing a todo
  const newText = prompt('编辑任务:', text);
  if (newText !== null) {
    updateTodo(id, { text: newText, description, priority, category, dueDate }, todoList);
  }
}

async function initializeUserTodos() {
  // Create a default collection for the user if it doesn't exist
  const userRef = db.collection('users').doc(window.currentUser.uid);
  await userRef.set({
    uid: window.currentUser.uid,
    email: window.currentUser.email,
    displayName: window.currentUser.displayName || window.currentUser.email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
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
    loadUserTodos(window.todoList);
    showApp(window.todoApp, window.authSection, window.userInfo);
  } else {
    if (window.authSection) window.authSection.style.display = 'block';
    if (window.todoApp) window.todoApp.style.display = 'none';
  }
});

// Expose functions to global scope for inline handlers
// These functions will be called from the main HTML file
window.setupAuthHandlers = setupAuthHandlers;
window.loadUserTodos = loadUserTodos;
window.addTodo = addTodo;
window.updateTodo = updateTodo;
window.deleteTodo = deleteTodo;
window.toggleComplete = toggleComplete;
window.renderTodos = renderTodos;
window.editTodo = editTodo;
window.initializeUserTodos = initializeUserTodos;
window.showApp = showApp;
window.logout = logout;