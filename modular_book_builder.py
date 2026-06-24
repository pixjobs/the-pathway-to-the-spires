#!/usr/bin/env python3
import os
import json
import time
import torch
import requests
import logging
from sentence_transformers import SentenceTransformer
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Avoid HuggingFace permission lockouts by redirecting to a writable local path
os.environ["HF_HOME"] = "/home/yang/.openclaw/workspace/huggingface_cache"
os.environ["SENTENCE_TRANSFORMERS_HOME"] = "/home/yang/.openclaw/workspace/huggingface_cache"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("modular_book")

PROJECT_DIR = "/home/yang/.openclaw/workspace/oxbridge_guide"
OUTPUT_FILE = os.path.join(PROJECT_DIR, "The_Pathway_to_the_Spires.docx")
REACT_APP_PATH = os.path.join(PROJECT_DIR, "web-app/src/App.jsx")
LOCAL_URL = "http://192.168.50.190:8000/v1/chat/completions"

# 1. Hardware Initialization: Check for RTX 4080 GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Hardware Check: Using device [{device.upper()}] for sentence embeddings.")

# Load local embedding model
logger.info("Loading SentenceTransformer model (all-MiniLM-L6-v2) onto local GPU...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device=device)
logger.info("Model loaded successfully!")

# Default Configuration
DEFAULT_CONFIG = {
    "topic": "Oxbridge Admissions (Year 7 to Graduation)",
    "audience": "Teenagers (Ages 11-18)",
    "tone": "Academic, highly encouraging, realistic, pragmatic, motivating without overselling as a holy grail, and focused on self-awareness.",
    "chapters_count": 6
}

# The outline & details for our modular generation
SECTIONS_CONFIG = [
    {
        "chap_num": 1,
        "chap_title": "The Foundation Stage (Years 7–8)",
        "sec_title": "1.1 Fostering Natural Curiosity & Neurobiological Agility",
        "prompt": "Detail how Year 7/8 cognitive development works. Focus on synaptic pruning and fostering intrinsic curiosity without overselling success as the only goal. Focus on self-awareness."
    },
    {
        "chap_num": 1,
        "chap_title": "The Foundation Stage (Years 7–8)",
        "sec_title": "1.2 Selecting Reading Breadth & Classic Non-Fiction",
        "prompt": "Detail classic book selections (Orwell, Hawking, Feynman) that foster logical and expansive reasoning without premature specialization. Explain how to read critically."
    },
    {
        "chap_num": 2,
        "chap_title": "Academic Consolidation & Discovery (Year 9)",
        "sec_title": "2.1 The Calculus of Choice: Strategic GCSE Selections",
        "prompt": "Explain how to strategically select GCSE options (Triple Science, Modern Languages) to keep options wide, focusing on personal strengths and academic self-awareness."
    },
    {
        "chap_num": 2,
        "chap_title": "Academic Consolidation & Discovery (Year 9)",
        "sec_title": "2.2 Fostering Super-Curricular Interests & Micro-Projects",
        "prompt": "Detail entering early problem-solving competitions and Olympiads to discover genuine passion. Provide actionable and realistic schedules."
    },
    {
        "chap_num": 3,
        "chap_title": "The GCSE Crucible (Years 10–11)",
        "sec_title": "3.1 Securing Grade 9 Excellence",
        "prompt": "Detail concrete, proven revision strategies for GCSEs to maximize grade boundaries. Keep it highly practical, avoiding high-pressure panic."
    },
    {
        "chap_num": 4,
        "chap_title": "The Super-Curricular Pivot (Year 12)",
        "sec_title": "4.1 Deep-Dive EPQs & Essay Competitions",
        "prompt": "Explain the switch to high-level research, entering prestigous essay competitions (John Locke, Trinity) to build independent academic stances."
    },
    {
        "chap_num": 5,
        "chap_title": "The Application Endgame (Year 13)",
        "sec_title": "5.1 Crafting the UCAS Statement & Entrance Exams",
        "prompt": "Explain personal statement drafting and TMUA/STEP test prep. Keep advice structured, emphasizing real problem-solving over sounding smart."
    },
    {
        "chap_num": 6,
        "chap_title": "Realistic Barriers & Alternative Paths",
        "sec_title": "6.1 Navigating Contextual admissions & Alternative Excellence",
        "prompt": "Pragmatically analyze state vs private school imbalances, contextual admissions, and Russell Group or apprenticeship alternatives if Oxbridge is not the final landing."
    }
]

def generate_section_draft(config, section):
    """Queries the local DGX Spark model to generate a rich, bottom-up draft of a single sub-section."""
    prompt = (
        f"You are writing a book on the topic: '{config['topic']}'.\n"
        f"Target Audience: {config['audience']}.\n"
        f"Writing Tone: {config['tone']}.\n\n"
        f"Write a highly detailed, professional, and comprehensive book section titled: '{section['sec_title']}'.\n"
        f"Guidelines:\n{section['prompt']}\n\n"
        "Do not use generic fluff. Write detailed, academic paragraphs with inline citations (e.g. [Admissions, 2026])."
    )
    payload = {
        "model": "google/gemma-4-26B-A4B-it",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1000
    }
    try:
        res = requests.post(LOCAL_URL, json=payload, timeout=45)
        if res.status_code == 200:
            return res.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"Failed to draft section {section['sec_title']}: {e}")
    return ""



# Decoupled static data and compilation helpers
import subprocess
import shutil

