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
language = st.sidebar.selectbox(
    "🌐 Select Language",
    ["English", "हिन्दी", "తెలుగు"]
)
translations = {
    "English": {
        "welcome": "🎉 Welcome, {name}! Your study strategy has been successfully generated.",

"tracker_title": "### 🏆 Milestone Progress Tracker",

"tracker_desc": "Check off the study topics as you finish them to visualize real-time syllabus completion!",

"select_subject": "Select Subject to Track",

"chapter1": "Fundamental Theory Review",
"chapter2": "Problem Solving Practice",
"chapter3": "Past Papers Assignment",
"chapter4": "Flashcard Consolidation",

"completion": "Overall Plan Completion",

"complete_msg": "🌟 Magnificent achievement! You have completed every syllabus milestone!",

"progress_msg": "Keep pushing forward! Consistency builds excellence.",

"start_msg": "Check off your first completed task to initiate the tracking metric!",

"tips_title": "### 💡 AI Study Tips (Intelligent Custom Insights)",

"tips_intro": "Applying dynamic study architectures for {name}'s high-yield performance:",

"tip1": "🚨 Emergency Buffer Rule: Since your exam is only a few days away, focus on high-yield revision papers instead of learning new concepts.",

"tip2": "⏳ Micro-Bite Pomodoro Method: Split study into 25-minute sessions with 5-minute breaks.",

"tip3": "🧠 Distributed Practice Pattern: Use the Feynman Technique to verify deep understanding.",

"tip4": "🔀 Interleaved Learning Schema: Alternate between problem-solving and theory subjects.",

"tip5": "🎯 Syllabus Deep-Dive: Practice active recall after reading each topic.",
        
        "title": "Smart Study Planner Pro",
        "student": "Student Name",
        "subjects": "Subjects of Interest",
        "exam": "Target Exam Date",
        "hours": "Daily Study Hours Available",
        "generate": "⚡ Generate Customized Study Plan",

        "days_left": "📅 Days Left",
        "total_hours": "⏱️ Total Study Hours",
        "active_subjects": "📚 Active Subjects",
        "generated_plan": "### 📋 Generated Study Distribution",
        "export": "##### 📥 Export Options",
        "chart": "### 📊 Hour Allocation Weight",

        "subject_name": "Subject Name",
        "allocated_hours": "Allocated Hours (hrs)",
        "revision_plan": "Recommended Revision Plan",
        "focus_priority": "Focus Priority",
        "priority": "Priority Level",
        "sessions": "sessions (90-min each)",
"brief_review": "1 brief review block",
"insight": "Insight",
"placeholder": "Comma-separated list of subjects",
"csv_download": "⬇️ Download Study Plan as CSV",
"excel_download": "Excel Download (XLSX)",
"add_subjects": "Add subjects in the sidebar to visualize parameters.",
"home_message": "👈 Use the left sidebar to specify your subjects, target schedule, and trigger 'Generate Study Plan'!",
"caption": "Design your path to academic excellence with Smart Study Planner Pro.",
"subtitle": "Your ultimate AI-powered preparation companion for modern collegiate success.",
    },

    "हिन्दी": {
        "welcome": "🎉 स्वागत है, {name}! आपकी अध्ययन योजना सफलतापूर्वक तैयार हो गई है।",

"tracker_title": "### 🏆 प्रगति ट्रैकर",

"tracker_desc": "विषयों को पूरा करने पर उन्हें चिह्नित करें और अपनी प्रगति देखें।",

"select_subject": "ट्रैक करने के लिए विषय चुनें",

"chapter1": "मूल सिद्धांत समीक्षा",
"chapter2": "समस्या समाधान अभ्यास",
"chapter3": "पिछले प्रश्नपत्र अभ्यास",
"chapter4": "फ्लैशकार्ड पुनरावृत्ति",

"completion": "कुल प्रगति",

"complete_msg": "🌟 शानदार उपलब्धि! आपने सभी अध्ययन लक्ष्य पूरे कर लिए हैं।",

"progress_msg": "लगातार प्रयास करते रहें। सफलता निश्चित है।",

"start_msg": "अपनी पहली पूर्ण गतिविधि को चिह्नित करें।",

"tips_title": "### 💡 एआई अध्ययन सुझाव",

"tips_intro": "{name} के लिए स्मार्ट अध्ययन सुझाव:",

"tip1": "🚨 परीक्षा निकट है, इसलिए केवल महत्वपूर्ण पुनरावृत्ति पर ध्यान दें।",

"tip2": "⏳ 25 मिनट अध्ययन और 5 मिनट विश्राम की पोमोडोरो तकनीक अपनाएँ।",

"tip3": "🧠 फाइनमैन तकनीक का उपयोग करके विषयों को सरल भाषा में समझाएँ।",

"tip4": "🔀 विभिन्न प्रकार के विषयों को बारी-बारी से पढ़ें।",

"tip5": "🎯 सक्रिय स्मरण तकनीक का उपयोग करें।",
        "title": "स्मार्ट स्टडी प्लानर प्रो",
        "student": "छात्र का नाम",
        "subjects": "रुचि के विषय",
        "exam": "लक्ष्य परीक्षा तिथि",
        "hours": "प्रतिदिन अध्ययन के घंटे",
        "generate": "⚡ व्यक्तिगत अध्ययन योजना बनाएँ",

        "days_left": "📅 शेष दिन",
        "total_hours": "⏱️ कुल अध्ययन घंटे",
        "active_subjects": "📚 सक्रिय विषय",
        "generated_plan": "### 📋 अध्ययन योजना",
        "export": "##### 📥 निर्यात विकल्प",
        "chart": "### 📊 घंटों का वितरण",

        "subject_name": "विषय का नाम",
        "allocated_hours": "अध्ययन घंटे",
        "revision_plan": "पुनरावृत्ति योजना",
        "focus_priority": "प्राथमिकता स्तर",
        "priority": "प्राथमिकता स्तर",
        "sessions": "सत्र (प्रत्येक 90 मिनट)",
"brief_review": "1 संक्षिप्त पुनरावृत्ति सत्र",
"insight": "सुझाव",
"placeholder": "कॉमा द्वारा अलग किए गए विषय दर्ज करें",
"csv_download": "⬇️ CSV के रूप में डाउनलोड करें",
"excel_download": "Excel डाउनलोड (XLSX)",
"add_subjects": "चार्ट देखने के लिए साइडबार में विषय जोड़ें।",
"home_message": "👈 अपने विषय और परीक्षा तिथि दर्ज करें तथा 'अध्ययन योजना बनाएँ' पर क्लिक करें।",
"caption": "स्मार्ट स्टडी प्लानर प्रो के साथ शैक्षणिक उत्कृष्टता की ओर अपना मार्ग तैयार करें।",
"subtitle": "आधुनिक शैक्षणिक सफलता के लिए आपका एआई-संचालित अध्ययन साथी।",
    },

    "తెలుగు": {
        "welcome": "🎉 స్వాగతం {name}! మీ అధ్యయన ప్రణాళిక విజయవంతంగా రూపొందించబడింది.",

"tracker_title": "### 🏆 పురోగతి ట్రాకర్",

"tracker_desc": "మీరు పూర్తి చేసిన అంశాలను గుర్తించి మీ పురోగతిని చూడండి.",

"select_subject": "ట్రాక్ చేయడానికి విషయం ఎంచుకోండి",

"chapter1": "ప్రాథమిక సిద్ధాంత సమీక్ష",
"chapter2": "సమస్య పరిష్కార సాధన",
"chapter3": "గత ప్రశ్నపత్రాల సాధన",
"chapter4": "ఫ్లాష్‌కార్డ్ పునశ్చరణ",

"completion": "మొత్తం పురోగతి",

"complete_msg": "🌟 అద్భుతం! మీరు అన్ని అధ్యయన లక్ష్యాలను పూర్తి చేశారు.",

"progress_msg": "నిరంతర కృషి విజయానికి దారి తీస్తుంది.",

"start_msg": "మీ మొదటి పూర్తి చేసిన పనిని గుర్తించండి.",

"tips_title": "### 💡 AI అధ్యయన సూచనలు",

"tips_intro": "{name} కోసం తెలివైన అధ్యయన సూచనలు:",

"tip1": "🚨 పరీక్ష సమీపంలో ఉంది కాబట్టి ముఖ్యమైన పునశ్చరణపై దృష్టి పెట్టండి.",

"tip2": "⏳ 25 నిమిషాల చదువు మరియు 5 నిమిషాల విరామంతో పోమోడోరో పద్ధతిని అనుసరించండి.",

"tip3": "🧠 ఫైన్మన్ పద్ధతిని ఉపయోగించి అంశాలను వివరించండి.",

"tip4": "🔀 వివిధ రకాల విషయాలను మారుస్తూ చదవండి.",

"tip5": "🎯 యాక్టివ్ రీకాల్ పద్ధతిని ఉపయోగించండి.",
        "title": "స్మార్ట్ స్టడీ ప్లానర్ ప్రో",
        "student": "విద్యార్థి పేరు",
        "subjects": "ఆసక్తి గల విషయాలు",
        "exam": "లక్ష్య పరీక్ష తేదీ",
        "hours": "రోజువారీ అధ్యయన గంటలు",
        "generate": "⚡ వ్యక్తిగత అధ్యయన ప్రణాళిక రూపొందించండి",

        "days_left": "📅 మిగిలిన రోజులు",
        "total_hours": "⏱️ మొత్తం అధ్యయన గంటలు",
        "active_subjects": "📚 క్రియాశీల విషయాలు",
        "generated_plan": "### 📋 రూపొందించిన అధ్యయన ప్రణాళిక",
        "export": "##### 📥 ఎగుమతి ఎంపికలు",
        "chart": "### 📊 గంటల పంపిణీ",

        "subject_name": "విషయం పేరు",
        "allocated_hours": "కేటాయించిన గంటలు",
        "revision_plan": "పునశ్చరణ ప్రణాళిక",
        "focus_priority": "ప్రాధాన్యత స్థాయి",
        "priority": "ప్రాధాన్యత",
        "sessions": "సెషన్లు (ప్రతి ఒక్కటి 90 నిమిషాలు)",
"brief_review": "1 చిన్న పునశ్చరణ సెషన్",
"insight": "సూచన",
"placeholder": "కామాలతో వేరు చేసిన విషయాలను నమోదు చేయండి",
"csv_download": "⬇️ CSVగా డౌన్‌లోడ్ చేయండి",
"excel_download": "Excel డౌన్‌లోడ్ (XLSX)",
"add_subjects": "చార్ట్ చూడటానికి సైడ్‌బార్‌లో విషయాలను జోడించండి.",
"home_message": "👈 మీ విషయాలు మరియు పరీక్ష తేదీని నమోదు చేసి 'అధ్యయన ప్రణాళిక రూపొందించండి'పై క్లిక్ చేయండి.",
"caption": "స్మార్ట్ స్టడీ ప్లానర్ ప్రోతో మీ విద్యా విజయానికి మార్గాన్ని రూపొందించండి.",
"subtitle": "ఆధునిక విద్యా విజయానికి మీ AI ఆధారిత అధ్యయన సహచరుడు.",
    }
}
subject_translations = {
    "English": {
        "Data Structures": "Data Structures",
        "Database Systems": "Database Systems",
        "Computer Networks": "Computer Networks",
        "Operating Systems": "Operating Systems"
    },

    "हिन्दी": {
        "Data Structures": "डेटा संरचनाएँ",
        "Database Systems": "डेटाबेस सिस्टम",
        "Computer Networks": "कंप्यूटर नेटवर्क",
        "Operating Systems": "ऑपरेटिंग सिस्टम"
    },

    "తెలుగు": {
        "Data Structures": "డేటా నిర్మాణాలు",
        "Database Systems": "డేటాబేస్ వ్యవస్థలు",
        "Computer Networks": "కంప్యూటర్ నెట్‌వర్క్‌లు",
        "Operating Systems": "ఆపరేటింగ్ సిస్టమ్స్"
    }
}
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
st.markdown(
    f"<h1 class='main-header'>📚 {translations[language]['title']}</h1>",
    unsafe_allow_html=True
)
st.markdown(
    f"*{translations[language]['subtitle']}*"
)
st.write("---")

