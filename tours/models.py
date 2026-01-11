from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
import uuid

class TourOperator(models.Model):
    """Туроператоры - партнеры"""
    name = models.CharField('Название', max_length=255)
    description = models.TextField('Описание', blank=True)
    logo = models.ImageField('Логотип', upload_to='operators/', blank=True, null=True)
    phone = models.CharField('Телефон', max_length=50, blank=True)
    email = models.EmailField('Email', blank=True)
    is_active = models.BooleanField('Активен', default=True)
    created_at = models.DateTimeField('Создан', auto_now_add=True)

    class Meta:
        verbose_name = 'Туроператор'
        verbose_name_plural = 'Туроператоры'
        ordering = ['name']

    def __str__(self):
        return self.name


class Tour(models.Model):
    """Основная модель тура"""
    TOUR_TYPE_CHOICES = [
        ('bus_group', 'Автобусный групповой'),
        ('bus_small', 'Автобусный малая группа'),
        ('individual', 'Индивидуальный'),
    ]
    
    title = models.CharField('Название', max_length=255)
    slug = models.SlugField('URL', max_length=255, unique=True, blank=True)
    description_short = models.TextField('Краткое описание', max_length=500)
    description_full = models.TextField('Полное описание')
    
    price_base = models.DecimalField('Цена (базовая)', max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField('Длительность (дней)')
    tour_type = models.CharField('Тип тура', max_length=50, choices=TOUR_TYPE_CHOICES)
    max_people = models.PositiveIntegerField('Максимум человек', blank=True, null=True)
    
    tour_operator = models.ForeignKey(
        TourOperator, 
        on_delete=models.PROTECT, 
        verbose_name='Туроператор',
        related_name='tours'
    )
    
    region = models.CharField('Регион Грузии', max_length=100, blank=True)
    included = models.TextField('Что включено')
    not_included = models.TextField('Что не включено')
    program_by_days = models.JSONField('Программа по дням', default=list)
    
    is_active = models.BooleanField('Активен', default=True)
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлен', auto_now=True)

    class Meta:
        verbose_name = 'Тур'
        verbose_name_plural = 'Туры'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tour_type']),
            models.Index(fields=['region']),
            models.Index(fields=['price_base']),
            models.Index(fields=['duration_days']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title) + '-' + str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)


class TourPhoto(models.Model):
    """Фотографии туров"""
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='photos',
        verbose_name='Тур'
    )
    photo = models.ImageField('Фото', upload_to='tours/')
    display_order = models.PositiveIntegerField('Порядок отображения', default=0)
    is_cover = models.BooleanField('Главное фото', default=False)
    created_at = models.DateTimeField('Загружено', auto_now_add=True)

    class Meta:
        verbose_name = 'Фото тура'
        verbose_name_plural = 'Фото туров'
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"Фото для {self.tour.title}"


class TourDate(models.Model):
    """Даты проведения туров"""
    STATUS_CHOICES = [
        ('available', 'Доступен'),
        ('full', 'Мест нет'),
        ('cancelled', 'Отменен'),
    ]
    
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='dates',
        verbose_name='Тур'
    )
    start_date = models.DateField('Дата начала')
    end_date = models.DateField('Дата окончания', blank=True, null=True)
    
    total_seats = models.PositiveIntegerField('Всего мест')
    available_seats = models.PositiveIntegerField('Свободных мест')
    
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField('Создана', auto_now_add=True)

    class Meta:
        verbose_name = 'Дата тура'
        verbose_name_plural = 'Даты туров'
        ordering = ['start_date']
        unique_together = ['tour', 'start_date']
        indexes = [
            models.Index(fields=['start_date', 'status']),
        ]

    def __str__(self):
        return f"{self.tour.title} - {self.start_date}"

    def save(self, *args, **kwargs):
        # Автоматически вычисляем end_date
        if not self.end_date and self.tour:
            from datetime import timedelta
            self.end_date = self.start_date + timedelta(days=self.tour.duration_days - 1)
        
        # Автоматически обновляем статус
        if self.available_seats == 0:
            self.status = 'full'
        elif self.available_seats > 0 and self.status == 'full':
            self.status = 'available'
            
        super().save(*args, **kwargs)


