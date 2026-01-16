import type {
  JobListing,
  Profile,
} from "@in-midst-my-life/schema";
import type {
  ResumeTailor,
  CoverLetterGenerator,
} from "./hunter-agent";

/**
 * Document Generation
 * Tool 3: Tailor Resume - Show the right mask
 * Tool 4: Write Cover Letter - Personalized and authentic
 *
 * Philosophy:
 * - Resume: Filter CV entries by selected mask - show relevant accomplishments
 * - Cover Letter: Personalized addressing of job requirements + cultural fit
 */

export class DefaultResumeTailor implements ResumeTailor {
  async generateForJob(
    profile: Profile,
    personaId: string,
    _jobId: string
  ): Promise<{
    resume: string;
    emphasize: string[];
    deEmphasize: string[];
    personaName: string;
  }> {
    // In production: filter CV entries by persona
    // For MVP: generate generic resume with persona sections

    const emphasize = this.getEmphasisPoints(personaId);
    const deEmphasize = this.getDeEmphasisPoints(personaId);
    const personaName = this.getPersonaName(personaId);

    const resume = this.buildResumeContent(profile, personaId, emphasize);

    return {
      resume,
      emphasize,
      deEmphasize,
      personaName,
    };
  }

  /**
   * Build resume content with persona filtering
   */
  private buildResumeContent(
    profile: Profile,
    personaId: string,
    emphasize: string[]
  ): string {
    let resume = "";

    // Header
    resume += `# ${profile.displayName}\n`;
    resume += `[Contact Info Provided Upon Request] | ${profile.locationText || "Remote"}\n\n`;

    // Summary
    resume += `## Professional Summary\n\n`;
    resume += `${this.generateSummary(profile, personaId)}\n\n`;

    // Experience (filtered and ordered by emphasis)
    resume += `## Experience\n`;
    resume += this.generateExperience(profile, emphasize);
    resume += `\n\n`;

    // Skills (prioritized by persona)
    resume += `## Skills\n`;
    resume += this.generateSkills(profile, personaId);
    resume += `\n\n`;

    // Education
    resume += `## Education\n`;
    resume += this.generateEducation(profile);
    resume += `\n\n`;

    // Certifications/Achievements
    resume += `## Certifications & Achievements\n`;
    resume += this.generateAchievements(profile, emphasize);

    return resume;
  }

  private generateSummary(_profile: Profile, personaId: string): string {
    // Persona-specific summary
    const summaries: Record<string, string> = {
      Architect:
        "Technical leader with proven ability to design and execute large-scale systems. Strong track record of building high-performing teams and delivering business impact.",
      Engineer:
        "Full-stack engineer with strong foundation in modern web technologies. Experienced in building scalable, maintainable systems and collaborating across teams.",
      Technician:
        "Skilled engineer focused on technical excellence and deep problem-solving. Committed to understanding systems at their core and delivering high-quality solutions.",
      Analyst:
        "Data-driven problem solver with ability to translate business needs into technical solutions. Strong analytical and communication skills.",
      Synthesist:
        "Connector and integrator who bridges technical and business domains. Skilled at seeing patterns and creating coherent systems from diverse components.",
      Generalist:
        "Versatile engineer comfortable across the full stack. Adaptable to diverse technical challenges and strong at learning new domains quickly.",
    };

    return summaries[personaId] || summaries["Engineer"] || "";
  }

  private generateExperience(_profile: Profile, emphasize: string[]): string {
    // In production: filter CV entries by persona
    // For MVP: generate mock experience

    const experience = `
### Senior Engineer | TechCorp | 2023-Present
- Led migration of 50+ microservices to new architecture
- Reduced system latency by 40% through optimization work
- Mentored team of 3 junior engineers
- ${emphasize[0] || "Improved system reliability and scalability"}

### Full-Stack Engineer | StartupXYZ | 2021-2023
- Built core product features from zero to production
- Designed and implemented API serving 100K+ daily users
- Contributed to raising Series A funding through technical demos
- ${emphasize[1] || "Wore multiple hats in fast-paced startup environment"}

### Junior Engineer | Acme Corp | 2019-2021
- Maintained and improved legacy systems serving millions
- Implemented new features across frontend and backend
- Participated in on-call rotation and incident response
- ${emphasize[2] || "Learned production engineering fundamentals"}
    `.trim();

    return experience;
  }

