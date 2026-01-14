"""
Custom CMS Plugin Models for Single-Page Presentation
Physics & Chemistry Department Website
"""

from django.db import models
from cms.models import CMSPlugin
from filer.fields.image import FilerImageField
from filer.fields.folder import FilerFolderField


class BaseSlidePlugin(CMSPlugin):
    """
    Abstract base class for all slide plugins to share common fields
    """
    department_title = models.CharField(
        max_length=200,
        default="Department of Physical and Macromolecular Chemistry",
        verbose_name="Department Title",
        help_text="Identity text displayed at the top of the slide"
    )
    department_logo = FilerImageField(
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="%(app_label)s_%(class)s_logos",
        verbose_name="Department Logo"
    )
    department_website = models.URLField(
        max_length=500,
        default="https://www.natur.cuni.cz/chemistry/fyzchem",
        verbose_name="Department Website",
        help_text="URL for the QR code"
    )

    class Meta:
        abstract = True


class IntroSlidePlugin(BaseSlidePlugin):
    """
    Plugin 1: Full-screen hero section with headline and background image
    """
    headline = models.CharField(
        max_length=200,
        verbose_name="Headline",
        help_text="Main headline text"
    )
    sub_headline = models.TextField(
        verbose_name="Sub-headline",
        help_text="Supporting text below the headline"
    )
    background_image = FilerImageField(
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="intro_slide_backgrounds",
        verbose_name="Background Image"
    )

    def __str__(self):
        return f"Intro: {self.headline[:50]}"

    class Meta:
        verbose_name = "Intro Slide"
        verbose_name_plural = "Intro Slides"


class HistoryBlockPlugin(BaseSlidePlugin):
    """
    Plugin 2: Image + Text block for storytelling sequences
    """
    title = models.CharField(
        max_length=200,
        verbose_name="Title"
    )
    body_text = models.TextField(
        verbose_name="Body Text",
        help_text="Main content text"
    )
    image = FilerImageField(
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="history_block_images",
        verbose_name="Image"
    )

    def __str__(self):
        return f"History: {self.title}"

    class Meta:
        verbose_name = "History Block"
        verbose_name_plural = "History Blocks"


class GalleryPlugin(BaseSlidePlugin):
    """
    Plugin 3: Modern gallery with multiple images
    """
    title = models.CharField(
        max_length=200,
        verbose_name="Gallery Title"
    )
    description = models.TextField(
        verbose_name="Description",
        blank=True,
        help_text="Optional description text"
    )
    folder = FilerFolderField(
        verbose_name="Source Folder",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        help_text="Select a folder to auto-populate the gallery. Images will be used from here."
    )

    def __str__(self):
        return f"Gallery: {self.title}"

    class Meta:
        verbose_name = "Gallery"
        verbose_name_plural = "Galleries"


class GalleryImage(models.Model):
    """
    Related model for gallery images
    """
    gallery = models.ForeignKey(
        GalleryPlugin,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = FilerImageField(
        on_delete=models.CASCADE,
        related_name="gallery_images",
        verbose_name="Image"
    )
    caption = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Caption"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Order"
    )

    def __str__(self):
        return f"{self.gallery.title} - Image {self.order}"

    class Meta:
        ordering = ['order']
        verbose_name = "Gallery Image"
        verbose_name_plural = "Gallery Images"


class PeopleGridPlugin(BaseSlidePlugin):
    """
    Plugin 4: Staff profiles grid
    """
    title = models.CharField(
        max_length=200,
        verbose_name="Section Title",
        default="Our Team"
    )

    def __str__(self):
        return f"People Grid: {self.title}"

    class Meta:
        verbose_name = "People Grid"
        verbose_name_plural = "People Grids"


class Person(models.Model):
    """
    Related model for individual person entries
    """
    people_grid = models.ForeignKey(
        PeopleGridPlugin,
        on_delete=models.CASCADE,
        related_name="people"
    )
    name = models.CharField(
        max_length=200,
        verbose_name="Name"
    )
    photo = FilerImageField(
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="person_photos",
        verbose_name="Photo"
    )
    job_title = models.CharField(
        max_length=200,
        verbose_name="Job Title/Description"
    )
    profile_link = models.URLField(
        blank=True,
        verbose_name="Profile Link",
        help_text="Link to full profile page"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Order"
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['order']
        verbose_name = "Person"
        verbose_name_plural = "People"


class PeopleGridImage(models.Model):
    """
    Related model for standalone images in the people grid
    """
    people_grid = models.ForeignKey(
        PeopleGridPlugin,
        on_delete=models.CASCADE,
        related_name="extra_images"
    )
    image = FilerImageField(
        on_delete=models.CASCADE,
        related_name="people_grid_extra_images",
        verbose_name="Image"
    )
    caption = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Caption",
        help_text="Optional caption for the lightbox"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Order"
    )

    def __str__(self):
        return f"Image {self.order}"

    class Meta:
        ordering = ['order']
        verbose_name = "Grid Image"
        verbose_name_plural = "Grid Images"


class YouTubeEmbedPlugin(BaseSlidePlugin):
    """
    Plugin 5: Responsive YouTube video embed
    """
    video_title = models.CharField(
        max_length=200,
        verbose_name="Video Title"
    )
    youtube_id = models.CharField(
        max_length=50,
        verbose_name="YouTube Video ID",
        help_text="Enter the YouTube video ID (e.g., 'dQw4w9WgXcQ' from youtube.com/watch?v=dQw4w9WgXcQ)"
    )

    def __str__(self):
        return f"Video: {self.video_title}"

    def get_embed_url(self):
        """Generate the embed URL from the video ID"""
        return f"https://www.youtube.com/embed/{self.youtube_id}"

    class Meta:
        verbose_name = "YouTube Embed"
        verbose_name_plural = "YouTube Embeds"

class ModernSlidePlugin(BaseSlidePlugin):
    """
    Plugin for showing a grid of images with staggered animations
    """
    title = models.CharField(
        max_length=200,
        verbose_name="Slide Title",
        default="Modern Highlights"
    )

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Modern Grid Slide"
        verbose_name_plural = "Modern Grid Slides"


class ModernSlideItem(models.Model):
    """
    Individual items for the Modern Grid Slide
    """
    plugin = models.ForeignKey(
        ModernSlidePlugin,
        on_delete=models.CASCADE,
        related_name="items"
    )
    image = FilerImageField(
        on_delete=models.CASCADE,
        related_name="modern_slide_images",
        verbose_name="Image"
    )
    subtitle = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Subtitle/Label"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Order"
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.subtitle or f"Item {self.pk}"
