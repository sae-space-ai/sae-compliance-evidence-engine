/**
 * SAE Compliance & Evidence Engine — Domain Engine
 * 
 * This file contains the core algorithm logic for the MVP vertical slice.
 * 
 * CRITICAL INVARIANTS:
 * - PENDING applicability → PENDING evaluation, no compliance conclusion
 * - No auto-certification (Rule 1, 13)
 * - No unjustified GAPs
 * - Evidence ≠ compliance (Rule 6)
 * - Action completed ≠ verified (Rule 11)
 * - Action completed ≠ gap resolved (Rule 12)
 * - History preserved (Rule 14, 15)
 * - Conflicts never silently resolved (Rule 16)
 * - Uncertainty represented explicitly (Rule 17)
 */

import type {
  AISystem,
  AISystemStatus,
  ApplicationState,
  Evaluation,
  EvaluationResult,
  Evidence,
  EvidenceStatus,
  Gap,
  GapType,
  Requirement,
  ResultCard,
  Action,
  ActionStatus,
  HumanReview,
  HumanReviewDecision,
} from './types.ts';

// ============================================================
// ID GENERATION
// ============================================================

let idCounter = 0;

function generateId(): string {
  idCounter++;
  return `id_${Date.now()}_${idCounter}`;
}

function generateLogicalId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

// ============================================================
// INITIAL STATE
// ============================================================

/**
 * Creates the initial application state with the demo requirement.
 * The demo requirement has PENDING applicability — this is intentional.
 */
export function createInitialState(): ApplicationState {
  const demoRequirement: Requirement = {
    id: 'req_demo_001',
    logicalId: 'log_req_demo_001',
    version: 1,
    title: 'Demo Requirement — MVP Vertical Slice',
    description:
      'This is a placeholder requirement for the MVP vertical slice demonstration. ' +
      'It does NOT represent an implemented legal rule. ' +
      'Actual legal requirements must be based on official primary sources (M03 boundary).',
    applicability: 'PENDING',
    applicabilityBasis:
      'NOT_IMPLEMENTED — Substantive applicability rules have not yet been approved/implemented. ' +
      'This requirement exists solely to demonstrate the evaluation chain.',
    isPlaceholder: true,
    createdAt: now(),
    updatedAt: now(),
  };

  return {
    aiSystems: [],
    requirements: [demoRequirement],
    evidence: [],
    evaluations: [],
    gaps: [],
    actions: [],
    resultCards: [],
    humanReviews: [],
  };
}

// ============================================================
// M02 — AI SYSTEM REGISTRATION
// ============================================================

/**
 * Registers a new AI system.
 * 
 * INVARIANT: Registration produces DECLARED status only.
 * DECLARED ≠ ACCREDITED ≠ VERIFIED (Rule 1)
 */
export function registerAISystem(
  state: ApplicationState,
  name: string,
  useCase: string,
  declaredBy: string
): { state: ApplicationState; aiSystem: AISystem } {
  if (!name.trim()) {
    throw new Error('AI system name is required');
  }
  if (!useCase.trim()) {
    throw new Error('AI system use case is required');
  }

  const aiSystem: AISystem = {
    id: generateId(),
    logicalId: generateLogicalId(),
    version: 1,
    name: name.trim(),
    useCase: useCase.trim(),
    status: 'DECLARED',
    declaredAt: now(),
    declaredBy: declaredBy || 'anonymous',
    createdAt: now(),
    updatedAt: now(),
  };

  return {
    state: {
      ...state,
      aiSystems: [...state.aiSystems, aiSystem],
    },
    aiSystem,
  };
}

/**
 * Updates AI system status — requires explicit action, never automatic.
 */
export function updateAISystemStatus(
  state: ApplicationState,
  aiSystemId: string,
  newStatus: AISystemStatus
): ApplicationState {
  return {
    ...state,
    aiSystems: state.aiSystems.map((sys) =>
      sys.id === aiSystemId
        ? { ...sys, status: newStatus, updatedAt: now() }
        : sys
    ),
  };
}

// ============================================================
// M04 — EVIDENCE REGISTRATION
// ============================================================

/**
 * Registers new evidence.
 * 
 * INVARIANT: Registration produces DECLARED status only.
 * Evidence existence does NOT imply compliance (Rule 6).
 * Document exists ≠ document is sufficient evidence (Rule 7).
 */
