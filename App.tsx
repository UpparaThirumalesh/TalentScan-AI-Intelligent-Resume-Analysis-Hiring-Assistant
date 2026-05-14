import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Brain, ListChecks, MessageSquare, ArrowLeft, Loader2, Target } from "lucide-react";
import { analyzeResume, type AnalysisResult } from "@/src/lib/analysisService.ts";
import { cn } from "@/src/lib/utils.ts";
import ReactMarkdown from "react-markdown";

interface AnalysisState {
  resumeText: string;
  jobDescription: string;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}

export default function App() {
  const [state, setState] = useState<AnalysisState>({
    resumeText: "",
    jobDescription: "",
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && file.type !== "text/plain") {
      setState(prev => ({ ...prev, error: "Please upload a PDF or Text file." }));
      return;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      if (file.type === "application/pdf") {
        const formData = new FormData();
        formData.append("resume", file);
        const response = await fetch("/api/extract-text", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setState(prev => ({ ...prev, resumeText: data.text, isAnalyzing: false }));
      } else {
        const text = await file.text();
        setState(prev => ({ ...prev, resumeText: text, isAnalyzing: false }));
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isAnalyzing: false }));
    }
  };

  const startAnalysis = async () => {
    if (!state.resumeText || !state.jobDescription) {
      setState(prev => ({ ...prev, error: "Both resume and job description are required." }));
      return;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      const result = await analyzeResume(state.resumeText, state.jobDescription);
      setState(prev => ({ ...prev, result, isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: "Analysis failed. Please check your API key or input.", isAnalyzing: false }));
    }
  };

  const reset = () => {
    setState({
      resumeText: "",
      jobDescription: "",
      isAnalyzing: false,
      result: null,
      error: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">TalentScan AI</span>
          </div>
          <button 
            onClick={reset}
            className="text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {!state.result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-[#111827]">
                  Precision Resume Analysis
                </h1>
                <p className="text-[#6B7280] max-w-xl mx-auto">
                  Compare your resume against any job description. Get instant feedback, skill gaps, and interview prep.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-12">
                {/* Resume Section */}
                <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#F3F4F6] rounded-xl text-[#374151]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h2 className="font-semibold text-lg">Your Resume</h2>
                    </div>
                    {state.resumeText && (
                      <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <input
                        type="file"
                        id="resume-upload"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.txt"
                      />
                      <label 
                        htmlFor="resume-upload"
                        className={cn(
                          "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                          state.resumeText 
                            ? "bg-[#F9FAFB] border-[#E5E7EB]" 
                            : "bg-white border-[#D1D5DB] hover:border-[#1A1A1A] hover:bg-[#F9FBFF]"
                        )}
                      >
                        <Upload className="w-8 h-8 text-[#9CA3AF] mb-3 group-hover:text-[#1A1A1A] transition-colors" />
                        <span className="font-medium text-[#374151]">
                          {state.resumeText ? "Change Resume" : "Upload PDF or Text"}
                        </span>
                        <span className="text-xs text-[#6B7280] mt-1">or paste text directly below</span>
                      </label>
                    </div>

                    <textarea
                      placeholder="Paste your resume text here..."
                      className="w-full h-48 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-[#1A1A1A] transition-all"
                      value={state.resumeText}
                      onChange={(e) => setState(prev => ({ ...prev, resumeText: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Job Description Section */}
                <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F3F4F6] rounded-xl text-[#374151]">
                      <Target className="w-5 h-5" />
                    </div>
                    <h2 className="font-semibold text-lg">Job Description</h2>
                  </div>

                  <textarea
                    placeholder="Paste the target job description here..."
                    className="w-full h-full min-h-[314px] p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-[#1A1A1A] transition-all"
                    value={state.jobDescription}
                    onChange={(e) => setState(prev => ({ ...prev, jobDescription: e.target.value }))}
                  />
                </div>
              </div>

              {state.error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {state.error}
                </motion.div>
              )}

              <div className="flex justify-center pt-8">
                <button
                  onClick={startAnalysis}
                  disabled={state.isAnalyzing || !state.resumeText || !state.jobDescription}
                  className="group relative h-14 w-64 bg-[#1A1A1A] rounded-full overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2 text-white font-semibold tracking-wide">
                    {state.isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze Talent
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setState(prev => ({ ...prev, result: null }))}
                  className="p-2 bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold">Analysis Results</h1>
                  <p className="text-sm text-[#6B7280]">Real-time talent matching report</p>
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-8">
                {/* Score Column */}
                <div className="md:col-span-4 space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm flex flex-col items-center text-center space-y-4">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="none"
                          stroke="#F3F4F6"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="none"
                          stroke={state.result.matchScore >= 80 ? "#10B981" : state.result.matchScore >= 50 ? "#F59E0B" : "#EF4444"}
                          strokeWidth="8"
                          strokeDasharray={364.4}
                          initial={{ strokeDashoffset: 364.4 }}
                          animate={{ strokeDashoffset: 364.4 - (364.4 * state.result.matchScore) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{state.result.matchScore}%</span>
                        <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Match</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Verdict</h3>
                      <p className="text-sm text-[#4B5563] leading-relaxed italic">"{state.result.reasoning}"</p>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] p-8 rounded-3xl text-white space-y-6">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold">Skill Gaps</h3>
                    </div>
                    <ul className="space-y-3">
                      {state.result.skillGaps.map((skill, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Content Column */}
                <div className="md:col-span-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <h3 className="font-semibold uppercase text-xs tracking-widest">Key Strengths</h3>
                      </div>
                      <ul className="space-y-3">
                        {state.result.strengths.map((s, i) => (
                          <li key={i} className="text-sm font-medium flex gap-2 text-[#374151]">
                            <span>•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-5 h-5" />
                        <h3 className="font-semibold uppercase text-xs tracking-widest">Growth Areas</h3>
                      </div>
                      <ul className="space-y-3">
                        {state.result.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm font-medium flex gap-2 text-[#374151]">
                            <span>•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Tailored Interview Questions</h3>
                    </div>
                    <div className="grid gap-4">
                      {state.result.interviewQuestions.map((q, i) => (
                        <div key={i} className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] text-sm text-[#374151] leading-relaxed">
                          <span className="font-bold text-blue-600 mr-2">Q{i+1}:</span> {q}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold">Optimization Tips</h3>
                    </div>
                    <ul className="space-y-4">
                      {state.result.improvedResumeTips.map((tip, i) => (
                        <li key={i} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs border border-indigo-100">
                            {i + 1}
                          </div>
                          <p className="text-sm text-[#4B5563] leading-relaxed">{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-[#E5E7EB] bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#6B7280]">
            © 2026 TalentScan AI. Powered by Google Gemini.
          </div>
          <div className="flex gap-6 text-sm font-medium text-[#6B7280]">
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

