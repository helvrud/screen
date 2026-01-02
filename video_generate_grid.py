import numpy as np
import textwrap
from moviepy import ImageClip, CompositeVideoClip, concatenate_videoclips, ColorClip
import moviepy.video.fx as vfx
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# --- Configuration & Paths ---
VIDEO_SIZE = (640, 480)  

# VIDEO_SIZE = (800, 600)  
# VIDEO_SIZE = (1920, 1200)

OUTPUT_FILE = "physchem_promo_final_grid.mp4"
TRANSITION_DURATION = 0.8
TEXT_FADE = 0.5

# Research Group Data
RESEARCH_GROUPS = [
    {"tit": "Biofyzikální chemie proteinových komplexů", "lead": "prof. Tomáš Obšil", "img": "images/obsil.jpg"},
    # Add other groups here as needed...
]

# --- Helper: Blurred Background ---
def make_blurred_bg(img_path, duration):
    img = Image.open(img_path).convert("RGB")
    bg = img.resize(VIDEO_SIZE).filter(ImageFilter.GaussianBlur(50)).point(lambda x: int(x * 0.5))
    return ImageClip(np.array(bg)).with_duration(duration)

# --- Helper: Text Graphic Generator ---
def create_text(text, fontsize=60, color="white", bgcolor=(0,0,0,160), width=1600):
    wrapped = textwrap.fill(text, width=40)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", fontsize)
    except:
        font = ImageFont.load_default()
    
    lines = wrapped.count('\n') + 1
    h = 150 + (lines * fontsize)
    img = Image.new("RGBA", (width, h), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, width, h], fill=bgcolor)
    draw.multiline_text((width/2, h/2), wrapped, font=font, fill=color, anchor="mm", align="center")
    return ImageClip(np.array(img))

# --- Fixed: "Sliding In" Researcher ---
def make_research_slide(group_info, duration=5.0):
    bg = ColorClip(size=VIDEO_SIZE, color=(255, 255, 255)).with_duration(duration)
    
    tit_clip = create_text(group_info["tit"], fontsize=70, bgcolor=(0,51,102,200))
    tit_clip = tit_clip.with_position(('center', 150)).with_duration(duration).with_effects([vfx.FadeIn(0.5)])
    
    # Pre-resize the image once to avoid zero-size errors during animation
    lead_img = ImageClip(group_info["img"]).resized(height=600).with_duration(duration-1).with_start(1)
    
    # FIX: Ensure the slider doesn't go to extreme values. 
    # We use (t-1) because the clip starts at t=1.
    def slide_pos(t):
        # Calculate progress from 0.0 to 1.0 starting from t=1
        elapsed = max(0, t - 1)
        # Slides from right (1920) to center (660ish)
        x_pos = max(660, 1920 - 1300 * elapsed)
        return (x_pos, 400)
    
    lead_img = lead_img.with_position(slide_pos)
    
    name_clip = create_text(group_info["lead"], fontsize=55, bgcolor=(200, 200, 200, 255), color="black")
    name_clip = name_clip.with_position(('center', 1050)).with_duration(duration-1).with_start(1.5).with_effects([vfx.FadeIn(0.5)])
    
    return CompositeVideoClip([bg, tit_clip, lead_img, name_clip], size=VIDEO_SIZE)

