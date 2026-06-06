export type interviewMode = {
  mode: string;
  type: string;
  difficulty: string;
  role: string;
};

export type InterviewRequest = {
  role: string;
  difficulty: "easy" | "medium" | "hard";
  type:
    | "behavioral"
    | "technical"
    | "system_design"
    | "case_study"
    | "hr_screening";
  mode: "text" | "voice";
  duration: number;
  industry?: string;
  focusAreas?: string[];
};

export type InterviewResponse = {
  success: boolean;
  questions?: Question[];
  metadata?: {
    totalQuestions: number;
    estimatedDuration: number;
    aiModel: string;
  };
  error?: string;
  code?: string;
};

export type Answer = {
  questionId: string;
  questionText?: string;
  text: string;
  isVoice: boolean;
  duration?: number;
  submittedAt: string;

  technical_score?: number | null;
  communication_score?: number | null;
  confidence_score?: number | null;
  score?: number | null;

  feedback?: string | null;
  strengths?: string[];
  areas_to_improve?: string[];
};

export type Question = {
  id: string;
  text: string;
  type:
    | "behavioral"
    | "technical"
    | "system_design"
    | "case_study"
    | "hr_screening";
  hint?: string;
  difficulty?: string;
  category?: string;
  expectedTopics?: string[];
};

export type EvaluateRequest = {
  sessionId: string;
  questionId: string;
  answer: string;
  isVoice?: boolean;
  duration?: number;
  questionText?: string;
};

export type EvaluationResult = {
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  feedback: string;
  strengths: string[];
  areas_to_improve: string[];
};

export type EvaluateResponse = {
  success: boolean;
  evaluation?: EvaluationResult;
  saved?: boolean;
  error?: string;
  code?: string;
};

export type EndSessionRequest = {
  sessionId: string;
  answers: Answer[];
  timeUsed: number;
  completed: boolean;
};

export type EndSessionResponse = {
  success: boolean;
  summary?: {
    totalQuestions: number;
    averageScore: number;
    totalTime: number;
    completed: boolean;
  };
  error?: string;
  code?: string;
};

export type SummaryData = {
  session: {
    id: string;
    role: string;
    interview_type: string;
    level: string;
    status: string;
    started_at: string;
    ended_at: string | null;

    cheat_count?: number;
    focus_score?: number;
    suspicious?: boolean;
    focus_events?: Array<{ type: string; timestamp: number; details?: string }>;
  };
  summary: {
    final_score: number;
    raw_score?: number;
    cheat_count?: number;
    focus_score?: number;
    suspicious?: boolean;
    strengths: string[];
    weaknesses: string[];
    recommendations: string;
  };
  questions: Array<{
    id: string;
    question: string;
    answer: string;
    technical_score: number | null;
    communication_score: number | null;
    confidence_score: number | null;
    feedback: string | null;
    strengths: string[] | null;
    areas_to_improve: string[] | null;
  }>;
};
