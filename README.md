# 📚 Smart Study Planner Pro

An intelligent, interactive, and beautifully designed study scheduling application engineered for college students and hackathons. Built entirely using **Python and Streamlit**, it calculates optimized workloads, models daily study slots, visualizes hour distribution, and provides automated, telemetry-free AI study tips and milestone tracking.

---

## ✨ Features

- **🎯 Tailored Dynamic Schedules**: Input custom names, subjects, and study availability to render personalized syllabus plans immediately.
- **📊 Interactive Metrics and Visualizations**:
  - Countdown metrics for **Days Left** and **Total Clock Hours**.
  - Custom responsive donut charts illustrating custom workload distributions.
- **🥇 Multi-Subject Milestone Progress Tracker**: Dedicated checkbox progress logger to mark off chapters per subject and observe dynamic, animated completion status.
- **💡 Custom Rule-Based AI Study Tips**: Generates dynamic pedagogical hacks adapted to your academic density and days-to-exam stress levels.
- **📥 Dual-Format Data Export**: Instantly export customized planner tables into:
  - **CSV** files for offline analysis.
  - Formatted **Excel (.xlsx)** spreadsheets.

---

## 🛠️ Installation & Setup (Local Development)

Execute the following exact sequential commands inside your terminal (e.g., VS Code or PowerShell) to boot the local study planner instance:

### 1. Create Python Virtual Environment
```bash
# Windows / PowerShell / Command Prompt / macOS / Linux
python -m venv venv
```

### 2. Activate Virtual Environment

**On Windows PowerShell:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\venv\Scripts\Activate.ps1
```

**On Standard Command Prompt (cmd):**
```cmd
.\venv\Scripts\activate.bat
```

**On Linux / macOS Bash Terminal:**
```bash
source venv/bin/activate
```

### 3. Install Required Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Streamlit Application
```bash
streamlit run app.py
```

---

## 🚀 Deployment Instructions (Streamlit Community Cloud)

Get a permanent, live URL for your hackathon judges in under 2 minutes:

1. Push your project files (`app.py`, `requirements.txt`, etc.) to a public **GitHub** repository.
2. Visit [Streamlit Community Cloud](https://share.streamlit.io/) and click **Sign in with GitHub**.
3. Click the **New App** button on your home dashboard.
4. Paste your repository link address, choose the branch (e.g. `main`), and set the main file path as `app.py`.
5. Click **Deploy!** Your app will build and transition to a permanent sharing link.

---

## 📁 Git Setup Commands (Publishing to GitHub)

Sync your local folder directly to your GitHub account:

```bash
# Step 1: Initialize Git
git init

# Step 2: Add all source code
git add .

# Step 3: Commit files
git commit -m "feat: initial commit for Smart Study Planner Pro"

# Step 4: Add remote link and push (replace user/repo with your actual link)
git branch -M main
git remote add origin https://github.com/yourusername/smart-study-planner-pro.git
git push -u origin main
```

---

## 🎨 Application Screenshots

> *Below are placeholders representing the application interface when loaded on local or cloud systems.*

### 🖥️ Sidebar Customizer and Main Visual Board
![Planner Panel Placeholder](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200)

---

## 📐 Project File Structure

```text
SmartStudyPlannerPro/
│
├── app.py           # Core Streamlit scheduling, analytics and visual engine
├── requirements.txt # Declared third-party operational packages
├── README.md        # Comprehensive technical workspace description
└── .gitignore       # Exclusion filters for runtime and environment files
```

---
*Created by **Alex Mercer** as a professional submission for the College Academic Hackathon.*