# --- Fixed: Grid Animation Logic ---
def make_grid_finale(image_paths, total_duration=8.0):
    COLS, ROWS = 4, 4
    CELL_W, CELL_H = VIDEO_SIZE[0] // COLS, VIDEO_SIZE[1] // ROWS
    ANIM_DUR = 0.8
    
    grid_clips = []
    for i, img_path in enumerate(image_paths[:16]):
        col, row = i % COLS, i // COLS
        target_x, target_y = col * CELL_W, row * CELL_H
        start_t = i * 0.3
        
        # Pre-resize initial large state
        orig_clip = ImageClip(img_path).resized(height=VIDEO_SIZE[1] * 0.7)
        start_x = (VIDEO_SIZE[0] - orig_clip.w) // 2
        start_y = (VIDEO_SIZE[1] - orig_clip.h) // 2
        
        # FIX: Instead of (-2000, -2000), we return a safe position (0,0) 
        # and rely on .with_start() to keep the clip hidden until needed.
        def pos_fn(t):
            if t < start_t: return (start_x, start_y)
            p = min(1.0, (t - start_t) / ANIM_DUR)
            return (start_x + (target_x - start_x) * p, start_y + (target_y - start_y) * p)

        def size_fn(t):
            if t < start_t: return 1.0
            p = min(1.0, (t - start_t) / ANIM_DUR)
            target_scale = CELL_H / (VIDEO_SIZE[1] * 0.7)
            # Ensure scale never hits exactly 0
            return max(0.01, 1.0 + (target_scale - 1.0) * p)

        animated = (orig_clip.with_start(start_t)
                    .with_duration(total_duration - start_t)
                    .with_position(pos_fn)
                    .with_effects([vfx.Resize(size_fn)]))
        grid_clips.append(animated)
        
    bg = ColorClip(size=VIDEO_SIZE, color=(20, 20, 20)).with_duration(total_duration)
    return CompositeVideoClip([bg] + grid_clips, size=VIDEO_SIZE)
def make_cumulative_grid_finale(image_paths):
    # --- 1. SETTINGS & TIMING ---
    COLS, ROWS = 4, 4
    CELL_W, CELL_H = VIDEO_SIZE[0] // COLS, VIDEO_SIZE[1] // ROWS
    
    # --- STRICT TIMING (Local Clip Time) ---
    STAY_BIG = 1.5   # Time spent in center
    FLY_DUR = 1.0    # Time spent moving
    INTERVAL = 2.5   # Appearance gap (STAY_BIG + FLY_DUR ensures no center overlap)
    HOLD_TIME = 5.0  # How long to stay on the full grid after the last image lands

    # --- 2. DYNAMIC DURATION CALCULATION ---
    num_images = len(image_paths[:16])
    if num_images == 0:
        return ColorClip(size=VIDEO_SIZE, color=(0,0,0)).with_duration(1)
        
    # The last image starts at (num-1 * INTERVAL) and takes (STAY+FLY) to land
    # Total = Last Start + Animation Duration + Final Hold
    total_dur = ((num_images - 1) * INTERVAL) + STAY_BIG + FLY_DUR + HOLD_TIME
    
    print(f"🎬 Finale calculated: {num_images} images will take {total_dur:.2f} seconds.")

    grid_clips = []
    
    for i, img_path in enumerate(image_paths[:16]):
        # 1. Capture UNIQUE grid coordinates (i // COLS is correct for rows)
        col = i % COLS
        row = i // COLS
        target_x = col * CELL_W
        target_y = row * CELL_H
        
        # 2. Timing (Global start time for the video timeline)
        global_start = i * INTERVAL
        
        # 3. Load and Prepare
        # We pre-resize the 'Big' version here
        clip = ImageClip(img_path).resized(height=VIDEO_SIZE[1] * 0.7)
        
        center_x = (VIDEO_SIZE[0] - clip.w) // 2
        center_y = (VIDEO_SIZE[1] - clip.h) // 2
        
        # Target scale to fit the grid cell (relative to the 0.7 height)
        target_scale_h = CELL_H / (VIDEO_SIZE[1] * 0.7)

        # 4. Position Function (Using local 't' starting at 0)
        # We use default arguments (tx=target_x) to freeze values for each loop iteration
        def pos_fn(t, tx=target_x, ty=target_y, cx=center_x, cy=center_y):
            # If time is within the 'Stay' period
            if t < STAY_BIG:
                return (cx, cy)
            # Flying period
            p = min(1.0, (t - STAY_BIG) / FLY_DUR)
            return (cx + (tx - cx) * p, cy + (ty - cy) * p)

        # 5. Size Function (Using local 't')
        def size_fn(t, th=target_scale_h):
            if t < STAY_BIG:
                return 1.0
            p = min(1.0, (t - STAY_BIG) / FLY_DUR)
            return 1.0 + (th - 1.0) * p

        # 6. Apply to Clip
        animated = (clip.with_start(global_start)
                    .with_duration(total_dur - global_start)
                    .with_position(pos_fn)
                    .with_effects([
                        vfx.FadeIn(0.3), # Smooth appearance in center
                        vfx.Resize(size_fn)
                    ]))
        
        grid_clips.append(animated)
        
    # Background must match the calculated total_dur
    bg = ColorClip(size=VIDEO_SIZE, color=(0, 0, 0)).with_duration(total_dur)
    
    return CompositeVideoClip([bg] + grid_clips, size=VIDEO_SIZE)


