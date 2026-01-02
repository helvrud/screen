import numpy as np
import textwrap
from moviepy import ImageClip, CompositeVideoClip, concatenate_videoclips, ColorClip
import moviepy.video.fx as vfx
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# --- Configuration & Paths ---
VIDEO_SIZE = (1920, 1200)  # 16:10 aspect ratio for huge screens [cite: 5, 6]
OUTPUT_FILE = "physchem_promo_final.mp4"
TRANSITION_DURATION = 0.8
TEXT_FADE = 0.5

# Group researcher data from your screenplay [cite: 17-30]
RESEARCH_GROUPS = [
    {"tit": "Biofyzikální chemie proteinových komplexů", "lead": "prof. Tomáš Obšil", "img": "obsil.jpg"},
    # {"tit": "Chromatografické metody", "lead": "doc. Květa Kalíková", "img": "kalikova.jpg"},
    # {"tit": "Heterogenní katalýza a pokročilé materiály", "lead": "prof. Jiří Čejka", "img": "cejka.jpg"},
    # {"tit": "Modelování (nano)materiálů", "lead": "doc. Lukáš Grajciar & doc. Christopher Heard", "img": "modeling.jpg"},
    # {"tit": "Polymerní syntéza a biomateriály", "lead": "doc. Ondřej Sedláček", "img": "sedlacek_o.jpg"},
    # {"tit": "Porézní polymery", "lead": "doc. Jan Sedláček", "img": "sedlacek_j.jpg"},
    # {"tit": "Soft matter", "lead": "prof. Miroslav Štěpánek", "img": "stepanek.jpg"},
    # {"tit": "Soft matter teorie", "lead": "prof. Filip Uhlík", "img": "uhlik.jpg"},
    # {"tit": "Makromolekulové modelování", "lead": "doc. Peter Košovan", "img": "kosovan.jpg"},
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
    
    # Dynamic height based on text lines
    lines = wrapped.count('\n') + 1
    h = 150 + (lines * fontsize)
    img = Image.new("RGBA", (width, h), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, width, h], fill=bgcolor)
    draw.multiline_text((width/2, h/2), wrapped, font=font, fill=color, anchor="mm", align="center")
    return ImageClip(np.array(img))

# --- Scene Type: "Sliding In" Researcher  ---
def make_research_slide(group_info, duration=5.0):
    bg = ColorClip(size=VIDEO_SIZE, color=(255, 255, 255)).with_duration(duration)
    
    # 1. Group Title (appears first)
    tit_clip = create_text(group_info["tit"], fontsize=70, bgcolor=(0,51,102,200)) # Dept Blue
    tit_clip = tit_clip.with_position(('center', 150)).with_duration(duration).with_effects([vfx.FadeIn(0.5)])
    
    # 2. Researcher Photo (Slides in from Right)
    lead_img = ImageClip(group_info["img"]).resized(height=600).with_duration(duration-1).with_start(1)
    # Animation: starts off-screen right, slides to center
    lead_img = lead_img.with_position(lambda t: (max(600, 1920 - 1300*t), 400))
    
    # 3. Researcher Name (appears with photo)
    name_clip = create_text(group_info["lead"], fontsize=55, bgcolor=(200, 200, 200, 255), color="black")
    name_clip = name_clip.with_position(('center', 1050)).with_duration(duration-1).with_start(1.5).with_effects([vfx.FadeIn(0.5)])
    
    return CompositeVideoClip([bg, tit_clip, lead_img, name_clip], size=VIDEO_SIZE)

# --- Main Assembly ---
def generate_video():
    clips = []

    # 1. Intro: Building [cite: 5-6]
    intro_img = ImageClip("hlavova8.jpg").resized(height=1200).with_duration(3)
    intro_txt = create_text("Katedra fyzikální a\nmakromolekulární chemie", fontsize=90).with_position('center').with_duration(3)
    clips.append(CompositeVideoClip([intro_img, intro_txt]).with_effects([vfx.FadeOut(0.5)]))

    # 2. History: Heyrovský [cite: 8-10]
    history_scenes = [
        ("3a.jpg", "Katedru fyzikální chemie založil v roce 1921 prof. Jaroslav Heyrovský…"),
        ("3b.jpg", "Známý pro svůj objev polarografie…"),
        ("3c.jpg", "… za který mu byla v roce 1959 udělena Nobelova cena za chemii.")
    ]
    for img, txt in history_scenes:
        bg = make_blurred_bg(img, 5)
        main = ImageClip(img).resized(height=900).with_position('center').with_duration(5)
        txt_c = create_text(txt).with_position(('center', 1000)).with_duration(5)
        clips.append(CompositeVideoClip([bg, main, txt_c]).with_effects([vfx.FadeIn(0.5), vfx.FadeOut(0.5)]))

    # 3. Action Montage: Fast paced labs [cite: 13]
    lab_photos = ["lab1.jpg", "lab2.jpg", "lab3.jpg", "lab4.jpg", "lab5.jpg"]
    montage = [ImageClip(p).resized(height=1200).with_duration(0.8).with_effects([vfx.FadeIn(0.1)]) for p in lab_photos]
    clips.append(concatenate_videoclips(montage))

    # 4. Awards [cite: 14-16]
    award_imgs = [
        # ("eliasova_neuron.jpg", "Pavla Eliášová – Cena Neuron"), 
        ("shamzy_neuron_2.jpg", "Maria Shamzy – Cena Neuron")]
    for img, txt in award_imgs:
        clips.append(CompositeVideoClip([make_blurred_bg(img, 4), 
                     ImageClip(img).resized(height=900).with_position('center'),
                     create_text(txt).with_position(('center', 1000))], size=VIDEO_SIZE).with_duration(4))

    # 5. Research Groups [cite: 17-30]
    clips.append(CompositeVideoClip([ColorClip(size=VIDEO_SIZE, color=(0,0,0)).with_duration(2), 
                                     create_text("Představujeme naše výzkumné skupiny", fontsize=80).with_position('center')], size=VIDEO_SIZE).with_duration(2))
    for group in RESEARCH_GROUPS:
        clips.append(make_research_slide(group))

    # 6. Final Accelerating Montage 
    final_people = ["person_JC.jpg", "person_FU.jpg", "person_MO.jpg", "person_MS.jpg", "person_JP.jpg"]
    accel_clips = []
    for i, p in enumerate(final_people):
        dur = max(0.2, 1.0 - (i * 0.15)) # Gets faster
        accel_clips.append(ImageClip(p).resized(height=1200).with_duration(dur))
    clips.append(concatenate_videoclips(accel_clips))

    # 7. Final CTA 
    final_bg = ColorClip(size=VIDEO_SIZE, color=(0,51,102)).with_duration(5) # University Blue
    cta_txt = create_text("PŘIDEJTE SE K NÁM\nphyschem.cz", fontsize=100, bgcolor=(0,0,0,0)).with_position('center').with_duration(5)
    clips.append(CompositeVideoClip([final_bg, cta_txt]))

    # Render
    final_video = concatenate_videoclips(clips, method="compose", padding=-0.5)
    # final_video.write_videofile(OUTPUT_FILE, fps=30, codec="libx264")
    final_video.write_videofile(
                OUTPUT_FILE,
                fps=30, 
                codec="libx264", 
                audio=False,
                threads=10,           # <--- Involves all 16 processors
                preset="ultrafast"    # <--- Optional: speeds up encoding further at the cost of file size
            )
if __name__ == "__main__":
    generate_video()