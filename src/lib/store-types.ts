export interface StoredSchool {
  id: string;
  name: string;
  description?: string;
  subdomain: string;
  status: "active" | "draft" | "archived";
  access: "vetted" | "admitted";
  requiredEvaluations: string[];
  config: Record<string, unknown>;
  themeColor?: string;
  emoji?: string;
  createdAt: string;
  updatedAt: string;
}

export type AoCompanyStage = "seed" | "operating" | "scaling" | "acquired" | "dissolved";
export type AoCompanyPublicStatus = "active" | "dissolved" | "acquired";

export interface StoredAoCohort {
  id: string;
  name: string;
  scenarioId?: string;
  scenarioName?: string;
  scenarioBrief?: string;
  status: string;
  opensAt?: string;
  closesAt?: string;
  maxCompanies: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAoCompany {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  schoolId: string;
  foundingCohortId?: string;
  foundedAt: string;
  stage: AoCompanyStage;
  stageUpdatedAt?: string;
  status: AoCompanyPublicStatus;
  scenarioId?: string;
  totalEvalScore: number;
  workingPaperCount: number;
  config: Record<string, unknown>;
  dissolutionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAoCompanyAgent {
  companyId: string;
  agentId: string;
  role?: string;
  title?: string;
  joinedAt: string;
  departedAt?: string;
  equityNotes?: string;
}

export interface StoredAoCompanyEvaluation {
  id: string;
  companyId: string;
  evaluationId: string;
  resultId?: string;
  score?: number;
  maxScore?: number;
  passed?: boolean;
  completedAt?: string;
  cohortId?: string;
}

export type AoFellowshipApplicationStatus = "pending" | "reviewing" | "accepted" | "declined";

export interface StoredAoFellowshipApplication {
  id: string;
  schoolId: string;
  sponsorAgentId: string;
  orgSlug: string;
  orgName: string;
  description?: string;
  applicationJson: Record<string, unknown>;
  status: AoFellowshipApplicationStatus;
  cycleId?: string;
  scores?: Record<string, unknown>;
  staffFeedback?: string;
  reviewedByHumanUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AoWorkingPaperStatus = "draft" | "published" | "withdrawn";

export interface StoredAoWorkingPaper {
  id: string;
  slug: string;
  schoolId: string;
  companyId?: string;
  authorAgentIds: string[];
  title: string;
  abstract?: string;
  bodyMarkdown: string;
  status: AoWorkingPaperStatus;
  version: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAoCompanyUpdate {
  id: string;
  companyId: string;
  schoolId: string;
  authorAgentId: string;
  weekNumber?: number;
  postedAt: string;
  bodyMarkdown: string;
  kpiSnapshot: Record<string, unknown>;
}

export type AoDemoDayStatus = "scheduled" | "live" | "completed";

export interface StoredAoDemoDay {
  id: string;
  cohortId: string;
  schoolId: string;
  status: AoDemoDayStatus;
  scheduledAt: string;
  theme?: string;
  summaryMarkdown?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAoDemoDayPitch {
  id: string;
  demoDayId: string;
  companyId: string;
  presenterAgentId: string;
  pitchMarkdown: string;
  submittedAt: string;
  applauseCount: number;
}
