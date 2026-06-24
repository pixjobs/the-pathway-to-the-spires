# 🏛️ The Pathway to the Spires

> A strategic, self-aware, and highly practical companion roadmap and interactive platform guiding candidates through elite UK G5 (Oxbridge, Imperial, LSE, and UCL) admissions.

---

## 🚀 Overview

**The Pathway to the Spires** is a dual-track academic product:
1. **The Manuscript (`The_Pathway_to_the_Spires.docx`):** A deep-drafted, academic-grade strategic guidebook compiled from Year 7 up to Year 13 graduation.
2. **The Companion Web Application:** An interactive React & Vite dashboard featuring:
   * **Structured Timelines:** Categorized milestones tracking progression phases.
   * **Reactive Corpus Search:** Client-side, instant search indexing across the entire strategic text.
   * **Metacognitive Audits:** Interative, checklist-driven diagnostic checks for candidate self-reflection.
   * **Verified G5 Portals:** One-click official admissions portals with distinct tactical instructions for Oxford, Cambridge, Imperial, LSE, and UCL.

---

## 🛠️ System Architecture

* **Front-End:** React 18, Vite, Tailwind CSS.
* **Compiler Pipeline:** Python 3 + `python-docx` + `sentence-transformers` (RTX 4080 GPU semantic embeddings).
* **Deployment/Cloud Hosting:** Docker + Alpine Nginx multi-stage build, ready for serverless deployment on **Google Cloud Run**.

---

## ⚡ Getting Started Locally

### 1. Front-End Development (React + Vite)
Serve the interactive app with dynamic hot-reloading:
```bash
cd web-app
npm install
npm run dev -- --port 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run the Modular Compiler Pipeline (Python)
To compile a fresh book manuscript, generate local GPU sentence embeddings, and automatically update the React `data.json`:
```bash
# Activate your virtual environment and run the modular builder
source ~/ds-env/bin/activate
python3 modular_book_builder.py
```

---

## ☁️ Google Cloud Run Deployment

This project is fully containerized and pre-configured for **Google Cloud Run** using a lightweight multi-stage Docker + Alpine Nginx server.

To build and deploy your containerized app directly to GCP:

### 1. Build and Tag the Image (via Artifact Registry)
```bash
# Authenticate with gcloud
gcloud auth login

# Set your GCP Project ID
gcloud config set project YOUR_PROJECT_ID

# Build the Docker image using Google Cloud Build directly from the repository root
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/the-pathway-to-the-spires:latest
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy the-pathway-to-the-spires \
  --image gcr.io/YOUR_PROJECT_ID/the-pathway-to-the-spires:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```
*Cloud Run will automatically scale Nginx to zero when idle, making hosting practically free!*

---

## 📂 Repository Contents
```
oxbridge_guide/
├── README.md                           # Professional developer documentation
├── .gitignore                          # Standard git ignore definitions
├── modular_book_builder.py             # Local GPU modular book compilation script
├── build_guide.py                      # Sequential Gemini book builder script
├── The_Pathway_to_the_Spires.docx # Compiled Word Manuscript
└── web-app/                            # Vite React companion web application
    ├── Dockerfile                      # Production Cloud Run container build
    ├── nginx.conf.template             # Dynamic PORT template for Cloud Run Nginx
    ├── src/
    │   ├── data.json                   # Decoupled strategic content database
    │   ├── App.jsx                     # High-fidelity dashboard interface
    │   └── main.jsx
    └── package.json
```

---

*Produced with ❤️ by Yang (Imperial MBA Graduate) and your OpenClaw Assistant (June 2026).*
