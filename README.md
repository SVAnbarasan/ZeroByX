<p align="center">
  <img src="frontend/public/zbx_logo.png" alt="ZeroByX Logo" width="300"/>
</p>

# 🔐 ZeroByX — Cybersecurity Specialized LLM

ZeroByX is an advanced cybersecurity-focused Large Language Model project, purpose-built for threat intelligence, incident response, penetration testing, and more. Powered by a fine-tuned **Mistral model**, it leverages **response ensembling**, **OSINT scraping**, and **command-based utilities** to provide actionable and real-time results for security professionals.

---

## 🚀 Features

- 🧠 **LLM-Ensembled Reasoning** – Smart multi-layer response aggregation.
- 🌐 **Live Intelligence** – Internet scraping via **DeepSeek-R1**.
- 🧩 **Ollama Integration** – Local LLM inference for privacy and performance.
- 🛠️ **Modular Commands** for:
  - `/cve` – Common Vulnerabilities & Exposures
  - `/exploitdb` – Exploit Database Search
  - `/apt` – APT (Advanced Persistent Threat) Profiles
  - `/ioc` – Indicators of Compromise
  - `/pentest` – Pentesting Techniques and Tools
  - `/ir`, `/dfir`, `/cloudsec`, `/governance`, and more...

---

## 📦 Tech Stack

- **Frontend:** Next.js + Vite
- **Backend / DB:** Supabase
- **LLMs:** Fine-tuned Mistral + Ollama (local)
- **Scraper Model:** DeepSeek-R1
- **Deployment:** Local / Web-based (self-hosted)

---

## 💻 Setup Instructions

> ⚠️ Prerequisites: Node.js, Python 3.x, Ollama installed locally, Supabase project setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/zerobyx.git
cd zerobyx
```

# ZeroCybernet

A modern full-stack project with a Python backend and a React (TypeScript) frontend.

## Project Structure

```
zerocybernet/
  backend/      # Python backend code
  frontend/     # React frontend code
  supabase/     # Supabase config
  ...           # Project-level files
```

## Getting Started

### Backend

1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. (Optional) Create a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run the backend server (example):
   ```sh
   python server.py
   ```

### Frontend

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Additional Notes
- Update `backend/requirements.txt` with your Python dependencies.
- Environment variables can be set in a `.env` file (not committed).
- See `frontend/README.md` and `backend/README.md` for more details.
