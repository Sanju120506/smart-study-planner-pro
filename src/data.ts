export const RAW_DEPENDENCIES = `streamlit>=1.38.0
pandas>=2.1.0
matplotlib>=3.8.0
openpyxl>=3.1.0`;

export const RAW_README = `# 📚 Smart Study Planner Pro

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
\`\`\`bash
# Windows / PowerShell / Command Prompt / macOS / Linux
python -m venv venv
\`\`\`

### 2. Activate Virtual Environment

**On Windows PowerShell:**
\`\`\`powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\\\\venv\\\\Scripts\\\\Activate.ps1
\`\`\`

**On Standard Command Prompt (cmd):**
\`\`\`cmd
.\\\\venv\\\\Scripts\\\\activate.bat
\`\`\`

**On Linux / macOS Bash Terminal:**
\`\`\`bash
source venv/bin/activate
\`\`\`

### 3. Install Required Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Run the Streamlit Application
\`\`\`bash
streamlit run app.py
\`\`\`

---

## 🚀 Deployment Instructions (Streamlit Community Cloud)

Get a permanent, live URL for your hackathon judges in under 2 minutes:

1. Push your project files (\`app.py\`, \`requirements.txt\`, etc.) to a public **GitHub** repository.
2. Visit [Streamlit Community Cloud](https://share.streamlit.io/) and click **Sign in with GitHub**.
3. Click the **New App** button on your home dashboard.
4. Paste your repository link address, choose the branch (e.g. \`main\`), and set the main file path as \`app.py\`.
5. Click **Deploy!** Your app will build and transition to a permanent sharing link.

---

## 📁 Git Setup Commands (Publishing to GitHub)

Sync your local folder directly to your GitHub account:

\`\`\`bash
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
\`\`\`
`;

