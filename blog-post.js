// ============ СТРАНИЦА СТАТЬИ БЛОГА ============

// Получение slug из URL
function getSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

// Форматирование просмотров
function formatViews(views) {
    if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'k';
    }
    return views;
}

// Загрузка и отображение статьи
function loadPost() {
    const slug = getSlugFromURL();

    if (!slug) {
        console.error('Slug не найден в URL');
        showError('Статья не найдена');
        return;
    }

    console.log('🔍 Загружаю статью:', slug);

    // Получаем данные из blog.js
    if (typeof window.blogData === 'undefined') {
        console.error('blogData не загружен');
        showError('Ошибка загрузки данных');
        return;
    }

    const post = window.blogData.getPostBySlug(slug);

    if (!post) {
        console.error('Пост не найден:', slug);
        showError('Статья не найдена');
        return;
    }

    console.log('✅ Статья найдена:', post.title);

    // Отображаем статью
    displayPost(post);

    // Загружаем похожие статьи
    loadRelatedPosts(slug, post.category);

    // Генерируем содержание
    generateTableOfContents();

    // Загружаем навигацию
    loadPostNavigation(slug);
}

// Отображение статьи
function displayPost(post) {
    const categoryName = window.blogData.categories[post.category];

    // Устанавливаем title страницы
    document.title = post.title + ' - Блог Доби-Дори 🦝';
    document.getElementById('pageTitle').textContent = post.title;

    // Breadcrumb
    document.getElementById('breadcrumbTitle').textContent = post.title;

    // Категория
    const categoryBadge = document.getElementById('postCategory');
    categoryBadge.textContent = categoryName;
    categoryBadge.className = 'post-category-badge ' + post.category;

    // Заголовок
    document.getElementById('postTitle').textContent = post.title;

    // Мета-информация
    document.getElementById('postDate').textContent = formatDate(post.date);
    document.getElementById('postReadTime').textContent = post.readTime;
    document.getElementById('postViews').textContent = formatViews(post.views);

    // Изображение
    const postImage = document.getElementById('postImage');
    postImage.src = post.image;
    postImage.alt = post.title;

    // Контент
    const contentDiv = document.getElementById('postContent');
    contentDiv.innerHTML = post.fullContent || generateDefaultContent(post);

    // Теги
    if (post.tags && post.tags.length > 0) {
        const tagsDiv = document.getElementById('postTags');
        tagsDiv.innerHTML = post.tags.map(tag => 
            `<a href="#" class="post-tag">#${tag}</a>`
        ).join('');
    }

    // Скрываем загрузку, показываем контент
    document.getElementById('postLoading').style.display = 'none';
    document.getElementById('postContainer').style.display = 'block';
}

// Генерация контента по умолчанию (если fullContent не задан)
function generateDefaultContent(post) {
    return `
        <p>${post.excerpt}</p>
        <p>История продолжается...</p>
    `;
}

// Похожие статьи
function loadRelatedPosts(currentSlug, category) {
    const relatedPosts = window.blogData.getRelatedPosts(currentSlug, category, 3);
    const container = document.getElementById('relatedPosts');

    if (relatedPosts.length === 0) {
        container.innerHTML = '<p style="color: var(--gray); text-align: center;">Пока нет похожих статей</p>';
        return;
    }

    container.innerHTML = relatedPosts.map(post => `
        <a href="blog-post.html?slug=${post.slug}" class="related-post">
            <img src="${post.image}" alt="${post.title}" class="related-post-thumb">
            <div class="related-post-info">
                <h4>${post.title}</h4>
                <div class="meta">
                    <span>${post.readTime} мин</span>
                </div>
            </div>
        </a>
    `).join('');
}

// Генерация содержания из заголовков
function generateTableOfContents() {
    const content = document.getElementById('postContent');
    const headings = content.querySelectorAll('h2, h3');
    const tocContainer = document.getElementById('tableOfContents');

    if (headings.length === 0) {
        tocContainer.innerHTML = '<p style="color: var(--gray); font-size: 0.9rem;">Нет разделов</p>';
        return;
    }

    const toc = Array.from(headings).map((heading, index) => {
        const id = `section-${index}`;
        heading.id = id;

        const level = heading.tagName === 'H2' ? '' : 'toc-link-sub';

        return `<a href="#${id}" class="toc-link ${level}">${heading.textContent}</a>`;
    }).join('');

    tocContainer.innerHTML = toc;

    // Добавляем smooth scroll
    document.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Навигация между статьями (предыдущая/следующая)
function loadPostNavigation(currentSlug) {
    const allPosts = window.blogData.posts;
    const currentIndex = allPosts.findIndex(p => p.slug === currentSlug);

    if (currentIndex === -1) return;

    const prevPost = allPosts[currentIndex + 1];
    const nextPost = allPosts[currentIndex - 1];

    const navContainer = document.getElementById('postNavigation');

    let navHTML = '';

    if (prevPost) {
        navHTML += `
            <a href="blog-post.html?slug=${prevPost.slug}" class="nav-post">
                <div class="nav-post-label">← Предыдущая статья</div>
                <div class="nav-post-title">${prevPost.title}</div>
            </a>
        `;
    } else {
        navHTML += '<div></div>';
    }

    if (nextPost) {
        navHTML += `
            <a href="blog-post.html?slug=${nextPost.slug}" class="nav-post" style="text-align: right;">
                <div class="nav-post-label">Следующая статья →</div>
                <div class="nav-post-title">${nextPost.title}</div>
            </a>
        `;
    }

    navContainer.innerHTML = navHTML;
}

// Показать ошибку
function showError(message) {
    const loading = document.getElementById('postLoading');
    loading.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: var(--accent-red);"></i>
        <p>${message}</p>
        <a href="blog.html" class="btn btn-primary" style="margin-top: 1rem;">Вернуться в блог</a>
    `;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦝 Загрузка страницы статьи...');

    // Небольшая задержка для красоты
    setTimeout(() => {
        loadPost();
    }, 300);
});