# Initialize Session States for calculations
if "plan_generated" not in st.session_state:
    st.session_state.plan_generated = False
if "progress_logs" not in st.session_state:
    st.session_state.progress_logs = {}

# Sidebar inputs
st.sidebar.header("🛠️ " + translations[language]["title"])

student_name = st.sidebar.text_input(
    f"👤 {translations[language]['student']}",
    value="Sanjana"
)
subjects_raw = st.sidebar.text_input(
    f"📖 {translations[language]['subjects']}",
    value="Data Structures, Database Systems, Computer Networks, Operating Systems",
    placeholder="Comma-separated list of subjects"
)

# Validate and clean subjects
subjects = [s.strip() for s in subjects_raw.split(",") if s.strip()]

display_subjects = [
    subject_translations.get(language, {}).get(subject, subject)
    for subject in subjects
]

# Exam Date Picker
default_exam_date = datetime.date.today() + datetime.timedelta(days=14)

exam_date = st.sidebar.date_input(
    f"📅 {translations[language]['exam']}",
    value=default_exam_date
)

# Study Time Slider
hours_per_day = st.sidebar.number_input(
    f"⏱️ {translations[language]['hours']}",
    min_value=0.5,
    max_value=16.0,
    value=4.0,
    step=0.5
)
generate_btn = st.sidebar.button(
    translations[language]["generate"],
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
        st.success(
    translations[language]["welcome"].format(name=student_name)
)
        
        # Calculations
        num_subjects = len(subjects)
        total_hours = float(days_left * hours_per_day)
        hours_per_subject = round(total_hours / num_subjects, 1) if num_subjects > 0 else 0.0
        
        # Display Metrics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">{translations[language]["days_left"]}</div>
                    <div class="metric-num">{days_left}</div>
                </div>
            """, unsafe_allow_html=True)
            
        with col2:
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">{translations[language]["total_hours"]}</div>
                    <div class="metric-num">{total_hours:.1f} hrs</div>
                </div>
            """, unsafe_allow_html=True)
            
        with col3:
            st.markdown(f"""
                <div class="metric-card" style="border-top-color: #10b981;">
                    <div class="metric-label">{translations[language]["active_subjects"]}</div>
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
            revision_blocks = (
    f"{num_pomodoros} {translations[language]['sessions']}"
    if num_pomodoros > 0
    else translations[language]["brief_review"]
)
            
            schedule_data.append({
    translations[language]["subject_name"]: display_subjects[index],

    translations[language]["allocated_hours"]:
    hours_per_subject,

    translations[language]["revision_plan"]:
    revision_blocks,

    translations[language]["focus_priority"]:
    f"{translations[language]['priority']} {min(index+1,3)}"
})
            
        df = pd.DataFrame(schedule_data)
        
        with plan_col:
            st.markdown(
    translations[language]["generated_plan"]
)
            st.dataframe(df, use_container_width=True, hide_index=True)
            
            # File Exports
            st.markdown(
    translations[language]["export"]
)
            exp_col1, exp_col2 = st.columns(2)
            
            # CSV Download
            csv_data = df.to_csv(index=False).encode('utf-8')
            with exp_col1:
                st.download_button(
                    label=translations[language]["csv_download"],
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
                        label=translations[language]["excel_download"],
                        data=excel_data,
                        file_name="smart_study_planner.xlsx",
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        use_container_width=True
                    )
            except Exception as e:
                with exp_col2:
                    st.info("💡 Direct Excel converter requires openpyxl. Use the CSV download above for seamless compatibility.")
                    
        with chart_col:
            st.markdown(
    translations[language]["chart"]
)
            if num_subjects > 0:
                fig, ax = plt.subplots(figsize=(6, 5))
                # Soft modern pastel palette
                colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#2dd4bf']
                colors = colors[:num_subjects] if num_subjects <= len(colors) else colors * (num_subjects // len(colors) + 1)
                
                wedges, texts, autotexts = ax.pie(
                    [hours_per_subject] * num_subjects, 
                    labels=display_subjects,
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
                st.info(translations[language]["add_subjects"])

        st.write("---")
        
        # Interactive Student Progress Tracker section
        st.markdown(translations[language]["tracker_title"])
        st.write(translations[language]["tracker_desc"])
        
        # Setup specific checkpoint data lists
        selected_subject = st.selectbox(
    translations[language]["select_subject"],
    subjects
)
        
        mock_chapters = [
    translations[language]["chapter1"],
    translations[language]["chapter2"],
    translations[language]["chapter3"],
    translations[language]["chapter4"]
]
        
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
            
            st.markdown(
    f"#### 🎓 {translations[language]['completion']}: `{overall_pct:.1f}%`"
)
            st.progress(overall_pct / 100.0)
            if overall_pct == 100.0:
                st.balloons()
                st.success(translations[language]["complete_msg"])
            elif overall_pct > 0:
                st.info(translations[language]["progress_msg"])
            else:
                st.write(translations[language]["start_msg"])
                
        st.write("---")
        
        # AI Study Tips Section (Rule-based Intelligence)
        st.markdown(translations[language]["tips_title"])
        
        with st.container():
         st.markdown(
            translations[language]["tips_intro"].format(
              name=student_name
        )
    )

    tips = []

    if days_left < 7:
        tips.append(translations[language]["tip1"])

    if hours_per_subject < 5.0:
        tips.append(translations[language]["tip2"])
    else:
        tips.append(translations[language]["tip3"])

    if num_subjects > 5:
        tips.append(translations[language]["tip4"])
    else:
        tips.append(translations[language]["tip5"])

    for idx, tip in enumerate(tips):
        st.info(
            f"🧠 {translations[language]['insight']} #{idx+1}: {tip}"
        )
                
else:
    # Onboard instruction panel
    st.info(translations[language]["home_message"])
    st.image(
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200", 
        caption=translations[language]["caption"],
        use_container_width=True
    )
