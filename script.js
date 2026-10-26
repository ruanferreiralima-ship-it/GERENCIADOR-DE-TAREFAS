// --- Gerenciamento de Estado ---
let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [
    { id: 1, text: 'Dar uma caminhada matinal de 20 minutos', completed: true },
    { id: 2, text: 'Revisar metas da semana', completed: false },
    { id: 3, text: 'Beber 2L de água ao longo do dia', completed: false }
];
let currentFilter = 'all';

// --- Elementos do DOM ---
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const currentDateEl = document.getElementById('current-date');
const headerCounter = document.getElementById('header-counter');
const progressBar = document.getElementById('progress-bar');

const countAllEl = document.getElementById('count-all');
const countPendingEl = document.getElementById('count-pending');
const countCompletedEl = document.getElementById('count-completed');

// --- Formatação de Data ---
function displayCurrentDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const today = new Date().toLocaleDateString('pt-BR', options);
    currentDateEl.textContent = today.charAt(0).toUpperCase() + today.slice(1);
}

// --- Sincronização com LocalStorage ---
function saveTasks() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    renderTasks();
}

// --- Operações CRUD das Tarefas ---
function addTask(text) {
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false
    };
    tasks.unshift(newTask);
    saveTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
}

// Remoção utilizando o método .remove() com confirmação de eliminação
function deleteTask(id, element) {
    const confirmDelete = confirm('Tem a certeza de que deseja remover esta tarefa?');
    
    if (confirmDelete) {
        tasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('todo_tasks', JSON.stringify(tasks));
        
        if (element) {
            element.remove();
        }
        renderTasks();
    }
}

function clearCompleted() {
    const confirmClear = confirm('Tem a certeza de que deseja remover todas as tarefas concluídas?');
    
    if (confirmClear) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
    }
}

// --- Gerenciamento de Filtros ---
function setFilter(filter) {
    currentFilter = filter;
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('bg-white', 'shadow-sm', 'text-slate-700', 'font-semibold');
        btn.classList.add('text-slate-600');
    });

    const activeBtn = document.getElementById(`filter-${filter}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-white', 'shadow-sm', 'text-slate-700', 'font-semibold');
        activeBtn.classList.remove('text-slate-600');
    }

    renderTasks();
}

// --- Renderização da Interface (UI) ---
function renderTasks() {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    const totalCount = tasks.length;
    const pendingCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;

    countAllEl.textContent = totalCount;
    countPendingEl.textContent = pendingCount;
    countCompletedEl.textContent = completedCount;

    headerCounter.textContent = `${pendingCount} ${pendingCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'}`;

    const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    progressBar.style.width = `${percentage}%`;

    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');

        filteredTasks.forEach(task => {
            // Criação do elemento com document.createElement('li')
            const li = document.createElement('li');
            li.className = `task-item flex items-center justify-between p-4 hover:bg-slate-50/80 group ${
                task.completed ? 'bg-slate-50/50' : ''
            }`;

            const taskContent = document.createElement('div');
            taskContent.className = 'flex items-center gap-3.5 flex-grow min-w-0 mr-3';

            const checkBtn = document.createElement('button');
            checkBtn.className = `w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                task.completed 
                    ? 'bg-sky-600 border-sky-600 text-white' 
                    : 'border-slate-300 hover:border-sky-500 bg-white'
            }`;
            checkBtn.onclick = () => toggleTask(task.id);
            checkBtn.innerHTML = `<i class="fa-solid fa-check text-[10px] ${task.completed ? 'block' : 'hidden'}"></i>`;

            const spanText = document.createElement('span');
            spanText.className = 'text-sm cursor-pointer select-none truncate transition-all';
            spanText.textContent = task.text;
            
            // Aplicação da risca no texto via .style.textDecoration
            if (task.completed) {
                spanText.style.textDecoration = 'line-through';
                spanText.classList.add('text-slate-400', 'font-normal');
            } else {
                spanText.style.textDecoration = 'none';
                spanText.classList.add('text-slate-700', 'font-medium');
            }
            spanText.onclick = () => toggleTask(task.id);

            taskContent.appendChild(checkBtn);
            taskContent.appendChild(spanText);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'opacity-100 sm:opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all';
            deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can text-sm"></i>';
            
            // Evento para remover o elemento da lista com confirmação
            deleteBtn.onclick = () => deleteTask(task.id, li);

            li.appendChild(taskContent);
            li.appendChild(deleteBtn);

            taskList.appendChild(li);
        });
    }
}

// --- Event Listeners ---
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value;
    
    if (text.trim() === '') {
        alert('Digite uma tarefa!');
    } else {
        addTask(text);
        taskInput.value = '';
        taskInput.focus();
    }
});

const btnAdicionar = document.getElementById('btn-adicionar');
if (btnAdicionar) {
    btnAdicionar.addEventListener('click', function() {
        // Ação executada ao clicar no botão
    });
}

// --- Lógica do Modal de Boas-Vindas ---
function showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.add('hidden');
}

document.getElementById('welcome-modal').addEventListener('click', (e) => {
    if (e.target.id === 'welcome-modal') {
        closeModal();
    }
});

// --- Carregamento Inicial ---
window.onload = function() {
    displayCurrentDate();
    renderTasks();

    setTimeout(function() {
        showWelcomeModal();
    }, 5000);
};