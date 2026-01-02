# PhysChem Department Presentation

A web-based presentation for the Department of Physical and Macromolecular Chemistry at Charles University.

## Features

- **Smooth Transitions**: Powered by GSAP (GreenSock Animation Platform).
- **Interactive Slides**: Includes history timelines, modern research highlights, and department people.
- **Video Integration**: Integrated YouTube player for promotional videos.
- **Responsive Layout**: Designed to look great on various screen sizes.

## Project Structure

- `index.html`: The main entry point for the presentation.
- `style.css`: Custom styling for all slides and elements.
- `main.js`: Core logic for slide sequencing and navigation.
- `*-slide.js`: Specific logic and data for individual slides (Intro, History, Video, Modern, People).

## How to Run

Simply open `index.html` in a modern web browser. For the best experience, including YouTube video playback, it is recommended to serve the directory using a local web server:

```bash
# Example using Python's built-in server
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Assets

- `person_*.jpg`: Photos of department members.
- `heyrovsky*.jpg`: Historical photos related to Jaroslav Heyrovský.
- `lab*.2000px.jpg`: Optimized laboratory and research photos.

## Controls

- **Next Slide**: `Arrow Right` or `Space`
- **Previous Slide**: `Arrow Left`
- **Navigation Arrows**: On-screen arrows for mouse/touch interaction.
