// Сервис для работы с файлами
class StorageService {
    constructor() {
        this.storage = window.firebaseServices.storage;
    }
    
    // Загрузка изображения проекта
    async uploadProjectImage(file, projectId) {
        try {
            const result = await window.firebaseService.uploadFile(file, `projects/${projectId}/images`);
            return result;
        } catch (error) {
            console.error('Ошибка загрузки изображения:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Загрузка аватара пользователя
    async uploadUserAvatar(file, userId) {
        try {
            const result = await window.firebaseService.uploadFile(file, `users/${userId}/avatar`);
            return result;
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Получение URL изображения
    async getImageUrl(path) {
        try {
            const storageRef = this.storage.ref();
            const url = await storageRef.child(path).getDownloadURL();
            return { success: true, url };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Создаем экземпляр сервиса
const storageService = new StorageService();
window.storageService = storageService;
