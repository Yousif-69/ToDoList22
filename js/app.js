/**
 * This file contains all the functionality for the ToDo List application.
 * It handles task management, local storage, and user interactions.
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const filterSelect = document.getElementById('filter-select');
    const tasksCounter = document.getElementById('tasks-counter');
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    // Initialize todos array from localStorage or empty array
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    // Render todos
    function renderTodos() {
        const currentFilter = filterSelect.value;
        
        // Filter todos based on selected filter
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true; // 'all' filter
        });
        
        // Clear current list
        todoList.innerHTML = '';
        
        // Show empty state if no todos
        if (filteredTodos.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-clipboard-list fa-3x mb-3"></i>
                <p>${todos.length === 0 ? 'Your to-do list is empty. Add some tasks!' : 'No tasks match the current filter.'}</p>
            `;
            todoList.appendChild(emptyState);
        } else {
            // Render filtered todos
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = 'todo-item list-group-item d-flex justify-content-between align-items-center';
                li.dataset.id = todo.id;
                
                li.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input toggle-completed" type="checkbox" 
                            id="check-${todo.id}" ${todo.completed ? 'checked' : ''}>
                        <label class="form-check-label ${todo.completed ? 'completed' : ''}" 
                            for="check-${todo.id}">${todo.text}</label>
                    </div>
                    <div class="todo-actions">
                        <button class="btn btn-sm btn-outline-primary edit-todo me-1">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-todo">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                todoList.appendChild(li);
            });
        }
        
        // Update tasks counter
        const activeTasks = todos.filter(todo => !todo.completed).length;
        const completedTasks = todos.length - activeTasks;
        tasksCounter.textContent = `${todos.length} tasks (${activeTasks} active, ${completedTasks} completed)`;
        
        // Save to localStorage
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Add new todo
    function addTodo(text) {
        const newTodo = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };
        
        todos.push(newTodo);
        renderTodos();
        todoInput.value = '';
        todoInput.focus();
        
        // Show toast notification
        showToast('Task added successfully!');
    }
    
    // Delete todo
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        renderTodos();
        
        // Show toast notification
        showToast('Task deleted!', 'danger');
    }
    
    // Toggle todo completion
    function toggleTodoCompleted(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        
        renderTodos();
    }
    
    // Edit todo
    function editTodo(id, newText) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, text: newText };
            }
            return todo;
        });
        
        renderTodos();
        
        // Show toast notification
        showToast('Task updated!', 'info');
    }
    
    // Clear completed todos
    function clearCompleted() {
        const completedCount = todos.filter(todo => todo.completed).length;
        
        if (completedCount === 0) {
            showToast('No completed tasks to clear!', 'warning');
            return;
        }
        
        todos = todos.filter(todo => !todo.completed);
        renderTodos();
        
        // Show toast notification
        showToast(`Cleared ${completedCount} completed tasks!`, 'success');
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '5';
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);
        
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        
        // Remove from DOM after hiding
        toast.addEventListener('hidden.bs.toast', function() {
            toastContainer.remove();
        });
    }
    
    // Event Listeners
    todoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            addTodo(text);
        }
    });
    
    todoList.addEventListener('click', function(e) {
        const li = e.target.closest('.todo-item');
        if (!li) return;
        
        const id = li.dataset.id;
        
        // Handle checkbox click
        if (e.target.classList.contains('toggle-completed') || 
            e.target.classList.contains('form-check-label')) {
            toggleTodoCompleted(id);
        }
        
        // Handle delete button click
        if (e.target.classList.contains('delete-todo') || 
            e.target.closest('.delete-todo')) {
            deleteTodo(id);
        }
        
        // Handle edit button click
        if (e.target.classList.contains('edit-todo') || 
            e.target.closest('.edit-todo')) {
            const todo = todos.find(t => t.id === id);
            const newText = prompt('Edit task:', todo.text);
            
            if (newText !== null && newText.trim()) {
                editTodo(id, newText.trim());
            }
        }
    });
    
    filterSelect.addEventListener('change', renderTodos);
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Initial render
    renderTodos();
}); 