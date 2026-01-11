from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TourViewSet, BookingViewSet, ReviewViewSet, 
    FAQViewSet, BlogPostViewSet, LeadViewSet, TourOperatorViewSet
)

router = DefaultRouter()
router.register(r'tours', TourViewSet, basename='tour')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'faq', FAQViewSet, basename='faq')
router.register(r'blog', BlogPostViewSet, basename='blog')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'tour-operators', TourOperatorViewSet, basename='touroperator')

urlpatterns = [
    path('', include(router.urls)),
]
