// Основное приложение
class SchoolCrowdsourcingApp {
    constructor() {
        this.currentFilter = 'all';
        this.projects = [];
        this.init();
    }
    
    async init() {
        // Инициализация компонентов
        this.initModals();
        
        // Загрузка проектов
        await this.loadProjects();
        
        // Проверка аутентификации
        await this.checkAuth();
        
        // Добавление обработчиков событий
        this.addEventListeners();
        
        // Сохраняем экземпляр в глобальной области видимости
        window.app = this;
    }
    
    // Инициализация модальных окон
    initModals() {
        // Регистрируем модальное окно аутентификации
        window.modalComponent.registerModal('auth-modal', (type) => {
            return this.getAuthForm(type || 'login');
        });
        
        // Регистрируем модальное окно создания проекта
        window.modalComponent.registerModal('project-modal', () => {
            return this.getProjectForm();
        });
    }
    
    // Форма аутентификации
    getAuthForm(type) {
        if (type === 'register') {
            return `
                <div class="form-container">
                    <h2>Регистрация</h2>
                    <form id="register-form">
                        <div class="form-group">
                            <label for="register-name">ФИО *</label>
                            <input type="text" id="register-name" required placeholder="Иванов Иван Иванович">
                        </div>
                        <div class="form-group">
                            <label for="register-email">Email *</label>
                            <input type="email" id="register-email" required placeholder="student@school.ru">
                        </div>
                        <div class="form-group">
                            <label for="register-password">Пароль *</label>
                            <input type="password" id="register-password" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="register-role">Роль</label>
                            <select id="register-role">
                                <option value="student">Ученик</option>
                                <option value="teacher">Учитель</option>
                                <option value="parent">Родитель</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="register-school">Школа/Класс</label>
                            <input type="text" id="register-school" placeholder="Школа №123, 10А класс">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
                            <button type="button" class="btn btn-secondary" id="google-register">
                                <i class="fab fa-google"></i> Google
                            </button>
                        </div>
                        <div class="form-switch">
                            Уже есть аккаунт? <a id="switch-to-login">Войти</a>
                        </div>
                    </form>
                </div>
            `;
        } else {
            return `
                <div class="form-container">
                    <h2>Вход в систему</h2>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" required placeholder="student@school.ru">
                        </div>
                        <div class="form-group">
                            <label for="login-password">Пароль</label>
                            <input type="password" id="login-password" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Войти</button>
                            <button type="button" class="btn btn-secondary" id="google-login">
                                <i class="fab fa-google"></i> Google
                            </button>
                        </div>
                        <div class="form-switch">
                            Нет аккаунта? <a id="switch-to-register">Зарегистрироваться</a>
                        </div>
                    </form>
                </div>
            `;
        }
    }
    
    // Форма создания проекта
    getProjectForm() {
        return `
            <div class="form-container">
                <h2>Создать новый проект</h2>
                <form id="create-project-form">
                    <div class="form-group">
                        <label for="project-title">Название проекта *</label>
                        <input type="text" id="project-title" required placeholder="Например: Школьный сад">
                    </div>
                    <div class="form-group">
                        <label for="project-category">Категория *</label>
                        <select id="project-category" required>
                            <option value="">Выберите категорию</option>
                            <option value="educational">Образование</option>
                            <option value="infrastructure">Инфраструктура</option>
                            <option value="events">Мероприятия</option>
                            <option value="eco">Экология</option>
                            <option value="technology">Технологии</option>
                            <option value="sport">Спорт</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="project-goal">Цель проекта</label>
                        <input type="text" id="project-goal" placeholder="Что вы хотите достичь?">
                    </div>
                    <div class="form-group">
                        <label for="project-description">Описание проекта *</label>
                        <textarea id="project-description" required rows="5" placeholder="Опишите ваш проект подробно..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="project-tags">Теги (через запятую)</label>
                        <input type="text" id="project-tags" placeholderсад, экология, растения">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Создать проект</button>
                        <button type="button" class="btn btn-secondary" onclick="window.modalComponent.hideModal('project-modal')">
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    // Проверка аутентификации
    async checkAuth() {
        const user = await window.authService.checkAuthState();
        this.updateAuthUI(user);
    }
    
    // Обновление UI в зависимости от состояния аутентификации
    updateAuthUI(user) {
        // Обновляем шапку
        if (window.headerComponent) {
            window.headerComponent.setUser(user);
        }
        
        // Показываем/скрываем кнопку создания проекта
        const createProjectBtn = document.getElementById('create-project-btn');
        if (createProjectBtn) {
            if (user) {
                createProjectBtn.style.display = 'block';
            } else {
                createProjectBtn.style.display = 'block';
                // Можно скрыть или оставить, но показать модальное окно при нажатии
            }
        }
    }
    
    // Загрузка проектов
    async loadProjects(filter = this.currentFilter) {
        try {
            const result = await window.firebaseService.getProjects(filter);
            
            if (result.success) {
                this.projects = result.projects;
                this.renderProjects();
            } else {
                console.error('Ошибка загрузки проектов:', result.error);
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }
    
    // Отображение проектов
    renderProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.projects.length === 0) {
            container.innerHTML = `
                <div class="no-projects">
                    <i class="fas fa-project-diagram fa-3x"></i>
                    <h3>Проектов пока нет</h3>
                    <p>Будьте первым, кто создаст проект!</p>
                </div>
            `;
            return;
        }
        
        this.projects.forEach(project => {
            const card = window.ProjectCardComponent.create(project);
            container.appendChild(card);
        });
    }
    
    // Показать модальное окно аутентификации
    showAuthModal(type = 'login') {
        window.modalComponent.showModal('auth-modal', type);
    }
    
    // Показать модальное окно создания проекта
    showProjectModal() {
        if (!window.firebaseService || !window.firebaseService.currentUser) {
            this.showAuthModal('login');
            return;
        }
        
        window.modalComponent.showModal('project-modal');
    }
    
    // Добавление обработчиков событий
    addEventListeners() {
        // Кнопка создания проекта
        const createProjectBtn = document.getElementById('create-project-btn');
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => this.showProjectModal());
        }
        
        // Кнопка исследования проектов
        const exploreBtn = document.getElementById('explore-projects-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                document.querySelector('.projects-section').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Фильтры проектов
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Убираем активный класс у всех кнопок
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Добавляем активный класс нажатой кнопке
                e.target.classList.add('active');
                
                // Загружаем проекты с выбранным фильтром
                const filter = e.target.dataset.filter;
                this.currentFilter = filter;
                this.loadProjects(filter);
            });
        });
        
        // Кнопка входа через Google
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'google-login' || e.target.id === 'google-register' || 
                e.target.closest('#google-login') || e.target.closest('#google-register')) {
                e.preventDefault();
                
                const result = await window.firebaseService.loginWithGoogle();
                if (result.success) {
                    window.modalComponent.hideModal('auth-modal');
                } else {
                    alert('Ошибка входа через Google: ' + result.error);
                }
            }
        });
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new SchoolCrowdsourcingApp();
});
