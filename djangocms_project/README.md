# DjangoCMS Single-Page Presentation Website
## Physics & Chemistry Department (physchem.cz)

A modern, single-page presentation website built with DjangoCMS featuring custom content plugins, parallax effects, and a scientific-themed design.

---

## Features

✨ **Single-Page Presentation Design** - Long-scrolling layout with smooth animations  
🎨 **Scientific Theme** - Particles.js background with antigravity floating effects  
🔌 **5 Custom CMS Plugins** - Fully editable content blocks via DjangoCMS  
📱 **Responsive Design** - Mobile-first approach with modern CSS  
⚡ **Modern Tech Stack** - Django 4.2, DjangoCMS 4.1, AOS animations  

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
cd /home/kvint/WEB/screen/djangocms_project/docker
docker-compose up -d --build
docker-compose exec web python manage.py createsuperuser
```

Access at http://localhost:8001 - See [docker/DOCKER.md](docker/DOCKER.md) for details.

### Option 2: Local Development

See [Installation & Setup](#installation--setup) below.

---

## Project Structure

```
djangocms_project/
├── physchem/                    # Main Django project
│   ├── settings.py              # Django & DjangoCMS configuration
│   ├── urls.py                  # URL routing
│   └── wsgi.py                  # WSGI application
├── content_plugins/             # Custom CMS plugins app
│   ├── models.py                # Plugin data models
│   ├── cms_plugins.py           # Plugin registration
│   ├── admin.py                 # Admin configuration
│   └── templates/               # Plugin templates
├── templates/                   # Base templates
│   ├── base.html                # Main layout with particles
│   └── single_page.html         # Content template
├── static/                      # Static assets
│   ├── css/antigravity.css      # Custom styling
│   └── js/animations.js         # Particles & animations
└── requirements.txt             # Python dependencies
```

---

## Installation & Setup

### 1. Create Virtual Environment

```bash
cd /home/kvint/WEB/screen/djangocms_project
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 5. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 6. Run Development Server

```bash
python manage.py runserver
```

Visit `http://127.0.0.1:8000/` to see your site!

---

## Creating Your First Page

### 1. Access Admin Panel

Navigate to `http://127.0.0.1:8000/admin` and log in with your superuser credentials.

### 2. Create a Page

1. Click **Pages** in the admin sidebar
2. Click **Add Page**
3. Set the title (e.g., "Home")
4. Choose **Single Page Presentation** as the template
5. Click **Save and continue editing**

### 3. Add Content Plugins

1. Click **View on site** to see your page
2. Enable **Edit mode** from the CMS toolbar
3. Click on the **"slides"** placeholder
4. Add plugins in any order:

---

## Custom CMS Plugins

### 🎯 Plugin 1: Intro Slide
**Purpose:** Full-screen hero section  
**Fields:**
- Headline (main title)
- Sub-headline (supporting text)
- Background Image (optional)

**Usage:** Use as the first section to create a stunning entrance.

---

### 📖 Plugin 2: History Block
**Purpose:** Image + text storytelling  
**Fields:**
- Title
- Body Text
- Image

**Usage:** Add multiple in sequence to tell your department's story. Images alternate left/right automatically.

---

### 🖼️ Plugin 3: Gallery
**Purpose:** Modern image gallery  
**Fields:**
- Gallery Title
- Description
- Multiple Images (add via admin)

**Usage:** Showcase lab equipment, facilities, or research images. After creating the plugin, edit it in admin to add multiple images.

---

### 👥 Plugin 4: People Grid
**Purpose:** Staff/faculty profiles  
**Fields:**
- Section Title
- People entries (add via admin)

**Person Fields:**
- Name
- Photo
- Job Title
- Profile Link

**Usage:** Display your team. After creating the plugin, edit it in admin to add individual people.

---

### 🎥 Plugin 5: YouTube Embed
**Purpose:** Responsive video embedding  
**Fields:**
- Video Title
- YouTube Video ID

**Usage:** Add research presentations or department videos. Extract the ID from YouTube URLs:
- `youtube.com/watch?v=dQw4w9WgXcQ` → ID is `dQw4w9WgXcQ`

---

## Managing Gallery Images & People

### Adding Gallery Images

1. Go to admin: **Content_plugins → Gallery images**
2. Click **Add Gallery Image**
3. Select the parent gallery
4. Upload image and add caption
5. Set order number (lower = appears first)

### Adding People to Grid

1. Go to admin: **Content_plugins → People**
2. Click **Add Person**
3. Select the parent people grid
4. Fill in details and upload photo
5. Set order number

---

## Customization

### Changing Colors

Edit `/static/css/antigravity.css` and modify the CSS variables:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --accent-blue: #4facfe;
    --accent-purple: #764ba2;
    /* ... more variables */
}
```

### Adjusting Particles

Edit `/static/js/animations.js` to modify the Particles.js configuration:

```javascript
particlesJS('particles-js', {
    particles: {
        number: { value: 80 },  // Change particle count
        color: { value: ['#4facfe', '#764ba2'] },  // Change colors
        // ... more settings
    }
});
```

### Adding Languages

To enable Czech language support:

1. Edit `physchem/settings.py`:
```python
LANGUAGE_CODE = 'cs'  # Change default to Czech
```

2. Run migrations again:
```bash
python manage.py migrate
```

---

## Production Deployment

### Important Security Settings

Before deploying to production, update `physchem/settings.py`:

```python
DEBUG = False
SECRET_KEY = 'your-secure-random-key-here'
ALLOWED_HOSTS = ['physchem.cz', 'www.physchem.cz']
```

### Generate Secret Key

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### Database

For production, switch from SQLite to PostgreSQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'physchem_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

## Troubleshooting

### Images Not Displaying

Run `python manage.py collectstatic` and ensure `MEDIA_ROOT` is properly configured.

### Plugins Not Appearing

1. Check that `content_plugins` is in `INSTALLED_APPS`
2. Restart the development server
3. Clear browser cache

### Particles Not Showing

Ensure you have an active internet connection (Particles.js loads from CDN).

---

## Tech Stack

- **Django 4.2** - Web framework
- **DjangoCMS 4.1** - Content management
- **django-filer** - Media management
- **Particles.js** - Background effects
- **AOS** - Scroll animations
- **Google Fonts** - Typography (Inter, Orbitron)

---

## Support & Documentation

- [DjangoCMS Documentation](https://docs.django-cms.org/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Particles.js](https://vincentgarreau.com/particles.js/)
- [AOS Library](https://michalsnik.github.io/aos/)

---

## License

This project is created for the Physics & Chemistry Department website migration.

---

**Created with ❤️ using DjangoCMS**
