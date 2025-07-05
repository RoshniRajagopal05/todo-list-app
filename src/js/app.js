import { fadeIn, fadeOut, slideIn, slideOut } from '../assets/animations.js';
import { saveTasks, loadTasks } from './storage.js';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const modalOverlay = document.getElementById('modal-overlay');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

// --- Edit Modal Elements ---
let editModal = null;
let editInputModal = null;
let saveEditBtn = null;
let cancelEditBtn = null;
let editingIndex = null;

let tasks = [];
let taskToDelete = null;

// --- Create Edit Modal ---
function createEditModal() {
    editModal = document.createElement('div');
    editModal.className = 'modal';
    editModal.innerHTML = `
        <p>Edit Task</p>
        <input type="text" class="edit-input-modal" maxlength="60" />
        <div class="modal-actions">
            <button class="btn add-btn save-edit-btn">Save</button>
            <button class="btn cancel-btn cancel-edit-btn">Cancel</button>
        </div>
    `;
    // Overlay for edit modal
    let overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'none';
    overlay.appendChild(editModal);
    document.body.appendChild(overlay);

    editInputModal = editModal.querySelector('.edit-input-modal');
    saveEditBtn = editModal.querySelector('.save-edit-btn');
    cancelEditBtn = editModal.querySelector('.cancel-edit-btn');

    // Save
    saveEditBtn.onclick = () => {
        const newText = editInputModal.value.trim();
        if (newText && editingIndex !== null) {
            tasks[editingIndex].text = newText;
            saveTasks(tasks);
            renderTasks();
            hideEditModal();
        }
    };
    // Cancel
    cancelEditBtn.onclick = hideEditModal;
    // ESC key
    editInputModal.onkeydown = (e) => {
        if (e.key === 'Enter') saveEditBtn.click();
        if (e.key === 'Escape') hideEditModal();
    };

    return overlay;
}

let editModalOverlay = createEditModal();

function showEditModal(idx, currentText) {
    editingIndex = idx;
    editInputModal.value = currentText;
    editModalOverlay.style.display = 'flex';
    setTimeout(() => {
        editModalOverlay.classList.add('active');
        editInputModal.focus();
        editInputModal.setSelectionRange(currentText.length, currentText.length);
    }, 10);
}
function hideEditModal() {
    editModalOverlay.classList.remove('active');
    setTimeout(() => {
        editModalOverlay.style.display = 'none';
        editingIndex = null;
    }, 300);
}

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, idx) => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.setAttribute('data-index', idx);

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = task.text;

        const actions = document.createElement('div');
        actions.className = 'todo-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn edit-btn';
        editBtn.textContent = 'Edit';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn delete-btn';
        deleteBtn.textContent = 'Delete';

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(textSpan);
        li.appendChild(actions);

        // Animations
        li.style.opacity = 0;
        setTimeout(() => slideIn(li), 10);

        // Edit (open modal)
        editBtn.onclick = () => {
            showEditModal(idx, task.text);
        };

        // Delete
        deleteBtn.onclick = () => {
            taskToDelete = idx;
            showModal();
        };

        todoList.appendChild(li);
    });
}

todoForm.onsubmit = (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    tasks.push({ text });
    saveTasks(tasks);
    todoInput.value = '';
    renderTasks();
};

function showModal() {
    modalOverlay.classList.add('active');
}

function hideModal() {
    modalOverlay.classList.remove('active');
}

confirmDeleteBtn.onclick = () => {
    if (taskToDelete !== null) {
        // Animate out
        const li = todoList.querySelector(`[data-index="${taskToDelete}"]`);
        slideOut(li, () => {
            tasks.splice(taskToDelete, 1);
            saveTasks(tasks);
            renderTasks();
            hideModal();
            taskToDelete = null;
        });
    }
};

cancelDeleteBtn.onclick = () => {
    hideModal();
    taskToDelete = null;
};

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    tasks = loadTasks();
    renderTasks();
});