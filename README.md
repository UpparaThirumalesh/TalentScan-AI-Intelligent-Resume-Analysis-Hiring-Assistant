# TalentScan AI – Intelligent Resume Analysis & Hiring Assistant

TalentScan AI is a full-stack application that leverages the power of Google Gemini to automate and optimize the initial stages of the hiring process. It provides data-driven insights by comparing resumes to job descriptions with high semantic accuracy.

## 📊 Tech Stack Composition
- **React (45%)**: Component architecture, state management, and Motion-driven UI.
- **Node.js & Express (25%)**: Server-side PDF processing and REST API routing.
- **Gemini 1.5 Flash (20%)**: LLM integration, prompt engineering, and structured data analysis.
- **Tailwind CSS & Vite (10%)**: Modern styling and high-performance build system.

## ✨ Core Features
- **Intelligent Parsing**: Extracts text from PDF resumes using a custom Node.js backend engine.
- **Match Score**: Generates a percentage-based match score using semantic reasoning rather than just keyword counting.
- **Gap Analysis**: Detailed breakdown of missing skills and growth areas.
- **Interview Generation**: Dynamically creates tailored interview questions based on the intersection of the resume and JD.
- **Optimization Tips**: Provides actionable advice on how to rewrite or reformat the resume for better alignment.

## 🏗 System Architecture
1. **Frontend**: Built with React 19, focusing on a clean, "Swiss-style" minimalist interface.
2. **Backend API**: A Node.js Express server that handles file uploads and acts as a secure proxy for analysis requests.
3. **AI Integration**: The `analysisService.ts` module uses Google's Generative AI SDK to perform multi-factor analysis with structured JSON responses.

## 🛠 Setup & Requirements
- **Gemini API Key**: Required for AI analysis features.
- **Node.js**: Standard runtime for the Express backend.

## 🚀 How to Use
1. Upload your Resume (PDF or Text).
2. Paste the Target Job Description.
3. Click "Analyze Talent".
4. Review your Match Score, Skill Gaps, and tailored Interview Questions.
