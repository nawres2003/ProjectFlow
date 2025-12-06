'use strict';

/**
 * navbar toggle
 */

const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const overlay = document.querySelector("[data-overlay]");

const elemArr = [navCloseBtn, overlay, navOpenBtn];

for (let i = 0; i < elemArr.length; i++) {
  elemArr[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
  });
}

/**
 * toggle navbar & overlay when click any navbar-link
 */

const navbarLinks = document.querySelectorAll("[data-navbar-link]");

for (let i = 0; i < navbarLinks.length; i++) {
  navbarLinks[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
  });
}

/**
 * header & go-top-btn active
 * when window scroll down to 400px
 */

const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 400) {
    header.classList.add("active");
    goTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    goTopBtn.classList.remove("active");
  }
});

/**
 * Authentification et gestion utilisateur
 */

// Initialiser l'authentification
let authManager = null;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser authManager s'il existe
  if (typeof AuthManager !== 'undefined') {
    authManager = new AuthManager();
  } else {
    // Charger auth.js si nécessaire
    const authScript = document.createElement('script');
    authScript.src = './assets/js/auth.js';
    authScript.onload = function() {
      authManager = new AuthManager();
      setupAuthEventListeners();
    };
    document.head.appendChild(authScript);
  }
  
  // Configurer les écouteurs d'événements pour l'authentification
  setupAuthEventListeners();
});

// Configurer les écouteurs d'événements pour l'authentification
function setupAuthEventListeners() {
  // Gestion de la déconnexion desktop
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (authManager) {
        authManager.logout();
      }
    });
  }
  
  // Gestion de la déconnexion mobile
  const logoutBtnMobile = document.getElementById('logout-btn-mobile');
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', function(e) {
      e.preventDefault();
      if (authManager) {
        authManager.logout();
      }
    });
  }
  
  // Toggle dropdown utilisateur
  const dropdownBtn = document.querySelector('.user-dropdown-btn');
  if (dropdownBtn) {
    dropdownBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdownContent = this.nextElementSibling;
      if (dropdownContent) {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
      }
    });
  }
  
  // Fermer le dropdown quand on clique ailleurs
  document.addEventListener('click', function(event) {
    const dropdownContent = document.querySelector('.user-dropdown-content');
    const dropdownBtn = document.querySelector('.user-dropdown-btn');
    
    if (dropdownContent && dropdownBtn && !dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
      dropdownContent.style.display = 'none';
    }
  });
}

// Vérifier l'accès aux pages protégées
function checkProtectedAccess() {
  // Pages qui nécessitent une connexion
  const protectedPages = ['projets.html', 'tasks.html', 'dashboard.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (protectedPages.includes(currentPage)) {
    // Vérifier si l'utilisateur est connecté
    const userData = localStorage.getItem('projectFlow_currentUser');
    if (!userData) {
      // Rediriger vers la page de connexion
      window.location.href = 'login.html';
    }
  }
}

// Exécuter la vérification d'accès au chargement de la page
window.addEventListener('load', checkProtectedAccess);