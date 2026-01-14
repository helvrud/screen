#!/bin/bash
set -e
set -o pipefail

echo "=========================================================="
echo "🚀 Starting DjangoCMS application (SQLite Mode)..."
echo "=========================================================="

# Run migrations
echo "📦 Running database migrations..."
python manage.py migrate --noinput

# Collect static files
# Only clear if we really want to, otherwise it's slow on every restart
echo "📂 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist
if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ] && [ "$DJANGO_SUPERUSER_EMAIL" ]; then
    echo "👤 Checking superuser status..."
    python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')
    print('✅ Superuser created successfully')
else:
    print('ℹ️ Superuser already exists')
END
fi

echo "----------------------------------------------------------"
echo "✨ Django application is ready!"
echo "🔗 Access it at: http://localhost:8001"
echo "----------------------------------------------------------"

exec "$@"
