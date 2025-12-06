// Contact functionality for ProjectFlow - VERSION CORRIGÉE
class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        console.log('Initialisation du formulaire de contact...');
        this.setupEventListeners();
        this.setupFAQ();
    }

    setupEventListeners() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(contactForm);
            });
        }

        // Reset form
        const resetBtn = document.querySelector('#contactForm button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForm(contactForm);
            });
        }

        // Pré-remplir les champs si l'utilisateur est connecté
        this.prefillUserInfo();
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            if (question) {
                question.addEventListener('click', () => {
                    // Fermer tous les autres items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Basculer l'item actuel
                    item.classList.toggle('active');
                });
            }
        });
    }

    prefillUserInfo() {
        try {
            const userData = localStorage.getItem('projectFlow_currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                const nameField = document.getElementById('name');
                const emailField = document.getElementById('email');
                
                if (nameField && !nameField.value) {
                    nameField.value = user.name;
                }
                
                if (emailField && !emailField.value) {
                    emailField.value = user.email;
                }
            }
        } catch (error) {
            console.error('Erreur lors du pré-remplissage:', error);
        }
    }

    async handleFormSubmit(form) {
        try {
            // Afficher l'état de chargement
            this.setFormState(form, 'loading');

            // Récupérer les données du formulaire
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                category: formData.get('category'),
                message: formData.get('message'),
                newsletter: formData.get('newsletter') === 'on',
                timestamp: new Date().toISOString()
            };

            // Validation
            if (!this.validateForm(data)) {
                this.setFormState(form, 'error', 'Veuillez remplir tous les champs obligatoires.');
                return;
            }

            // Simuler l'envoi
            await this.simulateFormSubmission(data);

            // Afficher le succès
            this.setFormState(form, 'success', 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
            
            // Réinitialiser le formulaire après succès
            setTimeout(() => {
                this.resetForm(form);
                this.setFormState(form, 'idle');
            }, 3000);

        } catch (error) {
            console.error('Erreur lors de l\'envoi du formulaire:', error);
            this.setFormState(form, 'error', 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
        }
    }

    validateForm(data) {
        const requiredFields = ['name', 'email', 'subject', 'category', 'message'];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return false;
            }
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return false;
        }

        return true;
    }

    async simulateFormSubmission(data) {
        // Simuler un délai d'envoi
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Données du formulaire:', data);
                
                // Dans un projet réel, vous enverriez les données à un serveur
                // Exemple avec fetch :
                /*
                await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer votre-token'
                    },
                    body: JSON.stringify(data)
                });
                */
                
                // Stocker dans localStorage pour simulation
                const existingMessages = JSON.parse(localStorage.getItem('projectFlow_contactMessages')) || [];
                existingMessages.push(data);
                localStorage.setItem('projectFlow_contactMessages', JSON.stringify(existingMessages));
                
                resolve();
            }, 1500);
        });
    }

    setFormState(form, state, message = '') {
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Créer ou récupérer les éléments de notification
        let successDiv = form.querySelector('.form-success');
        let errorDiv = form.querySelector('.form-error');
        
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'form-success';
            successDiv.style.cssText = `
                background: #10b981;
                color: white;
                padding: 1rem;
                border-radius: 0.5rem;
                margin-top: 1rem;
                display: none;
            `;
            form.appendChild(successDiv);
        }
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.style.cssText = `
                background: #ef4444;
                color: white;
                padding: 1rem;
                border-radius: 0.5rem;
                margin-top: 1rem;
                display: none;
            `;
            form.appendChild(errorDiv);
        }

        // Réinitialiser les états
        form.classList.remove('loading', 'success', 'error');
        successDiv.classList.remove('show');
        errorDiv.classList.remove('show');

        switch (state) {
            case 'loading':
                form.classList.add('loading');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon><span>Envoi en cours...</span>';
                }
                break;

            case 'success':
                form.classList.add('success');
                successDiv.textContent = message;
                successDiv.style.display = 'block';
                successDiv.classList.add('show');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<ion-icon name="send-outline"></ion-icon><span>Envoyer le message</span>';
                }
                break;

            case 'error':
                form.classList.add('error');
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                errorDiv.classList.add('show');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<ion-icon name="send-outline"></ion-icon><span>Envoyer le message</span>';
                }
                break;

            case 'idle':
            default:
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<ion-icon name="send-outline"></ion-icon><span>Envoyer le message</span>';
                }
                break;
        }
    }

    resetForm(form) {
        form.reset();
        
        // Conserver les informations utilisateur si connecté
        this.prefillUserInfo();
        
        // Masquer les notifications
        const successDiv = form.querySelector('.form-success');
        const errorDiv = form.querySelector('.form-error');
        
        if (successDiv) {
            successDiv.style.display = 'none';
            successDiv.classList.remove('show');
        }
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.classList.remove('show');
        }
        
        this.setFormState(form, 'idle');
    }
}

// Initialiser le formulaire de contact quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation du formulaire de contact...');
    new ContactForm();
});