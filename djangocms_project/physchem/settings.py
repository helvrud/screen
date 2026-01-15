"""
Django settings for physchem project.
DjangoCMS Single-Page Presentation Website
"""

import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-CHANGE-THIS-IN-PRODUCTION-xyz123')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# CSRF Trusted Origins for DjangoCMS and Docker
CSRF_TRUSTED_ORIGINS = [
    'http://127.0.0.1:8001',
    'http://localhost:8001',
]

# Allow DjangoCMS toolbar to be embedded
X_FRAME_OPTIONS = 'SAMEORIGIN'

# Help with wizard iframes in some browsers
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = False  # Sometimes needed for CMS JS



# Application definition
INSTALLED_APPS = [
    'djangocms_admin_style',  # Must come before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    
    # DjangoCMS core
    'cms',
    'menus',
    'treebeard',
    
    # DjangoCMS plugins
    'djangocms_text_ckeditor',
    'filer',
    'easy_thumbnails',
    
    # Custom apps
    'content_plugins',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    
    # DjangoCMS middleware
    'cms.middleware.user.CurrentUserMiddleware',
    'cms.middleware.page.CurrentPageMiddleware',
    'cms.middleware.toolbar.ToolbarMiddleware',
    'cms.middleware.language.LanguageCookieMiddleware',
]

ROOT_URLCONF = 'physchem.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'cms.context_processors.cms_settings',
                'sekizai.context_processors.sekizai',
            ],
        },
    },
]

WSGI_APPLICATION = 'physchem.wsgi.application'


# Database
# Use PostgreSQL in Docker, SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.sqlite3'),
        'NAME': os.environ.get('DB_NAME', BASE_DIR / 'db.sqlite3'),
        'USER': os.environ.get('DB_USER', ''),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', ''),
        'PORT': os.environ.get('DB_PORT', ''),
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
LANGUAGE_CODE = 'en'

LANGUAGES = [
    ('en', 'English'),
    ('cs', 'Czech'),
]

TIME_ZONE = 'Europe/Prague'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Site ID (required by DjangoCMS)
SITE_ID = 1


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/screen/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files
#MEDIA_URL = '/media/'
MEDIA_URL = '/screen/media/'

MEDIA_ROOT = BASE_DIR / 'media'


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# DjangoCMS Settings
CMS_TEMPLATES = [
    ('single_page.html', 'Single Page Presentation'),
    ('presentation.html', 'Animated Presentation (Kiosk)'),
]

CMS_PERMISSION = False  # Simplified for local/kiosk use to ensure toolbar access
INTERNAL_IPS = ['127.0.0.1', 'localhost']
CMS_TOOLBAR_ANONYMOUS_ON = True # Debugging
CMS_PAGE_CACHE = False
CMS_PLACEHOLDER_CACHE = False
CMS_PLUGIN_CACHE = False
CMS_PLACEHOLDER_CONF = {}

# CKEditor settings
CKEDITOR_SETTINGS = {
    'language': '{{ language }}',
    'toolbar': 'CMS',
    'skin': 'moono-lisa',
}

# Thumbnail settings
THUMBNAIL_HIGH_RESOLUTION = True
THUMBNAIL_PROCESSORS = (
    'easy_thumbnails.processors.colorspace',
    'easy_thumbnails.processors.autocrop',
    'filer.thumbnail_processors.scale_and_crop_with_subject_location',
    'easy_thumbnails.processors.filters',
)

# Add sekizai to installed apps
INSTALLED_APPS.append('sekizai')
CMS_CONFIRM_VERSION4 = True
# DYNAMIC INTERNAL_IPS for Docker
import socket
try:
    hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
    INTERNAL_IPS += [ip[:-1] + '1' for ip in ips]
except Exception:
    pass
INTERNAL_IPS.append('0.0.0.0')
