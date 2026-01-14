"""
Admin configuration for related models
"""

from django.contrib import admin
from .models import GalleryImage, Person


class GalleryImageInline(admin.TabularInline):
    model = GalleryImage
    extra = 1
    fields = ['image', 'caption', 'order']


class PersonInline(admin.TabularInline):
    model = Person
    extra = 1
    fields = ['name', 'photo', 'job_title', 'profile_link', 'order']


# Register inline models for easier management
admin.site.register(GalleryImage)
admin.site.register(Person)
