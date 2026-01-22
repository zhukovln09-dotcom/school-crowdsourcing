// Конфигурация Firebase (замените на свои данные)
const firebaseConfig = {
    apiKey: "AIzaSyDb7Tcjva31C_l0HNA4m60yKSPCwgdz8zQ",
    authDomain: "schoolcrowdsourcing.firebaseapp.com",
    projectId: "schoolcrowdsourcing",
    storageBucket: "schoolcrowdsourcing.firebasestorage.app",
    messagingSenderId: "898144804174",
    appId: "1:898144804174:web:b1994a202f92a23d8a521f"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Инициализация сервисов
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Экспорт для использования в других файлах
window.firebaseServices = { auth, db, storage };
