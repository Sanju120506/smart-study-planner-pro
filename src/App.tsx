import { useState, useMemo, useEffect } from "react";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  CheckSquare, 
  Download, 
  Sparkles, 
  Copy, 
  Terminal, 
  Cloud, 
  Check, 
  Award, 
  FileCode, 
  ChevronRight, 
  Info,
  Sliders,
  ExternalLink,
  Code
} from "lucide-react";
import { RAW_APP_PY, RAW_DEPENDENCIES, RAW_README, MOCK_CHAPTERS } from "./data";
import { StudyPlanItem, ProgressState } from "./types";

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"simulator" | "code_bundle" | "setup_guide">("simulator");

  // Inputs for simulator
  const [studentName, setStudentName] = useState("Alex Mercer");
  const [subjectsInput, setSubjectsInput] = useState("Data Structures, Database Systems, Computer Networks, Operating Systems");
  const [targetExamDate, setTargetExamDate] = useState(() => {
    // Default to +14 days
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split("T")[0];
  });
  const [dailyHours, setDailyHours] = useState(4.0);
  
  // State variables for calculated results
  const [isGenerated, setIsGenerated] = useState(true);
  const [generateFeedback, setGenerateFeedback] = useState(false);
  
  // Progress tracker state
  const [selectedSubject, setSelectedSubject] = useState("");
  const [progressLogs, setProgressLogs] = useState<ProgressState>({});

  // Active code viewer selection inside Code Bundle tab
  const [activeCodeFile, setActiveCodeFile] = useState<"app.py" | "requirements.txt" | "README.md">("app.py");
  const [copiedState, setCopiedState] = useState(false);

  // Parse subjects
  const cleanSubjects = useMemo(() => {
    return subjectsInput
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }, [subjectsInput]);

  // Set default selected subject when cleanSubjects alters
  useEffect(() => {
    if (cleanSubjects.length > 0 && !cleanSubjects.includes(selectedSubject)) {
      setSelectedSubject(cleanSubjects[0]);
    }
  }, [cleanSubjects, selectedSubject]);

  // Initialize progress log mappings
  useEffect(() => {
    const updated: ProgressState = { ...progressLogs };
    let altered = false;
    cleanSubjects.forEach(sub => {
      if (!updated[sub]) {
        updated[sub] = [false, false, false, false];
        altered = true;
      }
    });
    if (altered) {
      setProgressLogs(updated);
    }
  }, [cleanSubjects]);

  // Handle Generate triggers
  const handleGenerate = () => {
    setIsGenerated(true);
    setGenerateFeedback(true);
    setTimeout(() => setGenerateFeedback(false), 3000);
  };

  // Mathematical Schedule Engine
  const calculations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(targetExamDate);
    exam.setHours(0, 0, 0, 0);
    
    const diffTime = exam.getTime() - today.getTime();
    const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const totalHours = Number((daysLeft * dailyHours).toFixed(1));
    const numSubjects = cleanSubjects.length;
    
    // Equal distribution with custom roundoff
    const hoursPerSubject = numSubjects > 0 ? Number((totalHours / numSubjects).toFixed(1)) : 0;
    
    const items: StudyPlanItem[] = cleanSubjects.map((sub, i) => {
      const pomodoros = Math.floor(hoursPerSubject / 1.5);
      const sessionString = pomodoros > 0 
        ? `${pomodoros} sessions (90-min Pomodoros)` 
        : `1 brief review session (60-min)`;
        
      return {
        id: `subj-${i}`,
        subjectName: sub,
        allocatedHours: hoursPerSubject,
        sessions: sessionString,
        priority: `Priority Level ${Math.min(i + 1, 3)}`
      };
    });

    return {
      daysLeft,
      totalHours,
      hoursPerSubject,
      items
    };
  }, [targetExamDate, dailyHours, cleanSubjects]);

  // Calculate global completed checkpoints percent
  const overallProgressPercent = useMemo(() => {
    let total = 0;
    let completed = 0;
    
    cleanSubjects.forEach(sub => {
      const logs = progressLogs[sub] || [false, false, false, false];
      total += logs.length;
      completed += logs.filter(Boolean).length;
    });
    
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }, [cleanSubjects, progressLogs]);

  // Handle checklist clicks
  const toggleChapterCheckbox = (index: number) => {
    if (!selectedSubject) return;
    const currentList = progressLogs[selectedSubject] ? [...progressLogs[selectedSubject]] : [false, false, false, false];
    currentList[index] = !currentList[index];
    setProgressLogs({
      ...progressLogs,
      [selectedSubject]: currentList
    });
  };

  // Download logic for CSV study schedule table
  const triggerCSVDownload = () => {
    const headers = ["Subject Name", "Total Assigned Hours", "Recommended Revision Layout", "Priority Scale"];
    const rows = calculations.items.map(item => [
      `"${item.subjectName}"`,
      item.allocatedHours,
      `"${item.sessions}"`,
      `"${item.priority}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${studentName.replace(/\s+/g, "_")}_StudyPlan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clipboard copies
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const activeCodeContent = useMemo(() => {
    if (activeCodeFile === "app.py") return RAW_APP_PY;
    if (activeCodeFile === "requirements.txt") return RAW_DEPENDENCIES;
    return RAW_README;
  }, [activeCodeFile]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col antialiased text-slate-100">
      {/* Visual Navigation Header Banner */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Brand Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600/90 text-white p-2.5 rounded-xl shadow-md shadow-indigo-900/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif italic text-2xl tracking-normal text-slate-50">
                    Smart Study Planner Pro
                  </span>
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Hackathon Kit
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Streamlit Application Bundle & Professional Prep Simulator
                </p>
              </div>
            </div>

            {/* Application Mode Switcher Tabs */}
            <div className="flex space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button
                id="tab-simulator"
                onClick={() => setActiveTab("simulator")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === "simulator"
                    ? "bg-slate-850 text-white shadow-xs border border-slate-700/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live App Simulator</span>
              </button>

              <button
                id="tab-code"
                onClick={() => setActiveTab("code_bundle")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === "code_bundle"
                    ? "bg-slate-850 text-white shadow-xs border border-slate-700/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Hackathon Source Files</span>
              </button>

              <button
                id="tab-setup"
                onClick={() => setActiveTab("setup_guide")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === "setup_guide"
                    ? "bg-slate-850 text-white shadow-xs border border-slate-700/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Command Runbooks</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        {/* 1. INTERACTIVE STUDY PLANNER SIMULATOR TAB */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar simulator panel */}
            <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Streamlit Sidebar Input
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-950 animate-pulse"></span>
              </div>

              <div className="p-6 space-y-5">
                {/* Student Name */}
                <div>
                  <label id="lbl-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>👤 Student Registered Name</span>
                  </label>
                  <input
                    id="input-student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-100 placeholder-slate-500"
                    placeholder="E.g. Alex Mercer"
                  />
                </div>

                {/* Subjects Raw */}
                <div>
                  <label id="lbl-subjects" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    📖 Subjects List (comma separated)
                  </label>
                  <textarea
                    id="input-subjects"
                    rows={3}
                    value={subjectsInput}
                    onChange={(e) => setSubjectsInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-xs text-slate-100 leading-relaxed placeholder-slate-500"
                    placeholder="E.g. Data Structures, Computer Architecture, Mathematics"
                  />
                  <span className="text-[10px] text-slate-500 font-medium block mt-1.5 leading-relaxed">
                    Separate elements utilizing standard comma values. This triggers automatic workload allocation.
                  </span>
                </div>

                {/* Exam Date Picker */}
                <div>
                  <label id="lbl-exam-date" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    📅 Target Exam Milestone Date
                  </label>
                  <input
                    id="input-exam-date"
                    type="date"
                    value={targetExamDate}
                    onChange={(e) => setTargetExamDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-100 font-medium"
                  />
                </div>

                {/* Study Hours available */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label id="lbl-daily-hours" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      ⏱️ Daily Practice Hours Target
                    </label>
                    <span className="bg-indigo-950 text-indigo-350 border border-indigo-900/50 px-2 py-0.5 text-xs font-mono font-bold rounded-md">
                      {dailyHours.toFixed(1)} hrs
                    </span>
                  </div>
                  <input
                    id="input-hours-slider"
                    type="range"
                    min="1.0"
                    max="16.0"
                    step="0.5"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1 mt-1">
                    <span>1.0 hr</span>
                    <span>4.0 hrs</span>
                    <span>8.0 hrs</span>
                    <span>12.0 hrs</span>
                    <span>16.0 hrs</span>
                  </div>
                </div>

                {/* Streamlit Custom Red Action Generate Button */}
                <button
                  id="btn-generate-planner"
                  onClick={handleGenerate}
                  className="w-full mt-4 bg-[#ff4b4b] hover:bg-[#e03a3a] text-white py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Study Plan</span>
                </button>
              </div>

              {/* Informative tips box inside sidebar */}
              <div className="bg-slate-950/50 p-5 border-t border-slate-800 flex items-start space-x-3">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  This emulator runs in real-time, executing the identical mathematical allocation and visualization modules written inside your <strong className="text-slate-300">app.py</strong>. Try customizing names and hours!
                </p>
              </div>
            </div>

            {/* Display Simulator Screen Panel */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Main Emulated Screen Output */}
              {isGenerated ? (
                <div className="space-y-6">
                  
                  {/* Dynamic greeting toast notification */}
                  <div className="bg-emerald-950/40 border border-emerald-800/40 p-4 rounded-2xl flex items-center space-x-3.5 shadow-md animate-fade-in">
                    <div className="bg-emerald-900/30 text-emerald-400 p-2.5 rounded-xl shrink-0">
                      <Check className="w-5 h-5 font-bold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-200 text-sm">
                        🎉 Planning Distribution Successfully Confirmed!
                      </h4>
                      <p className="text-xs text-slate-300 font-medium">
                        Welcome, <strong className="font-semibold text-slate-105">{studentName || "Academic Candidate"}</strong>! We calculated your syllabus priorities below based on your exam countdown.
                      </p>
                    </div>
                  </div>

                  {/* Operational Metric Cards (Streamlit lookalike with custom colors) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    
                    {/* Days Left Card */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between border-t-4 border-indigo-500 transition-transform hover:scale-[1.01]">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-serif italic">
                        📅 Days Countdown Left
                      </span>
                      <div className="mt-2.5 flex items-baseline justify-between">
                        <span className="text-4xl font-extrabold text-white tracking-tight">
                          {calculations.daysLeft}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                          Days Left
                        </span>
                      </div>
                    </div>

                    {/* Total Available Study Hours */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between border-t-4 border-indigo-500 transition-transform hover:scale-[1.01]">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-serif italic">
                        ⏱️ Total Available Study Clock
                      </span>
                      <div className="mt-2.5 flex items-baseline justify-between">
                        <span className="text-4xl font-extrabold text-white tracking-tight">
                          {calculations.totalHours.toFixed(1)}
                        </span>
                        <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/50 border border-indigo-900/40 px-2.5 py-1 rounded-md">
                          Total Hours
                        </span>
                      </div>
                    </div>

                    {/* Active Subjects List Size */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between border-t-4 border-emerald-500 transition-transform hover:scale-[1.01]">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-serif italic">
                        📚 Active Core Subjects
                      </span>
                      <div className="mt-2.5 flex items-baseline justify-between">
                        <span className="text-4xl font-extrabold text-white tracking-tight">
                          {cleanSubjects.length}
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-900/40 px-2.5 py-1 rounded-md">
                          Active Courses
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Data Distribution Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Distribution schedule listing table element */}
                    <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
                      <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between bg-slate-900/40">
                        <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                          <span>📋 Generated Allocation Schedule</span>
                        </h3>
                        <button
                          id="btn-download-csv"
                          onClick={triggerCSVDownload}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 font-bold text-[11px] text-slate-300 transition cursor-pointer"
                          title="Generate a functional CSV download of current data matrix"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export csv data</span>
                        </button>
                      </div>

                      {calculations.items.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900/60 border-b border-slate-800 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                                <th className="px-4 py-3">Subject Name</th>
                                <th className="px-4 py-3 text-right">Hours</th>
                                <th className="px-4 py-3">Recommended Review blocks</th>
                                <th className="px-4 py-3">Milestone Priority</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                              {calculations.items.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                                  <td className="px-4 py-3.5 font-semibold text-slate-100">
                                    {item.subjectName}
                                  </td>
                                  <td className="px-4 py-3.5 text-right font-mono text-indigo-400 font-bold">
                                    {item.allocatedHours.toFixed(1)}h
                                  </td>
                                  <td className="px-4 py-3.5 text-slate-400">
                                    {item.sessions}
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                      index === 0
                                        ? "bg-rose-950/60 text-rose-300 border border-rose-900/40"
                                        : index === 1
                                        ? "bg-amber-950/60 text-amber-300 border border-amber-900/40"
                                        : "bg-slate-900 text-slate-450 border border-slate-800"
                                    }`}>
                                      {item.priority}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-500">
                          Please list core subjects to compile raw matrix view.
                        </div>
                      )}
                    </div>

                    {/* Hour allocation weight donut visual placeholder */}
                    <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                      <h3 className="font-bold text-sm text-slate-250 uppercase tracking-wider mb-4">
                        📊 Hour Allocation Weight
                      </h3>

                      {cleanSubjects.length > 0 ? (
                        <div className="flex flex-col items-center">
                          {/* Minimal SVG Donut Chart */}
                          <div className="relative w-44 h-44 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              {/* Background Circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="12"
                              />
                              {/* Render dynamic percentage segment wedges */}
                              {cleanSubjects.map((_, idx) => {
                                const segmentPercentage = 100 / cleanSubjects.length;
                                const strokeDasharray = `${segmentPercentage} ${100 - segmentPercentage}`;
                                const strokeDashoffset = -idx * segmentPercentage;
                                const colorsList = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];
                                const currentColor = colorsList[idx % colorsList.length];
                                
                                  return (
                                    <circle
                                      key={`donut-${idx}`}
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      fill="none"
                                      stroke={currentColor}
                                      strokeWidth="12"
                                      strokeDasharray={strokeDasharray}
                                      strokeDashoffset={strokeDashoffset}
                                      className="transition-all duration-300"
                                    />
                                  );
                              })}
                            </svg>
                            {/* Inner dark circle for donut look */}
                            <div className="absolute w-28 h-28 bg-slate-950 rounded-full flex flex-col items-center justify-center shadow-xs border border-slate-800">
                              <span className="text-3xl font-extrabold text-slate-100 font-mono">
                                {(100 / Math.max(1, cleanSubjects.length)).toFixed(0)}%
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                Each Subject
                              </span>
                            </div>
                          </div>

                          {/* Dynamic Color Palette Legend list */}
                          <div className="mt-5 space-y-1.5 w-full">
                            {cleanSubjects.map((sub, index) => {
                              const colorsList = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];
                              const currentColor = colorsList[index % colorsList.length];
                              return (
                                <div key={`legend-${index}`} className="flex items-center justify-between text-xs font-semibold text-slate-300">
                                  <div className="flex items-center space-x-2 shrink-0 max-w-[80%]">
                                    <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: currentColor }}></span>
                                    <span className="truncate text-slate-205">{sub}</span>
                                  </div>
                                  <span className="font-mono text-slate-400 shrink-0">
                                    {calculations.hoursPerSubject.toFixed(1)}h
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="py-20 text-center text-slate-500 text-xs">
                          Add active subjects to visualize hour allocation percentages.
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Progress Tracker Checklist with Dynamic feedback and animated Balloon logic */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-4 gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                          <CheckSquare className="w-4 h-4 text-emerald-500" />
                          <span>🏆 Interactive Progress Milestones Tracker</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          Check off study phases and watch your global completion status metrics rise in real-time.
                        </p>
                      </div>

                      {/* Dropdown for subject tracking choice */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs text-slate-400 font-medium font-serif italic">Subject Focus:</span>
                        <select
                          id="select-subject-track"
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                        >
                          {cleanSubjects.map(sub => (
                            <option key={`opt-${sub}`} value={sub} className="bg-slate-900 text-slate-100">
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                      
                      {/* Checkbox fields list */}
                      <div className="md:col-span-7 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-2xs font-serif italic">
                          {selectedSubject || "No Subject Loaded"} Milestones
                        </h4>
                        
                        {selectedSubject ? (
                          MOCK_CHAPTERS.map((chapter, i) => {
                            const isChecked = (progressLogs[selectedSubject] || [])[i] || false;
                            return (
                              <button
                                key={`milestone-ch-${i}`}
                                onClick={() => toggleChapterCheckbox(i)}
                                className={`w-full text-left flex items-center space-x-3 p-3 rounded-xl border transition duration-150 ${
                                  isChecked 
                                    ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-200" 
                                    : "bg-slate-900/30 border-slate-800 hover:bg-slate-900 text-slate-300"
                                } font-medium text-xs cursor-pointer`}
                              >
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                                  isChecked 
                                    ? "bg-emerald-600 border-emerald-600 text-white" 
                                    : "bg-slate-950 border-slate-800"
                                }`}>
                                  {isChecked && <Check className="w-3.5 h-3.5" />}
                                </span>
                                <span className={isChecked ? "line-through text-slate-500 font-normal" : "font-semibold"}>
                                  {chapter}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="text-xs text-slate-500 py-4 italic">
                            Please add standard subjects in the Sidebar setup component.
                          </div>
                        )}
                      </div>

                      {/* Visual progress state visual card */}
                      <div className="md:col-span-5 bg-slate-905 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center">
                        <Award className={`w-10 h-10 ${overallProgressPercent === 100 ? 'text-amber-500 animate-bounce' : 'text-indigo-400'} mb-3`} />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-serif italic">
                          Overall System Completion
                        </span>
                        
                        <div className="mt-2 text-4xl font-extrabold text-indigo-400 font-mono">
                          {overallProgressPercent}%
                        </div>

                        {/* Progress slider bar indicator */}
                        <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
                          <div 
                            className="bg-indigo-505 bg-linear-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${overallProgressPercent}%` }}
                          ></div>
                        </div>

                        <div className="mt-4 text-[11px] text-slate-400 font-medium leading-relaxed">
                          {overallProgressPercent === 100 ? (
                            <span className="text-emerald-400 font-bold block animate-pulse">
                              🌟 Outstanding Work! Complete Syllabus coverage achieved!
                            </span>
                          ) : overallProgressPercent > 0 ? (
                            <span>Milestones are active. Track your progress with diligence!</span>
                          ) : (
                            <span>Tick your first task to start visual progress!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                                 {/* AI Study Tips Section (Rule-based heuristics) */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
                      <div className="bg-amber-955 bg-amber-950/60 text-amber-400 p-1.5 rounded-lg border border-amber-900/40">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider font-serif italic">
                        💡 AI Study Tips (Intelligent Predefined Insights)
                      </h3>
                    </div>

                    <p className="text-xs text-slate-405 leading-relaxed italic">
                      Based on {studentName || "your"}'s constraints (Exam date in <b className="font-bold text-slate-300">{calculations.daysLeft} days</b> for <b className="font-bold text-slate-300">{cleanSubjects.length} subjects</b> with <b className="font-bold text-slate-300">{dailyHours}h daily slots</b>), the study planner algorithm compiled these optimized cognitive tips:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      
                      {/* Emergency Countdown condition */}
                      {calculations.daysLeft < 7 ? (
                        <div className="bg-rose-955 bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl flex items-start space-x-3">
                          <span className="text-lg shrink-0">🚨</span>
                          <div>
                            <h4 className="text-xs font-bold text-rose-300 mb-1">Emergency Buffer rule active</h4>
                            <p className="text-[11px] text-rose-200/90 leading-relaxed font-semibold">
                              Since your exam is less than 7 days away, do NOT attempt to read entire new textbooks. Rely heavily on solve-to-learn mechanics (past papers and summarized slide decks).
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-955 bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl flex items-start space-x-3">
                          <span className="text-lg shrink-0">☘️</span>
                          <div>
                            <h4 className="text-xs font-bold text-emerald-300 mb-1">Adequate Buffer Window</h4>
                            <p className="text-[11px] text-emerald-200/95 leading-relaxed font-medium">
                              With {calculations.daysLeft} days remaining, you have time for sequential deep learning sessions. Leverage active recall structures recursively after each review block.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Workload hours per subject tip */}
                      {calculations.hoursPerSubject < 5.0 ? (
                        <div className="bg-amber-955 bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex items-start space-x-3">
                          <span className="text-lg shrink-0">⏳</span>
                          <div>
                            <h4 className="text-xs font-bold text-amber-300 mb-1">Micro-Bite Pomodoro Method</h4>
                            <p className="text-[11px] text-amber-200/90 leading-relaxed font-semibold">
                              Your study load averages {calculations.hoursPerSubject}h per course. Split study spans into strict 25-minute sprints followed by 5-minute active re-energizing breaks to solidify memory schemas.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-indigo-955 bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl flex items-start space-x-3">
                          <span className="text-lg shrink-0">🧠</span>
                          <div>
                            <h4 className="text-xs font-bold text-indigo-300 mb-1">Distributed Practice Pattern</h4>
                            <p className="text-[11px] text-indigo-200/90 leading-relaxed font-medium">
                              Each subject has at least 5 hours of dedicated slotting. Apply the Feynman Technique—attempting to write down and explain the logic in direct plain language to verify your ultimate mastery.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Overload subject diversity warning */}
                      {cleanSubjects.length > 5 ? (
                        <div className="bg-purple-955 bg-purple-950/20 border border-purple-900/40 p-4 rounded-xl flex items-start space-x-3 md:col-span-2">
                          <span className="text-lg shrink-0">🔀</span>
                          <div>
                            <h4 className="text-xs font-bold text-purple-300 mb-1">Interleaved Learning Schema advised</h4>
                            <p className="text-[11px] text-purple-200/90 leading-relaxed font-semibold">
                              With {cleanSubjects.length} different core subjects, alternate between logical topic tasks (Data Structures, Math) and reading-focused topics (Operating Systems theory) on sequential days to avoid cognitive burnout.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start space-x-3 md:col-span-2">
                          <span className="text-lg shrink-0">🎯</span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-200 mb-1">Target Syllabus Deep-Dive</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                              Your active course count is optimized. Use progressive selective recall—read a major core syllabus paragraph, seal the book, and outline everything you recall in absolute raw bullet points.
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-950 border-2 border-dashed border-slate-800 py-24 text-center rounded-3xl flex flex-col items-center justify-center p-6 text-slate-500">
                  <BookOpen className="w-12 h-12 text-slate-750 mb-4 stroke-1 animate-pulse" />
                  <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider font-serif italic">
                    Ready to build your roadmap?
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed font-semibold">
                    Set up your registered name, examination date, and daily clock rate in the left Sidebar panel, then hit Generate Study Plan to run calculations.
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 2. SOURCE CODE VIEWER TAB */}
        {activeTab === "code_bundle" && (
          <div className="space-y-6">
            <div className="bg-slate-950 text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-lg border border-slate-800">
              <div>
                <span className="bg-indigo-950/50 text-indigo-400 font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md border border-indigo-900/30">
                  Hackathon Repository Assets
                </span>
                <h2 className="text-lg font-black mt-2 font-serif italic tracking-normal text-slate-100">
                  🚀 Submission-Ready Project Files Checklist
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                  These matching workspace files are generated dynamically inside your sandbox and are fully complete. You can inspect or copy each.
                </p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-xs text-slate-400 font-bold font-serif italic">Project Directory:</span>
                <span className="font-mono text-xs bg-slate-900 text-indigo-400 px-3 py-1.5 rounded-lg border border-slate-800">
                  /SmartStudyPlannerPro/
                </span>
              </div>
            </div>

            {/* Code Selector Layout Options */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* File selector deck */}
              <div className="lg:col-span-3 space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 font-serif italic">
                  Active Code Files
                </h4>
                
                {/* btn app.py */}
                <button
                  id="btn-file-py"
                  onClick={() => { setActiveCodeFile("app.py"); }}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                    activeCodeFile === "app.py" 
                      ? "bg-slate-950 border-indigo-500 text-slate-100 shadow-lg ring-1 ring-indigo-500/30" 
                      : "bg-transparent border-slate-800 hover:bg-slate-950/50 text-slate-405"
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <span className="text-amber-500 shrink-0 font-bold text-sm">🐍</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-200">app.py</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">Streamlit Core Engine</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeCodeFile === "app.py" ? "text-indigo-400" : "text-slate-600"}`} />
                </button>

                {/* btn requirements.txt */}
                <button
                  id="btn-file-req"
                  onClick={() => { setActiveCodeFile("requirements.txt"); }}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                    activeCodeFile === "requirements.txt" 
                      ? "bg-slate-950 border-indigo-500 text-slate-100 shadow-lg ring-1 ring-indigo-500/30" 
                      : "bg-transparent border-slate-800 hover:bg-slate-950/50 text-slate-405"
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <span className="text-sky-500 shrink-0 font-bold text-sm">📌</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-200">requirements.txt</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">App Dependencies</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeCodeFile === "requirements.txt" ? "text-indigo-400" : "text-slate-600"}`} />
                </button>

                {/* btn README.md */}
                <button
                  id="btn-file-readme"
                  onClick={() => { setActiveCodeFile("README.md"); }}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                    activeCodeFile === "README.md" 
                      ? "bg-slate-950 border-indigo-500 text-slate-100 shadow-lg ring-1 ring-indigo-500/30" 
                      : "bg-transparent border-slate-800 hover:bg-slate-950/50 text-slate-405"
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <span className="text-indigo-505 shrink-0 font-bold text-sm">📝</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-200">README.md</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">Deployment Manual</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeCodeFile === "README.md" ? "text-indigo-400" : "text-slate-600"}`} />
                </button>
              </div>

              {/* Code display screen */}
              <div className="lg:col-span-9 bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col">
                <div className="bg-slate-900 px-5 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1 px-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-550 bg-rose-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-550 bg-amber-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-555 bg-emerald-500/80"></span>
                    </div>
                    <span className="text-indigo-300 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                      /{activeCodeFile}
                    </span>
                  </div>
                  
                  {/* Floating click to copy action */}
                  <button
                    id="btn-copy-code"
                    onClick={() => handleCopyCode(activeCodeContent)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-650 bg-indigo-600/90 hover:bg-indigo-600 font-bold text-white text-xs transition active:scale-95 cursor-pointer"
                  >
                    {copiedState ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Code body block */}
                <div className="p-5 overflow-auto max-h-[500px] bg-[#020617]/40">
                  <pre className="font-mono text-xs text-slate-200 leading-relaxed text-left whitespace-pre-wrap select-all">
                    {activeCodeContent}
                  </pre>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. SETUP & RUNBOOK GUIDE TAB */}
        {activeTab === "setup_guide" && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center space-x-2 pb-3 border-b border-slate-800 font-serif italic">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span>Complete Hackathon Execution Commands (Runbook API)</span>
              </h2>
              
              <div className="mt-6 space-y-6">
                
                {/* Set-up sequence block 1 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-indigo-450 text-indigo-400 uppercase">Step 1: Set Up & Local Sandbox Run</span>
                    <span className="text-[10px] font-semibold text-slate-500">Windows PowerShell & Terminal</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Run these inside VS Code commands terminal to configure the standalone Python environment and deploy local hosting:
                  </p>
                  
                  <div className="bg-[#020617]/50 border border-slate-800 p-4 rounded-xl font-mono text-[11px] text-emerald-400 space-y-3 overflow-x-auto relative">
                    <button 
                      onClick={() => handleCopyCode(`python -m venv venv\n.\\venv\\Scripts\\Activate.ps1\npip install -r requirements.txt\nstreamlit run app.py`)}
                      className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-slate-350 p-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                      title="Copy complete local execution sequence"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <span className="text-slate-600"># 1. Create Virtual Workspace environment wrapper</span>
                      <div>python -m venv venv</div>
                    </div>
                    <div>
                      <span className="text-slate-600"># 2. Activate wrapper scope on PowerShell</span>
                      <div>.\venv\Scripts\Activate.ps1</div>
                    </div>
                    <div>
                      <span className="text-slate-600"># 3. Download third party dependencies list configuration</span>
                      <div>pip install -r requirements.txt</div>
                    </div>
                    <div>
                      <span className="text-slate-600"># 4. Initiate the local stream app server</span>
                      <div>streamlit run app.py</div>
                    </div>
                  </div>
                </div>

                {/* Set-up sequence block 2 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-indigo-455 text-indigo-400 uppercase">Step 2: Upload to GitHub Repository</span>
                    <span className="text-[10px] font-semibold text-slate-500">Source Control Syncing</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Initiate git tracing internally and push assets to your GitHub channel:
                  </p>
                  
                  <div className="bg-[#020617]/50 border border-slate-800 p-4 rounded-xl font-mono text-[11px] text-emerald-400 space-y-2 overflow-x-auto relative">
                    <button 
                      onClick={() => handleCopyCode(`git init\ngit add .\ngit commit -m "feat: initial commit for Smart Study Planner Pro"\ngit branch -M main\ngit remote add origin https://github.com/yourusername/smart-study-planner-pro.git\ngit push -u origin main`)}
                      className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-slate-355 p-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                      title="Copy Git pushing sequence"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <div>git init</div>
                    <div>git add .</div>
                    <div>git commit -m "feat: initial commit for Smart Study Planner Pro"</div>
                    <div>git branch -M main</div>
                    <div>git remote add origin https://github.com/yourusername/smart-study-planner-pro.git</div>
                    <div>git push -u origin main</div>
                  </div>
                </div>

                {/* Cloud Deploy deployment guidelines block */}
                <div className="space-y-3">
                  <div className="bg-indigo-950/20 border border-indigo-900/30 p-5 rounded-2xl">
                    <h4 className="font-extrabold text-sm text-indigo-305 text-indigo-300 flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-indigo-400" />
                      <span>☁️ Hackathon Judges Deployment Protocol</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      To secure a live sharing URL that you can submit directly to the hackathon evaluation panel, utilize the **Streamlit Community Cloud** (which is 100% free):
                    </p>
                    <ol className="list-decimal pl-5 mt-3 space-y-1.5 text-xs text-slate-400 font-medium leading-relaxed">
                      <li>Log in and hook your profile with GitHub on <a href="https://share.streamlit.io/" target="_blank" rel="noreferrer" className="underline font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-0.5"><span>share.streamlit.io</span><ExternalLink className="w-2.5 h-2.5 inline" /></a>.</li>
                      <li>Select <b>New App</b> on the user management portal window dashboard.</li>
                      <li>Select your newly pushed repository and target branch (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-[10.5px] font-mono text-indigo-300 border border-indigo-900/30">main</code>).</li>
                      <li>Specify <code className="bg-slate-900 px-1.5 py-0.5 rounded text-[10.5px] font-mono text-indigo-300 border border-indigo-900/30">app.py</code> inside the Primary Entry field block setup.</li>
                      <li>Click the prominent blue <b>Deploy!</b> button. The platform compiles container configurations in approximately 60 seconds and outputs a shareable live domain URL!</li>
                    </ol>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* Aesthetic Footer Panel */}
      <footer className="bg-slate-950/60 border-t border-slate-900 mt-auto py-6 text-center text-xs text-slate-500 font-medium shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Smart Study Planner Pro – Crafted with React & Streamlit paradigms for the College Innovation Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