  private generateSkills(_profile: Profile, personaId: string): string {
    const skillsByPersona: Record<string, string[]> = {
      Architect: [
        "System Design",
        "Microservices Architecture",
        "Distributed Systems",
        "Team Leadership",
        "Technical Strategy",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
      ],
      Engineer: [
        "Full-stack development",
        "TypeScript",
        "React",
        "Node.js",
        "PostgreSQL",
        "REST APIs",
        "Problem Solving",
        "Collaboration",
      ],
      Technician: [
        "Systems Programming",
        "Performance Optimization",
        "Debugging & Troubleshooting",
        "Low-Level Concepts",
        "C++",
        "Python",
        "Assembly",
        "Database Optimization",
      ],
      Analyst: [
        "Data Analysis",
        "SQL",
        "Python",
        "Tableau",
        "Statistical Analysis",
        "Business Intelligence",
        "Problem Decomposition",
      ],
      Synthesist: [
        "Systems Thinking",
        "Cross-functional Leadership",
        "Architecture Design",
        "Communication",
        "Holistic Problem Solving",
        "Integration",
      ],
      Generalist: [
        "Full-Stack Development",
        "Quick Learning",
        "Adaptability",
        "End-to-End Ownership",
        "Multiple Domains",
        "Pragmatic Solutions",
      ],
    };

    const skills = skillsByPersona[personaId] || skillsByPersona["Engineer"] || [];
    return skills.map((skill) => `- ${skill}`).join("\n");
  }

  private generateEducation(_profile: Profile): string {
    return `
### Bachelor of Science, Computer Science
University Name | 2019

Relevant Coursework: Algorithms, Databases, Distributed Systems
    `.trim();
  }

  private generateAchievements(_profile: Profile, emphasize: string[]): string {
    return `
- ${emphasize[0] || "Major project delivery with significant business impact"}
- ${emphasize[1] || "Industry recognition or awards"}
- ${emphasize[2] || "Open source contributions or technical publications"}
- Consistent high performance reviews and promotions
    `.trim();
  }

  private getEmphasisPoints(personaId: string): string[] {
    const emphasisMap: Record<string, string[]> = {
      Architect: [
        "System design and architecture experience",
        "Team leadership and mentorship",
        "Scalability and performance optimization",
      ],
      Engineer: [
        "Full-stack development capabilities",
        "Product-focused engineering",
        "Collaboration and teamwork",
      ],
      Technician: [
        "Deep technical expertise",
        "Problem-solving abilities",
        "Code quality and performance",
      ],
      Analyst: [
        "Data-driven decision making",
        "Business acumen",
        "Analytical thinking",
      ],
      Synthesist: [
        "Cross-domain understanding",
        "Holistic solutions",
        "Communication skills",
      ],
      Generalist: [
        "Versatility and adaptability",
        "End-to-end ownership",
        "Quick learning ability",
      ],
    };

    return emphasisMap[personaId] || emphasisMap["Engineer"] || [];
  }

  private getDeEmphasisPoints(personaId: string): string[] {
    // Points to downplay for this persona
    const deEmphasisMap: Record<string, string[]> = {
      Architect: ["Individual contributions", "Tactical coding"],
      Engineer: ["Solo work", "Isolated technical deep dives"],
      Technician: ["Non-technical work", "Meetings"],
      Analyst: ["Creative work", "Subjective decisions"],
      Synthesist: ["Technical minutiae", "Single-domain focus"],
      Generalist: ["Specialization", "Deep expertise"],
    };

    return deEmphasisMap[personaId] || [];
  }

  private getPersonaName(personaId: string): string {
    const nameMap: Record<string, string> = {
      Architect: "Architect",
      Engineer: "Engineer",
      Technician: "Technician",
      Analyst: "Analyst",
      Synthesist: "Synthesist",
      Generalist: "Generalist",
    };

    return nameMap[personaId] || "Professional";
  }
}

/**
 * Cover Letter Generator
 * Creates personalized, authentic cover letters
 */
export class DefaultCoverLetterGenerator implements CoverLetterGenerator {
  async generate(input: {
    job: JobListing;
    profile: Profile;
    personaId: string;
    tailoredResume: string;
  }): Promise<{
    letter: string;
    personalized: string[];
    tone: "formal" | "conversational" | "enthusiastic";
  }> {
    const { job, profile, personaId, tailoredResume: _tailoredResume } = input;

    const tone = this.selectTone(job);
    const personalizedElements = this.identifyPersonalizedElements(job, profile);
    const letter = this.buildCoverLetter(job, profile, personaId, personalizedElements, tone);

    return {
      letter,
      personalized: personalizedElements,
      tone,
    };
  }

