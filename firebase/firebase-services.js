// Сервисы Firebase для использования во всем приложении
class FirebaseService {
    constructor() {
        this.auth = window.firebaseServices.auth;
        this.db = window.firebaseServices.db;
        this.storage = window.firebaseServices.storage;
        this.currentUser = null;
        
        // Слушатель изменений состояния аутентификации
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.onAuthStateChanged(user);
        });
    }
    
    // Коллбек при изменении состояния аутентификации
    onAuthStateChanged(user) {
        // Будет переопределен в основном скрипте
        if (window.app && window.app.updateAuthUI) {
            window.app.updateAuthUI(user);
        }
    }
    
    // Регистрация с email и паролем
    async register(email, password, userData) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Сохраняем дополнительные данные пользователя в Firestore
            await this.db.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: userData.displayName,
                role: userData.role || 'student',
                school: userData.school || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Обновляем отображаемое имя в Firebase Auth
            await user.updateProfile({
                displayName: userData.displayName
            });
            
            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Вход с email и паролем
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Вход через Google
    async loginWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await this.auth.signInWithPopup(provider);
            
            // Проверяем, есть ли пользователь в Firestore
            const userDoc = await this.db.collection('users').doc(userCredential.user.uid).get();
            
            if (!userDoc.exists) {
                // Создаем запись о пользователе
                await this.db.collection('users').doc(userCredential.user.uid).set({
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    role: 'student',
                    school: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Выход
    async logout() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Получение данных пользователя
    async getUserData(uid) {
        try {
            const userDoc = await this.db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                return { success: true, data: userDoc.data() };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Создание проекта
    async createProject(projectData) {
        try {
            // Проверяем, авторизован ли пользователь
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            
            // Добавляем метаданные
            const projectWithMeta = {
                ...projectData,
                authorId: this.currentUser.uid,
                authorName: this.currentUser.displayName || 'Аноним',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active',
                members: [this.currentUser.uid],
                likes: [],
                comments: []
            };
            
            // Сохраняем проект в Firestore
            const projectRef = await this.db.collection('projects').add(projectWithMeta);
            
            return { success: true, projectId: projectRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Получение всех проектов
    async getProjects(filter = 'all') {
        try {
            let query = this.db.collection('projects').orderBy('createdAt', 'desc');
            
            // Применяем фильтр, если он не 'all'
            if (filter !== 'all') {
                query = query.where('category', '==', filter);
            }
            
            const snapshot = await query.get();
            const projects = [];
            
            snapshot.forEach(doc => {
                projects.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return { success: true, projects };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Получение проекта по ID
    async getProjectById(projectId) {
        try {
            const projectDoc = await this.db.collection('projects').doc(projectId).get();
            
            if (projectDoc.exists) {
                return { success: true, project: { id: projectDoc.id, ...projectDoc.data() } };
            } else {
                return { success: false, error: 'Project not found' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Обновление проекта
    async updateProject(projectId, updates) {
        try {
            await this.db.collection('projects').doc(projectId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Лайк проекта
    async likeProject(projectId) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            
            const projectDoc = await this.db.collection('projects').doc(projectId).get();
            const project = projectDoc.data();
            const likes = project.likes || [];
            
            const userIndex = likes.indexOf(this.currentUser.uid);
            
            if (userIndex === -1) {
                // Добавляем лайк
                likes.push(this.currentUser.uid);
            } else {
                // Убираем лайк
                likes.splice(userIndex, 1);
            }
            
            await this.db.collection('projects').doc(projectId).update({
                likes: likes
            });
            
            return { success: true, likes };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Добавление комментария
    async addComment(projectId, text) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            
            const comment = {
                id: Date.now().toString(),
                authorId: this.currentUser.uid,
                authorName: this.currentUser.displayName || 'Аноним',
                text: text,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await this.db.collection('projects').doc(projectId).update({
                comments: firebase.firestore.FieldValue.arrayUnion(comment)
            });
            
            return { success: true, comment };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Загрузка файла
    async uploadFile(file, path) {
        try {
            const storageRef = this.storage.ref();
            const fileRef = storageRef.child(`${path}/${Date.now()}_${file.name}`);
            const uploadTask = await fileRef.put(file);
            const downloadURL = await uploadTask.ref.getDownloadURL();
            
            return { success: true, url: downloadURL };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Создаем экземпляр сервиса
const firebaseService = new FirebaseService();
window.firebaseService = firebaseService;
