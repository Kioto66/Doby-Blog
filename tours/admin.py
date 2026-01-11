from django.contrib import admin
from django.utils.html import format_html
from .models import (
    TourOperator, Tour, TourPhoto, TourDate, 
    Booking, Review, FAQ, BlogPost, Lead
)


@admin.register(TourOperator)
class TourOperatorAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'phone', 'email']
    list_editable = ['is_active']


class TourPhotoInline(admin.TabularInline):
    model = TourPhoto
    extra = 3
    fields = ['photo', 'display_order', 'is_cover']


class TourDateInline(admin.TabularInline):
    model = TourDate
    extra = 2
    fields = ['start_date', 'end_date', 'total_seats', 'available_seats', 'status']
    readonly_fields = ['end_date']


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ['title', 'tour_type', 'price_base', 'duration_days', 'region', 'is_active', 'created_at']
    list_filter = ['tour_type', 'is_active', 'region', 'tour_operator']
    search_fields = ['title', 'description_short', 'description_full']
    list_editable = ['is_active']
    prepopulated_fields = {'slug': ('title',)}
    
    inlines = [TourPhotoInline, TourDateInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'slug', 'tour_type', 'tour_operator', 'region')
        }),
        ('Описание', {
            'fields': ('description_short', 'description_full', 'program_by_days')
        }),
        ('Цены и условия', {
            'fields': ('price_base', 'duration_days', 'max_people', 'included', 'not_included')
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
    )
    
    actions = ['activate_tours', 'deactivate_tours']
    
    def activate_tours(self, request, queryset):
        queryset.update(is_active=True)
    activate_tours.short_description = "Активировать выбранные туры"
    
    def deactivate_tours(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_tours.short_description = "Деактивировать выбранные туры"


@admin.register(TourPhoto)
class TourPhotoAdmin(admin.ModelAdmin):
    list_display = ['tour', 'photo', 'display_order', 'is_cover', 'created_at']
    list_filter = ['is_cover', 'tour']
    list_editable = ['display_order', 'is_cover']


@admin.register(TourDate)
class TourDateAdmin(admin.ModelAdmin):
    list_display = ['tour', 'start_date', 'end_date', 'seats_info', 'status_colored', 'created_at']
    list_filter = ['status', 'start_date']
    search_fields = ['tour__title']
    readonly_fields = ['end_date']
    date_hierarchy = 'start_date'
    
    def seats_info(self, obj):
        total = obj.total_seats
        available = obj.available_seats
        booked = total - available
        percentage = (available / total * 100) if total > 0 else 0
        
        if percentage > 50:
            color = 'green'
        elif percentage > 20:
            color = 'orange'
        else:
            color = 'red'
            
        return format_html(
            '<span style="color: {};">{}/{} свободно ({}%)</span>',
            color, available, total, int(percentage)
        )
    seats_info.short_description = 'Места'
    
    def status_colored(self, obj):
        colors = {
            'available': 'green',
            'full': 'red',
            'cancelled': 'gray',
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_colored.short_description = 'Статус'


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'tour_info', 'client_name', 'client_phone', 'people_count', 
                    'total_price', 'status_colored', 'source', 'created_at']
    list_filter = ['status', 'source', 'created_at']
    search_fields = ['client_name', 'client_phone', 'client_email']
    readonly_fields = ['total_price', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Информация о туре', {
            'fields': ('tour_date',)
        }),
        ('Данные клиента', {
            'fields': ('client_name', 'client_phone', 'client_email', 'people_count', 'comment')
        }),
        ('Статус и источник', {
            'fields': ('status', 'source', 'total_price')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['confirm_bookings', 'cancel_bookings']
    
    def tour_info(self, obj):
        return f"{obj.tour_date.tour.title} ({obj.tour_date.start_date})"
    tour_info.short_description = 'Тур'
    
    def status_colored(self, obj):
        colors = {
            'new': 'blue',
            'confirmed': 'green',
            'cancelled': 'red',
            'completed': 'gray',
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_colored.short_description = 'Статус'
    
    def confirm_bookings(self, request, queryset):
        queryset.update(status='confirmed')
    confirm_bookings.short_description = "Подтвердить выбранные бронирования"
    
    def cancel_bookings(self, request, queryset):
        queryset.update(status='cancelled')
    cancel_bookings.short_description = "Отменить выбранные бронирования"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['client_name', 'tour', 'rating_stars', 'moderation_status_colored', 'created_at']
    list_filter = ['moderation_status', 'rating', 'created_at']
    search_fields = ['client_name', 'client_city', 'text']
    readonly_fields = ['created_at']
    
    actions = ['approve_reviews', 'reject_reviews']
    
    def rating_stars(self, obj):
        stars = '⭐' * obj.rating
        return format_html('<span style="font-size: 16px;">{}</span>', stars)
    rating_stars.short_description = 'Оценка'
    
    def moderation_status_colored(self, obj):
        colors = {
            'pending': 'orange',
            'approved': 'green',
            'rejected': 'red',
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.moderation_status, 'black'),
            obj.get_moderation_status_display()
        )
    moderation_status_colored.short_description = 'Модерация'
    
    def approve_reviews(self, request, queryset):
        queryset.update(moderation_status='approved')
    approve_reviews.short_description = "Одобрить выбранные отзывы"
    
    def reject_reviews(self, request, queryset):
        queryset.update(moderation_status='rejected')
    reject_reviews.short_description = "Отклонить выбранные отзывы"


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question_short', 'category', 'display_order', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['question', 'answer']
    list_editable = ['display_order', 'is_active']
    
    def question_short(self, obj):
        return obj.question[:80] + '...' if len(obj.question) > 80 else obj.question
    question_short.short_description = 'Вопрос'


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_published', 'published_at', 'created_at']
    list_filter = ['category', 'is_published', 'published_at']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_published']
    date_hierarchy = 'published_at'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'slug', 'category', 'cover_image')
        }),
        ('Контент', {
            'fields': ('excerpt', 'content')
        }),
        ('Публикация', {
            'fields': ('is_published', 'published_at')
        }),
    )


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'phone', 'source', 'status_colored', 'created_at']
    list_filter = ['status', 'source', 'created_at']
    search_fields = ['name', 'phone', 'email', 'message']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    actions = ['mark_in_progress', 'mark_converted']
    
    def status_colored(self, obj):
        colors = {
            'new': 'blue',
            'in_progress': 'orange',
            'converted': 'green',
            'closed': 'gray',
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_colored.short_description = 'Статус'
    
    def mark_in_progress(self, request, queryset):
        queryset.update(status='in_progress')
    mark_in_progress.short_description = "Взять в работу"
    
    def mark_converted(self, request, queryset):
        queryset.update(status='converted')
    mark_converted.short_description = "Отметить как конвертированные"


# Настройка главной страницы админки
admin.site.site_header = "Туристическое агентство - Грузия"
admin.site.site_title = "Админ-панель"
admin.site.index_title = "Управление сайтом"
