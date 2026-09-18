/**
 * SAE Compliance & Evidence Engine — Enterprise Audit Engine
 * 
 * Core business logic for enterprise audit workflow.
 * Preserves all existing AI compliance logic.
 * Adds organization, audit, findings, risks, KPIs, human review, decisions.
 */

import type {
  ApplicationState,
  Organization,
  Audit,
  AuditStatus,
  Requirement,
  RequirementCategory,
  Evidence,
  EvidenceAvailability,
  EvidenceProvenance,
  EvidenceVerification,
  EvidenceEpistemic,
  EvidenceDecisionStatus,
  Evaluation,
  EvaluationResult,
  Finding,
  FindingStatus,
  FindingSeverity,
  Gap,
  GapCategory,
  Risk,
  Action,
  ActionPriority,
  ActionStatus,
  KPI,
  HumanReview,
  HumanReviewDecision,
  AuditDecisionRecord,
  AuditDecision,
  AuditTrailEntry,
  AuditTrailAction,
} from './enterpriseTypes.ts';

// ============================================================
// ID GENERATION
// ============================================================

let idCounter = 0;
function generateId(prefix: string = 'id'): string {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

function now(): string {
  return new Date().toISOString();
}

// ============================================================
// INITIAL STATE
// ============================================================

export function createInitialState(): ApplicationState {
  return {
    organizations: [],
    audits: [],
    requirements: [],
    evidence: [],
    evaluations: [],
    findings: [],
    gaps: [],
    risks: [],
    actions: [],
    kpis: [],
    humanReviews: [],
    decisions: [],
    auditTrail: [],
    aiSystems: [],
  };
}

// ============================================================
// PERSISTENCE (localStorage)
// ============================================================

const STORAGE_KEY = 'sae_engine_state';

export function saveState(state: ApplicationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function loadState(): ApplicationState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return createInitialState();
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================================
// AUDIT TRAIL
// ============================================================

function addTrailEntry(
  state: ApplicationState,
  auditId: string,
  action: AuditTrailAction,
  objectType: string,
  objectId: string,
  previousState: string | null,
  newState: string,
  reason: string,
  actor: string = 'system'
): ApplicationState {
  const entry: AuditTrailEntry = {
    id: generateId('trail'),
    auditId,
    timestamp: now(),
    actor,
    action,
    objectType,
    objectId,
    previousState,
    newState,
    reason,
  };
  return {
    ...state,
    auditTrail: [...state.auditTrail, entry],
  };
}

// ============================================================
// ORGANIZATION
// ============================================================

export function createOrganization(
  state: ApplicationState,
  name: string,
  country: string,
  sector: string,
  description: string,
  publicInfo: string
): { state: ApplicationState; organization: Organization } {
  const org: Organization = {
    id: generateId('org'),
    name,
    country,
    sector,
    description,
    publicInfo,
    createdAt: now(),
    updatedAt: now(),
  };
  return {
    state: { ...state, organizations: [...state.organizations, org] },
    organization: org,
  };
}

// ============================================================
// AUDIT
// ============================================================

export function createAudit(
  state: ApplicationState,
  benchmarkId: string,
  title: string,
  organizationId: string,
  scope: string,
  purpose: string,
  auditType: string,
  limitations: string[]
): { state: ApplicationState; audit: Audit } {
  const audit: Audit = {
    id: generateId('audit'),
    benchmarkId,
    title,
    organizationId,
    scope,
    purpose,
    auditType,
    status: 'PLANNED',
    startDate: now(),
    endDate: null,
    limitations,
    createdAt: now(),
    updatedAt: now(),
  };
  let newState = { ...state, audits: [...state.audits, audit] };
  newState = addTrailEntry(newState, audit.id, 'CREATED', 'Audit', audit.id, null, 'PLANNED', `Audit ${benchmarkId} created`);
  return { state: newState, audit };
}

export function updateAuditStatus(
  state: ApplicationState,
  auditId: string,
  newStatus: AuditStatus
): ApplicationState {
  const audit = state.audits.find(a => a.id === auditId);
  if (!audit) return state;
  
  let newState = {
    ...state,
    audits: state.audits.map(a => 
      a.id === auditId ? { ...a, status: newStatus, updatedAt: now() } : a
    ),
  };
  newState = addTrailEntry(newState, auditId, 'STATE_TRANSITION', 'Audit', auditId, audit.status, newStatus, `Status changed to ${newStatus}`);
  return newState;
}

// ============================================================
// REQUIREMENT
// ============================================================

export function createRequirement(
  state: ApplicationState,
  auditId: string,
  code: string,
  title: string,
  description: string,
  category: RequirementCategory,
  scope: string,
  expectedEvidence: string,
  isPlaceholder: boolean = false
): { state: ApplicationState; requirement: Requirement } {
  const req: Requirement = {
    id: generateId('req'),
    auditId,
    code,
    title,
    description,
    category,
    scope,
    expectedEvidence,
    isPlaceholder,
    createdAt: now(),
    updatedAt: now(),
  };
  let newState = { ...state, requirements: [...state.requirements, req] };
  newState = addTrailEntry(newState, auditId, 'CREATED', 'Requirement', req.id, null, req.code, `Requirement ${code} created`);
  return { state: newState, requirement: req };
}

// ============================================================
// EVIDENCE (Multi-dimensional)
// ============================================================

export function createEvidence(
  state: ApplicationState,
  auditId: string,
  requirementId: string,
  data: {
    title: string;
    description: string;
    sourceOrganization: string;
    sourceType: string;
    sourceUrl: string;
    publicationDate: string;
    reportingPeriod: string;
    retrievalDate: string;
    relevantClaim: string;
    extractedFact: string;
    scope: string;
    availability: EvidenceAvailability;
    provenance: EvidenceProvenance;
    verification: EvidenceVerification;
    epistemic: EvidenceEpistemic;
    decisionStatus: EvidenceDecisionStatus;
    limitations: string[];
    provenanceChain: string;
  }
): { state: ApplicationState; evidence: Evidence } {
  const ev: Evidence = {
    id: generateId('ev'),
    requirementId,
    auditId,
    ...data,
    createdAt: now(),
    updatedAt: now(),
  };
  let newState = { ...state, evidence: [...state.evidence, ev] };
  newState = addTrailEntry(newState, auditId, 'CREATED', 'Evidence', ev.id, null, ev.title, `Evidence registered`);
  return { state: newState, evidence: ev };
}

export function updateEvidenceVerification(
  state: ApplicationState,
  evidenceId: string,
  verification: EvidenceVerification,
  decisionStatus: EvidenceDecisionStatus
): ApplicationState {
  const ev = state.evidence.find(e => e.id === evidenceId);
  if (!ev) return state;
  
  let newState = {
    ...state,
    evidence: state.evidence.map(e =>
      e.id === evidenceId ? { ...e, verification, decisionStatus, updatedAt: now() } : e
    ),
  };
  newState = addTrailEntry(newState, ev.auditId, 'MODIFIED', 'Evidence', evidenceId, ev.verification, verification, 'Verification status updated');
  return newState;
}

// ============================================================
// EVALUATION
// ============================================================

export function evaluateRequirement(
  state: ApplicationState,
  auditId: string,
  requirementId: string,
  evaluatedBy: string
): { state: ApplicationState; evaluation: Evaluation } {
  const requirement = state.requirements.find(r => r.id === requirementId);
  if (!requirement) throw new Error(`Requirement ${requirementId} not found`);
  
  const relevantEvidence = state.evidence.filter(
    e => e.requirementId === requirementId && e.auditId === auditId
  );
  
  const previousEvaluations = state.evaluations.filter(
    e => e.requirementId === requirementId && e.auditId === auditId
  );
  
  // Determine result based on evidence
  let result: EvaluationResult;
  let basis: string;
  let reasoning: string;
  let humanReviewRequired = false;
  let humanReviewReason = '';
  
  if (relevantEvidence.length === 0) {
    result = 'INSUFFICIENT_EVIDENCE';
    basis = 'No evidence registered for this requirement.';
    reasoning = 'Absence of evidence does not constitute non-compliance. Evidence may exist but not be publicly available.';
    humanReviewRequired = true;
    humanReviewReason = 'No evidence available — requires human assessment of whether evidence exists outside public domain.';
  } else {
    const verified = relevantEvidence.filter(e => e.verification === 'VERIFIED');
    const reviewed = relevantEvidence.filter(e => e.verification === 'REVIEWED');
    const unverified = relevantEvidence.filter(e => e.verification === 'UNVERIFIED');
    const rejected = relevantEvidence.filter(e => e.verification === 'REJECTED');
    
    const missing = relevantEvidence.filter(e => e.availability === 'MISSING');
    const available = relevantEvidence.filter(e => e.availability === 'AVAILABLE');
    
    if (verified.length > 0 && unverified.length === 0 && rejected.length === 0 && missing.length === 0) {
      result = 'SUPPORTED';
      basis = `${verified.length} verified evidence item(s) support this requirement.`;
      reasoning = 'All evidence has been independently verified. No conflicting or missing evidence.';
    } else if (verified.length > 0 || reviewed.length > 0) {
      result = 'PARTIALLY_SUPPORTED';
      basis = `Evidence exists but not all items are independently verified. ${verified.length} verified, ${reviewed.length} reviewed, ${unverified.length} unverified.`;
      reasoning = 'Some evidence supports the requirement but independent verification is incomplete. Human review required to assess sufficiency.';
      humanReviewRequired = true;
      humanReviewReason = 'Mixed verification status — requires human judgment on sufficiency.';
    } else if (unverified.length > 0 && missing.length === 0) {
      result = 'NOT_VERIFIED';
      basis = `${unverified.length} evidence item(s) documented but not independently verified.`;
      reasoning = 'Corporate claims exist but have not been independently verified. Cannot conclude compliance without verification.';
      humanReviewRequired = true;
      humanReviewReason = 'Unverified claims require human assessment of reliability and sufficiency.';
    } else if (missing.length > 0 && available.length > 0) {
      result = 'PARTIALLY_SUPPORTED';
      basis = 'Partial evidence available. Some aspects lack evidence.';
      reasoning = 'Evidence covers some but not all aspects of the requirement.';
      humanReviewRequired = true;
      humanReviewReason = 'Partial coverage requires human assessment of materiality.';
    } else {
      result = 'INSUFFICIENT_EVIDENCE';
      basis = 'Evidence is insufficient to support a conclusion.';
      reasoning = 'Available evidence does not adequately address the requirement.';
      humanReviewRequired = true;
      humanReviewReason = 'Insufficient evidence — requires human assessment.';
    }
  }
  
  const evaluation: Evaluation = {
    id: generateId('eval'),
    requirementId,
    auditId,
    evidenceIds: relevantEvidence.map(e => e.id),
    result,
    basis,
    reasoning,
    humanReviewRequired,
    humanReviewReason,
    evaluatedAt: now(),
    evaluatedBy,
    previousEvaluationIds: previousEvaluations.map(e => e.id),
    createdAt: now(),
  };
  
  let newState = { ...state, evaluations: [...state.evaluations, evaluation] };
  newState = addTrailEntry(newState, auditId, 'EVALUATED', 'Evaluation', evaluation.id, null, evaluation.result, `Requirement ${requirement.code} evaluated: ${evaluation.result}`);
  
  return { state: newState, evaluation };
}

// ============================================================
// FINDING
// ============================================================

export function createFinding(
  state: ApplicationState,
  auditId: string,
  requirementId: string,
  evaluationId: string,
  evidenceIds: string[],
  description: string,
  factualBasis: string,
  evidenceBasis: string,
  severity: FindingSeverity,
  recommendedAction: string
): { state: ApplicationState; finding: Finding } {
  const finding: Finding = {
    id: generateId('find'),
    requirementId,
    evaluationId,
    auditId,
    evidenceIds,
    description,
    factualBasis,
    evidenceBasis,
    severity,
    status: 'OPEN',
    humanReviewStatus: 'PENDING',
    humanReviewer: null,
    humanReviewNotes: '',
    recommendedAction,
    createdAt: now(),
    updatedAt: now(),
  };
  let newState = { ...state, findings: [...state.findings, finding] };
  newState = addTrailEntry(newState, auditId, 'CREATED', 'Finding', finding.id, null, 'OPEN', `Finding created for requirement`);
  return { state: newState, finding };
}

// ============================================================
// GAP
// ============================================================

export function createGap(
  state: ApplicationState,
  auditId: string,
  findingId: string,
  requirementId: string,
  category: GapCategory,
  description: string
): { state: ApplicationState; gap: Gap } {
  const gap: Gap = {
    id: generateId('gap'),
    findingId,
    requirementId,
    auditId,
    category,
    description,
    status: 'OPEN',
    createdAt: now(),
    updatedAt: now(),
  };
  let newState = { ...state, gaps: [...state.gaps, gap] };
  newState = addTrailEntry(newState, auditId, 'CREATED', 'Gap', gap.id, null, category, `Gap created: ${category}`);
  return { state: newState, gap };
}

// ============================================================
// RISK
// ============================================================

export function createRisk(
  state: ApplicationState,
  auditId: string,
  findingId: string,
  gapId: string,
  requirementId: string,
  description: string
): { state: ApplicationState; risk: Risk } {
  const risk: Risk = {
    id: generateId('risk'),
    findingId,
    gapId,
    requirementId,
    auditId,
    description,
    likelihoodScore: 'NOT_DETERMINED',
    impactScore: 'NOT_DETERMINED',
    overallRisk: 'NOT_DETERMINED',
    riskStatus: 'PENDING_HUMAN_REVIEW',
    createdAt: now(),
    updatedAt: now(),
  };
  let newState = { ...state, risks: [...state.risks, risk] };
  newState = addTrailEntry(newState, auditId, 'CREATED', 'Risk', risk.id, null, 'PENDING_HUMAN_REVIEW', `Risk identified`);
  return { state: newState, risk };
}

// ============================================================
// ACTION
// ============================================================

export function createAction(
  state: ApplicationState,
  auditId: string,
  findingId: string,
  gapId: string | null,
  description: string,
  rationale: string,
  priority: ActionPriority
): { state: ApplicationState; action: Action } {
  const action: Action = {
    id: generateId('act'),
    findingId,
    gapId,
    auditId,
    description,
    rationale,
    priority,
    owner: 'NOT_PUBLICLY_IDENTIFIED',
    targetDate: 'NOT_PUBLICLY_IDENTIFIED',
    status: 'PROPOSED',
    humanReviewRequired: true,
    createdAt: now(),
    updatedAt: now(),
  };
  let newState = { ...state, actions: [...state.actions, action] };
  newState = addTrailEntry(newState, auditId, 'CREATED', 'Action', action.id, null, 'PROPOSED', `Action proposed`);
  return { state: newState, action };
}

// ============================================================
// KPI
// ============================================================

export function createKPI(
  state: ApplicationState,
  auditId: string,
  requirementId: string,
  evidenceId: string | null,
  metricName: string,
  value: string,
  unit: string,
  reportingPeriod: string,
  organizationalScope: string,
  source: string,
  verificationStatus: 'UNVERIFIED' | 'REVIEWED' | 'VERIFIED' | 'NOT_AVAILABLE',
  notes: string
): { state: ApplicationState; kpi: KPI } {
  const kpi: KPI = {
    id: generateId('kpi'),
    requirementId,
    auditId,
    evidenceId,
    metricName,
    value,
    unit,
    reportingPeriod,
    organizationalScope,
    source,
    verificationStatus,
    notes,
    createdAt: now(),
    updatedAt: now(),
  };
  let newState = { ...state, kpis: [...state.kpis, kpi] };
  newState = addTrailEntry(newState, auditId, 'CREATED', 'KPI', kpi.id, null, verificationStatus, `KPI registered: ${metricName}`);
  return { state: newState, kpi };
}

// ============================================================
// HUMAN REVIEW
// ============================================================

export function createHumanReview(
  state: ApplicationState,
  auditId: string,
  objectId: string,
  objectType: 'EVIDENCE' | 'EVALUATION' | 'FINDING' | 'RISK' | 'ACTION' | 'DECISION',
  decision: HumanReviewDecision,
  reviewer: string,
  notes: string
): { state: ApplicationState; review: HumanReview } {
  const review: HumanReview = {
    id: generateId('review'),
    objectId,
    objectType,
    decision,
    reviewer,
    reviewedAt: decision !== 'PENDING_REVIEW' ? now() : null,
    notes,
    createdAt: now(),
  };
  let newState = { ...state, humanReviews: [...state.humanReviews, review] };
  newState = addTrailEntry(newState, auditId, 'HUMAN_REVIEW', objectType, objectId, 'PENDING', decision, `Human review: ${decision}`);
  return { state: newState, review };
}

// ============================================================
// AUDIT DECISION
// ============================================================

export function makeAuditDecision(
  state: ApplicationState,
  auditId: string,
  decidedBy: string
): { state: ApplicationState; decision: AuditDecisionRecord } {
  const audit = state.audits.find(a => a.id === auditId);
  if (!audit) throw new Error(`Audit ${auditId} not found`);
  
  const auditRequirements = state.requirements.filter(r => r.auditId === auditId);
  const auditEvaluations = state.evaluations.filter(e => e.auditId === auditId);
  
  const requirementDecisions = auditRequirements.map(req => {
    const eval_ = auditEvaluations.find(e => e.requirementId === req.id);
    return {
      requirementId: req.id,
      decision: eval_?.result || 'INSUFFICIENT_EVIDENCE',
      basis: eval_?.basis || 'No evaluation performed',
    };
  });
  
  // Determine overall decision
  const results = auditEvaluations.map(e => e.result);
  let overallDecision: AuditDecision;
  let rationale: string;
  
  if (results.length === 0) {
    overallDecision = 'INSUFFICIENT_EVIDENCE';
    rationale = 'No evaluations have been performed.';
  } else if (results.every(r => r === 'SUPPORTED')) {
    overallDecision = 'SUPPORTED';
    rationale = 'All evaluated requirements are supported by verified evidence.';
  } else if (results.some(r => r === 'SUPPORTED') && results.some(r => r === 'PARTIALLY_SUPPORTED' || r === 'NOT_VERIFIED')) {
    overallDecision = 'PARTIALLY_SUPPORTED';
    rationale = 'Some requirements are supported, others have partial or unverified evidence.';
  } else if (results.every(r => r === 'INSUFFICIENT_EVIDENCE' || r === 'NOT_VERIFIED')) {
    overallDecision = 'INSUFFICIENT_EVIDENCE';
    rationale = 'Insufficient evidence across all requirements to support conclusions.';
  } else {
    overallDecision = 'PENDING_HUMAN_REVIEW';
    rationale = 'Mixed results require human review for overall assessment.';
  }
  
  const decision: AuditDecisionRecord = {
    id: generateId('decision'),
    auditId,
    overallDecision,
    rationale,
    requirementDecisions,
    humanReviewStatus: 'PENDING',
    humanReviewer: null,
    decidedAt: now(),
    decidedBy,
    createdAt: now(),
  };
  
  let newState = { ...state, decisions: [...state.decisions, decision] };
  newState = addTrailEntry(newState, auditId, 'DECISION', 'AuditDecision', decision.id, null, overallDecision, `Audit decision: ${overallDecision}`);
  newState = updateAuditStatus(newState, auditId, 'COMPLETED');
  
  return { state: newState, decision };
}

// ============================================================
// QUERY HELPERS
// ============================================================

export function getAuditWithFullData(state: ApplicationState, auditId: string) {
  const audit = state.audits.find(a => a.id === auditId);
  if (!audit) return null;
  
  const organization = state.organizations.find(o => o.id === audit.organizationId);
  const requirements = state.requirements.filter(r => r.auditId === auditId);
  const evidence = state.evidence.filter(e => e.auditId === auditId);
  const evaluations = state.evaluations.filter(e => e.auditId === auditId);
  const findings = state.findings.filter(f => f.auditId === auditId);
  const gaps = state.gaps.filter(g => g.auditId === auditId);
  const risks = state.risks.filter(r => r.auditId === auditId);
  const actions = state.actions.filter(a => a.auditId === auditId);
  const kpis = state.kpis.filter(k => k.auditId === auditId);
  const reviews = state.humanReviews.filter(r => {
    const relatedObj = [...evidence, ...evaluations, ...findings].find(o => o.id === r.objectId);
    return relatedObj !== undefined;
  });
  const decisions = state.decisions.filter(d => d.auditId === auditId);
  const trail = state.auditTrail.filter(t => t.auditId === auditId);
  
  return {
    audit,
    organization,
    requirements,
    evidence,
    evaluations,
    findings,
    gaps,
    risks,
    actions,
    kpis,
    reviews,
    decisions,
    trail,
  };
}
