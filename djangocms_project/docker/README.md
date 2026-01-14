# Quick Start with Docker

## Start the Application

```bash
cd /home/kvint/WEB/screen/djangocms_project/docker
docker-compose up -d --build
```

## Create Superuser

```bash
docker-compose exec web python manage.py createsuperuser
```

## Access

- Website: http://localhost:8000
- Admin: http://localhost:8000/admin

## Stop

```bash
docker-compose down
```

See [DOCKER.md](DOCKER.md) for complete documentation.
