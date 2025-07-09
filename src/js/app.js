import { fadeIn, fadeOut, slideIn, slideOut } from '../assets/animations.js';
import { saveTasks, loadTasks } from './storage.js';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const todoList = document.getElementById('todo-list');
const modalOverlay = document.getElementById('modal-overlay');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const searchInput = document.getElementById('search-input');
const pagination = document.getElementById('pagination');
const filterSelect = document.getElementById('filter-select');

const TASKS_PER_PAGE = 5;

let currentPage = 1;
let filteredTasks = [];
let currentFilter = 'all';

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

function formatDateDMY(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

todoForm.onsubmit = (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    const date = todoDate.value;
    if (!text || !date) {
        todoInput.reportValidity();
        todoDate.reportValidity();
        return;
    }
    tasks.push({ text, date, completed: false });
    saveTasks(tasks);
    todoInput.value = '';
    todoDate.value = '';
    renderTasks();
};

function renderTasks(filter = "", page = 1) {
    // Filter tasks by search and filter dropdown
    filteredTasks = tasks.filter(task => {
        const matchesSearch = filter
            ? task.text.toLowerCase().includes(filter.toLowerCase())
            : true;
        const matchesStatus =
            currentFilter === 'all' ||
            (currentFilter === 'pending' && !task.completed) ||
            (currentFilter === 'completed' && task.completed);
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE) || 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    todoList.innerHTML = '';
    const start = (page - 1) * TASKS_PER_PAGE;
    const end = start + TASKS_PER_PAGE;
    const pageTasks = filteredTasks.slice(start, end);

    pageTasks.forEach((task, idx) => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.setAttribute('data-index', tasks.indexOf(task));
        if (task.completed) li.classList.add('completed');

        // Custom checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = !!task.completed;
        checkbox.onclick = () => {
            task.completed = checkbox.checked;
            saveTasks(tasks);
            renderTasks(searchInput.value, currentPage);
        };

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = task.text;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'todo-date';
        dateSpan.textContent = task.date ? formatDateDMY(task.date) : '';

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

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(dateSpan);
        li.appendChild(actions);

        li.style.opacity = 0;
        setTimeout(() => slideIn(li), 10);

        editBtn.onclick = () => {
            showEditModal(tasks.indexOf(task), task.text, task.date);
        };

        deleteBtn.onclick = () => {
            taskToDelete = tasks.indexOf(task);
            showModal();
        };

        todoList.appendChild(li);
    });

    renderPagination(totalPages, page);
}

function renderPagination(totalPages, currentPage) {
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    // Prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = 'Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => renderTasks(searchInput.value, currentPage - 1);
    pagination.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => renderTasks(searchInput.value, i);
        pagination.appendChild(btn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => renderTasks(searchInput.value, currentPage + 1);
    pagination.appendChild(nextBtn);
}

// Add search functionality
searchInput.addEventListener('input', (e) => {
    renderTasks(e.target.value, 1);
});

// Add filter functionality
filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderTasks(searchInput.value, 1);
});

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

// Export JSON
document.getElementById('export-json').onclick = () => {
    const data = JSON.stringify(tasks, null, 2);
    downloadFile(data, 'tasks.json', 'application/json');
};

// Export CSV
document.getElementById('export-csv').onclick = () => {
    const csv = [
        ['Task', 'Date', 'Completed'],
        ...tasks.map(t => [
            `"${t.text.replace(/"/g, '""')}"`,
            t.date,
            t.completed ? 'Yes' : 'No'
        ])
    ].map(row => row.join(',')).join('\r\n');
    downloadFile(csv, 'tasks.csv', 'text/csv');
};

// Export TXT
document.getElementById('export-txt').onclick = () => {
    const txt = tasks.map(t => `${t.text} | ${t.date} | ${t.completed ? 'Completed' : 'Pending'}`).join('\r\n');
    downloadFile(txt, 'tasks.txt', 'text/plain');
};

// Export XML
document.getElementById('export-xml').onclick = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><tasks>${tasks.map(t =>
        `<task><text>${escapeXml(t.text)}</text><date>${t.date}</date><completed>${t.completed}</completed></task>`
    ).join('')}</tasks>`;
    downloadFile(xml, 'tasks.xml', 'application/xml');
};

// Export PDF (using jsPDF CDN)
document.getElementById('export-pdf').onclick = () => {
    if (typeof window.jspdf === "undefined" && typeof window.jsPDF === "undefined") {
        alert("PDF export requires jsPDF. Please include jsPDF via CDN in your HTML.");
        return;
    }
    const doc = new (window.jsPDF || window.jspdf.jsPDF)();
    doc.setFontSize(14);
    doc.text("To-Do List", 10, 15);
    let y = 25;
    tasks.forEach((t, i) => {
        doc.text(`${i + 1}. ${t.text}`, 10, y);
        doc.text(`Date: ${t.date} | ${t.completed ? 'Completed' : 'Pending'}`, 10, y + 7);
        y += 15;
        if (y > 270) { doc.addPage(); y = 15; }
    });
    doc.save('tasks.pdf');
};

// Helper for download
function downloadFile(data, filename, type) {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

// Helper for XML escaping
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
    }[c]));
}

// Import functionality
document.getElementById('import-file').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
        let imported = [];
        try {
            if (file.name.endsWith('.json')) {
                imported = JSON.parse(evt.target.result);
            } else if (file.name.endsWith('.csv')) {
                imported = csvToTasks(evt.target.result);
            } else if (file.name.endsWith('.txt')) {
                imported = txtToTasks(evt.target.result);
            } else if (file.name.endsWith('.xml')) {
                imported = xmlToTasks(evt.target.result);
            }
            if (Array.isArray(imported)) {
                tasks = imported;
                saveTasks(tasks);
                renderTasks();
                alert('Tasks imported successfully!');
            } else {
                alert('Invalid file format.');
            }
        } catch (err) {
            alert('Import failed: ' + err.message);
        }
        e.target.value = '';
    };
    reader.readAsText(file);
});

// CSV to tasks
function csvToTasks(csv) {
    const lines = csv.trim().split(/\r?\n/);
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const [text, date, completed] = lines[i].split(',');
        result.push({
            text: text.replace(/^"|"$/g, '').replace(/""/g, '"'),
            date: date,
            completed: /yes/i.test(completed)
        });
    }
    return result;
}

// TXT to tasks
function txtToTasks(txt) {
    return txt.trim().split(/\r?\n/).map(line => {
        const [text, date, status] = line.split('|').map(s => s.trim());
        return {
            text: text,
            date: date,
            completed: /completed/i.test(status)
        };
    });
}

// XML to tasks
function xmlToTasks(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const taskNodes = doc.getElementsByTagName('task');
    const result = [];
    for (let i = 0; i < taskNodes.length; i++) {
        const t = taskNodes[i];
        result.push({
            text: t.getElementsByTagName('text')[0].textContent,
            date: t.getElementsByTagName('date')[0].textContent,
            completed: t.getElementsByTagName('completed')[0].textContent === 'true'
        });
    }
    return result;
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    tasks = loadTasks();
    renderTasks();
});