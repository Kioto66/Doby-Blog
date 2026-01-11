import django_filters
from .models import Tour


class TourFilter(django_filters.FilterSet):
    """Фильтры для каталога туров"""
    
    min_price = django_filters.NumberFilter(field_name='price_base', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price_base', lookup_expr='lte')
    duration = django_filters.NumberFilter(field_name='duration_days')
    tour_type = django_filters.ChoiceFilter(choices=Tour.TOUR_TYPE_CHOICES)
    region = django_filters.CharFilter(lookup_expr='icontains')
    
    # Фильтр по датам - туры с датами в указанном диапазоне
    start_date = django_filters.DateFilter(
        field_name='dates__start_date', 
        lookup_expr='gte'
    )
    end_date = django_filters.DateFilter(
        field_name='dates__start_date', 
        lookup_expr='lte'
    )
    
    class Meta:
        model = Tour
        fields = ['min_price', 'max_price', 'duration', 'tour_type', 'region', 
                  'start_date', 'end_date']
