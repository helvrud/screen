FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    gettext \
    libjpeg-dev \
    zlib1g-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user to match the host user (UID 1000)
# Use -f to ignore if user/group already exists (in case of rebuilds with different base)
RUN groupadd -g 1000 kvint || true && \
    useradd -u 1000 -g kvint -m -s /bin/bash kvint || true && \
    mkdir -p /app/staticfiles /app/media && \
    chown -R kvint:kvint /app

# Copy requirements file first to leverage Docker cache
COPY --chown=kvint:kvint requirements.txt /app/

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy entrypoint script
COPY --chown=kvint:kvint docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy the rest of the application
# We do this after requirements to maximize caching
COPY --chown=kvint:kvint . /app/

# Switch to non-root user
USER kvint

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
