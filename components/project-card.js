// Компонент карточки проекта
class ProjectCardComponent {
    static create(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.id = project.id;
        card.dataset.category = project.category;
        
        // Форматируем дату
        const date = project.createdAt?.toDate ? project.createdAt.toDate() : new Date();
        const formattedDate = date.toLocaleDateString('ru-RU');
        
        // Форматируем описание
        const shortDescription = project.description.length > 150 
            ? project.description.substring(0, 150) + '...' 
            : project.description;
        
        // Получаем первую букву имени автора
        const authorInitial = project.authorName ? project.authorName.charAt(0).toUpperCase() : 'А';
        
        // Считаем количество участников
        const memberCount = project.members ? project.members.length : 1;
        
        card.innerHTML = `
            <div class="project-image">
                <i class="fas fa-project-diagram fa-3x"></i>
            </div>
            <div class="project-content">
                <span class="project-category">${this.getCategoryName(project.category)}</span>
                <h3>${project.title}</h3>
                <p class="project-description">${shortDescription}</p>
                
                <div class="project-meta">
                    <div class="project-author">
                        <div class="author-avatar">${authorInitial}</div>
                        <span>${project.authorName}</span>
                    </div>
                    <div class="project-stats">
                        <span><i class="fas fa-users"></i> ${memberCount}</span>
                        <span><i class="fas fa-heart"></i> ${project.likes ? project.likes.length : 0}</span>
                        <span><i class="fas fa-comment"></i> ${project.comments ? project.comments.length : 0}</span>
                    </div>
                </div>
                
                <div class="project-actions">
                    <button class="btn btn-primary btn-small view-project">Подробнее</button>
                    ${window.firebaseService && window.firebaseService.currentUser 
                        ? `<button class="btn btn-secondary btn-small like-project">
                            <i class="fas fa-heart"></i> Нравится
                          </button>`
                        : ''
                    }
                </div>
            </div>
        `;
        
        // Добавляем обработчики событий
        const viewBtn = card.querySelector('.view-project');
        const likeBtn = card.querySelector('.like-project');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', () => this.viewProject(project.id));
        }
        
        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.likeProject(project.id, card);
            });
        }
        
        return card;
    }
    
    static getCategoryName(category) {
        const categories = {
            'educational': 'Образование',
            'infrastructure': 'Инфраструктура',
            'events': 'Мероприятия',
            'eco': 'Экология',
            'technology': 'Технологии',
            'sport': 'Спорт'
        };
        
        return categories[category] || category;
    }
    
    static viewProject(projectId) {
        // В будущем можно сделать детальную страницу проекта
        alert(`Просмотр проекта ${projectId}. Эта функция будет реализована позже.`);
    }
    
    static async likeProject(projectId, cardElement) {
        if (!window.firebaseService || !window.firebaseService.currentUser) {
            alert('Чтобы ставить лайки, нужно войти в систему');
            return;
        }
        
        try {
            const result = await window.firebaseService.likeProject(projectId);
            
            if (result.success) {
                // Обновляем счетчик лайков на карточке
                const likesCount = cardElement.querySelector('.project-stats span:nth-child(2)');
                if (likesCount) {
                    const icon = likesCount.querySelector('i');
                    const count = result.likes.length;
                    likesCount.innerHTML = `${icon.outerHTML} ${count}`;
                }
                
                // Добавляем/убираем анимацию
                const likeBtn = cardElement.querySelector('.like-project i');
                likeBtn.classList.toggle('fas');
                likeBtn.classList.toggle('far');
            } else {
                alert('Ошибка: ' + result.error);
            }
        } catch (error) {
            console.error('Ошибка при лайке:', error);
        }
    }
}

// Экспорт компонента
window.ProjectCardComponent = ProjectCardComponent;