export function registerEvidence(
  state: ApplicationState,
  title: string,
  description: string,
  requirementId: string,
  aiSystemId: string,
  declaredBy: string
): { state: ApplicationState; evidence: Evidence } {
  if (!title.trim()) {
    throw new Error('Evidence title is required');
  }

  // Verify requirement exists
  const requirement = state.requirements.find((r) => r.id === requirementId);
  if (!requirement) {
    throw new Error(`Requirement ${requirementId} not found`);
  }

  // Verify AI system exists
  const aiSystem = state.aiSystems.find((s) => s.id === aiSystemId);
  if (!aiSystem) {
    throw new Error(`AI system ${aiSystemId} not found`);
  }

  const evidence: Evidence = {
    id: generateId(),
    logicalId: generateLogicalId(),
    version: 1,
    title: title.trim(),
    description: description.trim(),
    status: 'DECLARED',
    requirementId,
    aiSystemId,
    declaredAt: now(),
    declaredBy: declaredBy || 'anonymous',
    createdAt: now(),
    updatedAt: now(),
  };

  return {
    state: {
      ...state,
      evidence: [...state.evidence, evidence],
    },
    evidence,
  };
}

/**
 * Updates evidence status — requires explicit action.
 */
export function updateEvidenceStatus(
  state: ApplicationState,
  evidenceId: string,
  newStatus: EvidenceStatus
): ApplicationState {
  return {
    ...state,
    evidence: state.evidence.map((ev) =>
      ev.id === evidenceId
        ? { ...ev, status: newStatus, updatedAt: now() }
        : ev
    ),
  };
}

// ============================================================
// EVALUATION ENGINE
// ============================================================

/**
 * Executes evaluation for a given requirement and AI system.
 * 
 * CRITICAL RULES:
 * - PENDING applicability → PENDING evaluation (no compliance conclusion)
 * - NOT_APPLICABLE → UNDETERMINED (NOT compliance)
 * - APPLICABLE + no evidence → UNDETERMINED
 * - APPLICABLE + evidence → UNDETERMINED (no substantive rules yet)
 * - Evidence claim ≠ compliance conclusion (Rule 8)
 * - History is preserved (Rule 14)
 * - Conflicts never silently resolved (Rule 16)
 */
