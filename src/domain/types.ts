/**
 * SAE Compliance & Evidence Engine — Domain Types
 * 
 * This file defines the formal domain types for the MVP vertical slice.
 * These types correspond to the approved conceptual model and formal specification.
 * 
 * Key invariants:
 * - DECLARED ≠ DOCUMENTED ≠ ACCREDITED ≠ VERIFIED (Rule 1)
 * - UNKNOWN ≠ NOT_APPLICABLE (Rule 2)
 * - UNKNOWN ≠ NOT_ESTABLISHED (Rule 3)
 * - PENDING ≠ NOT_ESTABLISHED (Rule 4)
 * - NO EVIDENCE FOUND ≠ REQUIREMENT NOT FULFILLED (Rule 5)
 * - EVIDENCE FOUND ≠ REQUIREMENT FULFILLED (Rule 6)
 */

// ============================================================
// CORE STATUS TYPES
// ============================================================

/**
 * AI System registration status.
 * DECLARED ≠ ACCREDITED ≠ VERIFIED (Rule 1)
 */
export type AISystemStatus = 'DECLARED' | 'DOCUMENTED' | 'ACCREDITED' | 'VERIFIED';

/**
 * Applicability status of a requirement to a given AI system.
 * PENDING means the applicability has not yet been determined.
 * NOT_APPLICABLE means the requirement does not apply (distinct from UNKNOWN).
 * APPLICABLE means the requirement applies.
 */
export type ApplicabilityStatus = 'PENDING' | 'APPLICABLE' | 'NOT_APPLICABLE';

/**
 * Evidence status.
 * DECLARED means the evidence has been registered but not yet assessed.
 * ACCEPTED means the evidence has been accepted as valid for evaluation.
 * REJECTED means the evidence has been rejected.
 * UNKNOWN means the status is genuinely unknown (distinct from NOT_ESTABLISHED).
 */
export type EvidenceStatus = 'DECLARED' | 'ACCEPTED' | 'REJECTED' | 'UNKNOWN';

/**
 * Evaluation result status.
 * PENDING — applicability is PENDING, no evaluation can be performed.
 * UNDETERMINED — applicability is established but substantive rules not yet implemented.
 * ESTABLISHED — evaluation conclusion reached (only via approved rules).
 * NOT_ESTABLISHED — evaluation performed but conclusion not reached.
 * CONFLICTING — conflicting evidence or rules prevent a single conclusion.
 * REQUIRES_HUMAN_REVIEW — system cannot resolve and requires human intervention.
 */
export type EvaluationResult =
  | 'PENDING'
  | 'UNDETERMINED'
  | 'ESTABLISHED'
  | 'NOT_ESTABLISHED'
  | 'CONFLICTING'
  | 'REQUIRES_HUMAN_REVIEW';

/**
 * Gap types.
 * MISSING_EVIDENCE — applicable requirement with no evidence provided.
 * INSUFFICIENT_EVIDENCE — evidence exists but is not sufficient.
 * CONFLICTING_EVIDENCE — evidence conflicts prevent conclusion.
 * 
 * IMPORTANT: A GAP is NOT an infringement (Rule 9).
 * A GAP is NOT culpability (Rule 10).
 */
export type GapType = 'MISSING_EVIDENCE' | 'INSUFFICIENT_EVIDENCE' | 'CONFLICTING_EVIDENCE';

/**
 * Action status.
 * PROPOSED — action candidate identified.
 * IN_PROGRESS — action is being executed.
 * COMPLETED — action execution finished.
 * VERIFIED — action result independently verified (Rule 11, 12, 13).
 * 
 * CRITICAL: COMPLETED ≠ VERIFIED (Rule 11)
 * CRITICAL: COMPLETED ≠ GAP RESOLVED (Rule 12)
 * CRITICAL: An action cannot self-certify its own result (Rule 13)
 */
export type ActionStatus = 'PROPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

/**
 * Human review decision.
 * APPROVED — human reviewer approves the evaluation.
 * REJECTED — human reviewer rejects the evaluation.
 * PENDING_REVIEW — awaiting human review.
 */
export type HumanReviewDecision = 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';

// ============================================================
// DOMAIN ENTITIES
// ============================================================

/**
 * M02 — AI System declaration.
 * Registration alone produces DECLARED status.
 * No automatic promotion to ACCREDITED or VERIFIED.
 */
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

/**
 * M03 — Requirement definition (MVP: single demo requirement).
 * The demo requirement has PENDING applicability.
 * Actual legal rules are NOT yet implemented.
 */
export interface Requirement {
  id: string;
  logicalId: string;
  version: number;
  title: string;
  description: string;
  applicability: ApplicabilityStatus;
  applicabilityBasis: string;
  /** Indicates whether this is a placeholder/demo requirement */
  isPlaceholder: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * M04 — Evidence declaration.
 * Registration alone produces DECLARED status.
 * Evidence existence does NOT imply compliance (Rule 6).
 */
export interface Evidence {
  id: string;
  logicalId: string;
  version: number;
  title: string;
  description: string;
  status: EvidenceStatus;
  requirementId: string;
  aiSystemId: string;
  declaredAt: string;
  declaredBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * M04 — Evidence evaluation result.
 * Produced by the evaluation engine, not by user declaration.
 */
export interface Evaluation {
  id: string;
  requirementId: string;
  aiSystemId: string;
  result: EvaluationResult;
  basis: string;
  evidenceIds: string[];
  evaluatedAt: string;
  evaluatedBy: string;
  /** Preserves history — previous evaluation IDs */
  previousEvaluationIds: string[];
  createdAt: string;
}

/**
 * M05 — Gap derived from evaluation.
 * A GAP is only created when there is adequate basis.
 * PENDING applicability does NOT produce a GAP.
 */
export interface Gap {
  id: string;
  requirementId: string;
  aiSystemId: string;
  evaluationId: string;
  gapType: GapType;
  description: string;
  createdAt: string;
}

/**
 * M05 — Action derived from gap.
 * An action cannot self-certify (Rule 13).
 */
export interface Action {
  id: string;
  gapId: string;
  status: ActionStatus;
  description: string;
  proposedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * M06 — Result card.
 * Represents the structured output of the evaluation chain.
 * Cannot rewrite M03 applicability (Rule 19).
 * Cannot rewrite M04 evidence evaluations (Rule 20).
 */
export interface ResultCard {
  id: string;
  aiSystemId: string;
  evaluationId: string;
  result: EvaluationResult;
  gaps: Gap[];
  actions: Action[];
  generatedAt: string;
  /** Explicitly marks unimplemented aspects */
  unimplementedAspects: string[];
}

/**
 * Human review record.
 * REQUIRES_HUMAN_REVIEW is distinct from ordinary evaluation states (Rule for Test 9).
 */
export interface HumanReview {
  id: string;
  evaluationId: string;
  decision: HumanReviewDecision;
  reviewer: string;
  reviewedAt: string;
  notes: string;
}

// ============================================================
// APPLICATION STATE
// ============================================================

/**
 * The complete application state for the MVP vertical slice.
 * This represents the in-memory state before persistence is implemented.
 */
export interface ApplicationState {
  aiSystems: AISystem[];
  requirements: Requirement[];
  evidence: Evidence[];
  evaluations: Evaluation[];
  gaps: Gap[];
  actions: Action[];
  resultCards: ResultCard[];
  humanReviews: HumanReview[];
}
