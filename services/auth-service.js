// Сервис аутентификации
class AuthService {
    constructor() {
        this.currentUser = null;
    }
    
    // Проверка состояния аутентификации
    checkAuthState() {
        return new Promise((resolve) => {
            const unsubscribe = window.firebaseServices.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                unsubscribe();
                resolve(user);
            });
        });
    }
    
    // Получение данных текущего пользователя
    async getCurrentUserData() {
        if (!this.currentUser) return null;
        
        try {
            const result = await window.firebaseService.getUserData(this.currentUser.uid);
            if (result.success) {
                return { ...this.currentUser, ...result.data };
            }
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
        }
        
        return this.currentUser;
    }
    
    // Проверка роли пользователя
    async hasRole(role) {
        const userData = await this.getCurrentUserData();
        return userData && userData.role === role;
    }
}

// Создаем экземпляр сервиса
const authService = new AuthService();
window.authService = authService;