class Booking(models.Model):
    """Бронирования"""
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('confirmed', 'Подтверждена'),
        ('cancelled', 'Отменена'),
        ('completed', 'Завершена'),
    ]
    
    SOURCE_CHOICES = [
        ('website', 'Сайт'),
        ('whatsapp', 'WhatsApp'),
        ('telegram', 'Telegram'),
        ('phone', 'Телефон'),
    ]
    
    tour_date = models.ForeignKey(
        TourDate, 
        on_delete=models.PROTECT, 
        related_name='bookings',
        verbose_name='Дата тура'
    )
    
    client_name = models.CharField('Имя клиента', max_length=255)
    client_phone = models.CharField('Телефон', max_length=50)
    client_email = models.EmailField('Email')
    people_count = models.PositiveIntegerField('Количество человек', default=1)
    total_price = models.DecimalField('Общая стоимость', max_digits=10, decimal_places=2)
    comment = models.TextField('Комментарий', blank=True)
    
    source = models.CharField('Источник', max_length=50, choices=SOURCE_CHOICES, default='website')
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='new')
    
    created_at = models.DateTimeField('Создана', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлена', auto_now=True)

    class Meta:
        verbose_name = 'Бронирование'
        verbose_name_plural = 'Бронирования'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"Заявка #{self.id} - {self.client_name}"

    def save(self, *args, **kwargs):
        # При создании вычисляем total_price и уменьшаем available_seats
        is_new = self.pk is None
        
        if is_new:
            self.total_price = self.tour_date.tour.price_base * self.people_count
            
        super().save(*args, **kwargs)
        
        if is_new:
            # Уменьшаем количество доступных мест
            self.tour_date.available_seats -= self.people_count
            self.tour_date.save()


class Review(models.Model):
    """Отзывы клиентов"""
    MODERATION_CHOICES = [
        ('pending', 'На модерации'),
        ('approved', 'Одобрен'),
        ('rejected', 'Отклонен'),
    ]
    
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE, 
        related_name='reviews',
        verbose_name='Тур'
    )
    
    client_name = models.CharField('Имя', max_length=255)
    client_city = models.CharField('Город', max_length=100, blank=True)
    rating = models.PositiveIntegerField(
        'Оценка', 
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    text = models.TextField('Текст отзыва')
    photos = models.JSONField('Фотографии', default=list, blank=True)
    video_url = models.URLField('Видео URL', blank=True)
    
    moderation_status = models.CharField(
        'Статус модерации', 
        max_length=20, 
        choices=MODERATION_CHOICES, 
        default='pending'
    )
    
    created_at = models.DateTimeField('Создан', auto_now_add=True)

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['moderation_status', 'rating']),
        ]

    def __str__(self):
        return f"Отзыв от {self.client_name} - {self.tour.title}"


class FAQ(models.Model):
    """Часто задаваемые вопросы"""
    CATEGORY_CHOICES = [
        ('safety', 'Безопасность и документы'),
        ('payment', 'Оплата и возврат'),
        ('docs', 'Документы и визы'),
        ('transport', 'Транспорт и логистика'),
        ('food', 'Питание'),
        ('connection', 'Связь'),
        ('other', 'Другое'),
    ]
    
    question = models.TextField('Вопрос')
    answer = models.TextField('Ответ')
    category = models.CharField('Категория', max_length=50, choices=CATEGORY_CHOICES)
    display_order = models.PositiveIntegerField('Порядок', default=0)
    is_active = models.BooleanField('Активен', default=True)
    created_at = models.DateTimeField('Создан', auto_now_add=True)

    class Meta:
        verbose_name = 'Вопрос FAQ'
        verbose_name_plural = 'FAQ'
        ordering = ['category', 'display_order']

    def __str__(self):
        return self.question[:50]


class BlogPost(models.Model):
    """Блог и статьи"""
    CATEGORY_CHOICES = [
        ('guides', 'Путеводители'),
        ('tips', 'Советы'),
        ('culture', 'Культура и традиции'),
        ('news', 'Новости'),
    ]
    
    title = models.CharField('Заголовок', max_length=255)
    slug = models.SlugField('URL', max_length=255, unique=True, blank=True)
    content = models.TextField('Содержание')
    excerpt = models.TextField('Краткое описание', max_length=300)
    category = models.CharField('Категория', max_length=50, choices=CATEGORY_CHOICES)
    cover_image = models.ImageField('Обложка', upload_to='blog/', blank=True, null=True)
    
    is_published = models.BooleanField('Опубликована', default=False)
    published_at = models.DateTimeField('Дата публикации', blank=True, null=True)
    created_at = models.DateTimeField('Создана', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлена', auto_now=True)

    class Meta:
        verbose_name = 'Статья блога'
        verbose_name_plural = 'Блог'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['category', 'is_published']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title) + '-' + str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)


class Lead(models.Model):
    """Общие лиды (не привязанные к конкретному туру)"""
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('in_progress', 'В работе'),
        ('converted', 'Конвертирован'),
        ('closed', 'Закрыт'),
    ]
    
    SOURCE_CHOICES = [
        ('contact_form', 'Форма обратной связи'),
        ('callback', 'Обратный звонок'),
        ('chat_bot', 'Чат-бот'),
    ]
    
    name = models.CharField('Имя', max_length=255)
    phone = models.CharField('Телефон', max_length=50)
    email = models.EmailField('Email', blank=True)
    message = models.TextField('Сообщение', blank=True)
    
    source = models.CharField('Источник', max_length=50, choices=SOURCE_CHOICES)
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='new')
    
    created_at = models.DateTimeField('Создан', auto_now_add=True)

    class Meta:
        verbose_name = 'Лид'
        verbose_name_plural = 'Лиды'
        ordering = ['-created_at']

    def __str__(self):
        return f"Лид #{self.id} - {self.name}"