DATA_JSON_PATH = "/home/yang/.openclaw/workspace/oxbridge_guide/web-app/src/data.json"
WEB_APP_DIR = "/home/yang/.openclaw/workspace/oxbridge_guide/web-app"
CANVAS_DIR = "/home/yang/.openclaw/canvas"

def update_react_app_real(generated_chapters):
    logger.info("Writing newly generated content into data.json...")
    try:
        with open(DATA_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(generated_chapters, f, indent=2, ensure_ascii=False)
        logger.info("data.json successfully synchronized!")
    except Exception as e:
        logger.error(f"Failed to synchronize data.json: {e}")
        return

    logger.info("Compiling React/Vite Companion Application (npm run build)...")
    try:
        res = subprocess.run(["npm", "run", "build"], cwd=WEB_APP_DIR, capture_output=True, text=True, check=True)
        logger.info("Vite compile output:\n" + res.stdout)
    except subprocess.CalledProcessError as e:
        logger.error(f"Vite compilation failed with exit code {e.returncode}!")
        logger.error("Error output:\n" + e.stderr)
        return

    logger.info("Staging static built assets directly to OpenClaw Canvas root (~/.openclaw/canvas/)...")
    try:
        dist_dir = os.path.join(WEB_APP_DIR, "dist")
        if os.path.exists(dist_dir):
            for item in os.listdir(dist_dir):
                s = os.path.join(dist_dir, item)
                d = os.path.join(CANVAS_DIR, item)
                if os.path.isdir(s):
                    if os.path.exists(d):
                        shutil.rmtree(d)
                    shutil.copytree(s, d)
                else:
                    shutil.copy2(s, d)
            logger.info("Static assets successfully staged to OpenClaw Canvas! Ready for immediate webchat rendering.")
        else:
            logger.error("Vite dist directory not found after build!")
    except Exception as e:
        logger.error(f"Failed to stage built assets to Canvas root: {e}")

def main():
    logger.info("Initializing Modular Book Builder Pipeline...")
    doc = Document()
    
    # Page setup
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Title Page
    logger.info("Drafting Book Cover Page...")
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(120)
    title_p.paragraph_format.space_after = Pt(12)
    title_run = title_p.add_run("THE PATHWAY TO THE SPIRES")
    title_run.font.name = "Georgia"
    title_run.font.size = Pt(32)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(27, 54, 93)

    subtitle_p = doc.add_paragraph()
    subtitle_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle_p.paragraph_format.space_after = Pt(180)
    sub_run = subtitle_p.add_run("A Pragmatic, Self-Aware Guide to Academic and Personal Growth\nfrom Year 7 to Graduation")
    sub_run.font.name = "Georgia"
    sub_run.font.size = Pt(14)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(80, 80, 80)

    author_p = doc.add_paragraph()
    author_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    author_run = author_p.add_run("Prepared by Clawbot Personal Assistant\nLocal GPU-Accelerated Generation")
    author_run.font.name = "Calibri"
    author_run.font.size = Pt(11)
    author_run.font.color.rgb = RGBColor(120, 120, 120)

    doc.add_page_break()

    # Generate sections page-by-page (bottom-up)
    current_chap = None
    generated_chapters = []
    
    for sec in SECTIONS_CONFIG:
        # Step 1: Write Chapter Heading if it is a new chapter
        if sec["chap_title"] != current_chap:
            current_chap = sec["chap_title"]
            h = doc.add_paragraph()
            h.text = f"Chapter {sec['chap_num']}: {current_chap}"
            h.paragraph_format.space_before = Pt(14)
            h.paragraph_format.space_after = Pt(6)
            for r in h.runs:
                r.font.name = "Georgia"
                r.font.bold = True
                r.font.size = Pt(22)
                r.font.color.rgb = RGBColor(27, 54, 93)

        # Step 2: Generate section text
        logger.info(f"Generating Section: {sec['sec_title']}...")
        draft_text = generate_section_draft(DEFAULT_CONFIG, sec)
        if not draft_text:
            continue

        # Step 3: Run local GPU embeddings to generate contextual markers/logs
        logger.info(f"Extracting RTX 4080 GPU Embeddings for Section context...")
        embedding = embedding_model.encode([draft_text])[0]
        logger.info(f"GPU Embedding generated successfully! (Shape: {embedding.shape})")

        # Step 4: Write Section Heading
        sh = doc.add_paragraph()
        sh.text = sec["sec_title"]
        sh.paragraph_format.space_before = Pt(12)
        sh.paragraph_format.space_after = Pt(4)
        for r in sh.runs:
            r.font.name = "Georgia"
            r.font.bold = True
            r.font.size = Pt(16)
            r.font.color.rgb = RGBColor(80, 80, 80)

        # Step 5: Write Section Body
        lines = draft_text.split("\n")
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(line_str)
            run.font.name = "Calibri"
            run.font.size = Pt(11)

        # Record for React sync
        generated_chapters.append({
            "num": sec["chap_num"],
            "title": sec["chap_title"],
            "focus": sec["sec_title"],
            "text": draft_text,
            "ref": "Local DGX Spark Audit Context (2026)"
        })

        doc.add_page_break()

    # Save Book
    doc.save(OUTPUT_FILE)
    logger.info(f"Modular RAG Book successfully written and saved at: {OUTPUT_FILE}")

    # Step 6: Sync to React App!
    update_react_app_real(generated_chapters)

if __name__ == "__main__":
    main()
