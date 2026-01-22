// Компонент шапки
class HeaderComponent {
    constructor() {
        this.user = null;
    }
    
    setUser(user) {
        this.user = user;
        this.render();
    }
    
    render() {
        const header = document.getElementById('main-header');
        if (!header) return;
        
        header.innerHTML = `
            <div class="container">
                <div class="header-content">
                    <a href="#" class="logo">
                        <i class="fas fa-school"></i>
                        <h1>Умная школа</h1>
                    </a>
                    
                    <nav>
                        <ul>
                            <li><a href="#" id="home-link">Главная</a></li>
                            <li><a href="#" id="projects-link">Проекты</a></li>
                            <li><a href="#" id="leaderboard-link">Рейтинг</a></li>
                            ${this.user ? `<li><a href="#" id="my-projects-link">Мои проекты</a></li>` : ''}
                            <li><a href="#" id="about-link">О платформе</a></li>
                        </ul>
                    </nav>
                    
                    <div class="auth-buttons">
                        ${this.user ? this.renderUserMenu() : this.renderAuthButtons()}
                    </div>
                </div>
            </div>
        `;
        
        this.addEventListeners();
    }
    
    renderAuthButtons() {
        return `
            <button id="login-btn" class="btn btn-secondary">Войти</button>
            <button id="register-btn" class="btn btn-primary">Регистрация</button>
        `;
    }
    
    renderUserMenu() {
        const displayName = this.user.displayName || this.user.email.split('@')[0];
        const initial = displayName.charAt(0).toUpperCase();
        
        return `
            <div class="user-menu">
                <div class="user-avatar">${initial}</div>
                <span class="user-name">${displayName}</span>
                <button id="logout-btn" class="btn btn-small btn-secondary">Выйти</button>
            </div>
        `;
    }
    
    addEventListeners() {
        // Кнопки аутентификации
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showAuthModal('login'));
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showAuthModal('register'));
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }
    
    showAuthModal(type) {
        if (window.app && window.app.showAuthModal) {
            window.app.showAuthModal(type);
        }
    }
    
    async logout() {
        if (window.firebaseService) {
            await window.firebaseService.logout();
        }
    }
}

// Инициализация компонента
const headerComponent = new HeaderComponent();
window.headerComponent = headerComponent;
