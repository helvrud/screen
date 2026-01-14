# Docker Deployment Guide (SQLite Mode)

## Quick Start

### 1. Navigate to Docker Directory

```bash
cd /home/kvint/WEB/screen/djangocms_project/docker
```

### 2. Build and Start Containers

```bash
docker-compose up -d --build
```

This will:
- Build the Django application image
- Run migrations automatically
- Collect static files
- Start the development server on port **8001**

### 3. Access the Application

- **Website:** http://localhost:8001
- **Admin:** http://localhost:8001/admin

### 4. Create Superuser (First Time)

```bash
docker-compose exec web python manage.py createsuperuser
```

---

## Architecture

### Services

**web** - Django application container
- Built from custom Dockerfile
- Runs on port 8001 (internally 8000)
- Project files mounted from host (`..:/app`)
- Separate volumes for media and static files
- **Uses SQLite** (stored in `db.sqlite3` in your project root)

### Volume Mounts

```yaml
volumes:
  - ..:/app                      # Project files (EXTERNAL - on host)
  - media_files:/app/media       # Media uploads (Docker volume)
  - static_files:/app/staticfiles # Collected static files (Docker volume)
```

**Important:** Your project files remain on the host system at `/home/kvint/WEB/screen/djangocms_project/`. Any changes you make are immediately reflected in the container.

---

## Common Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f web
```

### Restart Services

```bash
docker-compose restart
```

### Run Django Commands

```bash
# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Collect static files
docker-compose exec web python manage.py collectstatic

# Django shell
docker-compose exec web python manage.py shell
```

---

## Data Persistence

✅ **Project Files** - Stored on host, fully persistent  
✅ **Database** - `db.sqlite3` file in your project root (on host)  
✅ **Media Files** - Uploaded files in Docker volume `media_files`  
✅ **Static Files** - Collected static in Docker volume `static_files`  

---

## Summary

This Docker setup is optimized for simplicity using SQLite and mounts your current working directory directly into the container. Port **8001** is used to avoid conflicts with other local services.
