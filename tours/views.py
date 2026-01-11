from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import (
    Tour, Booking, Review, FAQ, BlogPost, Lead, TourOperator
)
from .serializers import (
    TourListSerializer, TourDetailSerializer,
    BookingCreateSerializer, ReviewSerializer, ReviewCreateSerializer,
    FAQSerializer, BlogPostListSerializer, BlogPostDetailSerializer,
    LeadCreateSerializer, TourOperatorSerializer
)
from .filters import TourFilter


class TourViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API для туров
    list: каталог туров с фильтрами
    retrieve: детальная страница тура
    """
    queryset = Tour.objects.filter(is_active=True).select_related('tour_operator')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TourFilter
    search_fields = ['title', 'description_short', 'description_full', 'region']
    ordering_fields = ['price_base', 'duration_days', 'created_at']
    ordering = ['-created_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TourDetailSerializer
        return TourListSerializer


class BookingViewSet(viewsets.GenericViewSet):
    """
    API для бронирований
    create: создать новую заявку
    """
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        return Response({
            'success': True,
            'booking_id': booking.id,
            'message': 'Ваша заявка принята! Мы свяжемся с вами в течение часа.'
        }, status=status.HTTP_201_CREATED)


class ReviewViewSet(viewsets.GenericViewSet):
    """
    API для отзывов
    list: получить одобренные отзывы
    create: добавить отзыв (с модерацией)
    """
    queryset = Review.objects.filter(moderation_status='approved')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def list(self, request):
        tour_id = request.query_params.get('tour_id')
        queryset = self.get_queryset()
        
        if tour_id:
            queryset = queryset.filter(tour_id=tour_id)
        
        queryset = queryset.order_by('-created_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'message': 'Спасибо за отзыв! Он будет опубликован после модерации.'
        }, status=status.HTTP_201_CREATED)


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API для FAQ
    """
    queryset = FAQ.objects.filter(is_active=True).order_by('category', 'display_order')
    serializer_class = FAQSerializer
    
    def list(self, request):
        category = request.query_params.get('category')
        queryset = self.get_queryset()
        
        if category:
            queryset = queryset.filter(category=category)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API для блога
    """
    queryset = BlogPost.objects.filter(is_published=True).order_by('-published_at')
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer


class LeadViewSet(viewsets.GenericViewSet):
    """
    API для лидов (формы обратной связи)
    """
    serializer_class = LeadCreateSerializer
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'message': 'Спасибо! Мы свяжемся с вами в ближайшее время.'
        }, status=status.HTTP_201_CREATED)


class TourOperatorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API для туроператоров
    """
    queryset = TourOperator.objects.filter(is_active=True)
    serializer_class = TourOperatorSerializer
