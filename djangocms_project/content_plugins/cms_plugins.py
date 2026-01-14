"""
CMS Plugin Registration
Custom plugins for single-page presentation
"""

from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from django.utils.translation import gettext_lazy as _

from .models import (
    IntroSlidePlugin,
    HistoryBlockPlugin,
    GalleryPlugin,
    PeopleGridPlugin,
    YouTubeEmbedPlugin,
    Person,
    PeopleGridImage,
    GalleryImage
)

from django.contrib import admin

class PersonInline(admin.StackedInline):
    model = Person
    extra = 0

class PeopleGridImageInline(admin.StackedInline):
    model = PeopleGridImage
    extra = 0

class GalleryImageInline(admin.StackedInline):
    model = GalleryImage
    extra = 0

@plugin_pool.register_plugin
class IntroSlideCMSPlugin(CMSPluginBase):
    model = IntroSlidePlugin
    name = _("Intro Slide")
    render_template = "content_plugins/intro_slide.html"
    cache = True
    module = _("Presentation Plugins")

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)
        context['instance'] = instance
        return context


import random

@plugin_pool.register_plugin
class HistoryBlockCMSPlugin(CMSPluginBase):
    model = HistoryBlockPlugin
    name = _("History Block")
    render_template = "content_plugins/history_block.html"
    cache = True
    module = _("Presentation Plugins")

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)
        context['instance'] = instance
        return context


@plugin_pool.register_plugin
class GalleryCMSPlugin(CMSPluginBase):
    model = GalleryPlugin
    name = _("Gallery")
    render_template = "content_plugins/gallery.html"
    cache = False  # Disable cache to ensure random order on refresh
    module = _("Presentation Plugins")
    inlines = [GalleryImageInline]

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)
        
        images = list(instance.images.all())
        
        if instance.folder:
            # Fetch images from the folder
            folder_files = instance.folder.files.all()
            
            for file in folder_files:
                # Check for image extension
                if file.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                    class FolderImageWrapper:
                        def __init__(self, filer_file):
                            self.image = filer_file
                            # Only use label if explicitly set, NO fallback to filename
                            self.caption = filer_file.label if filer_file.label and filer_file.label != filer_file.original_filename else ""
                            
                    images.append(FolderImageWrapper(file))
        
        # Randomize the order
        random.shuffle(images)
        
        context['images'] = images
        return context


@plugin_pool.register_plugin
class PeopleGridCMSPlugin(CMSPluginBase):
    model = PeopleGridPlugin
    name = _("People Grid")
    render_template = "content_plugins/people_grid.html"
    cache = True
    module = _("Presentation Plugins")
    inlines = [PersonInline, PeopleGridImageInline]

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)
        context['instance'] = instance
        
        # Merge people and images
        people = list(instance.people.all())
        images = list(instance.extra_images.all())
        
        # Tag them for template identification
        for p in people:
            p.type = 'person'
        for i in images:
            i.type = 'image'
            
        # Combine and sort
        grid_items = sorted(people + images, key=lambda x: x.order)
        
        context['grid_items'] = grid_items
        return context


@plugin_pool.register_plugin
class YouTubeEmbedCMSPlugin(CMSPluginBase):
    model = YouTubeEmbedPlugin
    name = _("YouTube Embed")
    render_template = "content_plugins/youtube_embed.html"
    cache = True
    module = _("Presentation Plugins")

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)
        context['instance'] = instance
        context['embed_url'] = instance.get_embed_url()
        return context
