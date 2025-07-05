export function saveTasks(tasks) {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
}

export function loadTasks() {
    const data = localStorage.getItem('todo-tasks');
    return data ? JSON.parse(data) : [];
}

export function clearTasks() {
    localStorage.removeItem('todo-tasks');
}