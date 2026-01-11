// ============ БЛОГ ДОБИ-ДОРИ ============

// 🦝 Категории блога
const categories = {
    'all': 'Все посты',
    'nature': 'Природа и горы',
    'culture': 'История и культура',
    'food': 'Еда и вино',
    'cities': 'Города и люди',
    'tips': 'Советы путешественникам'
};

// 📸 Слайдер для hero секции
const heroSlides = [
    'images/doby_obl_1.jpg',
    'images/doby_obl_2.jpg',
    'images/doby_obl_3.jpg',
    'images/doby_obl_4.jpg'
];

let currentSlide = 0;
let slideInterval;

// 📝 Данные постов блога
const blogPosts = [
    {
        id: 1,
        title: 'Как я полюбил Грузию с первого взгляда',
        slug: 'kak-ya-polyubil-gruziyu',
        category: 'tips',
        image: 'images/dobi-1.jpg',
        excerpt: 'Моя первая поездка в Грузию началась с вокзала в Тбилиси. Я еще не знал, что эта страна изменит мою жизнь навсегда. Запах хачапури, звуки грузинского языка и невероятное гостеприимство местных жителей...',
        readTime: 5,
        date: '2026-01-10',
        views: 1420,
        isPopular: true
    },
    {
        id: 2,
        title: 'Казбек и величие грузинских гор',
        slug: 'kazbek-velichie-gor',
        category: 'nature',
        image: 'images/dobi-2.jpg',
        excerpt: 'Стоя на высоте 5047 метров, я понял, что такое настоящая свобода. Казбек – это не просто гора, это символ Грузии, её непокорённый дух. Путь к церкви Гергети был незабываемым приключением...',
        readTime: 7,
        date: '2026-01-09',
        views: 2150,
        isPopular: true
    },
    {
        id: 3,
        title: 'Крепость Ананури: где история оживает',
        slug: 'krepost-ananuri',
        category: 'culture',
        image: 'images/dobi-3.jpg',
        excerpt: 'Когда я впервые увидел крепость Ананури на берегу Жинвальского водохранилища, время будто остановилось. Каменные стены хранят секреты веков, а вид на бирюзовые воды захватывает дух...',
        readTime: 6,
        date: '2026-01-08',
        views: 1680,
        isPopular: true
    },
    {
        id: 4,
        title: 'Тбилиси: город, который никогда не спит',
        slug: 'tbilisi-gorod-mechty',
        category: 'cities',
        image: 'images/dobi-4.jpg',
        excerpt: 'Тбилиси – это город контрастов. Старые серные бани соседствуют с ультрасовременным мостом Мира, а узкие улочки Старого города ведут к панорамным видам с крепости Нарикала. Каждый уголок дышит историей...',
        readTime: 8,
        date: '2026-01-07',
        views: 3200,
        isPopular: true
    },
    {
        id: 5,
        title: 'Грузинское застолье: как я стал экспертом по хинкали',
        slug: 'gruzinskoe-zastole',
        category: 'food',
        image: 'images/dobi-5.jpg',
        excerpt: 'Супра – это не просто ужин, это философия жизни. За одним столом собираются друзья, родственники и даже случайные путники. Я попробовал 47 хинкали за один вечер и не жалею ни о чём!',
        readTime: 5,
        date: '2026-01-06',
        views: 2890,
        isPopular: true
    },

    // ========== НОВЫЕ ПОСТЫ ==========

    {
        id: 6,
        title: 'Кавказское гостеприимство: история о том, как меня приняли за своего',
        slug: 'kavkazskoe-gostepriimstvo',
        category: 'tips',
        image: 'images/dobi-6.jpg',
        excerpt: 'В маленькой деревне у подножья гор меня пригласили на семейный ужин. Я был просто туристом с рюкзаком, но хозяева встретили меня как родного. Это был урок настоящего грузинского гостеприимства, который я запомню навсегда. История о том, почему грузины говорят: "Гость – посланник Бога"...',
        readTime: 12,
        date: '2026-01-05',
        views: 3450,
        isPopular: true
    },
    {
        id: 7,
        title: 'Батуми: где море встречается с горами',
        slug: 'batumi-more-i-gory',
        category: 'cities',
        image: 'images/dobi-7.jpg',
        excerpt: 'Батуми – это грузинская жемчужина на берегу Черного моря. Современные небоскребы соседствуют с уютными кафе, где подают лучший аджарский хачапури. Я провел здесь неделю, гуляя по набережной, купаясь в теплом море и открывая для себя совершенно другую Грузию – солнечную, морскую, невероятно красивую...',
        readTime: 10,
        date: '2026-01-04',
        views: 2780,
        isPopular: false
    },
    {
        id: 8,
        title: 'Вардзия: пещерный город, высеченный в скале',
        slug: 'vardzia-peshcherny-gorod',
        category: 'culture',
        image: 'images/dobi-8.jpg',
        excerpt: 'Когда я увидел Вардзию, я не поверил своим глазам. Целый город, вырезанный в отвесной скале в XII веке! Тысячи пещер, тайные ходы, древние фрески. Царица Тамара создала эту крепость-монастырь, чтобы защитить свой народ. Стоя там, я понял, насколько сильным был дух грузинского народа, который веками защищал свою землю...',
        readTime: 11,
        date: '2026-01-03',
        views: 4100,
        isPopular: true
    },
    {
        id: 9,
        title: 'История одного тамады: традиции, которые живут веками',
        slug: 'istoriya-odnogo-tamady',
        category: 'culture',
        image: 'images/dobi-9.jpg',
        excerpt: 'На супре я познакомился с 80-летним тамадой Гиви. Его тосты были не просто словами – это была живая история Грузии. Он рассказал мне о традициях, которые передаются из поколения в поколение, о том, как грузины хранят честь и достоинство превыше всего. "Слово грузина – это его жизнь", – сказал он...',
        readTime: 13,
        date: '2026-01-02',
        views: 3890,
        isPopular: true
    },
    {
        id: 10,
        title: 'Мцхета: древняя столица и духовное сердце Грузии',
        slug: 'mtsheta-drevnyaya-stolitsa',
        category: 'culture',
        image: 'images/dobi-10.jpg',
        excerpt: 'Мцхета – город, которому более 2500 лет. Здесь находится собор Светицховели, где, по преданию, хранится хитон Иисуса Христа. Стоя в этом древнем храме, я почувствовал связь времён. Грузины приняли христианство в 337 году и до сих пор хранят веру своих предков. Это народ, который никогда не предавал своих убеждений...',
        readTime: 9,
        date: '2026-01-01',
        views: 2650,
        isPopular: false
    },
    {
        id: 11,
        title: 'Канатная дорога в Боржоми: над облаками и соснами',
        slug: 'kanatnaya-doroga-borzhomi',
        category: 'nature',
        image: 'images/dobi-11.jpg',
        excerpt: 'Боржоми – это не только знаменитая минеральная вода. Это удивительное место, где горы покрыты сосновыми лесами, а воздух настолько чистый, что кружится голова. Поднявшись на канатной дороге на вершину, я увидел Грузию с высоты птичьего полета. Внизу шумел горный курорт, а вокруг – только небо и вершины...',
        readTime: 8,
        date: '2025-12-30',
        views: 2340,
        isPopular: false
    },
    {
        id: 12,
        title: 'Встреча с горцами: уроки мужества и чести',
        slug: 'vstrecha-s-gortsami',
        category: 'tips',
        image: 'images/dobi-12.jpg',
        excerpt: 'В горном селении Сванети я встретил семью, которая живёт здесь уже 800 лет. Старейшина рассказал мне истории о том, как их предки защищали родную землю от захватчиков. "Мы никогда не сдавались", – говорил он. Грузинский характер закалялся веками: открытость и радушие к друзьям, непреклонность перед врагами...',
        readTime: 14,
        date: '2025-12-29',
        views: 4250,
        isPopular: true
    },
    {
        id: 13,
        title: 'Мост Мира: символ современной Грузии',
        slug: 'most-mira-simvol',
        category: 'cities',
        image: 'images/dobi-13.jpg',
        excerpt: 'Мост Мира в Тбилиси – это не просто архитектурное чудо из стекла и стали. Это символ того, как Грузия соединяет прошлое и будущее. Вечером, когда мост подсвечивается тысячами огней, я встретил студента Георгия. Он рассказал, как молодые грузины строят новую страну, сохраняя традиции предков...',
        readTime: 10,
        date: '2025-12-28',
        views: 3120,
        isPopular: false
    },
    {
        id: 14,
        title: 'Грузинское вино: 8000 лет традиций в каждом глотке',
        slug: 'gruzinskoe-vino-traditsii',
        category: 'food',
        image: 'images/dobi-14.jpg',
        excerpt: 'Грузия – родина вина. Здесь его делают в квеври – глиняных сосудах, закопанных в землю, уже 8000 лет! В винном погребе в Кахетии винодел Важа рассказал мне семейный секрет: "Вино – это душа грузина. Мы вкладываем в него честь, любовь и верность традициям". Он был прав – каждый глоток хранил историю поколений...',
        readTime: 11,
        date: '2025-12-27',
        views: 3680,
        isPopular: true
    }
];

