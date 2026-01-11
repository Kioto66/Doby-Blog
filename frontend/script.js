// API базовый URL - использует переменную окружения или локальный fallback
const API_URL = window.API_URL || 'http://127.0.0.1:8001/api';

// Глобальные переменные
let currentPage = 1;
let filters = {};

// ============ ИНИЦИАЛИЗАЦИЯ ============
document.addEventListener('DOMContentLoaded', () => {
    loadTours();
    setupFilters();
    setupNavigation();
    animateOnScroll();
});

// ============ ЗАГРУЗКА ТУРОВ ============
async function loadTours(page = 1) {
    const loader = document.getElementById('loader');
    const toursGrid = document.getElementById('toursGrid');
    const toursCount = document.getElementById('toursFoundCount');
    
    loader.style.display = 'block';
    toursGrid.innerHTML = '';
    
    try {
        // Формируем URL с фильтрами
        let url = `${API_URL}/tours/?page=${page}`;
        
        if (filters.min_price) url += `&min_price=${filters.min_price}`;
        if (filters.max_price) url += `&max_price=${filters.max_price}`;
        if (filters.duration) url += `&duration=${filters.duration}`;
        if (filters.region) url += `&region=${filters.region}`;
        if (filters.start_date) url += `&start_date=${filters.start_date}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        loader.style.display = 'none';
        
        if (data.results && data.results.length > 0) {
            toursCount.textContent = data.count;
            renderTours(data.results);
            renderPagination(data);
        } else {
            toursGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: var(--gray);">Туры не найдены. Попробуйте изменить фильтры.</p>';
            toursCount.textContent = '0';
        }
    } catch (error) {
        loader.style.display = 'none';
        console.error('Ошибка загрузки туров:', error);
        toursGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--accent-red);">⚠️ Ошибка загрузки. Проверьте что Django сервер запущен на http://127.0.0.1:8000</p>';
    }
}

// ============ ОТРИСОВКА ТУРОВ ============
function renderTours(tours) {
    const toursGrid = document.getElementById('toursGrid');
    
    tours.forEach((tour, index) => {
        const card = document.createElement('div');
        card.className = 'tour-card';
        card.onclick = () => openTour(tour.slug);
        
        // Используем Lorem Picsum (стабильные плейсхолдеры)
        // Разные seed для разных картинок
        //const imageUrl = `https://picsum.photos/seed/${tour.id}/800/600`;
        const imageUrl = `images/tour${(index % 8) + 1}.jpg`;

        const tourTypeMap = {
            'bus_group': 'Автобусный групповой',
            'bus_small': 'Малая группа',
            'individual': 'Индивидуальный'
        };
        
        card.innerHTML = `
            <div class="tour-image-wrapper">
                <img src="${imageUrl}" alt="${tour.title}" class="tour-image">
                <div class="tour-badge">от ${formatPrice(tour.price_base)}</div>
            </div>
            <div class="tour-content">
                <h3 class="tour-title">${tour.title}</h3>
                <div class="tour-rating">
                    ${renderStars(5)}
                    <span style="color: var(--gray);">(4.8)</span>
                </div>
                <div class="tour-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${tour.region}</span>
                    <span><i class="fas fa-calendar"></i> ${tour.duration_days} ${pluralizeDays(tour.duration_days)}</span>
                </div>
                <p class="tour-description">${tour.description_short}</p>
                <div class="tour-footer">
                    <span style="color: var(--gray); font-size: 0.9rem;">${tourTypeMap[tour.tour_type] || tour.tour_type}</span>
                    <button class="btn btn-primary" style="padding: 0.5rem 1.5rem;">Подробнее →</button>
                </div>
            </div>
        `;
        
        toursGrid.appendChild(card);
    });
}


// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

function renderStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return stars;
}

function pluralizeDays(num) {
    if (num === 1) return 'день';
    if (num >= 2 && num <= 4) return 'дня';
    return 'дней';
}

function openTour(slug) {
	window.location.href = `tour-detail.html?slug=${slug}`;
    // Пока просто alert, потом сделаем детальную страницу
    //alert(`Открытие тура: ${slug}\n\nДетальная страница будет на следующем этапе!`);
}

// ============ ФИЛЬТРЫ ============
function setupFilters() {
    const applyButton = document.getElementById('applyFilters');
    
    applyButton.addEventListener('click', () => {
        filters = {};
        
        // Даты
        const startDate = document.getElementById('filterStartDate').value;
        if (startDate) filters.start_date = startDate;
        
        // Бюджет
        const budget = document.getElementById('filterBudget').value;
        if (budget) {
            const [min, max] = budget.split('-');
            filters.min_price = min;
            filters.max_price = max;
        }
        
        // Длительность
        const duration = document.getElementById('filterDuration').value;
        if (duration) filters.duration = duration;
        
        // Регион
        const region = document.getElementById('filterRegion').value;
        if (region) filters.region = region;
        
        // Загружаем с фильтрами
        loadTours(1);
    });
}

// ============ ПАГИНАЦИЯ ============
function renderPagination(data) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (!data.next && !data.previous) return;
    
    const totalPages = Math.ceil(data.count / 12);
    
    if (data.previous) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn btn-secondary';
        prevBtn.style.cssText = 'padding: 0.5rem 1rem; margin: 0.5rem;';
        prevBtn.textContent = '← Предыдущая';
        prevBtn.onclick = () => loadTours(currentPage - 1);
        pagination.appendChild(prevBtn);
    }
    
    const pageInfo = document.createElement('span');
    pageInfo.style.cssText = 'margin: 0 1rem; font-weight: 600;';
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    pagination.appendChild(pageInfo);
    
    if (data.next) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-secondary';
        nextBtn.style.cssText = 'padding: 0.5rem 1rem; margin: 0.5rem;';
        nextBtn.textContent = 'Следующая →';
        nextBtn.onclick = () => loadTours(currentPage + 1);
        pagination.appendChild(nextBtn);
    }
}

// ============ НАВИГАЦИЯ ============
function setupNavigation() {
    // Плавный скролл
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Мобильное меню
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    
    navToggle.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// ============ АНИМАЦИИ ПРИ СКРОЛЛЕ ============
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.tour-card, .feature, .review-card').forEach(el => {
        observer.observe(el);
    });
}
// ============ HERO SLIDER ============
let currentSlide = 0;
let slideInterval;
const slides = document.querySelectorAll('.hero-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function showSlide(index) {
    // Убираем active со всех слайдов
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    // Добавляем active к нужному слайду
    currentSlide = (index + totalSlides) % totalSlides;
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

function startSlideshow() {
    slideInterval = setInterval(nextSlide, 5000); // Меняем каждые 5 секунд
}

function stopSlideshow() {
    clearInterval(slideInterval);
}

// Кнопки навигации
document.getElementById('heroNext').addEventListener('click', () => {
    nextSlide();
    stopSlideshow();
    startSlideshow(); // Перезапускаем таймер
});

document.getElementById('heroPrev').addEventListener('click', () => {
    prevSlide();
    stopSlideshow();
    startSlideshow();
});

// Клик по индикаторам
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        showSlide(index);
        stopSlideshow();
        startSlideshow();
    });
});

// Пауза при наведении на hero
const heroSection = document.querySelector('.hero');
heroSection.addEventListener('mouseenter', stopSlideshow);
heroSection.addEventListener('mouseleave', startSlideshow);

// Запускаем слайдшоу при загрузке
startSlideshow();