export const RAW_APP_PY = `# -*- coding: utf-8 -*-
"""
Smart Study Planner Pro
Streamlit App Entry Point
Suitable for College Hackathon Submission
"""

import streamlit as st
import pandas as pd
import datetime
import matplotlib.pyplot as plt
import io

# Set page configuration with standard aesthetic defaults
st.set_page_config(
    page_title="Smart Study Planner Pro",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom injection of styled CSS for standard material look and cards
st.markdown("""
    <style>
    .metric-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        text-align: center;
        border-top: 5px solid #4f46e5;
    }
    .metric-num {
        font-size: 32px;
        font-weight: 800;
        color: #4f46e5;
        margin-top: 8px;
    }
    .metric-label {
        font-size: 14px;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
    }
    .main-header {
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        color: #1e293b;
    }
    </style>
""", unsafe_allow_html=True)

# App Logo / Title Banner
st.markdown("<h1 class='main-header'>📚 Smart Study Planner Pro</h1>", unsafe_allow_html=True)
st.markdown("*Your ultimate AI-powered preparation companion for modern collegiate success.*")
st.write("---")

# Initialize Session States for calculations
if "plan_generated" not in st.session_state:
    st.session_state.plan_generated = False
if "progress_logs" not in st.session_state:
    st.session_state.progress_logs = {}

# Sidebar inputs
st.sidebar.header("🛠️ Personalized Planner Setup")

student_name = st.sidebar.text_input("👤 Student Name", value="Alex Mercer")
subjects_raw = st.sidebar.text_input(
    "📖 Subjects of Interest", 
    value="Data Structures, Database Systems, Computer Networks, Operating Systems"
)

# Validate and clean subjects
subjects = [s.strip() for s in subjects_raw.split(",") if s.strip()]

# Exam Date Picker
default_exam_date = datetime.date.today() + datetime.timedelta(days=14)
exam_date = st.sidebar.date_input("📅 Target Exam Date", value=default_exam_date)

# Study Time Slider
hours_per_day = st.sidebar.number_input(
    "⏱️ Daily Study Hours Available", 
    min_value=0.5, 
    max_value=16.0, 
    value=4.0, 
    step=0.5
)

generate_btn = st.sidebar.button("⚡ Generate Customized Study Plan", use_container_width=True)

# Perform basic validation checks and calculations
today = datetime.date.today()
days_left = (exam_date - today).days

# Main execution panel
if generate_btn or st.session_state.plan_generated:
    st.session_state.plan_generated = True
    
    if not student_name:
        st.error("⚠️ Please specify your name in the sidebar setup panel.")
    elif len(subjects) == 0:
        st.error("⚠️ Please insert at least one academic subject to begin planning.")
    elif days_left < 1:
        st.warning("⚠️ Target exam date must be in the future!")
    else:
        st.success(f"🎉 Welcome, {student_name}! Your study strategy has been successfully generated.")
        
        num_subjects = len(subjects)
        total_hours = float(days_left * hours_per_day)
        hours_per_subject = round(total_hours / num_subjects, 1) if num_subjects > 0 else 0.0
        
        # Display Metrics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown(f'<div class="metric-card"><div class="metric-label">📅 Days Left</div><div class="metric-num">{days_left}</div></div>', unsafe_allow_html=True)
        with col2:
            st.markdown(f'<div class="metric-card"><div class="metric-label">⏱️ Total Study Hours</div><div class="metric-num">{total_hours:.1f} hrs</div></div>', unsafe_allow_html=True)
        with col3:
            st.markdown(f'<div class="metric-card" style="border-top-color: #10b981;"><div class="metric-label">📚 Active Subjects</div><div class="metric-num">{num_subjects}</div></div>', unsafe_allow_html=True)
            
        st.write("##")
        plan_col, chart_col = st.columns([3, 2])
        
        schedule_data = []
        for index, sub in enumerate(subjects):
            num_pomodoros = int((hours_per_subject) / 1.5)
            revision_blocks = f"{num_pomodoros} sessions (90-min each)" if num_pomodoros > 0 else "1 brief review block"
            
            schedule_data.append({
                "Subject Name": sub,
                "Allocated Hours (hrs)": hours_per_subject,
                "Recommended Revision Plan": revision_blocks,
                "Focus Priority": f"Priority Level {min(index+1, 3)}"
            })
            
        df = pd.DataFrame(schedule_data)
        
        with plan_col:
            st.markdown("### 📋 Generated Study Distribution")
            st.dataframe(df, use_container_width=True, hide_index=True)
            
            st.markdown("##### 📥 Export Options")
            exp_col1, exp_col2 = st.columns(2)
            
            csv_data = df.to_csv(index=False).encode('utf-8')
            with exp_col1:
                st.download_button(label="⬇️ Download Study Plan as CSV", data=csv_data, file_name="smart_study_planner.csv", mime="text/csv", use_container_width=True)
                
            try:
                buffer = io.BytesIO()
                with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                    df.to_excel(writer, index=False, sheet_name='StudyPlanner')
                excel_data = buffer.getvalue()
                with exp_col2:
                    st.download_button(label="Excel Download (XLSX)", data=excel_data, file_name="smart_study_planner.xlsx", mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", use_container_width=True)
            except Exception as e:
                with exp_col2:
                    st.info("💡 Direct Excel converter requires openpyxl. Use the CSV download above.")
                    
        with chart_col:
            st.markdown("### 📊 Hour Allocation Weight")
            if num_subjects > 0:
                fig, ax = plt.subplots(figsize=(6, 5))
                colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#2dd4bf']
                colors = colors[:num_subjects] if num_subjects <= len(colors) else colors * (num_subjects // len(colors) + 1)
                
                wedges, texts, autotexts = ax.pie(
                    [hours_per_subject] * num_subjects, 
                    labels=subjects, 
                    autopct='%1.1f%%',
                    startangle=140,
                    colors=colors,
                    textprops=dict(color="#1e293b", weight="bold"),
                    wedgeprops=dict(width=0.4, edgecolor='white', linewidth=2)
                )
                plt.setp(autotexts, size=10, weight="bold")
                plt.tight_layout()
                ax.patch.set_facecolor('none')
                fig.patch.set_facecolor('none')
                st.pyplot(fig)
                
        st.write("---")
        st.markdown("### 🏆 Milestone Progress Tracker")
        selected_subject = st.selectbox("Select Subject to Track", subjects)
        mock_chapters = ["Fundamental Theory Review", "Problem Solving Practice", "Past Papers Assignment", "Flashcard Consolidation"]
        
        if selected_subject not in st.session_state.progress_logs:
            st.session_state.progress_logs[selected_subject] = [False] * len(mock_chapters)
            
        logs_state = st.session_state.progress_logs[selected_subject]
        prog_col1, prog_col2 = st.columns([3, 2])
        
        with prog_col1:
            for i, chapter in enumerate(mock_chapters):
                logs_state[i] = st.checkbox(f"✔️ {chapter}", value=logs_state[i], key=f"chk_{selected_subject}_{i}")
            st.session_state.progress_logs[selected_subject] = logs_state
            
        with prog_col2:
            total_tasks = sum(len(v) for v in st.session_state.progress_logs.values())
            completed_tasks = sum(sum(v) for v in st.session_state.progress_logs.values())
            overall_pct = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0
            st.markdown(f"#### 🎓 Overall Plan Completion: \`{overall_pct:.1f}%\`")
            st.progress(overall_pct / 100.0)
            if overall_pct == 100.0:
                st.balloons()
                st.success("🌟 Completed every single milestone!")
                
        st.write("---")
        st.markdown("### 💡 AI Study Tips")
        tips = []
        if days_left < 7:
            tips.append("🚨 **Emergency Buffer Rule**: Since your exam is only in a few days, focus on solving High-Yield Revision papers instead of learning brand new concepts from scratch.")
        if hours_per_subject < 5.0:
            tips.append("⏳ **Micro-Bite Pomodoro Method**: Split study intervals into crisp 25-minute Pomodoro sprints followed by 5-minute passive recovery breaks to avoid cognitive saturation.")
        else:
            tips.append("🧠 **Distributed Practice Pattern**: Use the Feynman Technique—attempting to explain the underlying logic in plain terms to verify deep mastery.")
            
        for idx, tip in enumerate(tips):
            st.info(f"Insight #{idx+1}: {tip}")
`;

export const MOCK_CHAPTERS = [
  "Fundamental Theory Review",
  "Problem Solving Practice",
  "Past Papers Assignment",
  "Flashcard Consolidation"
];