// 🎨 Текущий активный фильтр
let currentFilter = 'all';

// 🚀 Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦝 Инициализация блога Доби-Дори...');
    initHeroSlider();
    renderPosts();
    renderPopularPosts();
    initializeFilters();
});

// 🎬 Инициализация слайдера в hero
function initHeroSlider() {
    console.log('🎬 Инициализация слайдера...');
    const sliderContainer = document.getElementById('heroSlider');

    if (!sliderContainer) {
        console.error('❌ Контейнер heroSlider не найден!');
        return;
    }

    console.log('✅ Контейнер найден, создаю слайды...');

    // Создание слайдов
    heroSlides.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'hero-slide' + (index === 0 ? ' active' : '');
        slide.style.backgroundImage = `url('${image}')`;
        sliderContainer.appendChild(slide);
        console.log(`📸 Слайд ${index + 1}: ${image}`);
    });

    // Создание индикаторов
    const indicators = document.getElementById('sliderIndicators');
    if (indicators) {
        heroSlides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'slider-dot' + (index === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(dot);
        });
        console.log('✅ Индикаторы созданы');
    }

    // Автоматическая смена слайдов каждые 5 секунд
    startSlideShow();

    // Кнопки навигации
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopSlideShow();
            previousSlide();
            startSlideShow();
        });
        console.log('✅ Кнопка "Назад" подключена');
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopSlideShow();
            nextSlide();
            startSlideShow();
        });
        console.log('✅ Кнопка "Вперед" подключена');
    }

    console.log('🎉 Слайдер успешно инициализирован!');
}

