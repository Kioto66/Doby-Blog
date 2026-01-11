from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('secret-admin/', admin.site.urls),  # Скрытая админка
    path('api/', include('tours.urls')),      # API endpoints
]

# Для разработки - отдача медиа файлов
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