  /**
   * Select tone based on company culture
   */
  private selectTone(
    job: JobListing
  ): "formal" | "conversational" | "enthusiastic" {
    if (job.company_size === "startup") {
      return "conversational"; // Startups tend to be more casual
    }

    if (job.company_industry?.includes("Tech")) {
      return "enthusiastic"; // Tech companies appreciate passion
    }

    return "formal"; // Default to formal for established companies
  }

  /**
   * Identify personalized elements from job description
   */
  private identifyPersonalizedElements(job: JobListing, _profile: Profile): string[] {
    const elements: string[] = [];

    // Company mission/values
    if (job.description) {
      if (job.description.includes("impact")) {
        elements.push("company_impact");
      }
      if (job.description.includes("innovative")) {
        elements.push("innovation");
      }
      if (job.description.includes("scale")) {
        elements.push("scale");
      }
    }

    // Company size
    elements.push(`company_size_${job.company_size}`);

    // Technologies mentioned
    if (job.technologies && job.technologies.length > 0) {
      elements.push(`technologies: ${job.technologies.slice(0, 2).join(", ")}`);
    }

    return elements;
  }

  /**
   * Build personalized cover letter
   */
  private buildCoverLetter(
    job: JobListing,
    profile: Profile,
    _personaId: string,
    personalizedElements: string[],
    tone: "formal" | "conversational" | "enthusiastic"
  ): string {
    const letterHeader = this.generateHeader(profile);
    const opening = this.generateOpening(job, tone);
    const middleBody = this.generateMiddleBody(job, profile, personalizedElements);
    const closing = `
Sincerely,

${profile.displayName}
[Contact Info Provided Upon Request]
`;

    return [letterHeader, opening, middleBody, closing].join("\n\n");
  }

  private generateHeader(profile: Profile): string {
    return `${profile.displayName}
[Email Address]
${new Date().toLocaleDateString()}

[Company Name]
[Address]`;
  }

  private generateOpening(job: JobListing, tone: string): string {
    if (tone === "formal") {
      return `Dear Hiring Team,

I am writing to express my strong interest in the ${job.title} position at ${job.company}.`;
    }

    if (tone === "conversational") {
      return `Hi Team,

I came across the ${job.title} opening at ${job.company} and it immediately caught my attention.`;
    }

    return `Dear ${job.company} Team,

I'm excited about the opportunity to join your team as a ${job.title}.`;
  }

  private generateMiddleBody(
    job: JobListing,
    _profile: Profile,
    personalizedElements: string[]
  ): string {
    let body = "In my current/recent role, I've developed strong expertise in ";

    // Mention relevant technologies
    if (job.technologies && job.technologies.length > 0) {
      body += `${job.technologies.slice(0, 3).join(", ")} and related technologies. `;
    }

    body += `\n\nWhat appeals to me most about this role is ${this.generateAppealPoint(job, personalizedElements)}. `;

    body += `I'm confident that my background in [relevant area] combined with my `;
    body += `passion for [company values/goals] makes me a strong fit for this opportunity.`;

    return body;
  }

  private generateAppealPoint(job: JobListing, personalizedElements: string[]): string {
    if (personalizedElements.includes("company_impact")) {
      return "the opportunity to build something with meaningful impact";
    }

    if (job.company_size === "startup") {
      return "the chance to wear multiple hats and shape product direction";
    }

    if (job.company_size === "enterprise") {
      return "the opportunity to work on systems at scale";
    }

    return "the challenge and growth opportunity";
  }



}

interface ResumeGenerationOptions {
  highlightGaps?: boolean;
  includeMetadata?: boolean;
  personaId?: string;
}

interface CoverLetterGenerationOptions {
  template?: "professional" | "creative" | "direct" | "academic";
  tone?: "formal" | "conversational" | "enthusiastic";
  includeSalutation?: boolean;
  includeSignature?: boolean;
  personaId?: string;
}

export interface DocumentGeneratorResult {
  content: string;
  confidence: number;
  keywordMatches: string[];
  suggestedImprovements: string[];
  tone?: "formal" | "conversational" | "enthusiastic";
}

export class DocumentGenerator {
  private resumeTailor = new DefaultResumeTailor();
  private coverLetterGenerator = new DefaultCoverLetterGenerator();

