// tasks.js - Gestion complète des tâches avec système Kanban - VERSION CORRIGÉE

// Modèle de données pour les tâches
class Task {
    constructor(id, title, description, status, projectId, priority, category, dueDate, createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status || 'todo';
        this.projectId = projectId || '';
        this.priority = priority || 'medium';
        this.category = category || 'other';
        this.dueDate = dueDate || '';
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}

// Gestionnaire des tâches
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.projects = this.loadProjects();
        this.currentEditingId = null;
        this.draggedTask = null;
        this.init();
    }

    // Initialisation
    init() {
        this.bindEvents();
        this.renderProjectsFilter();
        this.renderTasks();
        this.loadSampleData();
        this.initDragAndDrop(); // Initialiser le drag & drop une fois au début
    }

    // Charger les tâches depuis le localStorage
    loadTasks() {
        const tasksData = localStorage.getItem('projectFlow_tasks');
        if (tasksData) {
            try {
                const parsed = JSON.parse(tasksData);
                return parsed.map(t => new Task(
                    t.id, t.title, t.description, t.status, t.projectId, 
                    t.priority, t.category, t.dueDate, t.createdAt
                ));
            } catch (e) {
                console.error('Erreur lors du chargement des tâches:', e);
                return [];
            }
        }
        return [];
    }

    // Charger les projets depuis le localStorage
    loadProjects() {
        const projectsData = localStorage.getItem('projectFlow_projects');
        if (projectsData) {
            try {
                return JSON.parse(projectsData);
            } catch (e) {
                console.error('Erreur lors du chargement des projets:', e);
                return [];
            }
        }
        return [];
    }

    // Sauvegarder les tâches dans le localStorage
    saveTasks() {
        localStorage.setItem('projectFlow_tasks', JSON.stringify(this.tasks));
    }

    // Charger des données d'exemple si aucune tâche n'existe
    loadSampleData() {
        if (this.tasks.length === 0 && this.projects.length > 0) {
            const sampleTasks = [
                new Task(
                    'task_1',
                    'Concevoir la maquette',
                    'Créer les wireframes et maquettes pour la page d\'accueil',
                    'todo',
                    this.projects[0]?.id,
                    'high',
                    'design',
                    this.getDateString(7)
                ),
                new Task(
                    'task_2',
                    'Développer le header',
                    'Implémenter le header responsive avec navigation',
                    'in-progress',
                    this.projects[0]?.id,
                    'medium',
                    'development',
                    this.getDateString(3)
                ),
                new Task(
                    'task_3',
                    'Tests utilisateurs',
                    'Organiser et mener des tests utilisateurs sur le prototype',
                    'todo',
                    this.projects[1]?.id,
                    'medium',
                    'research',
                    this.getDateString(14)
                ),
                new Task(
                    'task_4',
                    'Documentation API',
                    'Rédiger la documentation complète de l\'API',
                    'done',
                    this.projects[2]?.id,
                    'low',
                    'development',
                    this.getDateString(-2)
                )
            ];
            this.tasks = sampleTasks;
            this.saveTasks();
        }
    }

    // Obtenir une date formatée
    getDateString(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0];
    }

    // Lier les événements
    bindEvents() {
        // Bouton d'ajout de tâche principal
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Boutons d'ajout de tâche par colonne
        document.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.closest('.add-task-btn').dataset.status;
                this.openTaskModal(null, status);
            });
        });

        // Fermeture du modal
        document.getElementById('task-modal-close').addEventListener('click', () => {
            this.closeTaskModal();
        });
        document.getElementById('task-cancel-btn').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // Soumission du formulaire
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Recherche de tâches
        document.getElementById('task-search').addEventListener('input', () => {
            this.renderTasks();
        });

        // Filtrage par projet
        document.getElementById('project-filter').addEventListener('change', () => {
            this.renderTasks();
        });

        // Filtrage par priorité
        document.getElementById('priority-filter').addEventListener('change', () => {
            this.renderTasks();
        });

        // Fermer le modal en cliquant à l'extérieur
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target.id === 'task-modal') {
                this.closeTaskModal();
            }
        });
    }

    // Remplir le filtre des projets
    renderProjectsFilter() {
        const projectFilter = document.getElementById('project-filter');
        const taskProject = document.getElementById('task-project');
        
        // Vider les options existantes (sauf la première)
        while (projectFilter.children.length > 1) {
            projectFilter.removeChild(projectFilter.lastChild);
        }
        while (taskProject.children.length > 1) {
            taskProject.removeChild(taskProject.lastChild);
        }

        // Ajouter les projets
        this.projects.forEach(project => {
            const option1 = document.createElement('option');
            option1.value = project.id;
            option1.textContent = project.name;
            projectFilter.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = project.id;
            option2.textContent = project.name;
            taskProject.appendChild(option2);
        });
    }

    // Ouvrir le modal pour créer ou éditer une tâche
    openTaskModal(taskId = null, status = null) {
        const modal = document.getElementById('task-modal');
        const title = document.getElementById('task-modal-title');
        
        if (taskId) {
            // Mode édition
            title.textContent = 'Modifier la Tâche';
            this.currentEditingId = taskId;
            this.fillFormWithTaskData(taskId);
        } else {
            // Mode création
            title.textContent = 'Nouvelle Tâche';
            this.currentEditingId = null;
            document.getElementById('task-form').reset();
            
            // Définir le statut si fourni
            if (status) {
                document.getElementById('task-status').value = status;
            }
        }
        
        modal.style.display = 'flex';
        document.getElementById('task-title').focus();
    }

    // Remplir le formulaire avec les données de la tâche
    fillFormWithTaskData(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-status').value = task.status;
            document.getElementById('task-project').value = task.projectId || '';
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-category').value = task.category;
            document.getElementById('task-due-date').value = task.dueDate || '';
        }
    }

    // Fermer le modal
    closeTaskModal() {
        document.getElementById('task-modal').style.display = 'none';
        document.getElementById('task-form').reset();
        this.currentEditingId = null;
    }

    // Sauvegarder une tâche (création ou édition)
    saveTask() {
        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const status = document.getElementById('task-status').value;
        const projectId = document.getElementById('task-project').value;
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        const dueDate = document.getElementById('task-due-date').value;

        if (!title) {
            this.showNotification('Veuillez saisir un titre pour la tâche', 'error');
            document.getElementById('task-title').focus();
            return;
        }

        if (id) {
            // Édition d'une tâche existante
            const taskIndex = this.tasks.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
                this.tasks[taskIndex].title = title;
                this.tasks[taskIndex].description = description;
                this.tasks[taskIndex].status = status;
                this.tasks[taskIndex].projectId = projectId;
                this.tasks[taskIndex].priority = priority;
                this.tasks[taskIndex].category = category;
                this.tasks[taskIndex].dueDate = dueDate;
                this.tasks[taskIndex].updatedAt = new Date().toISOString();
                this.showNotification('Tâche modifiée avec succès', 'success');
            }
        } else {
            // Création d'une nouvelle tâche
            const newId = 'task_' + Date.now();
            const newTask = new Task(newId, title, description, status, projectId, priority, category, dueDate);
            this.tasks.push(newTask);
            this.showNotification('Tâche créée avec succès', 'success');
        }

        this.saveTasks();
        this.renderTasks();
        this.closeTaskModal();
    }

    // Supprimer une tâche
    deleteTask(taskId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.showNotification('Tâche supprimée avec succès', 'success');
        }
    }

    // Afficher les tâches
    renderTasks() {
        const searchTerm = document.getElementById('task-search').value.toLowerCase();
        const projectFilter = document.getElementById('project-filter').value;
        const priorityFilter = document.getElementById('priority-filter').value;

        // Filtrer les tâches
        let filteredTasks = this.tasks;
        
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) || 
                (task.description && task.description.toLowerCase().includes(searchTerm))
            );
        }
        
        if (projectFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.projectId === projectFilter);
        }
        
        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }

        // Rendre les tâches par colonne
        this.renderColumn('todo', filteredTasks);
        this.renderColumn('in-progress', filteredTasks);
        this.renderColumn('done', filteredTasks);

        // Mettre à jour les compteurs
        this.updateColumnCounts(filteredTasks);

        // Réinitialiser le drag & drop après le rendu
        this.initDragAndDrop();
    }

    // Rendre une colonne spécifique
    renderColumn(status, filteredTasks) {
        const column = document.getElementById(`${status}-tasks`);
        const tasksInColumn = filteredTasks.filter(task => task.status === status);

        if (tasksInColumn.length === 0) {
            column.innerHTML = `
                <div class="empty-column">
                    <ion-icon name="document-outline"></ion-icon>
                    <h4>Aucune tâche</h4>
                    <p>Ajoutez une tâche pour commencer</p>
                </div>
            `;
            return;
        }

        column.innerHTML = tasksInColumn.map(task => this.createTaskCard(task)).join('');

        // Ajouter les événements aux boutons d'action
        this.bindTaskActions(status);
    }

    // Créer une carte de tâche
    createTaskCard(task) {
        const project = this.projects.find(p => p.id === task.projectId);
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let dueDateClass = '';
        if (dueDate) {
            const taskDueDate = new Date(dueDate);
            taskDueDate.setHours(0, 0, 0, 0);
            
            if (taskDueDate < today) {
                dueDateClass = 'overdue';
            } else if (taskDueDate.getTime() === today.getTime()) {
                dueDateClass = 'today';
            }
        }

        return `
            <div class="task-card ${task.priority}-priority" data-task-id="${task.id}" draggable="true">
                <div class="task-header">
                    <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
                    <div class="task-actions">
                        <button class="task-btn edit-task" title="Modifier la tâche">
                            <ion-icon name="create-outline"></ion-icon>
                        </button>
                        <button class="task-btn delete-task" title="Supprimer la tâche">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                    </div>
                </div>
                <div class="task-body">
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    <div class="task-meta">
                        ${project ? `<span class="task-tag project">${this.escapeHtml(project.name)}</span>` : ''}
                        <span class="task-tag priority-${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                        <span class="task-tag category">${this.getCategoryLabel(task.category)}</span>
                    </div>
                </div>
                <div class="task-footer">
                    ${dueDate ? `
                        <span class="task-due-date ${dueDateClass}">
                            <ion-icon name="calendar-outline"></ion-icon>
                            ${this.formatDate(dueDate)}
                        </span>
                    ` : '<span></span>'}
                    <span class="task-created">${this.formatRelativeDate(task.createdAt)}</span>
                </div>
            </div>
        `;
    }

    // Mettre à jour les compteurs de colonnes
    updateColumnCounts(filteredTasks) {
        document.getElementById('todo-count').textContent = 
            filteredTasks.filter(t => t.status === 'todo').length;
        document.getElementById('in-progress-count').textContent = 
            filteredTasks.filter(t => t.status === 'in-progress').length;
        document.getElementById('done-count').textContent = 
            filteredTasks.filter(t => t.status === 'done').length;
    }

    // Lier les événements aux boutons d'action des tâches
    bindTaskActions(status) {
        const column = document.getElementById(`${status}-tasks`);

        // Boutons d'édition
        column.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = btn.closest('.task-card').dataset.taskId;
                this.openTaskModal(taskId);
            });
        });

        // Boutons de suppression
        column.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = btn.closest('.task-card').dataset.taskId;
                this.deleteTask(taskId);
            });
        });
    }

    // Initialiser le drag and drop - VERSION CORRIGÉE
    initDragAndDrop() {
        // Supprimer les anciens écouteurs d'événements
        const oldTasks = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.tasks-list');

        // Réinitialiser les écouteurs d'événements pour les colonnes
        columns.forEach(column => {
            // Cloner et remplacer pour supprimer les anciens écouteurs
            const newColumn = column.cloneNode(true);
            column.parentNode.replaceChild(newColumn, column);
        });

        // Réattacher les écouteurs d'événements aux colonnes
        document.querySelectorAll('.tasks-list').forEach(column => {
            column.addEventListener('dragover', this.handleDragOver.bind(this));
            column.addEventListener('dragenter', this.handleDragEnter.bind(this));
            column.addEventListener('dragleave', this.handleDragLeave.bind(this));
            column.addEventListener('drop', this.handleDrop.bind(this));
        });

        // Attacher les écouteurs d'événements aux nouvelles tâches
        document.querySelectorAll('.task-card').forEach(task => {
            task.addEventListener('dragstart', this.handleDragStart.bind(this));
            task.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    }

    // Gérer le début du drag
    handleDragStart(e) {
        this.draggedTask = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
        
        // Ajouter un délai pour que l'élément devienne semi-transparent
        setTimeout(() => {
            e.target.style.opacity = '0.4';
        }, 0);
    }

    // Gérer la fin du drag
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        e.target.style.opacity = '1';
        document.querySelectorAll('.tasks-list').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    // Gérer le survol pendant le drag
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    // Gérer l'entrée dans une colonne
    handleDragEnter(e) {
        e.preventDefault();
        const column = e.target.closest('.tasks-list');
        if (column) {
            column.classList.add('drag-over');
        }
    }

    // Gérer la sortie d'une colonne
    handleDragLeave(e) {
        const column = e.target.closest('.tasks-list');
        if (column && !column.contains(e.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    }

    // Gérer le drop - VERSION CORRIGÉE
    handleDrop(e) {
        e.preventDefault();
        const column = e.target.closest('.tasks-list');
        
        if (column && this.draggedTask) {
            column.classList.remove('drag-over');
            
            const taskId = this.draggedTask.dataset.taskId;
            const newStatus = column.dataset.status;
            
            console.log(`Déplacement de la tâche ${taskId} vers ${newStatus}`);
            
            // Mettre à jour le statut de la tâche
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                const oldStatus = this.tasks[taskIndex].status;
                this.tasks[taskIndex].status = newStatus;
                this.tasks[taskIndex].updatedAt = new Date().toISOString();
                this.saveTasks();
                
                // Re-rendre toutes les tâches pour les mettre à jour visuellement
                this.renderTasks();
                
                this.showNotification(`Tâche déplacée de "${this.getStatusLabel(oldStatus)}" vers "${this.getStatusLabel(newStatus)}"`, 'success');
            }
            
            this.draggedTask = null;
        }
    }

    // Obtenir le libellé du statut
    getStatusLabel(status) {
        const labels = {
            'todo': 'À faire',
            'in-progress': 'En cours',
            'done': 'Terminé'
        };
        return labels[status] || status;
    }

    // Obtenir le libellé de la priorité
    getPriorityLabel(priority) {
        const labels = {
            'high': 'Haute',
            'medium': 'Moyenne',
            'low': 'Basse'
        };
        return labels[priority] || priority;
    }

    // Obtenir le libellé de la catégorie
    getCategoryLabel(category) {
        const labels = {
            'development': 'Développement',
            'design': 'Design',
            'marketing': 'Marketing',
            'research': 'Recherche',
            'other': 'Autre'
        };
        return labels[category] || category;
    }

    // Formater la date
    formatDate(date) {
        const options = { day: 'numeric', month: 'short' };
        return date.toLocaleDateString('fr-FR', options);
    }

    // Formater la date relative
    formatRelativeDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
        return `Il y a ${Math.floor(diffDays / 30)} mois`;
    }

    // Échapper le HTML pour la sécurité
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Styles pour la notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: var(--radius-12);
            box-shadow: var(--shadow);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        // Style pour le bouton de fermeture
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin: 0;
        `;

        document.body.appendChild(notification);

        // Fermer la notification
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Fermer automatiquement après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Ajouter l'animation CSS pour les notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialiser le gestionnaire de tâches quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});