<div align="center">

  # 🧠 PrepAI
  
  **The Ultimate AI-Powered Interview Command Center**
  
  *Stop guessing what the interviewer will ask. Start practicing with the AI that knows.*

  <br />
  
  [![Next.js](https://img.shields.io/badge/Next.js_14-000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Groq](https://img.shields.io/badge/Groq_AI-FF4F00?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTUtMTAtNXpNMiAxN2wxMCA1IDEwLTVNMiAxMmwxMCA1IDEwLTUiLz48L3N2Zz4=&logoColor=white)](https://groq.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

  <br />

  [Live Demo](https://prep-ai-khaki.vercel.app) • [Report Bug](https://github.com/Abel-Mitiku/prepai/issues) • [Request Feature](https://github.com/Abel-Mitiku/prepai/issues)

</div>

---

## 🌟 The Vision

Let’s face it: interviewing is stressful. You can have all the right technical skills, but if you freeze when the pressure is on, you lose the offer. 

**PrepAI** is an elite, AI-driven interview simulation platform designed to bridge the gap between *knowing* your craft and *articulating* it flawlessly under pressure. Powered by the blazing-fast **Groq** inference engine and backed by the robust **Supabase** ecosystem, PrepAI doesn't just ask you questions—it coaches you, evaluates you, and transforms you into the candidate they can't say no to.

---

## ✨ Core Features

### 🎯 Hyper-Personalized Scenarios
* **Context-Aware Generation:** Interviews tailored to your exact target role, tech stack, and experience level.
* **Resume-Parsed Questions:** Upload your resume, and the AI will interrogate you on your specific past projects and skills.
* **Dynamic Follow-ups:** Just like a real human interviewer, PrepAI digs deeper based on your initial answers.

### 🎤 Immersive Live Sessions
* **Zero-Latency Interaction:** Powered by **Groq's** ultra-fast LPU inference, the AI responds instantly, keeping the conversation flowing naturally.
* **Voice & Text Modes:** Speak your answers out loud or type them out. 
* **Real-Time Flow:** Experience the pressure and pacing of a real technical or behavioral interview.

### 🤖 Ruthless but Constructive AI Grading
* **Deep-Dive Analytics:** Get a comprehensive breakdown of your performance, including technical accuracy, communication clarity, and confidence scoring.
* **STAR Method Evaluation:** The AI checks if you're structuring your behavioral answers correctly (Situation, Task, Action, Result).
* **Actionable Coaching:** Don't just get a score; get specific, line-by-line recommendations on how to rephrase and improve your answers.

### 📈 The Command Center Dashboard
* **Visual Progress Tracking:** Beautiful, interactive charts (powered by Recharts) to visualize your score improvements over time.
* **Session History:** Replay and review every single interview you've ever taken.
* **Skill Gap Insights:** Identify exactly which technical concepts or soft skills you need to brush up on.

### 📄 Elite Resume & ATS Tools
* **ATS Compatibility Checker:** Paste a job description and see exactly how well your resume aligns with the bot filters.
* **AI Resume Review:** Get instant, AI-powered feedback on formatting, impact, and keyword optimization.

### 🔒 Fort Knox Security
* **Enterprise-Grade Auth:** Secure email/password flows, magic links, and password recovery via **Supabase Auth**.
* **Row Level Security (RLS):** Your data is yours. Database-level policies ensure users can only access their own interviews and resumes.

---

## 🛠 The Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend & DB** | Supabase (PostgreSQL, Auth, Storage, Edge Functions, RLS) |
| **AI Engine** | **Groq API** (Llama 3 / Mixtral for ultra-low latency inference) |
| **UI/UX** | Lucide Icons, Recharts, Framer Motion (Animations) |
| **PDF Engine** | `@react-pdf/renderer` (For dynamic resume generation) |
| **Deployment** | Vercel (Edge Network) |

---

## 🔄 How It Works

1. **Onboard & Upload:** Create your account and optionally upload your current resume.
2. **Configure the Hot Seat:** Select your target role, tech stack, and interview type (Technical, Behavioral, or Mixed).
3. **Face the AI:** Launch a live session. Answer questions naturally via voice or text in real-time.
4. **The Debrief:** Instantly receive a detailed scorecard with strengths, weaknesses, and rewritten examples of how to answer better.
5. **Level Up:** Review your analytics on the dashboard and track your journey to interview mastery.

---

## 🚀 Getting Started Locally

Want to run PrepAI on your own machine? It's surprisingly easy.

### 1. Prerequisites
* Node.js (v18+)
* A [Supabase](https://supabase.com/) account
* A [Groq](https://console.groq.com/) API key

### 2. Clone & Install
```bash
git clone https://github.com/Abel-Mitiku/prepai.git
cd prepai
npm install
