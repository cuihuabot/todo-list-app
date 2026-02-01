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

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const todoApp = document.getElementById('todoApp');
const authSection = document.getElementById('authSection');
const userList = document.getElementById('userList');
const todoList = document.getElementById('todoList');
const userInfo = document.getElementById('userInfo');

let currentUser = null;

// Authentication functions
function setupAuthHandlers() {
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      
      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        await loadUserTodos();
        showApp();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = registerForm.email.value;
      const password = registerForm.password.value;
      const displayName = registerForm.displayName.value;
      
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName });
        currentUser = userCredential.user;
        await initializeUserTodos();
        showApp();
      } catch (error) {
        alert(error.message);
      }
    });
  }
}

// Todo functions
async function loadUserTodos() {
  if (!currentUser) return;
  
  const todosRef = db.collection('users').doc(currentUser.uid).collection('todos');
  const snapshot = await todosRef.orderBy('createdAt', 'desc').get();
  
  const todos = [];
  snapshot.forEach(doc => {
    todos.push({ id: doc.id, ...doc.data() });
  });
  
  renderTodos(todos);
}

async function addTodo(text, description = '', priority = 'medium', category = 'personal', dueDate = '') {
  if (!currentUser) return;
  
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
  
  const todosRef = db.collection('users').doc(currentUser.uid).collection('todos');
  await todosRef.add(newTodo);
  await loadUserTodos();
}

async function updateTodo(id, updates) {
  if (!currentUser) return;
  
  const todoRef = db.collection('users').doc(currentUser.uid).collection('todos').doc(id);
  await todoRef.update(updates);
  await loadUserTodos();
}

async function deleteTodo(id) {
  if (!currentUser) return;
  
  const todoRef = db.collection('users').doc(currentUser.uid).collection('todos').doc(id);
  await todoRef.delete();
  await loadUserTodos();
}

function renderTodos(todos) {
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
        <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleComplete('${todo.id}', ${!todo.completed})">
        <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
        <div class="todo-actions">
          <button onclick="editTodo('${todo.id}', '${todo.text}', '${todo.description}', '${todo.priority}', '${todo.category}', '${todo.dueDate}')">编辑</button>
          <button onclick="deleteTodo('${todo.id}')">删除</button>
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

async function toggleComplete(id, completed) {
  await updateTodo(id, { 
    completed, 
    completedAt: completed ? firebase.firestore.FieldValue.serverTimestamp() : null 
  });
}

function editTodo(id, text, description, priority, category, dueDate) {
  // Implementation for editing a todo
  const newText = prompt('编辑任务:', text);
  if (newText !== null) {
    updateTodo(id, { text: newText, description, priority, category, dueDate });
  }
}

async function initializeUserTodos() {
  // Create a default collection for the user if it doesn't exist
  const userRef = db.collection('users').doc(currentUser.uid);
  await userRef.set({
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName || currentUser.email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function showApp() {
  if (authSection) authSection.style.display = 'none';
  if (todoApp) todoApp.style.display = 'block';
  if (userInfo) userInfo.textContent = `欢迎, ${currentUser.displayName || currentUser.email}`;
}

function logout() {
  auth.signOut();
  if (authSection) authSection.style.display = 'block';
  if (todoApp) todoApp.style.display = 'none';
}

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadUserTodos();
    showApp();
  } else {
    if (authSection) authSection.style.display = 'block';
    if (todoApp) todoApp.style.display = 'none';
  }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', setupAuthHandlers);

// Expose functions to global scope for inline handlers
window.toggleComplete = toggleComplete;
window.editTodo = editTodo;
window.deleteTodo = deleteTodo;
window.logout = logout;