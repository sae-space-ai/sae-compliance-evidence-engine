/**
 * SAE Compliance & Evidence Engine — Comprehensive Validation Suite
 * 
 * This file implements the full End-to-End Validation Matrix for the MVP Vertical Slice.
 * It covers all modules (M02-M06), edge cases, and negative testing scenarios.
 * 
 * Validation Categories:
 * - P0: Critical (blocks release)
 * - P1: High (should be fixed before release)
 * - P2: Medium (should be addressed in next iteration)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  registerAISystem,
  registerEvidence,
  executeEvaluation,
  deriveGap,
  proposeAction,
  updateActionStatus,
  generateResultCard,
  updateEvidenceStatus,
  recordHumanReview,
} from '../engine.ts';
import type { ApplicationState } from '../types.ts';

// ============================================================
// VALIDATION MATRIX METADATA
// ============================================================

export interface ValidationTestCase {
  id: string;
  module: string;
  title: string;
  preconditions: string;
  steps: string;
  expectedResult: string;
  priority: 'P0' | 'P1' | 'P2';
  category: 'positive' | 'negative' | 'edge-case' | 'security' | 'transition';
}

export const VALIDATION_MATRIX: ValidationTestCase[] = [
  // ============================================================
  // M02 — AI INVENTORY VALIDATION
  // ============================================================
  {
    id: 'VT-M02-001',
    module: 'M02',
    title: 'AI System Registration — Valid Input',
    preconditions: 'Empty state, no AI systems registered',
    steps: 'Register AI system with valid name and use case',
    expectedResult: 'System created with status DECLARED, all fields populated correctly',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M02-002',
    module: 'M02',
    title: 'AI System Registration — Missing Name',
    preconditions: 'Empty state',
    steps: 'Attempt to register AI system with empty name',
    expectedResult: 'Registration rejected with clear error message',
    priority: 'P0',
    category: 'negative',
  },
  {
    id: 'VT-M02-003',
    module: 'M02',
    title: 'AI System Registration — Missing Use Case',
    preconditions: 'Empty state',
    steps: 'Attempt to register AI system with empty use case',
    expectedResult: 'Registration rejected with clear error message',
    priority: 'P0',
    category: 'negative',
  },
  {
    id: 'VT-M02-004',
    module: 'M02',
    title: 'AI System Status — DECLARED ≠ ACCREDITED',
    preconditions: 'AI system registered',
    steps: 'Verify initial status after registration',
    expectedResult: 'Status is DECLARED, NOT ACCREDITED or VERIFIED (Rule 1)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M02-005',
    module: 'M02',
    title: 'AI System — Multiple Registrations',
    preconditions: 'One AI system already registered',
    steps: 'Register second AI system',
    expectedResult: 'Both systems exist independently with unique IDs',
    priority: 'P1',
    category: 'positive',
  },
  {
    id: 'VT-M02-006',
    module: 'M02',
    title: 'AI System — Whitespace-only Name',
    preconditions: 'Empty state',
    steps: 'Register AI system with name containing only spaces',
    expectedResult: 'Registration rejected (trimmed name is empty)',
    priority: 'P1',
    category: 'edge-case',
  },

  // ============================================================
  // M03 — DEMO REQUIREMENT (PLACEHOLDER) VALIDATION
  // ============================================================
  {
    id: 'VT-M03-001',
    module: 'M03',
    title: 'Placeholder Requirement — Initial State',
    preconditions: 'Fresh application state',
    steps: 'Inspect demo requirement',
    expectedResult: 'Applicability is PENDING, isPlaceholder is true',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M03-002',
    module: 'M03',
    title: 'Placeholder — No False Legal Conclusions',
    preconditions: 'Demo requirement exists',
    steps: 'Execute evaluation with PENDING applicability',
    expectedResult: 'Result is PENDING, no compliance conclusion generated',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M03-003',
    module: 'M03',
    title: 'Placeholder — Explicit Warning Present',
    preconditions: 'Demo requirement exists',
    steps: 'Inspect requirement description and basis',
    expectedResult: 'Clear warning that this is NOT a real legal rule',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M03-004',
    module: 'M03',
    title: 'Placeholder — NOT_APPLICABLE ≠ Compliance',
    preconditions: 'Requirement set to NOT_APPLICABLE',
    steps: 'Execute evaluation',
    expectedResult: 'Result is UNDETERMINED, NOT ESTABLISHED (no compliance)',
    priority: 'P0',
    category: 'edge-case',
  },
  {
    id: 'VT-M03-005',
    module: 'M03',
    title: 'Placeholder — PENDING ≠ NOT_ESTABLISHED',
    preconditions: 'Requirement with PENDING applicability',
    steps: 'Execute evaluation',
    expectedResult: 'Result is PENDING, distinct from NOT_ESTABLISHED (Rule 4)',
    priority: 'P0',
    category: 'edge-case',
  },

  // ============================================================
  // M04 — EVIDENCE VALIDATION
  // ============================================================
  {
    id: 'VT-M04-001',
    module: 'M04',
    title: 'Evidence Registration — Valid Input',
    preconditions: 'AI system and requirement exist',
    steps: 'Register evidence with valid title and description',
    expectedResult: 'Evidence created with status DECLARED',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M04-002',
    module: 'M04',
    title: 'Evidence Registration — Missing Title',
    preconditions: 'AI system and requirement exist',
    steps: 'Attempt to register evidence with empty title',
    expectedResult: 'Registration rejected with error',
    priority: 'P0',
    category: 'negative',
  },
  {
    id: 'VT-M04-003',
    module: 'M04',
    title: 'Evidence — DECLARED ≠ ACCEPTED',
    preconditions: 'Evidence registered',
    steps: 'Check evidence status',
    expectedResult: 'Status is DECLARED, NOT ACCEPTED (Rule 6, 7)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M04-004',
    module: 'M04',
    title: 'Evidence — Linkage to Requirement',
    preconditions: 'Evidence registered',
    steps: 'Verify evidence is linked to correct requirement and AI system',
    expectedResult: 'Evidence.requirementId and evidence.aiSystemId are correct',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M04-005',
    module: 'M04',
    title: 'Evidence — Invalid Requirement Reference',
    preconditions: 'AI system exists',
    steps: 'Attempt to register evidence with non-existent requirement ID',
    expectedResult: 'Registration rejected with clear error',
    priority: 'P0',
    category: 'negative',
  },
  {
    id: 'VT-M04-006',
    module: 'M04',
    title: 'Evidence — Invalid AI System Reference',
    preconditions: 'Requirement exists',
    steps: 'Attempt to register evidence with non-existent AI system ID',
    expectedResult: 'Registration rejected with clear error',
    priority: 'P0',
    category: 'negative',
  },
  {
    id: 'VT-M04-007',
    module: 'M04',
    title: 'Evidence — UNKNOWN Status',
    preconditions: 'Evidence registered',
    steps: 'Set evidence status to UNKNOWN',
    expectedResult: 'Status is UNKNOWN, distinct from other states (Rule 2)',
    priority: 'P1',
    category: 'edge-case',
  },
  {
    id: 'VT-M04-008',
    module: 'M04',
    title: 'Evidence — Document Exists ≠ Sufficient Evidence',
    preconditions: 'Evidence registered',
    steps: 'Verify that evidence existence does not imply compliance',
    expectedResult: 'Evidence status DECLARED, no automatic compliance conclusion',
    priority: 'P0',
    category: 'positive',
  },

  // ============================================================
  // EVALUATION ENGINE VALIDATION
  // ============================================================
  {
    id: 'VT-EVAL-001',
    module: 'Evaluation',
    title: 'PENDING Applicability → PENDING Evaluation',
    preconditions: 'Requirement with PENDING applicability, AI system registered',
    steps: 'Execute evaluation',
    expectedResult: 'Result is PENDING, no compliance conclusion',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-EVAL-002',
    module: 'Evaluation',
    title: 'APPLICABLE + No Evidence → UNDETERMINED',
    preconditions: 'APPLICABLE requirement, no evidence',
    steps: 'Execute evaluation',
    expectedResult: 'Result is UNDETERMINED',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-EVAL-003',
    module: 'Evaluation',
    title: 'APPLICABLE + Evidence → UNDETERMINED',
    preconditions: 'APPLICABLE requirement, evidence registered',
    steps: 'Execute evaluation',
    expectedResult: 'Result is UNDETERMINED (no substantive rules yet)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-EVAL-004',
    module: 'Evaluation',
    title: 'Evidence Claim ≠ Compliance Conclusion',
    preconditions: 'Evidence registered',
    steps: 'Execute evaluation',
    expectedResult: 'No automatic compliance conclusion from evidence (Rule 8)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-EVAL-005',
    module: 'Evaluation',
    title: 'History Preservation',
    preconditions: 'Two evaluations executed for same requirement+system',
    steps: 'Check second evaluation',
    expectedResult: 'Previous evaluation IDs preserved (Rule 14)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-EVAL-006',
    module: 'Evaluation',
    title: 'Conflicting Evidence Detection',
    preconditions: 'ACCEPTED and REJECTED evidence for same requirement',
    steps: 'Execute evaluation',
    expectedResult: 'Result is CONFLICTING, not silently resolved (Rule 16)',
    priority: 'P0',
    category: 'edge-case',
  },
  {
    id: 'VT-EVAL-007',
    module: 'Evaluation',
    title: 'UNKNOWN Evidence Exclusion',
    preconditions: 'Evidence with UNKNOWN status',
    steps: 'Execute evaluation',
    expectedResult: 'UNKNOWN evidence not used for evaluation',
    priority: 'P1',
    category: 'edge-case',
  },
  {
    id: 'VT-EVAL-008',
    module: 'Evaluation',
    title: 'Invalid Requirement Reference',
    preconditions: 'AI system exists',
    steps: 'Execute evaluation with non-existent requirement',
    expectedResult: 'Evaluation rejected with error',
    priority: 'P0',
    category: 'negative',
  },
  {
    id: 'VT-EVAL-009',
    module: 'Evaluation',
    title: 'Invalid AI System Reference',
    preconditions: 'Requirement exists',
    steps: 'Execute evaluation with non-existent AI system',
    expectedResult: 'Evaluation rejected with error',
    priority: 'P0',
    category: 'negative',
  },

  // ============================================================
  // M05 — GAP → ACTION VALIDATION
  // ============================================================
  {
    id: 'VT-M05-001',
    module: 'M05',
    title: 'PENDING Evaluation → No GAP',
    preconditions: 'Evaluation with PENDING result',
    steps: 'Derive gap',
    expectedResult: 'No gap created',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M05-002',
    module: 'M05',
    title: 'APPLICABLE + No Evidence → MISSING_EVIDENCE',
    preconditions: 'APPLICABLE requirement, no evidence',
    steps: 'Execute evaluation, derive gap',
    expectedResult: 'Gap type is MISSING_EVIDENCE',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M05-003',
    module: 'M05',
    title: 'APPLICABLE + Evidence → No Automatic Gap',
    preconditions: 'APPLICABLE requirement, evidence exists',
    steps: 'Execute evaluation, derive gap',
    expectedResult: 'No gap (no substantive rules yet)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M05-004',
    module: 'M05',
    title: 'ESTABLISHED Evaluation → No GAP',
    preconditions: 'Evaluation with ESTABLISHED result',
    steps: 'Derive gap',
    expectedResult: 'No gap created',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M05-005',
    module: 'M05',
    title: 'CONFLICTING Evidence → CONFLICTING_EVIDENCE Gap',
    preconditions: 'Conflicting evidence',
    steps: 'Execute evaluation, derive gap',
    expectedResult: 'Gap type is CONFLICTING_EVIDENCE',
    priority: 'P0',
    category: 'edge-case',
  },
  {
    id: 'VT-M05-006',
    module: 'M05',
    title: 'GAP ≠ Infringement',
    preconditions: 'Gap exists',
    steps: 'Inspect gap description',
    expectedResult: 'Gap explicitly states it is NOT an infringement (Rule 9)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M05-007',
    module: 'M05',
    title: 'GAP ≠ Culpability',
    preconditions: 'Gap exists',
    steps: 'Inspect gap description',
    expectedResult: 'Gap explicitly states it is NOT culpability (Rule 10)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M05-008',
    module: 'M05',
    title: 'Action Proposal',
    preconditions: 'Gap exists',
    steps: 'Propose action for gap',
    expectedResult: 'Action created with status PROPOSED',
    priority: 'P1',
    category: 'positive',
  },
  {
    id: 'VT-M05-009',
    module: 'M05',
    title: 'Action COMPLETED ≠ VERIFIED',
    preconditions: 'Action exists',
    steps: 'Set action status to COMPLETED',
    expectedResult: 'Status is COMPLETED, NOT VERIFIED (Rule 11)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M05-010',
    module: 'M05',
    title: 'Action COMPLETED ≠ GAP RESOLVED',
    preconditions: 'Action set to COMPLETED',
    steps: 'Check if gap still exists',
    expectedResult: 'Gap still exists (Rule 12)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M05-011',
    module: 'M05',
    title: 'No Self-Certification',
    preconditions: 'Action exists',
    steps: 'Attempt to set action to VERIFIED directly',
    expectedResult: 'No automatic verification without full chain (Rule 13)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M05-012',
    module: 'M05',
    title: 'NOT_ESTABLISHED → No Automatic Gap',
    preconditions: 'Evaluation with NOT_ESTABLISHED result',
    steps: 'Derive gap',
    expectedResult: 'No automatic generic gap (Test 7)',
    priority: 'P1',
    category: 'edge-case',
  },

  // ============================================================
  // M06 — RESULT / DOSSIER VALIDATION
  // ============================================================
  {
    id: 'VT-M06-001',
    module: 'M06',
    title: 'Result Card Generation',
    preconditions: 'Evaluation exists',
    steps: 'Generate result card',
    expectedResult: 'Result card created with correct evaluation result',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M06-002',
    module: 'M06',
    title: 'Result Card — Cannot Rewrite M03',
    preconditions: 'Result card generated',
    steps: 'Verify requirement applicability unchanged',
    expectedResult: 'M03 applicability not modified by M06 (Rule 19)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M06-003',
    module: 'M06',
    title: 'Result Card — Cannot Rewrite M04',
    preconditions: 'Result card generated',
    steps: 'Verify evidence evaluations unchanged',
    expectedResult: 'M04 evaluations not modified by M06 (Rule 20)',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M06-004',
    module: 'M06',
    title: 'Result Card — Unimplemented Aspects Marked',
    preconditions: 'Result card generated',
    steps: 'Inspect unimplementedAspects field',
    expectedResult: 'Unimplemented aspects explicitly listed',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M06-005',
    module: 'M06',
    title: 'Result Card — Gaps Included',
    preconditions: 'Evaluation with gaps',
    steps: 'Generate result card',
    expectedResult: 'All gaps for evaluation included in result card',
    priority: 'P1',
    category: 'positive',
  },
  {
    id: 'VT-M06-006',
    module: 'M06',
    title: 'Result Card — Actions Included',
    preconditions: 'Gaps with actions',
    steps: 'Generate result card',
    expectedResult: 'All actions for gaps included in result card',
    priority: 'P1',
    category: 'positive',
  },
  {
    id: 'VT-M06-007',
    module: 'M06',
    title: 'Result Card — No False Certification',
    preconditions: 'Result card with PENDING evaluation',
    steps: 'Inspect result card',
    expectedResult: 'No certification, compliance, or approval claims',
    priority: 'P0',
    category: 'positive',
  },
  {
    id: 'VT-M06-008',
    module: 'M06',
    title: 'Result Card — Invalid Evaluation Reference',
    preconditions: 'No evaluation exists',
    steps: 'Attempt to generate result card with invalid evaluation ID',
    expectedResult: 'Generation rejected with error',
    priority: 'P0',
    category: 'negative',
  },

  // ============================================================
  // CROSS-CUTTING CONCERNS
  // ============================================================
  {
    id: 'VT-XCUT-001',
    module: 'Cross-cutting',
    title: 'Human Review — Distinct State',
    preconditions: 'Evaluation exists',
    steps: 'Record human review',
    expectedResult: 'REQUIRES_HUMAN_REVIEW is distinct from other states (Test 9)',
    priority: 'P1',
    category: 'positive',
  },
  {
    id: 'VT-XCUT-002',
    module: 'Cross-cutting',
    title: 'Temporal Integrity',
    preconditions: 'Multiple operations performed',
    steps: 'Verify timestamps are sequential',
    expectedResult: 'All timestamps are valid ISO strings, sequential',
    priority: 'P2',
    category: 'positive',
  },
  {
    id: 'VT-XCUT-003',
    module: 'Cross-cutting',
    title: 'Provenance Tracking',
    preconditions: 'Entities created',
    steps: 'Verify createdBy/declaredBy fields',
    expectedResult: 'Provenance fields populated for all entities',
    priority: 'P1',
    category: 'positive',
  },
  {
    id: 'VT-XCUT-004',
    module: 'Cross-cutting',
    title: 'Version Tracking',
    preconditions: 'Entities created',
    steps: 'Verify version fields',
    expectedResult: 'All entities have version >= 1',
    priority: 'P2',
    category: 'positive',
  },
  {
    id: 'VT-XCUT-005',
    module: 'Cross-cutting',
    title: 'Logical ID Uniqueness',
    preconditions: 'Multiple entities created',
    steps: 'Verify logical IDs',
    expectedResult: 'All logical IDs are unique',
    priority: 'P1',
    category: 'positive',
  },
];

// ============================================================
// ACTUAL TEST IMPLEMENTATIONS
// ============================================================

describe('COMPREHENSIVE VALIDATION SUITE', () => {
  let state: ApplicationState;

  beforeEach(() => {
    state = createInitialState();
  });

  // ============================================================
  // M02 VALIDATION TESTS
  // ============================================================
  describe('M02 — AI Inventory Validation', () => {
    it('VT-M02-001: Valid AI System Registration', () => {
      const { aiSystem } = registerAISystem(state, 'Test System', 'Test Use', 'user');
      expect(aiSystem.id).toBeTruthy();
      expect(aiSystem.name).toBe('Test System');
      expect(aiSystem.useCase).toBe('Test Use');
      expect(aiSystem.status).toBe('DECLARED');
    });

    it('VT-M02-002: Missing Name Rejected', () => {
      expect(() => registerAISystem(state, '', 'Use', 'user')).toThrow();
    });

    it('VT-M02-003: Missing Use Case Rejected', () => {
      expect(() => registerAISystem(state, 'Name', '', 'user')).toThrow();
    });

    it('VT-M02-004: DECLARED ≠ ACCREDITED', () => {
      const { aiSystem } = registerAISystem(state, 'Test', 'Use', 'user');
      expect(aiSystem.status).toBe('DECLARED');
      expect(aiSystem.status).not.toBe('ACCREDITED');
      expect(aiSystem.status).not.toBe('VERIFIED');
    });

    it('VT-M02-005: Multiple Registrations', () => {
      const { state: s1 } = registerAISystem(state, 'System 1', 'Use 1', 'user');
      const { state: s2 } = registerAISystem(s1, 'System 2', 'Use 2', 'user');
      expect(s2.aiSystems.length).toBe(2);
      expect(s2.aiSystems[0].id).not.toBe(s2.aiSystems[1].id);
    });

    it('VT-M02-006: Whitespace-only Name Rejected', () => {
      expect(() => registerAISystem(state, '   ', 'Use', 'user')).toThrow();
    });
  });

  // ============================================================
  // M03 VALIDATION TESTS
  // ============================================================
  describe('M03 — Demo Requirement Validation', () => {
    it('VT-M03-001: Placeholder Initial State', () => {
      const req = state.requirements[0];
      expect(req.applicability).toBe('PENDING');
      expect(req.isPlaceholder).toBe(true);
    });

    it('VT-M03-002: No False Legal Conclusions', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      expect(evaluation.result).toBe('PENDING');
      expect(evaluation.result).not.toBe('ESTABLISHED');
    });

    it('VT-M03-003: Explicit Warning Present', () => {
      const req = state.requirements[0];
      expect(req.description).toContain('placeholder');
      expect(req.applicabilityBasis).toContain('NOT_IMPLEMENTED');
    });

    it('VT-M03-004: NOT_APPLICABLE ≠ Compliance', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'NOT_APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      expect(evaluation.result).toBe('UNDETERMINED');
      expect(evaluation.result).not.toBe('ESTABLISHED');
    });

    it('VT-M03-005: PENDING ≠ NOT_ESTABLISHED', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      expect(evaluation.result).toBe('PENDING');
      expect(evaluation.result).not.toBe('NOT_ESTABLISHED');
    });
  });

  // ============================================================
  // M04 VALIDATION TESTS
  // ============================================================
  describe('M04 — Evidence Validation', () => {
    it('VT-M04-001: Valid Evidence Registration', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { evidence } = registerEvidence(s1, 'Title', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      expect(evidence.id).toBeTruthy();
      expect(evidence.status).toBe('DECLARED');
    });

    it('VT-M04-002: Missing Title Rejected', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      expect(() => registerEvidence(s1, '', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user')).toThrow();
    });

    it('VT-M04-003: DECLARED ≠ ACCEPTED', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { evidence } = registerEvidence(s1, 'Title', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      expect(evidence.status).toBe('DECLARED');
      expect(evidence.status).not.toBe('ACCEPTED');
    });

    it('VT-M04-004: Evidence Linkage', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { evidence } = registerEvidence(s1, 'Title', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      expect(evidence.requirementId).toBe(s1.requirements[0].id);
      expect(evidence.aiSystemId).toBe(s1.aiSystems[0].id);
    });

    it('VT-M04-005: Invalid Requirement Reference', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      expect(() => registerEvidence(s1, 'Title', 'Desc', 'invalid_req', s1.aiSystems[0].id, 'user')).toThrow();
    });

    it('VT-M04-006: Invalid AI System Reference', () => {
      expect(() => registerEvidence(state, 'Title', 'Desc', state.requirements[0].id, 'invalid_sys', 'user')).toThrow();
    });

    it('VT-M04-007: UNKNOWN Status', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { state: s2, evidence } = registerEvidence(s1, 'Title', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const s3 = updateEvidenceStatus(s2, evidence.id, 'UNKNOWN');
      const updated = s3.evidence.find(e => e.id === evidence.id);
      expect(updated?.status).toBe('UNKNOWN');
    });

    it('VT-M04-008: Document ≠ Sufficient Evidence', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { evidence } = registerEvidence(s1, 'Title', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      expect(evidence.status).toBe('DECLARED');
      // No automatic compliance conclusion
    });
  });

  // ============================================================
  // EVALUATION VALIDATION TESTS
  // ============================================================
  describe('Evaluation Engine Validation', () => {
    it('VT-EVAL-001: PENDING → PENDING', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      expect(evaluation.result).toBe('PENDING');
    });

    it('VT-EVAL-002: APPLICABLE + No Evidence → UNDETERMINED', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      expect(evaluation.result).toBe('UNDETERMINED');
    });

    it('VT-EVAL-003: APPLICABLE + Evidence → UNDETERMINED', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2 } = registerEvidence(s1, 'Title', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { evaluation } = executeEvaluation(s2, s2.requirements[0].id, s2.aiSystems[0].id, 'user');
      expect(evaluation.result).toBe('UNDETERMINED');
    });

    it('VT-EVAL-004: Evidence ≠ Compliance', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2 } = registerEvidence(s1, 'Title', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { evaluation } = executeEvaluation(s2, s2.requirements[0].id, s2.aiSystems[0].id, 'user');
      expect(evaluation.result).not.toBe('ESTABLISHED');
    });

    it('VT-EVAL-005: History Preservation', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation: eval1 } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { evaluation: eval2 } = executeEvaluation(s2, s2.requirements[0].id, s2.aiSystems[0].id, 'user');
      expect(eval2.previousEvaluationIds).toContain(eval1.id);
    });

    it('VT-EVAL-006: Conflicting Evidence', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evidence: ev1 } = registerEvidence(s1, 'Accepted', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const s3 = updateEvidenceStatus(s2, ev1.id, 'ACCEPTED');
      const { state: s4, evidence: ev2 } = registerEvidence(s3, 'Rejected', 'Desc', s3.requirements[0].id, s3.aiSystems[0].id, 'user');
      const s5 = updateEvidenceStatus(s4, ev2.id, 'REJECTED');
      const { evaluation } = executeEvaluation(s5, s5.requirements[0].id, s5.aiSystems[0].id, 'user');
      expect(evaluation.result).toBe('CONFLICTING');
    });

    it('VT-EVAL-007: UNKNOWN Evidence Excluded', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evidence } = registerEvidence(s1, 'Unknown', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const s3 = updateEvidenceStatus(s2, evidence.id, 'UNKNOWN');
      const { evaluation } = executeEvaluation(s3, s3.requirements[0].id, s3.aiSystems[0].id, 'user');
      expect(evaluation.basis).toContain('UNKNOWN');
    });

    it('VT-EVAL-008: Invalid Requirement', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      expect(() => executeEvaluation(s1, 'invalid', s1.aiSystems[0].id, 'user')).toThrow();
    });

    it('VT-EVAL-009: Invalid AI System', () => {
      expect(() => executeEvaluation(state, state.requirements[0].id, 'invalid', 'user')).toThrow();
    });
  });

  // ============================================================
  // M05 VALIDATION TESTS
  // ============================================================
  describe('M05 — Gap → Action Validation', () => {
    it('VT-M05-001: PENDING → No Gap', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { gap } = deriveGap(s2, evaluation.id);
      expect(gap).toBeNull();
    });

    it('VT-M05-002: APPLICABLE + No Evidence → MISSING_EVIDENCE', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { gap } = deriveGap(s2, evaluation.id);
      expect(gap).not.toBeNull();
      expect(gap!.gapType).toBe('MISSING_EVIDENCE');
    });

    it('VT-M05-003: APPLICABLE + Evidence → No Gap', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2 } = registerEvidence(s1, 'Title', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { state: s3, evaluation } = executeEvaluation(s2, s2.requirements[0].id, s2.aiSystems[0].id, 'user');
      const { gap } = deriveGap(s3, evaluation.id);
      expect(gap).toBeNull();
    });

    it('VT-M05-004: ESTABLISHED → No Gap', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const establishedEval = {
        id: 'eval_test',
        requirementId: s1.requirements[0].id,
        aiSystemId: s1.aiSystems[0].id,
        result: 'ESTABLISHED' as const,
        basis: 'Test',
        evidenceIds: [],
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: 'test',
        previousEvaluationIds: [],
        createdAt: new Date().toISOString(),
      };
      const s2: ApplicationState = { ...s1, evaluations: [establishedEval] };
      const { gap } = deriveGap(s2, establishedEval.id);
      expect(gap).toBeNull();
    });

    it('VT-M05-005: CONFLICTING → CONFLICTING_EVIDENCE', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evidence: ev1 } = registerEvidence(s1, 'A', 'D', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const s3 = updateEvidenceStatus(s2, ev1.id, 'ACCEPTED');
      const { state: s4, evidence: ev2 } = registerEvidence(s3, 'B', 'D', s3.requirements[0].id, s3.aiSystems[0].id, 'user');
      const s5 = updateEvidenceStatus(s4, ev2.id, 'REJECTED');
      const { state: s6, evaluation } = executeEvaluation(s5, s5.requirements[0].id, s5.aiSystems[0].id, 'user');
      const { gap } = deriveGap(s6, evaluation.id);
      expect(gap).not.toBeNull();
      expect(gap!.gapType).toBe('CONFLICTING_EVIDENCE');
    });

    it('VT-M05-006: GAP ≠ Infringement', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { gap } = deriveGap(s2, evaluation.id);
      expect(gap!.description).toContain('NOT an infringement');
    });

    it('VT-M05-007: GAP ≠ Culpability', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { gap } = deriveGap(s2, evaluation.id);
      expect(gap!.description).toContain('NOT');
    });

    it('VT-M05-008: Action Proposal', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { state: s3, gap } = deriveGap(s2, evaluation.id);
      const { action } = proposeAction(s3!, gap!.id, 'Fix it');
      expect(action.status).toBe('PROPOSED');
    });

    it('VT-M05-009: COMPLETED ≠ VERIFIED', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { state: s3, gap } = deriveGap(s2, evaluation.id);
      const { state: s4, action } = proposeAction(s3!, gap!.id, 'Fix');
      const s5 = updateActionStatus(s4, action.id, 'COMPLETED');
      const completed = s5.actions.find(a => a.id === action.id);
      expect(completed!.status).toBe('COMPLETED');
      expect(completed!.status).not.toBe('VERIFIED');
    });

    it('VT-M05-010: COMPLETED ≠ GAP RESOLVED', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { state: s3, gap } = deriveGap(s2, evaluation.id);
      const { state: s4, action } = proposeAction(s3!, gap!.id, 'Fix');
      const s5 = updateActionStatus(s4, action.id, 'COMPLETED');
      expect(s5.gaps.length).toBe(1);
    });

    it('VT-M05-011: No Self-Certification', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { state: s3, gap } = deriveGap(s2, evaluation.id);
      const { state: s4, action } = proposeAction(s3!, gap!.id, 'Fix');
      const s5 = updateActionStatus(s4, action.id, 'COMPLETED');
      // Gap still exists, action not verified
      expect(s5.gaps.length).toBe(1);
      expect(s5.actions[0].status).toBe('COMPLETED');
    });

    it('VT-M05-012: NOT_ESTABLISHED → No Automatic Gap', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const notEstEval = {
        id: 'eval_ne',
        requirementId: s1.requirements[0].id,
        aiSystemId: s1.aiSystems[0].id,
        result: 'NOT_ESTABLISHED' as const,
        basis: 'Test',
        evidenceIds: [],
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: 'test',
        previousEvaluationIds: [],
        createdAt: new Date().toISOString(),
      };
      const s2: ApplicationState = { ...s1, evaluations: [notEstEval] };
      const { gap } = deriveGap(s2, notEstEval.id);
      expect(gap).toBeNull();
    });
  });

  // ============================================================
  // M06 VALIDATION TESTS
  // ============================================================
  describe('M06 — Result Validation', () => {
    it('VT-M06-001: Result Card Generation', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { resultCard } = generateResultCard(s2, evaluation.id);
      expect(resultCard.result).toBe(evaluation.result);
    });

    it('VT-M06-002: Cannot Rewrite M03', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const origApplicability = s1.requirements[0].applicability;
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      generateResultCard(s2, evaluation.id);
      expect(s2.requirements[0].applicability).toBe(origApplicability);
    });

    it('VT-M06-003: Cannot Rewrite M04', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { state: s2, evidence } = registerEvidence(s1, 'Title', 'Desc', s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const origStatus = s2.evidence[0].status;
      const { state: s3, evaluation } = executeEvaluation(s2, s2.requirements[0].id, s2.aiSystems[0].id, 'user');
      generateResultCard(s3, evaluation.id);
      expect(s3.evidence.find(e => e.id === evidence.id)?.status).toBe(origStatus);
    });

    it('VT-M06-004: Unimplemented Aspects Marked', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { resultCard } = generateResultCard(s2, evaluation.id);
      expect(resultCard.unimplementedAspects.length).toBeGreaterThan(0);
    });

    it('VT-M06-005: Gaps Included', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { state: s3, gap } = deriveGap(s2, evaluation.id);
      const { resultCard } = generateResultCard(s3!, evaluation.id);
      expect(resultCard.gaps.length).toBe(1);
    });

    it('VT-M06-006: Actions Included', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map(r => ({ ...r, applicability: 'APPLICABLE' as const })),
      };
      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { state: s3, gap } = deriveGap(s2, evaluation.id);
      const { state: s4 } = proposeAction(s3!, gap!.id, 'Fix');
      const { resultCard } = generateResultCard(s4, evaluation.id);
      expect(resultCard.actions.length).toBe(1);
    });

    it('VT-M06-007: No False Certification', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { resultCard } = generateResultCard(s2, evaluation.id);
      expect(resultCard.result).toBe('PENDING');
      expect(resultCard.result).not.toBe('ESTABLISHED');
    });

    it('VT-M06-008: Invalid Evaluation Reference', () => {
      expect(() => generateResultCard(state, 'invalid')).toThrow();
    });
  });

  // ============================================================
  // CROSS-CUTTING VALIDATION TESTS
  // ============================================================
  describe('Cross-Cutting Validation', () => {
    it('VT-XCUT-001: Human Review Distinct State', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const { state: s2, evaluation } = executeEvaluation(s1, s1.requirements[0].id, s1.aiSystems[0].id, 'user');
      const { review } = recordHumanReview(s2, evaluation.id, 'PENDING_REVIEW', 'reviewer', 'Notes');
      expect(review.decision).toBe('PENDING_REVIEW');
    });

    it('VT-XCUT-002: Temporal Integrity', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const sys = s1.aiSystems[0];
      expect(new Date(sys.createdAt).getTime()).toBeLessThanOrEqual(new Date(sys.updatedAt).getTime());
    });

    it('VT-XCUT-003: Provenance Tracking', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'test_user');
      expect(s1.aiSystems[0].declaredBy).toBe('test_user');
    });

    it('VT-XCUT-004: Version Tracking', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      expect(s1.aiSystems[0].version).toBeGreaterThanOrEqual(1);
    });

    it('VT-XCUT-005: Logical ID Uniqueness', () => {
      const { state: s1 } = registerAISystem(state, 'Test 1', 'Use 1', 'user');
      const { state: s2 } = registerAISystem(s1, 'Test 2', 'Use 2', 'user');
      const ids = s2.aiSystems.map(s => s.logicalId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
