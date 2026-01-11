<!-- Конфигурация API для разных окружений -->
<script>
  // Определяем API URL в зависимости от окружения
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Локальная разработка
    window.API_URL = 'http://127.0.0.1:8001/api';
  } else if (window.location.hostname === 'kioto66.github.io') {
    // GitHub Pages - указываем backend на Render
    window.API_URL = 'https://doby-blog-backend.onrender.com/api'; // Замените на ваш Render URL после развертывания
  } else {
    // Fallback
    window.API_URL = 'http://127.0.0.1:8001/api';
  }
</script>
