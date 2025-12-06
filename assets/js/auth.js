// auth.js - Gestion de l'authentification pour ProjectFlow - VERSION CORRIGÉE

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.currentUser = this.getCurrentUser();
        this.updateUI();
    }

    // Enregistrer un nouvel utilisateur
    register(name, email, password) {
        try {
            // Récupérer les utilisateurs existants
            const users = JSON.parse(localStorage.getItem('projectFlow_users')) || [];
            
            // Vérifier si l'email existe déjà
            if (users.some(user => user.email === email)) {
                throw new Error('Cet email est déjà utilisé.');
            }

            // Créer un nouvel utilisateur
            const newUser = {
                id: 'user_' + Date.now(),
                name: name,
                email: email,
                password: password,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            // Ajouter à la liste des utilisateurs
            users.push(newUser);
            localStorage.setItem('projectFlow_users', JSON.stringify(users));

            // Connecter automatiquement l'utilisateur
            this.login(email, password);
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            throw error;
        }
    }

    // Connecter un utilisateur
    login(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('projectFlow_users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Email ou mot de passe incorrect.');
            }

            // Mettre à jour la dernière connexion
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('projectFlow_users', JSON.stringify(users));

            // Stocker l'utilisateur courant
            localStorage.setItem('projectFlow_currentUser', JSON.stringify(user));
            this.currentUser = user;
            
            this.updateUI();
            this.showNotification('Connexion réussie !', 'success');
            
            // Rediriger vers la page des projets
            setTimeout(() => {
                window.location.href = 'projets.html';
            }, 1000);
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            throw error;
        }
    }

    // Déconnecter l'utilisateur
    logout() {
        localStorage.removeItem('projectFlow_currentUser');
        this.currentUser = null;
        this.updateUI();
        this.showNotification('Déconnexion réussie.', 'info');
        
        // Rediriger vers la page d'accueil
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Récupérer l'utilisateur courant
    getCurrentUser() {
        const userData = localStorage.getItem('projectFlow_currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    // Vérifier si un utilisateur est connecté
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Mettre à jour l'interface utilisateur
    updateUI() {
        const userLinks = document.getElementById('user-links');
        const userMenu = document.getElementById('user-menu');
        const welcomeMessage = document.getElementById('welcome-message');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');
        
        // Version mobile
        const userLinksMobile = document.getElementById('user-links-mobile');
        const userMenuMobile = document.getElementById('user-menu-mobile');
        const userNameMobile = document.getElementById('user-name-mobile');
        const userEmailMobile = document.getElementById('user-email-mobile');
        const userAvatarMobile = document.getElementById('user-avatar-mobile');
        
        if (this.isLoggedIn()) {
            // Version desktop
            if (userLinks) userLinks.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            
            // Version mobile
            if (userLinksMobile) userLinksMobile.style.display = 'none';
            if (userMenuMobile) userMenuMobile.style.display = 'block';
            
            // Mettre à jour les informations utilisateur
            if (welcomeMessage) {
                welcomeMessage.textContent = this.currentUser.name.split(' ')[0];
            }
            if (userName) {
                userName.textContent = this.currentUser.name;
            }
            if (userEmail) {
                userEmail.textContent = this.currentUser.email;
            }
            if (userAvatar) {
                userAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
            }
            
            // Version mobile
            if (userNameMobile) {
                userNameMobile.textContent = this.currentUser.name;
            }
            if (userEmailMobile) {
                userEmailMobile.textContent = this.currentUser.email;
            }
            if (userAvatarMobile) {
                userAvatarMobile.textContent = this.currentUser.name.charAt(0).toUpperCase();
            }
            
            this.updateActionButtons(true);
        } else {
            // Version desktop
            if (userLinks) {
                userLinks.style.display = 'flex';
                userLinks.style.alignItems = 'center';
                userLinks.style.gap = '1rem';
            }
            if (userMenu) userMenu.style.display = 'none';
            
            // Version mobile
            if (userLinksMobile) userLinksMobile.style.display = 'block';
            if (userMenuMobile) userMenuMobile.style.display = 'none';
            
            this.updateActionButtons(false);
        }
    }

    // Mettre à jour les boutons d'action
    updateActionButtons(isLoggedIn) {
        const startBtn = document.getElementById('start-btn');
        
        if (startBtn) {
            if (isLoggedIn) {
                startBtn.href = 'projets.html';
                const span = startBtn.querySelector('span');
                if (span) {
                    span.textContent = 'Accéder aux projets';
                }
            } else {
                startBtn.href = 'login.html';
                const span = startBtn.querySelector('span');
                if (span) {
                    span.textContent = 'Commencer maintenant';
                }
            }
        }
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

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

        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialiser l'authentification
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager = new AuthManager();
    });
}