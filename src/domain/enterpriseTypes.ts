/**
 * SAE Compliance & Evidence Engine — Enterprise Audit Domain Types
 * 
 * Extended domain model supporting full enterprise audit workflow:
 * Organization → Audit → Scope → Requirement → Evidence → Evaluation →
 * Finding → Gap → Risk → Action → KPI → Human Review → Decision → PDF
 * 
 * Key principles:
 * - Multi-dimensional evidence model (availability, provenance, verification, epistemic, decision)
 * - No automatic state escalation
 * - Complete traceability
 * - Epistemic honesty
 */

// ============================================================
// ORGANIZATION
// ============================================================

export interface Organization {
  id: string;
  name: string;
  country: string;
  sector: string;
  description: string;
  publicInfo: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// AUDIT
// ============================================================

export type AuditStatus = 'PLANNED' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'HOLD';

export interface Audit {
  id: string;
  benchmarkId: string;
  title: string;
  organizationId: string;
  scope: string;
  purpose: string;
  auditType: string;
  status: AuditStatus;
  startDate: string;
  endDate: string | null;
  limitations: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// REQUIREMENT (Enhanced)
// ============================================================

export type RequirementCategory = 
  | 'GOVERNANCE'
  | 'STRATEGY'
  | 'MATERIALITY'
  | 'ENERGY'
  | 'CLIMATE'
  | 'WASTE'
  | 'WATER'
  | 'CERTIFICATION'
  | 'SUPPLY_CHAIN'
  | 'PACKAGING'
  | 'BIODIVERSITY'
  | 'ASSURANCE';

export interface Requirement {
  id: string;
  auditId: string;
  code: string;
  title: string;
  description: string;
  category: RequirementCategory;
  scope: string;
  expectedEvidence: string;
  isPlaceholder: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// EVIDENCE (Multi-dimensional model)
// ============================================================

export type EvidenceAvailability = 'AVAILABLE' | 'MISSING' | 'UNKNOWN';
export type EvidenceProvenance = 'FIRST_PARTY' | 'THIRD_PARTY' | 'REGULATORY' | 'EXTERNAL';
export type EvidenceVerification = 'UNVERIFIED' | 'REVIEWED' | 'VERIFIED' | 'REJECTED';
export type EvidenceEpistemic = 'DOCUMENTED' | 'INFERRED' | 'ESTIMATED';
export type EvidenceDecisionStatus = 'OPEN' | 'PENDING_HUMAN_REVIEW' | 'HOLD' | 'CLOSED';

export interface Evidence {
  id: string;
  requirementId: string;
  auditId: string;
  
  // Basic metadata
  title: string;
  description: string;
  
  // Source information
  sourceOrganization: string;
  sourceType: string;
  sourceUrl: string;
  publicationDate: string;
  reportingPeriod: string;
  retrievalDate: string;
  
  // Content
  relevantClaim: string;
  extractedFact: string;
  scope: string;
  
  // Multi-dimensional quality model
  availability: EvidenceAvailability;
  provenance: EvidenceProvenance;
  verification: EvidenceVerification;
  epistemic: EvidenceEpistemic;
  decisionStatus: EvidenceDecisionStatus;
  
  // Limitations
  limitations: string[];
  
  // Provenance
  provenanceChain: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// EVALUATION
// ============================================================

export type EvaluationResult = 
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_VERIFIED'
  | 'PENDING_HUMAN_REVIEW'
  | 'HOLD'
  | 'NOT_APPLICABLE';

export interface Evaluation {
  id: string;
  requirementId: string;
  auditId: string;
  evidenceIds: string[];
  result: EvaluationResult;
  basis: string;
  reasoning: string;
  humanReviewRequired: boolean;
  humanReviewReason: string;
  evaluatedAt: string;
  evaluatedBy: string;
  previousEvaluationIds: string[];
  createdAt: string;
}

// ============================================================
// FINDING
// ============================================================

export type FindingStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'PENDING_REVIEW';
export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING_HUMAN_REVIEW' | 'NOT_DETERMINABLE';

export interface Finding {
  id: string;
  requirementId: string;
  evaluationId: string;
  auditId: string;
  evidenceIds: string[];
  
  description: string;
  factualBasis: string;
  evidenceBasis: string;
  
  severity: FindingSeverity;
  status: FindingStatus;
  
  humanReviewStatus: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  humanReviewer: string | null;
  humanReviewNotes: string;
  
  recommendedAction: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// GAP (Enhanced taxonomy)
// ============================================================

export type GapCategory = 
  | 'NON_COMPLIANCE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'MISSING_EVIDENCE'
  | 'UNVERIFIED_CLAIM'
  | 'PARTIAL_COVERAGE'
  | 'OUT_OF_SCOPE'
  | 'PENDING_REVIEW';

export interface Gap {
  id: string;
  findingId: string;
  requirementId: string;
  auditId: string;
  