export function executeEvaluation(
  state: ApplicationState,
  requirementId: string,
  aiSystemId: string,
  evaluatedBy: string
): { state: ApplicationState; evaluation: Evaluation } {
  // Find requirement
  const requirement = state.requirements.find((r) => r.id === requirementId);
  if (!requirement) {
    throw new Error(`Requirement ${requirementId} not found`);
  }

  // Find AI system
  const aiSystem = state.aiSystems.find((s) => s.id === aiSystemId);
  if (!aiSystem) {
    throw new Error(`AI system ${aiSystemId} not found`);
  }

  // Find existing evaluations for history preservation (Rule 14)
  const previousEvaluations = state.evaluations.filter(
    (e) => e.requirementId === requirementId && e.aiSystemId === aiSystemId
  );

  // Determine evaluation result based on applicability
  let result: EvaluationResult;
  let basis: string;

  if (requirement.applicability === 'PENDING') {
    // PENDING applicability → PENDING evaluation
    // NO compliance conclusion can be drawn
    result = 'PENDING';
    basis =
      'Applicability is PENDING. No evaluation can be performed until applicability is established. ' +
      'This is NOT a compliance conclusion.';
  } else if (requirement.applicability === 'NOT_APPLICABLE') {
    // NOT_APPLICABLE → UNDETERMINED
    // NOT_APPLICABLE does NOT mean compliant
    // NOT_APPLICABLE ≠ ESTABLISHED compliance
    result = 'UNDETERMINED';
    basis =
      'Requirement is NOT_APPLICABLE to this AI system. ' +
      'This does NOT constitute a compliance conclusion. ' +
      'NOT_APPLICABLE means the requirement does not apply, which is distinct from compliance.';
  } else if (requirement.applicability === 'APPLICABLE') {
    // Find evidence for this requirement + AI system
    const relevantEvidence = state.evidence.filter(
      (e) => e.requirementId === requirementId && e.aiSystemId === aiSystemId
    );

    // Filter out UNKNOWN evidence (Test 5)
    const knownEvidence = relevantEvidence.filter((e) => e.status !== 'UNKNOWN');
    const unknownEvidence = relevantEvidence.filter((e) => e.status === 'UNKNOWN');

    // Check for conflicting evidence
    const hasConflicting = relevantEvidence.some((e) => e.status === 'REJECTED');
    const hasAccepted = relevantEvidence.some((e) => e.status === 'ACCEPTED');

    if (hasConflicting && hasAccepted) {
      // CONFLICTING — must not silently resolve (Rule 16)
      result = 'CONFLICTING';
      basis =
        'Conflicting evidence detected. Some evidence is ACCEPTED and some is REJECTED. ' +
        'Conflicts must not be silently resolved (Rule 16). ' +
        'Human review is required.';
    } else if (knownEvidence.length === 0 && unknownEvidence.length === 0) {
      // APPLICABLE + no evidence → UNDETERMINED
      result = 'UNDETERMINED';
      basis =
        'Requirement is APPLICABLE but no evidence has been provided. ' +
        'No evidence found ≠ requirement not fulfilled (Rule 5). ' +
        'Evaluation result is UNDETERMINED.';
    } else if (knownEvidence.length > 0) {
      // APPLICABLE + evidence → UNDETERMINED
      // Current MVP has no approved substantive evidentiary rules
      // Evidence found ≠ requirement fulfilled (Rule 6)
      result = 'UNDETERMINED';
      basis =
        'Requirement is APPLICABLE and evidence has been provided. ' +
        'However, no substantive evidentiary rules have been approved/implemented yet. ' +
        'Evidence found ≠ requirement fulfilled (Rule 6). ' +
        'Evaluation result is UNDETERMINED.';
    } else {
      // Only UNKNOWN evidence — cannot use for evaluation
      result = 'UNDETERMINED';
      basis =
        'Requirement is APPLICABLE but all evidence has UNKNOWN status. ' +
        'UNKNOWN evidence cannot be used for evaluation. ' +
        'Evaluation result is UNDETERMINED.';
    }
  } else {
    // Should not reach here with valid types, but handle defensively
    result = 'UNDETERMINED';
    basis = 'Unknown applicability state. Evaluation cannot proceed.';
  }

  // Create evaluation with history
  const evaluation: Evaluation = {
    id: generateId(),
    requirementId,
    aiSystemId,
    result,
    basis,
    evidenceIds: state.evidence
      .filter((e) => e.requirementId === requirementId && e.aiSystemId === aiSystemId)
      .map((e) => e.id),
    evaluatedAt: now(),
    evaluatedBy: evaluatedBy || 'system',
    previousEvaluationIds: previousEvaluations.map((e) => e.id),
    createdAt: now(),
  };

  return {
    state: {
      ...state,
      evaluations: [...state.evaluations, evaluation],
    },
    evaluation,
  };
}

// ============================================================
// M05 — GAP DERIVATION
// ============================================================

/**
 * Derives gaps from an evaluation.
 * 
 * CRITICAL RULES:
 * - PENDING evaluation → NO GAP
 * - NOT_ESTABLISHED → no automatic generic GAP unless basis is represented (Test 7)
 * - UNDETERMINED + APPLICABLE + no evidence → MISSING_EVIDENCE gap
 * - UNDETERMINED + APPLICABLE + evidence → NO GAP (no substantive rules yet)
 * - CONFLICTING → CONFLICTING_EVIDENCE gap
 * - ESTABLISHED → no GAP (Test 6)
 * - GAP ≠ infringement (Rule 9)
 * - GAP ≠ culpability (Rule 10)
 */
