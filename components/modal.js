// Компонент модальных окон
class ModalComponent {
    constructor() {
        this.modals = {};
        this.init();
    }
    
    init() {
        // Создаем слушатель для закрытия модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }
    
    registerModal(modalId, contentFunction) {
        this.modals[modalId] = {
            element: document.getElementById(modalId),
            contentFunction: contentFunction
        };
        
        // Добавляем обработчик закрытия
        const closeBtn = this.modals[modalId].element.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal(modalId));
        }
    }
    
    showModal(modalId, data = null) {
        const modal = this.modals[modalId];
        if (!modal) return;
        
        // Обновляем контент, если есть функция
        if (modal.contentFunction) {
            const contentContainer = modal.element.querySelector('.modal-content > div');
            if (contentContainer) {
                contentContainer.innerHTML = modal.contentFunction(data);
            }
        }
        
        modal.element.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Добавляем обработчики для форм внутри модального окна
        this.addFormHandlers(modalId);
    }
    
    hideModal(modalId) {
        const modal = this.modals[modalId];
        if (!modal) return;
        
        modal.element.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    hideAllModals() {
        Object.keys(this.modals).forEach(modalId => {
            this.hideModal(modalId);
        });
    }
    
    addFormHandlers(modalId) {
        // Обработчик для формы регистрации
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister();
            });
        }
        
        // Обработчик для формы входа
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
        
        // Обработчик для формы создания проекта
        const projectForm = document.getElementById('create-project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleCreateProject();
            });
        }
        
        // Переключение между формами регистрации и входа
        const switchToLogin = document.getElementById('switch-to-login');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                this.showModal('auth-modal', 'login');
            });
        }
        
        const switchToRegister = document.getElementById('switch-to-register');
        if (switchToRegister) {
            switchToRegister.addEventListener('click', () => {
                this.showModal('auth-modal', 'register');
            });
        }
    }
    
    async handleRegister() {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const displayName = document.getElementById('register-name').value;
        const role = document.getElementById('register-role').value;
        const school = document.getElementById('register-school').value;
        
        if (!email || !password || !displayName) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        const result = await window.firebaseService.register(email, password, {
            displayName,
            role,
            school
        });
        
        if (result.success) {
            alert('Регистрация успешна!');
            this.hideModal('auth-modal');
        } else {
            alert('Ошибка регистрации: ' + result.error);
        }
    }
    
    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            alert('Пожалуйста, введите email и пароль');
            return;
        }
        
        const result = await window.firebaseService.login(email, password);
        
        if (result.success) {
            this.hideModal('auth-modal');
        } else {
            alert('Ошибка входа: ' + result.error);
        }
    }
    
    async handleCreateProject() {
        const title = document.getElementById('project-title').value;
        const description = document.getElementById('project-description').value;
        const category = document.getElementById('project-category').value;
        const goal = document.getElementById('project-goal').value;
        
        if (!title || !description || !category) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        const result = await window.firebaseService.createProject({
            title,
            description,
            category,
            goal,
            tags: []
        });
        
        if (result.success) {
            alert('Проект успешно создан!');
            this.hideModal('project-modal');
            
            // Обновляем список проектов
            if (window.app && window.app.loadProjects) {
                window.app.loadProjects();
            }
        } else {
            alert('Ошибка создания проекта: ' + result.error);
        }
    }
}

// Создаем экземпляр компонента
const modalComponent = new ModalComponent();
window.modalComponent = modalComponent;
