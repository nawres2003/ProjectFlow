// Dashboard functionality for ProjectFlow - VERSION COMPLÈTEMENT CORRIGÉE
class Dashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        console.log('Initialisation du dashboard...');
        this.loadData();
        this.setupEventListeners();
    }

    loadData() {
        console.log('Chargement des données...');
        try {
            const projects = JSON.parse(localStorage.getItem('projectFlow_projects')) || [];
            const tasks = JSON.parse(localStorage.getItem('projectFlow_tasks')) || [];
            
            console.log('Projets chargés:', projects.length);
            console.log('Tâches chargées:', tasks.length);
            
            this.updateStatistics(projects, tasks);
            this.initializeCharts();
            this.updateCharts(projects, tasks);
            this.updateLists(projects, tasks);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    updateStatistics(projects, tasks) {
        try {
            const totalProjects = projects.length;
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'done').length;
            const progressRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            document.getElementById('total-projects').textContent = totalProjects;
            document.getElementById('total-tasks').textContent = totalTasks;
            document.getElementById('completed-tasks').textContent = completedTasks;
            document.getElementById('progress-rate').textContent = `${progressRate}%`;
        } catch (error) {
            console.error('Erreur dans updateStatistics:', error);
        }
    }

    initializeCharts() {
        console.log('Initialisation des graphiques...');
        try {
            const tasksStatusCanvas = document.getElementById('tasks-status-chart');
            const tasksPriorityCanvas = document.getElementById('tasks-priority-chart');
            const tasksTimelineCanvas = document.getElementById('tasks-timeline-chart');
            const projectsCategoryCanvas = document.getElementById('projects-category-chart');
            const performanceCanvas = document.getElementById('performance-chart');

            if (tasksStatusCanvas) {
                this.charts.tasksStatus = this.createTasksStatusChart();
            }
            if (tasksPriorityCanvas) {
                this.charts.tasksPriority = this.createTasksPriorityChart();
            }
            if (tasksTimelineCanvas) {
                this.charts.tasksTimeline = this.createTasksTimelineChart();
            }
            if (projectsCategoryCanvas) {
                this.charts.projectsCategory = this.createProjectsCategoryChart();
            }
            if (performanceCanvas) {
                this.charts.performance = this.createPerformanceChart();
            }
        } catch (error) {
            console.error('Erreur dans initializeCharts:', error);
        }
    }

    createTasksStatusChart() {
        const ctx = document.getElementById('tasks-status-chart').getContext('2d');
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['À Faire', 'En Cours', 'Terminé'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    createTasksPriorityChart() {
        const ctx = document.getElementById('tasks-priority-chart').getContext('2d');
        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Haute', 'Moyenne', 'Basse'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    createTasksTimelineChart() {
        const ctx = document.getElementById('tasks-timeline-chart').getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateLast30DaysLabels(),
                datasets: [
                    {
                        label: 'Tâches Créées',
                        data: Array(30).fill(0),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    },
                    {
                        label: 'Tâches Terminées',
                        data: Array(30).fill(0),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { size: 12 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { size: 11 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }

    createProjectsCategoryChart() {
        const ctx = document.getElementById('projects-category-chart').getContext('2d');
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Travail', 'Personnel', 'Éducation', 'Autre'],
                datasets: [{
                    label: 'Nombre de Projets',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgb(139, 92, 246)',
                        'rgb(236, 72, 153)',
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { size: 11 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performance-chart').getContext('2d');
        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Productivité', 'Ponctualité', 'Qualité', 'Collaboration', 'Innovation'],
                datasets: [{
                    label: 'Performance',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: 'rgb(139, 92, 246)',
                    pointBackgroundColor: 'rgb(139, 92, 246)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(139, 92, 246)',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { display: true },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: {
                            stepSize: 20,
                            font: { size: 11 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: { font: { size: 12 } }
                    }
                }
            }
        });
    }

    updateCharts(projects, tasks) {
        console.log('Mise à jour des graphiques...');
        try {
            // Graphique statut des tâches
            if (this.charts.tasksStatus) {
                const statusCounts = {
                    'todo': tasks.filter(task => task.status === 'todo').length,
                    'in-progress': tasks.filter(task => task.status === 'in-progress').length,
                    'done': tasks.filter(task => task.status === 'done').length
                };

                this.charts.tasksStatus.data.datasets[0].data = [
                    statusCounts.todo,
                    statusCounts['in-progress'],
                    statusCounts.done
                ];
                this.charts.tasksStatus.update();
            }

            // Graphique priorité des tâches
            if (this.charts.tasksPriority) {
                const priorityCounts = {
                    'high': tasks.filter(task => task.priority === 'high').length,
                    'medium': tasks.filter(task => task.priority === 'medium').length,
                    'low': tasks.filter(task => task.priority === 'low').length
                };

                this.charts.tasksPriority.data.datasets[0].data = [
                    priorityCounts.high,
                    priorityCounts.medium,
                    priorityCounts.low
                ];
                this.charts.tasksPriority.update();
            }

            // Graphique catégories de projets
            if (this.charts.projectsCategory) {
                const categoryCounts = {
                    'work': projects.filter(project => project.category === 'work').length,
                    'personal': projects.filter(project => project.category === 'personal').length,
                    'education': projects.filter(project => project.category === 'education').length,
                    'other': projects.filter(project => project.category === 'other').length
                };

                this.charts.projectsCategory.data.datasets[0].data = [
                    categoryCounts.work,
                    categoryCounts.personal,
                    categoryCounts.education,
                    categoryCounts.other
                ];
                this.charts.projectsCategory.update();
            }

            // Graphique chronologique
            this.updateTimelineChart(tasks);

            // Graphique de performance
            if (this.charts.performance) {
                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(task => task.status === 'done').length;
                const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                
                const productivity = Math.min(100, completionRate + 20);
                const timeliness = this.calculateTimeliness(tasks);
                const quality = Math.min(100, completionRate + 15);
                const collaboration = projects.length > 0 ? Math.min(100, (projects.filter(p => p.tasks && p.tasks.length > 0).length / projects.length) * 100 + 30) : 50;
                const innovation = Math.min(100, (tasks.filter(t => t.category === 'development' || t.category === 'research').length / Math.max(1, tasks.length)) * 100 + 10);

                this.charts.performance.data.datasets[0].data = [
                    productivity,
                    timeliness,
                    quality,
                    collaboration,
                    innovation
                ];
                this.charts.performance.update();
            }

        } catch (error) {
            console.error('Erreur dans updateCharts:', error);
        }
    }

    updateTimelineChart(tasks) {
        try {
            if (!this.charts.tasksTimeline) return;

            const days = 30;
            const dates = this.generateLast30DaysLabels();
            const createdData = Array(days).fill(0);
            const completedData = Array(days).fill(0);

            tasks.forEach(task => {
                const createdDate = new Date(task.createdAt);
                const createdDayIndex = this.getDaysAgo(createdDate);
                
                if (createdDayIndex >= 0 && createdDayIndex < days) {
                    createdData[createdDayIndex]++;
                }

                if (task.status === 'done' && task.updatedAt) {
                    const completedDate = new Date(task.updatedAt);
                    const completedDayIndex = this.getDaysAgo(completedDate);
                    
                    if (completedDayIndex >= 0 && completedDayIndex < days) {
                        completedData[completedDayIndex]++;
                    }
                }
            });

            this.charts.tasksTimeline.data.labels = dates;
            this.charts.tasksTimeline.data.datasets[0].data = createdData;
            this.charts.tasksTimeline.data.datasets[1].data = completedData;
            this.charts.tasksTimeline.update();
        } catch (error) {
            console.error('Erreur dans updateTimelineChart:', error);
        }
    }

    updateLists(projects, tasks) {
        console.log('Mise à jour des listes...');
        try {
            this.updateRecentProjects(projects);
            this.updateUpcomingTasks(tasks);
            this.updateHighPriorityTasks(tasks);
        } catch (error) {
            console.error('Erreur dans updateLists:', error);
        }
    }

    updateRecentProjects(projects) {
        const container = document.getElementById('recent-projects-list');
        if (!container) return;

        const recentProjects = projects
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);

        if (recentProjects.length === 0) {
            container.innerHTML = `
                <div class="empty-list">
                    <ion-icon name="folder-open-outline"></ion-icon>
                    <p>Aucun projet trouvé</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentProjects.map(project => `
            <div class="list-item">
                <div class="item-info">
                    <h4 class="item-title">${this.escapeHtml(project.name)}</h4>
                    <div class="item-meta">
                        <span class="project-category ${project.category}">${this.getProjectCategoryLabel(project.category)}</span>
                        <span class="item-date">${this.formatDate(project.createdAt)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateUpcomingTasks(tasks) {
        const container = document.getElementById('upcoming-tasks-list');
        if (!container) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingTasks = tasks
            .filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate >= today && task.status !== 'done';
            })
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        if (upcomingTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-list">
                    <ion-icon name="calendar-outline"></ion-icon>
                    <p>Aucune échéance proche</p>
                </div>
            `;
            return;
        }

        container.innerHTML = upcomingTasks.map(task => `
            <div class="list-item">
                <div class="item-info">
                    <h4 class="item-title">${this.escapeHtml(task.title)}</h4>
                    <div class="item-meta">
                        <span class="item-status ${task.status}">${this.getTaskStatusLabel(task.status)}</span>
                        <span class="item-date ${this.isDueToday(task.dueDate) ? 'today' : ''}">
                            ${this.formatDate(task.dueDate)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateHighPriorityTasks(tasks) {
        const container = document.getElementById('high-priority-tasks-list');
        if (!container) return;

        const highPriorityTasks = tasks
            .filter(task => task.priority === 'high' && task.status !== 'done')
            .sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'))
            .slice(0, 5);

        if (highPriorityTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-list">
                    <ion-icon name="warning-outline"></ion-icon>
                    <p>Aucune tâche importante</p>
                </div>
            `;
            return;
        }

        container.innerHTML = highPriorityTasks.map(task => `
            <div class="list-item">
                <div class="item-info">
                    <h4 class="item-title">${this.escapeHtml(task.title)}</h4>
                    <div class="item-meta">
                        <span class="item-status ${task.status}">${this.getTaskStatusLabel(task.status)}</span>
                        <span class="item-date">${task.dueDate ? this.formatDate(task.dueDate) : 'Sans date'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Méthodes utilitaires
    generateLast30DaysLabels() {
        const labels = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(this.formatDateShort(date));
        }
        return labels;
    }

    getDaysAgo(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const diffTime = today - targetDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return 29 - diffDays;
    }

    calculateTimeliness(tasks) {
        const tasksWithDueDate = tasks.filter(task => task.dueDate);
        if (tasksWithDueDate.length === 0) return 50;
        
        const onTimeTasks = tasksWithDueDate.filter(task => {
            if (task.status !== 'done') return true;
            const dueDate = new Date(task.dueDate);
            const completedDate = new Date(task.updatedAt || task.createdAt);
            return completedDate <= dueDate;
        }).length;
        
        return Math.min(100, (onTimeTasks / tasksWithDueDate.length) * 100);
    }

    formatDate(dateString) {
        if (!dateString) return 'Non définie';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Date invalide';
        }
    }

    formatDateShort(date) {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit'
        });
    }

    getTaskStatusLabel(status) {
        const statusMap = {
            'todo': 'À Faire',
            'in-progress': 'En Cours',
            'done': 'Terminé'
        };
        return statusMap[status] || 'À Faire';
    }

    getProjectCategoryLabel(category) {
        const categoryMap = {
            'work': 'Travail',
            'personal': 'Personnel',
            'education': 'Éducation',
            'other': 'Autre'
        };
        return categoryMap[category] || category;
    }

    isDueToday(dueDate) {
        if (!dueDate) return false;
        try {
            const today = new Date().toDateString();
            const due = new Date(dueDate).toDateString();
            return today === due;
        } catch (error) {
            return false;
        }
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    setupEventListeners() {
        try {
            const refreshBtn = document.getElementById('refresh-stats');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.loadData();
                    this.showNotification('Statistiques actualisées !');
                });
            }

            const exportBtn = document.getElementById('export-data');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportData();
                });
            }

            const timeRange = document.getElementById('time-range');
            if (timeRange) {
                timeRange.addEventListener('change', (e) => {
                    this.loadData();
                });
            }
        } catch (error) {
            console.error('Erreur dans setupEventListeners:', error);
        }
    }

    async exportData() {
        try {
            const projects = JSON.parse(localStorage.getItem('projectFlow_projects')) || [];
            const tasks = JSON.parse(localStorage.getItem('projectFlow_tasks')) || [];
            
            // Afficher un message de chargement
            this.showNotification('Génération du PDF en cours...', 'info');
            
            // Charger les bibliothèques
            await this.loadJsPDF();
            await this.loadHtml2Canvas();
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Configuration
            doc.setFont('helvetica');
            doc.setFontSize(20);
            doc.setTextColor(59, 130, 246);
            doc.text('Rapport ProjectFlow', 20, 30);

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Export du : ${new Date().toLocaleDateString('fr-FR')}`, 20, 45);

            let yPosition = 65;

            // Statistiques
            doc.setFontSize(16);
            doc.setTextColor(59, 130, 246);
            doc.text('Statistiques Générales', 20, yPosition);
            yPosition += 15;

            const totalProjects = projects.length;
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'done').length;
            const progressRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`• Total des projets: ${totalProjects}`, 25, yPosition);
            yPosition += 8;
            doc.text(`• Total des tâches: ${totalTasks}`, 25, yPosition);
            yPosition += 8;
            doc.text(`• Tâches terminées: ${completedTasks}`, 25, yPosition);
            yPosition += 8;
            doc.text(`• Taux d'avancement: ${progressRate}%`, 25, yPosition);
            yPosition += 20;

            // Graphiques
            const chartIds = [
                { id: 'tasks-status-chart', title: 'Statut des Tâches' },
                { id: 'tasks-priority-chart', title: 'Priorité des Tâches' },
                { id: 'tasks-timeline-chart', title: 'Chronologie des Tâches' },
                { id: 'projects-category-chart', title: 'Catégories de Projets' },
                { id: 'performance-chart', title: 'Performance' }
            ];

            for (const chart of chartIds) {
                yPosition = await this.addChartToPDF(doc, chart.id, chart.title, yPosition);
                
                // Pause entre chaque capture pour éviter les erreurs
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Projets récents
            if (projects.length > 0) {
                if (yPosition > 150) {
                    doc.addPage();
                    yPosition = 30;
                }

                doc.setFontSize(16);
                doc.setTextColor(59, 130, 246);
                doc.text('Projets Récents', 20, yPosition);
                yPosition += 15;

                const recentProjects = projects
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                    .slice(0, 10);

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                recentProjects.forEach((project) => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 30;
                    }

                    doc.text(`• ${this.escapeHtml(project.name)}`, 25, yPosition);
                    yPosition += 6;
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`  Catégorie: ${this.getProjectCategoryLabel(project.category)} | Créé le: ${this.formatDate(project.createdAt)}`, 25, yPosition);
                    yPosition += 8;
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                });
                yPosition += 10;
            }

            // Tâches importantes
            if (tasks.length > 0) {
                if (yPosition > 150) {
                    doc.addPage();
                    yPosition = 30;
                }

                doc.setFontSize(16);
                doc.setTextColor(59, 130, 246);
                doc.text('Tâches Importantes', 20, yPosition);
                yPosition += 15;

                const highPriorityTasks = tasks
                    .filter(task => task.priority === 'high')
                    .slice(0, 10);

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                highPriorityTasks.forEach((task) => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 30;
                    }

                    doc.text(`• ${this.escapeHtml(task.title)}`, 25, yPosition);
                    yPosition += 6;
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`  Statut: ${this.getTaskStatusLabel(task.status)} | Priorité: Haute | Échéance: ${task.dueDate ? this.formatDate(task.dueDate) : 'Non définie'}`, 25, yPosition);
                    yPosition += 8;
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                });
            }

            // Pied de page
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} sur ${pageCount} - Généré par ProjectFlow`, 105, 285, { align: 'center' });
            }

            // Télécharger
            doc.save(`projectflow-rapport-${new Date().toISOString().split('T')[0]}.pdf`);

            this.showNotification('Rapport PDF exporté avec succès !');
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            this.showNotification('Erreur lors de l\'export PDF', 'error');
        }
    }

    async addChartToPDF(doc, chartId, title, yPosition) {
        try {
            const canvas = document.getElementById(chartId);
            if (!canvas) {
                console.warn(`Canvas ${chartId} non trouvé`);
                return yPosition;
            }

            // Nouvelle page si nécessaire
            if (yPosition > 120) {
                doc.addPage();
                yPosition = 30;
            }

            // Titre
            doc.setFontSize(14);
            doc.setTextColor(59, 130, 246);
            doc.text(title, 20, yPosition);
            yPosition += 10;

            // Capturer le canvas
            const chartImage = await html2canvas(canvas, {
                scale: 1.5,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = chartImage.toDataURL('image/jpeg', 0.9);
            
            // Dimensions
            const imgWidth = 170;
            const imgHeight = (chartImage.height * imgWidth) / chartImage.width;
            
            // Ajouter l'image
            doc.addImage(imgData, 'JPEG', 20, yPosition, imgWidth, imgHeight);
            
            return yPosition + imgHeight + 15;
        } catch (error) {
            console.error(`Erreur avec le graphique ${chartId}:`, error);
            return yPosition;
        }
    }

    async loadJsPDF() {
        return new Promise((resolve, reject) => {
            if (window.jspdf) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Erreur de chargement de jsPDF'));
            document.head.appendChild(script);
        });
    }

    async loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (window.html2canvas) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Erreur de chargement de html2canvas'));
            document.head.appendChild(script);
        });
    }

    showNotification(message, type = 'success') {
        try {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => toast.style.transform = 'translateX(0)', 100);

            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        } catch (error) {
            console.error('Erreur dans showNotification:', error);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation du dashboard...');
    new Dashboard();
});

// Gestion des erreurs
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
});