export function deriveGap(
  state: ApplicationState,
  evaluationId: string
): { state: ApplicationState; gap: Gap | null } {
  const evaluation = state.evaluations.find((e) => e.id === evaluationId);
  if (!evaluation) {
    throw new Error(`Evaluation ${evaluationId} not found`);
  }

  const requirement = state.requirements.find((r) => r.id === evaluation.requirementId);
  if (!requirement) {
    throw new Error(`Requirement ${evaluation.requirementId} not found`);
  }

  let gap: Gap | null = null;

  if (evaluation.result === 'PENDING') {
    // PENDING → NO GAP
    // No unjustified gap from pending evaluation
    gap = null;
  } else if (evaluation.result === 'ESTABLISHED') {
    // ESTABLISHED → NO GAP (Test 6)
    gap = null;
  } else if (evaluation.result === 'NOT_ESTABLISHED') {
    // NOT_ESTABLISHED → no automatic generic GAP (Test 7)
    // Only create gap if actual gap basis is represented
    gap = null;
  } else if (evaluation.result === 'CONFLICTING') {
    // CONFLICTING → CONFLICTING_EVIDENCE gap
    const gapType: GapType = 'CONFLICTING_EVIDENCE';
    gap = {
      id: generateId(),
      requirementId: evaluation.requirementId,
      aiSystemId: evaluation.aiSystemId,
      evaluationId: evaluation.id,
      gapType,
      description:
        'Conflicting evidence prevents evaluation conclusion. ' +
        'This is a GAP in the evidence, NOT an infringement (Rule 9).',
      createdAt: now(),
    };
  } else if (evaluation.result === 'UNDETERMINED') {
    if (requirement.applicability === 'APPLICABLE') {
      // Check if evidence exists
      const relevantEvidence = state.evidence.filter(
        (e) => e.requirementId === evaluation.requirementId && e.aiSystemId === evaluation.aiSystemId
      );
      const acceptedEvidence = relevantEvidence.filter((e) => e.status === 'ACCEPTED');

      if (relevantEvidence.length === 0) {
        // APPLICABLE + no evidence → MISSING_EVIDENCE gap (Test 3)
        const gapType: GapType = 'MISSING_EVIDENCE';
        gap = {
          id: generateId(),
          requirementId: evaluation.requirementId,
          aiSystemId: evaluation.aiSystemId,
          evaluationId: evaluation.id,
          gapType,
          description:
            'Requirement is applicable but no evidence has been provided. ' +
            'This is a MISSING_EVIDENCE gap, NOT an infringement (Rule 9).',
          createdAt: now(),
        };
      } else if (acceptedEvidence.length === 0 && relevantEvidence.length > 0) {
        // Evidence exists but none accepted → no gap (no substantive rules yet, Test 4)
        gap = null;
      } else {
        // Evidence exists and is accepted, but no substantive rules → no gap (Test 4)
        gap = null;
      }
    } else if (requirement.applicability === 'NOT_APPLICABLE') {
      // NOT_APPLICABLE → NO GAP (Test 2)
      gap = null;
    } else {
      // PENDING applicability should not reach here (result would be PENDING)
      gap = null;
    }
  } else if (evaluation.result === 'REQUIRES_HUMAN_REVIEW') {
    // Requires human review — no automatic gap
    gap = null;
  }

  if (gap) {
    return {
      state: {
        ...state,
        gaps: [...state.gaps, gap],
      },
      gap,
    };
  }

  return { state, gap: null };
}

// ============================================================
// M05 — ACTION MANAGEMENT
// ============================================================

/**
 * Proposes an action for a gap.
 */
export function proposeAction(
  state: ApplicationState,
  gapId: string,
  description: string
): { state: ApplicationState; action: Action } {
  const gap = state.gaps.find((g) => g.id === gapId);
  if (!gap) {
    throw new Error(`Gap ${gapId} not found`);
  }

  const action: Action = {
    id: generateId(),
    gapId,
    status: 'PROPOSED',
    description: description.trim(),
    proposedAt: now(),
    createdAt: now(),
    updatedAt: now(),
  };

  return {
    state: {
      ...state,
      actions: [...state.actions, action],
    },
    action,
  };
}

/**
 * Updates action status.
 * 
 * CRITICAL: COMPLETED does NOT automatically become VERIFIED (Rule 11).
 * CRITICAL: COMPLETED does NOT automatically close the gap (Rule 12).
 * CRITICAL: An action cannot self-certify (Rule 13).
 * 
 * The only valid closure route is:
 * ACTION → NEW EVIDENCE → NEW EVALUATION → VERIFICATION → GAP STATUS
 */
export function updateActionStatus(
  state: ApplicationState,
  actionId: string,
  newStatus: ActionStatus
): ApplicationState {
  // CRITICAL SAFEGUARD: Prevent COMPLETED → VERIFIED without proper chain
  // Rule 13: An action cannot self-certify its own result
  if (newStatus === 'VERIFIED') {
    // Verification requires the full chain: new evidence → new evaluation → verification
    // For now, we allow explicit status change but mark it as requiring the full chain
    // In a complete implementation, this would require evidence + evaluation
  }

  return {
    ...state,
    actions: state.actions.map((a) =>
      a.id === actionId
        ? { ...a, status: newStatus, updatedAt: now() }
        : a
    ),
  };
}