  async generateResume(
    profile: Profile,
    job: JobListing,
    options: ResumeGenerationOptions = {}
  ): Promise<DocumentGeneratorResult> {
    const personaId = options.personaId || this.detectPersona(profile);
    const tailored = await this.resumeTailor.generateForJob(profile, personaId, job.id);

    const keywords = this.extractKeywords(job);
    const matches = this.findKeywordMatches(profile, keywords);
    const missing = keywords.filter((keyword) => !matches.includes(keyword));
    const confidence = this.calculateConfidence(matches.length, keywords.length);

    const suggestions: string[] = [];
    if (options.highlightGaps !== false && missing.length > 0) {
      suggestions.push(
        ...missing.slice(0, 3).map((keyword) => `Mention "${keyword}" within a relevant experience bullet.`)
      );
    }
    if (options.includeMetadata === false) {
      suggestions.push("Enable metadata flags to surface persona-specific strengths.");
    }
    if (suggestions.length === 0) {
      suggestions.push("Quantify achievements to strengthen resonance with the role.");
    }

    return {
      content: tailored.resume,
      confidence,
      keywordMatches: matches,
      suggestedImprovements: suggestions,
    };
  }

  async generateCoverLetter(
    profile: Profile,
    job: JobListing,
    options: CoverLetterGenerationOptions = {}
  ): Promise<DocumentGeneratorResult> {
    const personaId = options.personaId || this.detectPersona(profile);
    const tailoredResume = await this.resumeTailor.generateForJob(profile, personaId, job.id);
    const coverLetter = await this.coverLetterGenerator.generate({
      job,
      profile,
      personaId,
      tailoredResume: tailoredResume.resume,
    });
    const tone = coverLetter.tone;

    const keywords = this.extractKeywords(job);
    const matches = this.findKeywordMatches(profile, keywords);
    const missing = keywords.filter((keyword) => !matches.includes(keyword));
    const confidence = this.calculateConfidence(matches.length, keywords.length);

    let content = this.applyCoverLetterTemplate(coverLetter.letter, options);
    if (options.includeSalutation === false) {
      content = this.stripSalutation(content);
    }
    if (options.includeSignature === false) {
      content = this.stripSignature(content);
    }

    const suggestions: string[] = [];
    if (missing.length > 0) {
      suggestions.push(
        ...missing.slice(0, 2).map((keyword) => `Tie the "${keyword}" experience to measurable outcomes.`)
      );
    }
    if (options.tone && options.tone !== coverLetter.tone) {
      suggestions.push(`Adjust the tone to be more ${options.tone}.`);
    }
    if (suggestions.length === 0) {
      suggestions.push("Highlight how your background maps directly to the company's mission.");
    }

    return {
      content,
      confidence,
      keywordMatches: matches,
      suggestedImprovements: suggestions,
      tone,
    };
  }

  private detectPersona(profile: Profile): string {
    if (profile.title?.toLowerCase().includes("architect")) {
      return "Architect";
    }
    if (profile.title?.toLowerCase().includes("lead")) {
      return "Engineer";
    }
    return "Generalist";
  }

  private extractKeywords(job: JobListing): string[] {
    const text = [
      job.title,
      job.company,
      job.description,
      job.requirements,
      job.technologies?.join(" "),
      job.location,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const tokens = Array.from(new Set(text.match(/[a-z0-9]{4,}/g) || []));
    if (tokens.length === 0) {
      return ["impact", "scale", "leadership"];
    }

    return tokens.slice(0, 12);
  }

  private findKeywordMatches(profile: Profile, keywords: string[]): string[] {
    const experiences = profile.experiences?.map((exp) => exp.roleTitle).join(" ") ?? "";
    const skills = profile.skills?.map((skill) => skill.name).join(" ") ?? "";
    const profileText = [
      profile.summaryMarkdown,
      experiences,
      skills,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return keywords.filter((keyword) => profileText.includes(keyword));
  }

  private calculateConfidence(matchCount: number, totalKeywords: number): number {
    if (totalKeywords === 0) return 0.5;
    const ratio = matchCount / totalKeywords;
    return Math.min(1, 0.4 + ratio * 0.6);
  }

  private applyCoverLetterTemplate(content: string, options: CoverLetterGenerationOptions): string {
    const templatePrefix = {
      professional: "",
      creative: "🌟 Creative & Bold Introduction 🌟\n",
      direct: "Direct Note:\n",
      academic: "Dear Committee,\n",
    }[options.template ?? "professional"] ?? "";

    const templateSuffix = options.template === "academic" ? "\nSincerely,\n[Insert Academic Title]" : "";
    return `${templatePrefix}${content}${templateSuffix}`;
  }

  private stripSalutation(content: string): string {
    const parts = content.split("\n\n");
    return parts.length > 1 ? parts.slice(1).join("\n\n") : content;
  }

  private stripSignature(content: string): string {
    const lines = content.split("\n");
    if (lines.length <= 3) return content;
    return lines.slice(0, lines.length - 2).join("\n");
  }
}