def generate_intro():
    global clips
    # 1. Intro
    clips.append(CompositeVideoClip([
        ImageClip("images/hlavova8.jpg").resized(height=1200).with_duration(3),
        create_text("Katedra fyzikální a\nmakromolekulární chemie", fontsize=90).with_position('center').with_duration(3)
    ]).with_effects([vfx.FadeOut(0.5)]))

def generate_history():
    global clips

    # 2. History
    for img, txt in [("images/3a.jpg", "Katedru fyzikální chemie založil 1921..."), 
                     ("images/3b.jpg", "Známý pro svůj objev polarografie…"), 
                     ("images/3c.jpg", "...Nobelova cena 1959.")]:
        bg = make_blurred_bg(img, 4)
        main = ImageClip(img).resized(height=900).with_position('center').with_duration(4)
        txt_c = create_text(txt).with_position(('center', 1000)).with_duration(4)
        clips.append(CompositeVideoClip([bg, main, txt_c]).with_effects([vfx.FadeIn(0.5), vfx.FadeOut(0.5)]))
def generate_labs():
    global clips
    # 3. Fast Lab Montage
    labs = [
        "images/lab1.jpg", 
        # "images/lab2.jpg", 
        # "images/lab3.jpg", 
        # "images/lab4.jpg", 
        "images/lab5.jpg"]
    clips.append(concatenate_videoclips([ImageClip(p).resized(height=1200).with_duration(0.6) for p in labs]))
def generate_awards():
    global clips
    # 4. Awards
    for img, txt in [("images/shamzy_neuron_2.jpg", "Maria Shamzy – Cena Neuron")]:
        clips.append(CompositeVideoClip([make_blurred_bg(img, 4), 
                     ImageClip(img).resized(height=900).with_position('center'),
                     create_text(txt).with_position(('center', 1000))], size=VIDEO_SIZE).with_duration(4))


def generate_groups():
    global clips
    # 5. Research Groups
    clips.append(CompositeVideoClip([ColorClip(size=VIDEO_SIZE, color=(0,0,0)).with_duration(2), 
                 create_text("Naše výzkumné skupiny", fontsize=80).with_position('center')], size=VIDEO_SIZE).with_duration(2))
    for group in RESEARCH_GROUPS:
        clips.append(make_research_slide(group))

def generate_video():
    clips = []

    # generate_intro()
    # generate_history()
    # generate_labs()
    # generate_awards()
    # generate_groups()


    # 6. GRAND FINALE: Cumulative Fly-to-Grid
    # Fill this list with your 16 filenames
    final_people = ["images/person_JC.jpg", 
                    "images/person_FU.jpg", 
                    "images/person_MO.jpg", 
                    "images/person_MS.jpg", 
                    "images/person_JP.jpg"] 
    # If you have 16, it will fill the 4x4 grid perfectly.
    
    clips.append(make_cumulative_grid_finale(final_people))

    # 7. Final CTA 
    final_bg = ColorClip(size=VIDEO_SIZE, color=(0,51,102)).with_duration(5)
    cta_txt = create_text("PŘIDEJTE SE K NÁM\nphyschem.cz", fontsize=100, bgcolor=(0,0,0,0)).with_position('center').with_duration(5)
    clips.append(CompositeVideoClip([final_bg, cta_txt]))

    # Render
    final_video = concatenate_videoclips(clips, method="compose", padding=-0.5)
    
    print("🚀 Rendering with 16 threads...")
    final_video.write_videofile(
        OUTPUT_FILE,
        fps=30, 
        codec="libx264", 
        audio=False,
        threads=16,           # Using all 16 processors
        preset="ultrafast",
        ffmpeg_params=["-crf", "18"]
    )
    
if __name__ == "__main__":
    generate_video()