// ⏭️ Следующий слайд
function nextSlide() {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    updateSlider();
}

// ⏮️ Предыдущий слайд
function previousSlide() {
    currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    updateSlider();
}

// 🎯 Переход к конкретному слайду
function goToSlide(index) {
    stopSlideShow();
    currentSlide = index;
    updateSlider();
    startSlideShow();
}

// 🔄 Обновление слайдера
function updateSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// ▶️ Запуск автопоказа
function startSlideShow() {
    slideInterval = setInterval(nextSlide, 5000);
}

// ⏸️ Остановка автопоказа
function stopSlideShow() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// 📊 Рендеринг постов
function renderPosts(filter = 'all') {
    const postsContainer = document.getElementById('blogPostsGrid');

    if (!postsContainer) {
        console.error('Контейнер blogPostsGrid не найден');
        return;
    }

    // Фильтрация постов
    const filteredPosts = filter === 'all' 
        ? blogPosts 
        : blogPosts.filter(post => post.category === filter);

    // Очистка контейнера
    postsContainer.innerHTML = '';

    // Если нет постов
    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                <p style="font-size: 1.2rem; color: var(--gray);">
                    🦝 Доби-Дори еще не писал постов в этой категории
                </p>
            </div>
        `;
        return;
    }

    // Создание карточек постов
    filteredPosts.forEach(post => {
        const postCard = createPostCard(post);
        postsContainer.innerHTML += postCard;
    });

    // Добавление обработчиков клика
    addPostClickHandlers();
}

// 🎴 Создание карточки поста
function createPostCard(post) {
    const categoryName = categories[post.category];
    const formattedDate = formatDate(post.date);

    return `
        <article class="blog-post-card" data-slug="${post.slug}">
            <div class="blog-post-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
                <span class="blog-category-badge ${post.category}">${categoryName}</span>
            </div>
            <div class="blog-post-content">
                <h2 class="blog-post-title">${post.title}</h2>
                <p class="blog-post-excerpt">${post.excerpt}</p>
                <div class="blog-post-meta">
                    <span>📅 ${formattedDate}</span>
                    <span>⏱️ ${post.readTime} мин</span>
                    <span>👀 ${formatViews(post.views)}</span>
                </div>
            </div>
        </article>
    `;
}

// ⭐ Рендеринг популярных постов в сайдбаре
function renderPopularPosts() {
    const popularContainer = document.getElementById('popularPostsList');

    if (!popularContainer) return;

    // Сортировка по просмотрам и выбор топ-3
    const popularPosts = [...blogPosts]
        .filter(post => post.isPopular)
        .sort((a, b) => b.views - a.views)
        .slice(0, 3);

    popularContainer.innerHTML = '';

    popularPosts.forEach(post => {
        const categoryName = categories[post.category];

        const popularItem = `
            <div class="popular-post-item" data-slug="${post.slug}">
                <img src="${post.image}" alt="${post.title}" class="popular-post-thumb">
                <div class="popular-post-info">
                    <h4>${post.title}</h4>
                    <div class="meta">
                        <span>${categoryName}</span> • <span>${post.readTime} мин</span>
                    </div>
                </div>
            </div>
        `;

        popularContainer.innerHTML += popularItem;
    });

    // Добавление обработчиков клика для популярных постов
    addPopularPostClickHandlers();
}

// 🎯 Инициализация фильтров
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Снятие активного класса со всех кнопок
            filterButtons.forEach(b => b.classList.remove('active'));

            // Добавление активного класса к нажатой кнопке
            btn.classList.add('active');

            // Получение категории из data-атрибута
            const category = btn.getAttribute('data-category');
            currentFilter = category;

            // Рендеринг постов с фильтром
            renderPosts(category);
        });
    });
}

// 🖱️ Обработчики клика на карточки постов
function addPostClickHandlers() {
    const postCards = document.querySelectorAll('.blog-post-card');

    postCards.forEach(card => {
        card.addEventListener('click', () => {
            const slug = card.getAttribute('data-slug');
            window.location.href = `blog-post.html?slug=${slug}`;
        });
    });
}

// 🖱️ Обработчики клика на популярные посты
function addPopularPostClickHandlers() {
    const popularItems = document.querySelectorAll('.popular-post-item');

    popularItems.forEach(item => {
        item.addEventListener('click', () => {
            const slug = item.getAttribute('data-slug');
            window.location.href = `blog-post.html?slug=${slug}`;
        });
    });
}

// 📅 Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

// 👀 Форматирование количества просмотров
function formatViews(views) {
    if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'k';
    }
    return views;
}

// 🔍 Экспорт данных для использования на других страницах
window.blogData = {
    posts: blogPosts,
    categories: categories,
    getPostBySlug: (slug) => blogPosts.find(post => post.slug === slug),
    getRelatedPosts: (currentSlug, category, limit = 3) => {
        return blogPosts
            .filter(post => post.slug !== currentSlug && post.category === category)
            .slice(0, limit);
    }
};
