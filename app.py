# -*- coding: utf-8 -*-
"""
Smart Study Planner Pro
Streamlit App Entry Point
Suitable for College Hackathon Submission
"""
from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama
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
        tracking-style: wide;
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

student_name = st.sidebar.text_input("👤 Student Name", value="Sanjana", placeholder="Enter your name")
subjects_raw = st.sidebar.text_input(
    "📖 Subjects of Interest", 
    value="Data Structures, Database Systems, Computer Networks, Operating Systems",
    placeholder="Comma-separated list of subjects"
)

# Validate and clean subjects
subjects = [s.strip() for s in subjects_raw.split(",") if s.strip()]

# Exam Date Picker (Default to 14 days in the future to ensure valid calculation)
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

generate_btn = st.sidebar.button(
    "⚡ Generate Customized Study Plan",
    use_container_width=True
)

# ADD THIS BELOW ↓↓↓

st.sidebar.subheader("🤖 AI Settings")

ai_provider = st.sidebar.radio(
    "Choose AI Provider",
    ["Local Ollama", "BYOK (Groq)"]
)

groq_key = ""

if ai_provider == "BYOK (Groq)":
    groq_key = st.sidebar.text_input(
        "Enter Groq API Key",
        type="password"
    )

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
        st.warning("⚠️ Target exam date must be in the future! Please adjust your date picker input.")
    else:
        # Success Greeting
        st.success(f"🎉 Welcome, {student_name}! Your study strategy has been successfully generated.")
        
        # Calculations
        num_subjects = len(subjects)
        total_hours = float(days_left * hours_per_day)
        hours_per_subject = round(total_hours / num_subjects, 1) if num_subjects > 0 else 0.0
        
        # Display Metrics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">📅 Days Left</div>
                    <div class="metric-num">{days_left}</div>
                </div>
            """, unsafe_allow_html=True)
            
        with col2:
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">⏱️ Total Study Hours</div>
                    <div class="metric-num">{total_hours:.1f} hrs</div>
                </div>
            """, unsafe_allow_html=True)
            
        with col3:
            st.markdown(f"""
                <div class="metric-card" style="border-top-color: #10b981;">
                    <div class="metric-label">📚 Active Subjects</div>
                    <div class="metric-num">{num_subjects}</div>
                </div>
            """, unsafe_allow_html=True)
            
        st.write("##")
        
        # Layout splits for visualization and schedule
        plan_col, chart_col = st.columns([3, 2])
        
        # Creating database matrix
        schedule_data = []
        for index, sub in enumerate(subjects):
            # Formulating revision sessions (90 min blocks)
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
            
            # File Exports
            st.markdown("##### 📥 Export Options")
            exp_col1, exp_col2 = st.columns(2)
            
            # CSV Download
            csv_data = df.to_csv(index=False).encode('utf-8')
            with exp_col1:
                st.download_button(
                    label="⬇️ Download Study Plan as CSV",
                    data=csv_data,
                    file_name="smart_study_planner.csv",
                    mime="text/csv",
                    use_container_width=True
                )
                
            # Excel Download (Safely bundle with openpyxl engine)
            try:
                buffer = io.BytesIO()
                with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                    df.to_excel(writer, index=False, sheet_name='StudyPlanner')
                excel_data = buffer.getvalue()
                with exp_col2:
                    st.download_button(
                        label="Excel Download (XLSX)",
                        data=excel_data,
                        file_name="smart_study_planner.xlsx",
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        use_container_width=True
                    )
            except Exception as e:
                with exp_col2:
                    st.info("💡 Direct Excel converter requires openpyxl. Use the CSV download above for seamless compatibility.")
                    
        with chart_col:
            st.markdown("### 📊 Hour Allocation Weight")
            if num_subjects > 0:
                fig, ax = plt.subplots(figsize=(6, 5))
                # Soft modern pastel palette
                colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#2dd4bf']
                colors = colors[:num_subjects] if num_subjects <= len(colors) else colors * (num_subjects // len(colors) + 1)
                
                wedges, texts, autotexts = ax.pie(
                    [hours_per_subject] * num_subjects, 
                    labels=subjects, 
                    autopct='%1.1f%%',
                    startangle=140,
                    colors=colors,
                    textprops=dict(color="#1e293b", weight="bold"),
                    wedgeprops=dict(width=0.4, edgecolor='white', linewidth=2) # Modern donut style
                )
                plt.setp(autotexts, size=10, weight="bold")
                plt.tight_layout()
                ax.patch.set_facecolor('none')
                fig.patch.set_facecolor('none')
                st.pyplot(fig)
            else:
                st.info("Add subjects in the sidebar to visualize parameters.")

        st.write("---")
        
        # Interactive Student Progress Tracker section
        st.markdown("### 🏆 Milestone Progress Tracker")
        st.write("Check off the study topics as you finish them to visualize real-time syllabus completion!")
        
        # Setup specific checkpoint data lists
        selected_subject = st.selectbox("Select Subject to Track", subjects)
        
        mock_chapters = ["Fundamental Theory Review", "Problem Solving Practice", "Past Papers Assignment", "Flashcard Consolidation"]
        
        # Track status using session state logs
        if selected_subject not in st.session_state.progress_logs:
            st.session_state.progress_logs[selected_subject] = [False] * len(mock_chapters)
            
        logs_state = st.session_state.progress_logs[selected_subject]
        
        prog_col1, prog_col2 = st.columns([3, 2])
        
        with prog_col1:
            for i, chapter in enumerate(mock_chapters):
                unique_key = f"chk_{selected_subject}_{i}"
                logs_state[i] = st.checkbox(f"✔️ {chapter}", value=logs_state[i], key=unique_key)
                
            # Save the modifications
            st.session_state.progress_logs[selected_subject] = logs_state
            
        with prog_col2:
            # Calculate overall subject progress
            total_tasks = sum(len(v) for v in st.session_state.progress_logs.values())
            completed_tasks = sum(sum(v) for v in st.session_state.progress_logs.values())
            overall_pct = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0
            
            st.markdown(f"#### 🎓 Overall Plan Completion: `{overall_pct:.1f}%`")
            st.progress(overall_pct / 100.0)
            if overall_pct == 100.0:
                st.balloons()
                st.success("🌟 Magnificient achievement! You have completed every syllabus milestone!")
            elif overall_pct > 0:
                st.info("Keep pushing forward! Consistency builds excellence.")
            else:
                st.write("Check off your first completed task to initiate the tracking metric!")
                
        st.write("---")
        
        # AI Study Tips Section (Rule-based Intelligence)
        st.markdown("### 💡 AI Study Tips (Intelligent Custom Insights)")
        
        with st.container():
            st.markdown(f"*Applying dynamic study architectures for {student_name}'s high-yield performance:*")
            
            tips = []
            
            # Rule 1: High pressure condition
            if days_left < 7:
                tips.append("🚨 **Emergency Buffer Rule**: Since your exam is only in a few days, focus on solving High-Yield Revision papers instead of learning brand new concepts from scratch.")
            
            # Rule 2: Low-mid range workload distribution
            if hours_per_subject < 5.0:
                tips.append("⏳ **Micro-Bite Pomodoro Method**: Split study intervals into crisp 25-minute Pomodoro sprints followed by 5-minute active recovery breaks to avoid cognitive saturation.")
            else:
                tips.append("🧠 **Distributed Practice Pattern**: With more than 5 hours assigned to each topic, use the Feynman Technique—attempting to explain the underlying logic in plain terms to a peer to verify deep mastery.")
                
            # Rule 3: High cognitive load warning (lots of subjects)
            if num_subjects > 5:
                tips.append("🔀 **Interleaved Learning Schema**: Alternate between highly quantitative logic subjects (e.g. data structures) and reading-heavy documentation targets (e.g. networks) to prevent mental exhaustion.")
            else:
                tips.append("🎯 **Syllabus Deep-Dive**: You have plenty of time per subject! Implement selective recall—read a paragraph, close the textbook, and write down everything you remember verbatim.")
                
            # Display tip lists in formatted quotes
            for idx, tip in enumerate(tips):
                st.info(f"🧬 Insight #{idx+1}: {tip}")
                
else:
    # Onboard instruction panel
    st.info("👈 Use the left sidebar to specify your subjects, target schedule, and trigger 'Generate Study Plan'!")
    st.image(
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200", 
        caption="Design your path to academic excellence with Smart Study Planner Pro.",
        use_container_width=True
    )
