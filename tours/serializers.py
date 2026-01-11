from rest_framework import serializers
from .models import (
    TourOperator, Tour, TourPhoto, TourDate, 
    Booking, Review, FAQ, BlogPost, Lead
)


class TourOperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourOperator
        fields = ['id', 'name', 'description', 'logo', 'phone', 'email']


class TourPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourPhoto
        fields = ['id', 'photo', 'display_order', 'is_cover']


class TourDateSerializer(serializers.ModelSerializer):
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model = TourDate
        fields = ['id', 'start_date', 'end_date', 'total_seats', 
                  'available_seats', 'status', 'is_available']
    
    def get_is_available(self, obj):
        return obj.available_seats > 0 and obj.status == 'available'


class TourListSerializer(serializers.ModelSerializer):
    """Для списка туров в каталоге"""
    tour_operator = TourOperatorSerializer(read_only=True)
    cover_photo = serializers.SerializerMethodField()
    nearest_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Tour
        fields = ['id', 'title', 'slug', 'description_short', 'price_base', 
                  'duration_days', 'tour_type', 'region', 'cover_photo', 
                  'nearest_date', 'tour_operator']
    
    def get_cover_photo(self, obj):
        cover = obj.photos.filter(is_cover=True).first()
        if cover:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(cover.photo.url)
        return None
    
    def get_nearest_date(self, obj):
        from django.utils import timezone
        nearest = obj.dates.filter(
            start_date__gte=timezone.now().date(),
            status='available',
            available_seats__gt=0
        ).first()
        if nearest:
            return TourDateSerializer(nearest).data
        return None


class TourDetailSerializer(serializers.ModelSerializer):
    """Детальная страница тура"""
    tour_operator = TourOperatorSerializer(read_only=True)
    photos = TourPhotoSerializer(many=True, read_only=True)
    dates = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Tour
        fields = ['id', 'title', 'slug', 'description_short', 'description_full',
                  'price_base', 'duration_days', 'tour_type', 'max_people', 
                  'region', 'included', 'not_included', 'program_by_days',
                  'tour_operator', 'photos', 'dates', 'reviews', 'average_rating']
    
    def get_dates(self, obj):
        from django.utils import timezone
        dates = obj.dates.filter(
            start_date__gte=timezone.now().date(),
            status='available'
        ).order_by('start_date')[:10]
        return TourDateSerializer(dates, many=True).data
    
    def get_reviews(self, obj):
        reviews = obj.reviews.filter(moderation_status='approved').order_by('-created_at')[:5]
        return ReviewSerializer(reviews, many=True).data
    
    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews.filter(moderation_status='approved').aggregate(Avg('rating'))
        return round(avg['rating__avg'], 1) if avg['rating__avg'] else None


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['tour_date', 'client_name', 'client_phone', 'client_email', 
                  'people_count', 'comment', 'source']
    
    def validate_client_phone(self, value):
        """Валидация телефона"""
        import re
        # Убираем все символы кроме цифр и +
        cleaned = re.sub(r'[^\d+]', '', value)
        
        # Проверяем формат
        if not re.match(r'^\+?[78]\d{10}$', cleaned):
            raise serializers.ValidationError(
                "Введите корректный номер телефона в формате +7XXXXXXXXXX"
            )
        
        # Нормализуем к формату +7
        if cleaned.startswith('8'):
            cleaned = '+7' + cleaned[1:]
        elif not cleaned.startswith('+'):
            cleaned = '+' + cleaned
            
        return cleaned
    
    def validate(self, data):
        """Проверка доступности мест"""
        tour_date = data.get('tour_date')
        people_count = data.get('people_count')
        
        if tour_date.available_seats < people_count:
            raise serializers.ValidationError({
                'people_count': f'Недостаточно мест. Доступно: {tour_date.available_seats}'
            })
        
        if tour_date.status != 'available':
            raise serializers.ValidationError({
                'tour_date': 'Этот тур недоступен для бронирования'
            })
        
        return data


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'client_name', 'client_city', 'rating', 'text', 
                  'photos', 'video_url', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['tour', 'client_name', 'client_city', 'rating', 'text', 
                  'photos', 'video_url']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category']


class BlogPostListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'category', 'cover_image', 
                  'published_at']


class BlogPostDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'content', 'excerpt', 'category', 
                  'cover_image', 'published_at', 'updated_at']


class LeadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ['name', 'phone', 'email', 'message', 'source']
    
    def validate_phone(self, value):
        """Валидация телефона"""
        import re
        cleaned = re.sub(r'[^\d+]', '', value)
        if not re.match(r'^\+?[78]\d{10}$', cleaned):
            raise serializers.ValidationError(
                "Введите корректный номер телефона"
            )
        if cleaned.startswith('8'):
            cleaned = '+7' + cleaned[1:]
        elif not cleaned.startswith('+'):
            cleaned = '+' + cleaned
        return cleaned