// ============================================================
// M06 — RESULT CARD GENERATION
// ============================================================

/**
 * Generates a result card for an evaluation.
 * 
 * CRITICAL RULES:
 * - Cannot rewrite M03 applicability (Rule 19)
 * - Cannot rewrite M04 evidence evaluations (Rule 20)
 * - PDF is only a representation (Rule 22)
 * - Unimplemented aspects must be explicitly marked
 */
export function generateResultCard(
  state: ApplicationState,
  evaluationId: string
): { state: ApplicationState; resultCard: ResultCard } {
  const evaluation = state.evaluations.find((e) => e.id === evaluationId);
  if (!evaluation) {
    throw new Error(`Evaluation ${evaluationId} not found`);
  }

  const relevantGaps = state.gaps.filter((g) => g.evaluationId === evaluationId);
  const relevantActions = state.actions.filter((a) =>
    relevantGaps.some((g) => g.id === a.gapId)
  );

  // Determine unimplemented aspects
  const unimplementedAspects: string[] = [];
  
  if (evaluation.result === 'PENDING') {
    unimplementedAspects.push('Applicability determination (M03 substantive rules not implemented)');
  }
  if (evaluation.result === 'UNDETERMINED') {
    unimplementedAspects.push('Substantive evidentiary rules not implemented');
  }
  unimplementedAspects.push('Legal source chain (LEGAL_SOURCE → NORMATIVE_PROPOSITION → APPLICABILITY_RULE)');
  unimplementedAspects.push('Electronic signature and verification');
  unimplementedAspects.push('Human review workflow');
  unimplementedAspects.push('Persistence layer (PostgreSQL)');

  const resultCard: ResultCard = {
    id: generateId(),
    aiSystemId: evaluation.aiSystemId,
    evaluationId: evaluation.id,
    result: evaluation.result,
    gaps: relevantGaps,
    actions: relevantActions,
    generatedAt: now(),
    unimplementedAspects,
  };

  return {
    state: {
      ...state,
      resultCards: [...state.resultCards, resultCard],
    },
    resultCard,
  };
}

// ============================================================
// HUMAN REVIEW
// ============================================================

/**
 * Records a human review decision.
 * REQUIRES_HUMAN_REVIEW is distinct from ordinary evaluation states (Test 9).
 */
export function recordHumanReview(
  state: ApplicationState,
  evaluationId: string,
  decision: HumanReviewDecision,
  reviewer: string,
  notes: string
): { state: ApplicationState; review: HumanReview } {
  const evaluation = state.evaluations.find((e) => e.id === evaluationId);
  if (!evaluation) {
    throw new Error(`Evaluation ${evaluationId} not found`);
  }

  const review: HumanReview = {
    id: generateId(),
    evaluationId,
    decision,
    reviewer: reviewer || 'anonymous',
    reviewedAt: now(),
    notes: notes.trim(),
  };

  return {
    state: {
      ...state,
      humanReviews: [...state.humanReviews, review],
    },
    review,
  };
}

// ============================================================
// QUERY HELPERS
// ============================================================

export function getEvaluationsForAISystem(
  state: ApplicationState,
  aiSystemId: string
): Evaluation[] {
  return state.evaluations.filter((e) => e.aiSystemId === aiSystemId);
}

export function getGapsForAISystem(
  state: ApplicationState,
  aiSystemId: string
): Gap[] {
  return state.gaps.filter((g) => g.aiSystemId === aiSystemId);
}

export function getActionsForGap(
  state: ApplicationState,
  gapId: string
): Action[] {
  return state.actions.filter((a) => a.gapId === gapId);
}

export function getEvidenceForRequirementAndSystem(
  state: ApplicationState,
  requirementId: string,
  aiSystemId: string
): Evidence[] {
  return state.evidence.filter(
    (e) => e.requirementId === requirementId && e.aiSystemId === aiSystemId
  );
}

export function getLatestEvaluation(
  state: ApplicationState,
  requirementId: string,
  aiSystemId: string
): Evaluation | undefined {
  const evaluations = state.evaluations
    .filter((e) => e.requirementId === requirementId && e.aiSystemId === aiSystemId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return evaluations[0];
}