  category: GapCategory;
  description: string;
  
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// RISK
// ============================================================

export interface Risk {
  id: string;
  findingId: string;
  gapId: string;
  requirementId: string;
  auditId: string;
  
  description: string;
  
  // Epistemic honesty: do not fabricate scores
  likelihoodScore: string; // 'NOT_DETERMINED' | qualitative description
  impactScore: string; // 'NOT_DETERMINED' | qualitative description
  overallRisk: string; // 'NOT_DETERMINED' | qualitative description
  
  riskStatus: 'PENDING_HUMAN_REVIEW' | 'ASSESSED' | 'ACCEPTED' | 'MITIGATED';
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ACTION
// ============================================================

export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_DETERMINED';
export type ActionStatus = 'PROPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'NOT_APPLICABLE';

export interface Action {
  id: string;
  findingId: string;
  gapId: string | null;
  auditId: string;
  
  description: string;
  rationale: string;
  priority: ActionPriority;
  
  // Owner and dates — explicitly marked if unknown
  owner: string; // 'NOT_PUBLICLY_IDENTIFIED' or role
  targetDate: string; // 'NOT_PUBLICLY_IDENTIFIED' or date
  
  status: ActionStatus;
  
  humanReviewRequired: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// KPI / INDICATOR
// ============================================================

export interface KPI {
  id: string;
  requirementId: string;
  auditId: string;
  evidenceId: string | null;
  
  metricName: string;
  value: string; // 'NOT_AVAILABLE' or actual value
  unit: string;
  reportingPeriod: string;
  organizationalScope: string;
  
  source: string;
  verificationStatus: 'UNVERIFIED' | 'REVIEWED' | 'VERIFIED' | 'NOT_AVAILABLE';
  
  notes: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// HUMAN REVIEW
// ============================================================

export type HumanReviewDecision = 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW' | 'ESCALATED';

export interface HumanReview {
  id: string;
  objectId: string;
  objectType: 'EVIDENCE' | 'EVALUATION' | 'FINDING' | 'RISK' | 'ACTION' | 'DECISION';
  
  decision: HumanReviewDecision;
  reviewer: string; // 'PENDING' or actual reviewer
  reviewedAt: string | null;
  notes: string;
  
  createdAt: string;
}

// ============================================================
// AUDIT DECISION
// ============================================================

export type AuditDecision = 
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_VERIFIED'
  | 'PENDING_HUMAN_REVIEW'
  | 'HOLD';

export interface AuditDecisionRecord {
  id: string;
  auditId: string;
  
  overallDecision: AuditDecision;
  rationale: string;
  
  requirementDecisions: Array<{
    requirementId: string;
    decision: EvaluationResult;
    basis: string;
  }>;
  
  humanReviewStatus: 'PENDING' | 'COMPLETED';
  humanReviewer: string | null;
  
  decidedAt: string;
  decidedBy: string;
  
  createdAt: string;
}

// ============================================================
// AUDIT TRAIL
// ============================================================

export type AuditTrailAction = 
  | 'CREATED'
  | 'MODIFIED'
  | 'EVALUATED'
  | 'STATE_TRANSITION'
  | 'HUMAN_REVIEW'
  | 'DECISION'
  | 'REPORT_GENERATED';

export interface AuditTrailEntry {
  id: string;
  auditId: string;
  timestamp: string;
  actor: string; // 'system' | 'user' | specific role
  action: AuditTrailAction;
  objectType: string;
  objectId: string;
  previousState: string | null;
  newState: string;
  reason: string;
}

// ============================================================
// APPLICATION STATE
// ============================================================

export interface ApplicationState {
  // Core entities
  organizations: Organization[];
  audits: Audit[];
  requirements: Requirement[];
  evidence: Evidence[];
  evaluations: Evaluation[];
  findings: Finding[];
  gaps: Gap[];
  risks: Risk[];
  actions: Action[];
  kpis: KPI[];
  humanReviews: HumanReview[];
  decisions: AuditDecisionRecord[];
  auditTrail: AuditTrailEntry[];
  
  // Legacy AI compliance (preserved)
  aiSystems: AISystem[];
}

// Legacy types preserved for backward compatibility
export type AISystemStatus = 'DECLARED' | 'DOCUMENTED' | 'ACCREDITED' | 'VERIFIED';
export interface AISystem {
  id: string;
  logicalId: string;
  version: number;
  name: string;
  useCase: string;
  status: AISystemStatus;
  declaredAt: string;
  declaredBy: string;
  createdAt: string;
  updatedAt: string;
}
