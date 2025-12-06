// projects.js - Gestion complète des projets pour ProjectFlow

// Modèle de données pour les projets
class Project {
    constructor(id, name, description, category, color, createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.color = color;
        this.createdAt = createdAt || new Date().toISOString();
        this.tasks = []; // Tableau pour stocker les tâches du projet
    }
}

// Gestionnaire des projets
class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
        this.currentEditingId = null;
        this.init();
    }

    // Initialisation
    init() {
        this.bindEvents();
        this.renderProjects();
        this.loadSampleData();
    }

    // Charger les projets depuis le localStorage
    loadProjects() {
        const projectsData = localStorage.getItem('projectFlow_projects');
        if (projectsData) {
            try {
                const parsed = JSON.parse(projectsData);
                return parsed.map(p => new Project(
                    p.id, p.name, p.description, p.category, p.color, p.createdAt
                ));
            } catch (e) {
                console.error('Erreur lors du chargement des projets:', e);
                return [];
            }
        }
        return [];
    }

    // Sauvegarder les projets dans le localStorage
    saveProjects() {
        localStorage.setItem('projectFlow_projects', JSON.stringify(this.projects));
    }

    // Charger des données d'exemple si aucun projet n'existe
    loadSampleData() {
        if (this.projects.length === 0) {
            const sampleProjects = [
                new Project(
                    'proj_1',
                    'Site Web E-commerce',
                    'Développement d\'une plateforme e-commerce complète avec système de paiement',
                    'work',
                    '#3b82f6'
                ),
                new Project(
                    'proj_2',
                    'Application Mobile Fitness',
                    'Application de suivi d\'entraînement et nutrition avec statistiques',
                    'personal',
                    '#ef4444'
                ),
                new Project(
                    'proj_3',
                    'Cours React Avancé',
                    'Préparation des supports pour le cours avancé React et Redux',
                    'education',
                    '#10b981'
                )
            ];
            this.projects = sampleProjects;
            this.saveProjects();
        }
    }

    // Lier les événements
    bindEvents() {
        // Bouton d'ajout de projet
        document.getElementById('add-project-btn').addEventListener('click', () => {
            this.openProjectModal();
        });

        // Fermeture du modal
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeProjectModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeProjectModal();
        });

        // Soumission du formulaire
        document.getElementById('project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject();
        });

        // Recherche de projets
        document.getElementById('project-search').addEventListener('input', () => {
            this.renderProjects();
        });

        // Filtrage par catégorie
        document.getElementById('category-filter').addEventListener('change', () => {
            this.renderProjects();
        });

        // Fermer le modal en cliquant à l'extérieur
        document.getElementById('project-modal').addEventListener('click', (e) => {
            if (e.target.id === 'project-modal') {
                this.closeProjectModal();
            }
        });

        // Mettre à jour la valeur de couleur affichée
        document.getElementById('project-color').addEventListener('input', (e) => {
            document.getElementById('color-value').textContent = e.target.value;
        });
    }

    // Ouvrir le modal pour créer ou éditer un projet
    openProjectModal(projectId = null) {
        const modal = document.getElementById('project-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('project-form');
        
        if (projectId) {
            // Mode édition
            title.textContent = 'Modifier le Projet';
            this.currentEditingId = projectId;
            this.fillFormWithProjectData(projectId);
        } else {
            // Mode création
            title.textContent = 'Nouveau Projet';
            this.currentEditingId = null;
            form.reset();
            document.getElementById('project-color').value = '#3b82f6';
            document.getElementById('color-value').textContent = '#3b82f6';
        }
        
        modal.style.display = 'flex';
        document.getElementById('project-name').focus();
    }

    // Remplir le formulaire avec les données du projet
    fillFormWithProjectData(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('project-id').value = project.id;
            document.getElementById('project-name').value = project.name;
            document.getElementById('project-description').value = project.description || '';
            document.getElementById('project-category').value = project.category;
            document.getElementById('project-color').value = project.color;
            document.getElementById('color-value').textContent = project.color;
        }
    }

    // Fermer le modal
    closeProjectModal() {
        document.getElementById('project-modal').style.display = 'none';
        document.getElementById('project-form').reset();
        this.currentEditingId = null;
    }

    // Sauvegarder un projet (création ou édition)
    saveProject() {
        const id = document.getElementById('project-id').value;
        const name = document.getElementById('project-name').value.trim();
        const description = document.getElementById('project-description').value.trim();
        const category = document.getElementById('project-category').value;
        const color = document.getElementById('project-color').value;

        if (!name) {
            this.showNotification('Veuillez saisir un nom pour le projet', 'error');
            document.getElementById('project-name').focus();
            return;
        }

        // Vérifier si le nom existe déjà (en excluant le projet actuel en édition)
        const existingProject = this.projects.find(p => 
            p.name.toLowerCase() === name.toLowerCase() && p.id !== id
        );
        
        if (existingProject) {
            this.showNotification('Un projet avec ce nom existe déjà', 'error');
            return;
        }

        if (id) {
            // Édition d'un projet existant
            const projectIndex = this.projects.findIndex(p => p.id === id);
            if (projectIndex !== -1) {
                this.projects[projectIndex].name = name;
                this.projects[projectIndex].description = description;
                this.projects[projectIndex].category = category;
                this.projects[projectIndex].color = color;
                this.showNotification('Projet modifié avec succès', 'success');
            }
        } else {
            // Création d'un nouveau projet
            const newId = 'proj_' + Date.now();
            const newProject = new Project(newId, name, description, category, color);
            this.projects.push(newProject);
            this.showNotification('Projet créé avec succès', 'success');
        }

        this.saveProjects();
        this.renderProjects();
        this.closeProjectModal();
    }

    // Supprimer un projet
    deleteProject(projectId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveProjects();
            this.renderProjects();
            this.showNotification('Projet supprimé avec succès', 'success');
        }
    }

    // Afficher les projets
    renderProjects() {
        const container = document.getElementById('projects-container');
        const searchTerm = document.getElementById('project-search').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;

        // Filtrer les projets
        let filteredProjects = this.projects;
        
        if (searchTerm) {
            filteredProjects = filteredProjects.filter(project => 
                project.name.toLowerCase().includes(searchTerm) || 
                (project.description && project.description.toLowerCase().includes(searchTerm))
            );
        }
        
        if (categoryFilter !== 'all') {
            filteredProjects = filteredProjects.filter(project => 
                project.category === categoryFilter
            );
        }

        // Afficher les projets filtrés
        if (filteredProjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <ion-icon name="folder-open-outline"></ion-icon>
                    <h3>Aucun projet trouvé</h3>
                    <p>${this.projects.length === 0 ? 'Créez votre premier projet pour commencer à organiser votre travail.' : 'Aucun projet ne correspond à vos critères de recherche.'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredProjects.map(project => `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-header" style="border-left: 4px solid ${project.color}">
                    <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                    <div class="project-actions">
                        <button class="btn-icon edit-project" title="Modifier le projet">
                            <ion-icon name="create-outline"></ion-icon>
                        </button>
                        <button class="btn-icon delete-project" title="Supprimer le projet">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                    </div>
                </div>
                <div class="project-body">
                    <p class="project-description">${project.description ? this.escapeHtml(project.description) : 'Aucune description'}</p>
                    <div class="project-meta">
                        <span class="project-category ${project.category}">${this.getCategoryLabel(project.category)}</span>
                        <span class="project-date">${this.formatDate(project.createdAt)}</span>
                    </div>
                    <div class="project-stats">
                        <div class="stat">
                            <span class="stat-number">${project.tasks ? project.tasks.length : 0}</span>
                            <span class="stat-label">Tâches</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${project.tasks ? project.tasks.filter(t => t.status === 'done').length : 0}</span>
                            <span class="stat-label">Terminées</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${this.getProgress(project)}%</span>
                            <span class="stat-label">Progression</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Ajouter les événements aux boutons d'action
        this.bindProjectActions();
    }

    // Obtenir le libellé de la catégorie
    getCategoryLabel(category) {
        const labels = {
            'work': 'Travail',
            'personal': 'Personnel',
            'education': 'Éducation',
            'other': 'Autre'
        };
        return labels[category] || category;
    }

    // Calculer la progression d'un projet
    getProgress(project) {
        if (!project.tasks || project.tasks.length === 0) return 0;
        const completedTasks = project.tasks.filter(t => t.status === 'done').length;
        return Math.round((completedTasks / project.tasks.length) * 100);
    }

    // Formater la date
    formatDate(dateString) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
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

    // Lier les événements aux boutons d'action des projets
    bindProjectActions() {
        // Boutons d'édition
        document.querySelectorAll('.edit-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = btn.closest('.project-card').dataset.projectId;
                this.openProjectModal(projectId);
            });
        });

        // Boutons de suppression
        document.querySelectorAll('.delete-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = btn.closest('.project-card').dataset.projectId;
                this.deleteProject(projectId);
            });
        });

        // Clic sur une carte de projet (pour navigation future vers les détails)
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Éviter la navigation si on clique sur les boutons d'action
                if (!e.target.closest('.project-actions')) {
                    const projectId = card.dataset.projectId;
                    // Pour l'instant, on ouvre le modal d'édition
                    this.openProjectModal(projectId);
                }
            });
        });
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

// Initialiser le gestionnaire de projets quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new ProjectManager();
});