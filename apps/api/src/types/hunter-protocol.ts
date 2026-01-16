export interface DocumentGeneratorResult {
  content: string;
  confidence: number;
  keywordMatches: string[];
  suggestedImprovements: string[];
}

export interface TailoredResume {
  profileId: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  personaRecommendation?: string;
  resume: {
    content: string;
    format: "pdf" | "docx" | "markdown";
    confidence: number;
    keywordMatches: string[];
    suggestedImprovements: string[];
  };
  resumeMarkdown?: string;
  selectedExperiences?: string[];
  tailoringRationale?: string;
  personalizationNotes?: string;
  metadata: {
    generatedAt: string;
    remainingTailorings: number;
    expiresAt: string;
  };
}

export interface GeneratedCoverLetter {
  profileId: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  hiringManager: string;
  coverLetter: {
    content: string;
    template: "professional" | "creative" | "direct" | "academic";
    tone: "formal" | "conversational" | "enthusiastic";
    wordCount: number;
    readingTime: number;
  };
  coverLetterMarkdown?: string;
  personalizationNotes?: string;
  toneUsed?: "formal" | "conversational" | "enthusiastic";
  metadata: {
    generatedAt: string;
    remainingLetters: number;
    expiresAt: string;
    editableUntil: string;
  };
}

export interface ApplicationSubmission {
  id: string;
  profileId: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  resume: string;
  coverLetter: string;
  submittedAt: string;
  status: "applied" | "draft" | "interviewing" | "offer" | "rejected" | "withdrawn";
  submissionType: "manual" | "auto";
  confirmationCode: string;
  appliedVia?: string;
}

export interface ApplicationSubmissionResult {
  success: boolean;
  submissionId: string;
  jobTitle: string;
  jobCompany: string;
  confirmationCode: string;
  submitted: {
    resume: boolean;
    coverLetter: boolean;
    autoSubmitted: boolean;
  };
  nextSteps: string[];
  metadata: {
    submittedAt: string;
    trackingId: string;
    communicationPreferences: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      inAppNotifications: boolean;
    };
  };
}
