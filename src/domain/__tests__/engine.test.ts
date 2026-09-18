/**
 * SAE Compliance & Evidence Engine — Domain Engine Tests
 * 
 * These tests verify the critical invariants of the evaluation engine.
 * Each test corresponds to a specific requirement from the specification.
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
} from '../engine.ts';
import type { ApplicationState } from '../types.ts';

describe('SAE Compliance & Evidence Engine — Domain Tests', () => {
  let state: ApplicationState;

  beforeEach(() => {
    state = createInitialState();
  });

  // ============================================================
  // TEST 1: PENDING applicability
  // ============================================================
  describe('TEST 1: PENDING applicability', () => {
    it('PENDING applicability → PENDING evaluation, no GAP, no compliance conclusion', () => {
      // Register AI system
      const { state: stateWithSystem } = registerAISystem(
        state,
        'Test AI System',
        'Administrative assistance',
        'test_user'
      );

      const aiSystem = stateWithSystem.aiSystems[0];
      const requirement = stateWithSystem.requirements[0];

      // Verify demo requirement has PENDING applicability
      expect(requirement.applicability).toBe('PENDING');

      // Execute evaluation
      const { state: stateWithEval, evaluation } = executeEvaluation(
        stateWithSystem,
        requirement.id,
        aiSystem.id,
        'test_user'
      );

      // Expected: evaluation.result = PENDING
      expect(evaluation.result).toBe('PENDING');

      // Expected: no compliance conclusion
      expect(evaluation.result).not.toBe('ESTABLISHED');
      expect(evaluation.basis).toContain('No evaluation can be performed');

      // Derive gap
      const { gap } = deriveGap(stateWithEval, evaluation.id);

      // Expected: no GAP
      expect(gap).toBeNull();
    });
  });

  // ============================================================
  // TEST 2: NOT_APPLICABLE
  // ============================================================
  describe('TEST 2: NOT_APPLICABLE', () => {
    it('NOT_APPLICABLE → UNDETERMINED, no GAP, not compliance', () => {
      // Modify requirement to NOT_APPLICABLE
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'NOT_APPLICABLE' as const,
        })),
      };

      const { state: stateWithSystem } = registerAISystem(
        modifiedState,
        'Test AI System',
        'Test use',
        'test_user'
      );

      const aiSystem = stateWithSystem.aiSystems[0];
      const requirement = stateWithSystem.requirements[0];

      // Execute evaluation
      const { state: stateWithEval, evaluation } = executeEvaluation(
        stateWithSystem,
        requirement.id,
        aiSystem.id,
        'test_user'
      );

      // Expected: evaluation.result = UNDETERMINED
      expect(evaluation.result).toBe('UNDETERMINED');

      // NOT_APPLICABLE ≠ compliance
      expect(evaluation.result).not.toBe('ESTABLISHED');
      expect(evaluation.basis).toContain('does NOT constitute a compliance conclusion');

      // Derive gap
      const { gap } = deriveGap(stateWithEval, evaluation.id);

      // Expected: no GAP
      expect(gap).toBeNull();
    });
  });

  // ============================================================
  // TEST 3: APPLICABLE + no evidence
  // ============================================================
  describe('TEST 3: APPLICABLE + no evidence', () => {
    it('APPLICABLE + no evidence → UNDETERMINED, GAP = MISSING_EVIDENCE', () => {
      // Set requirement to APPLICABLE
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'APPLICABLE' as const,
        })),
      };

      const { state: stateWithSystem } = registerAISystem(
        modifiedState,
        'Test AI System',
        'Test use',
        'test_user'
      );

      const aiSystem = stateWithSystem.aiSystems[0];
      const requirement = stateWithSystem.requirements[0];

      // Execute evaluation WITHOUT evidence
      const { state: stateWithEval, evaluation } = executeEvaluation(
        stateWithSystem,
        requirement.id,
        aiSystem.id,
        'test_user'
      );

      // Expected: evaluation.result = UNDETERMINED
      expect(evaluation.result).toBe('UNDETERMINED');

      // Derive gap
      const { gap } = deriveGap(stateWithEval, evaluation.id);

      // Expected: GAP type = MISSING_EVIDENCE
      expect(gap).not.toBeNull();
      expect(gap!.gapType).toBe('MISSING_EVIDENCE');
    });
  });

  // ============================================================
  // TEST 4: APPLICABLE + evidence
  // ============================================================
  describe('TEST 4: APPLICABLE + evidence', () => {
    it('APPLICABLE + evidence → UNDETERMINED, no GAP merely because evidence exists', () => {
      // Set requirement to APPLICABLE
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'APPLICABLE' as const,
        })),
      };

      const { state: stateWithSystem } = registerAISystem(
        modifiedState,
        'Test AI System',
        'Test use',
        'test_user'
      );

      const aiSystem = stateWithSystem.aiSystems[0];
      const requirement = stateWithSystem.requirements[0];

      // Register evidence (DECLARED status)
      const { state: stateWithEvidence } = registerEvidence(
        stateWithSystem,
        'Test Evidence',
        'Test evidence description',
        requirement.id,
        aiSystem.id,
        'test_user'
      );

      // Execute evaluation
      const { state: stateWithEval, evaluation } = executeEvaluation(
        stateWithEvidence,
        requirement.id,
        aiSystem.id,
        'test_user'
      );

      // Expected: evaluation.result = UNDETERMINED
      expect(evaluation.result).toBe('UNDETERMINED');

      // Evidence found ≠ requirement fulfilled (Rule 6)
      expect(evaluation.result).not.toBe('ESTABLISHED');

      // Derive gap
      const { gap } = deriveGap(stateWithEval, evaluation.id);

      // Expected: NO GAP merely because evidence exists
      // (no substantive evidentiary rules yet)
      expect(gap).toBeNull();
    });
  });

  // ============================================================
  // TEST 5: UNKNOWN evidence
  // ============================================================
  describe('TEST 5: UNKNOWN evidence', () => {
    it('UNKNOWN evidence must not automatically become valid for evaluation', () => {
      // Set requirement to APPLICABLE
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'APPLICABLE' as const,
        })),
      };

      const { state: stateWithSystem } = registerAISystem(
        modifiedState,
        'Test AI System',
        'Test use',
        'test_user'
      );

      const aiSystem = stateWithSystem.aiSystems[0];
      const requirement = stateWithSystem.requirements[0];

      // Register evidence with UNKNOWN status
      const { state: stateWithEvidence, evidence } = registerEvidence(
        stateWithSystem,
        'Unknown Evidence',
        'Evidence with unknown status',
        requirement.id,
        aiSystem.id,
        'test_user'
      );

      // Set evidence to UNKNOWN
      const stateWithUnknown = updateEvidenceStatus(
        stateWithEvidence,
        evidence.id,
        'UNKNOWN'
      );

      // Execute evaluation
      const { evaluation } = executeEvaluation(
        stateWithUnknown,
        requirement.id,
        aiSystem.id,
        'test_user'
      );

      // Result should be UNDETERMINED — UNKNOWN evidence cannot be used
      expect(evaluation.result).toBe('UNDETERMINED');
      expect(evaluation.basis).toContain('UNKNOWN evidence cannot be used');
    });
  });

  // ============================================================
  // TEST 6: ESTABLISHED evaluation
  // ============================================================
  describe('TEST 6: ESTABLISHED evaluation', () => {
    it('ESTABLISHED evaluation → deriveGap() returns null', () => {
      // Set requirement to APPLICABLE
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'APPLICABLE' as const,
        })),
      };

      const { state: stateWithSystem } = registerAISystem(
        modifiedState,
        'Test AI System',
        'Test use',
        'test_user'
      );

      const aiSystem = stateWithSystem.aiSystems[0];
      const requirement = stateWithSystem.requirements[0];

      // Manually create an ESTABLISHED evaluation (simulating approved rule)
      const establishedEval = {
        id: 'eval_established_test',
        requirementId: requirement.id,
        aiSystemId: aiSystem.id,
        result: 'ESTABLISHED' as const,
        basis: 'Test: evaluation explicitly set to ESTABLISHED',
        evidenceIds: [],
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: 'test',
        previousEvaluationIds: [],
        createdAt: new Date().toISOString(),
      };

      const stateWithEval: ApplicationState = {
        ...stateWithSystem,
        evaluations: [...stateWithSystem.evaluations, establishedEval],
      };

      // Derive gap
      const { gap } = deriveGap(stateWithEval, establishedEval.id);

      // Expected: no GAP
      expect(gap).toBeNull();
    });
  });

  // ============================================================
  // TEST 7: NOT_ESTABLISHED evaluation
  // ============================================================
  describe('TEST 7: NOT_ESTABLISHED evaluation', () => {
    it('NOT_ESTABLISHED → no automatic generic GAP unless basis is represented', () => {
      // Set requirement to APPLICABLE
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'APPLICABLE' as const,
        })),
      };

      const { state: stateWithSystem } = registerAISystem(
        modifiedState,
        'Test AI System',
        'Test use',
        'test_user'
      );

      const aiSystem = stateWithSystem.aiSystems[0];
      const requirement = stateWithSystem.requirements[0];

      // Manually create a NOT_ESTABLISHED evaluation
      const notEstablishedEval = {
        id: 'eval_not_established_test',
        requirementId: requirement.id,
        aiSystemId: aiSystem.id,
        result: 'NOT_ESTABLISHED' as const,
        basis: 'Test: evaluation explicitly set to NOT_ESTABLISHED',
        evidenceIds: [],
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: 'test',
        previousEvaluationIds: [],
        createdAt: new Date().toISOString(),
      };

      const stateWithEval: ApplicationState = {
        ...stateWithSystem,
        evaluations: [...stateWithSystem.evaluations, notEstablishedEval],
      };

      // Derive gap
      const { gap } = deriveGap(stateWithEval, notEstablishedEval.id);

      // Expected: no automatic generic GAP
      expect(gap).toBeNull();
    });
  });

  // ============================================================
  // TEST 8: CONFLICTING evaluation
  // ============================================================
  describe('TEST 8: CONFLICTING evaluation', () => {
    it('CONFLICTING must not silently become ESTABLISHED or NOT_ESTABLISHED', () => {
      // Set requirement to APPLICABLE
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'APPLICABLE' as const,
        })),
      };

      const { state: stateWithSystem } = registerAISystem(
        modifiedState,
        'Test AI System',
        'Test use',
        'test_user'
      );

      const aiSystem = stateWithSystem.aiSystems[0];
      const requirement = stateWithSystem.requirements[0];

      // Register accepted evidence
      const { state: state1, evidence: ev1 } = registerEvidence(
        stateWithSystem,
        'Accepted Evidence',
        'This evidence is accepted',
        requirement.id,
        aiSystem.id,
        'test_user'
      );
      const state2 = updateEvidenceStatus(state1, ev1.id, 'ACCEPTED');

      // Register rejected evidence (creates conflict)
      const { state: state3, evidence: ev2 } = registerEvidence(
        state2,
        'Rejected Evidence',
        'This evidence is rejected',
        requirement.id,
        aiSystem.id,
        'test_user'
      );
      const state4 = updateEvidenceStatus(state3, ev2.id, 'REJECTED');

      // Execute evaluation
      const { state: stateWithEval, evaluation } = executeEvaluation(
        state4,
        requirement.id,
        aiSystem.id,
        'test_user'
      );

      // Expected: CONFLICTING
      expect(evaluation.result).toBe('CONFLICTING');

      // Must NOT silently become ESTABLISHED or NOT_ESTABLISHED
      expect(evaluation.result).not.toBe('ESTABLISHED');
      expect(evaluation.result).not.toBe('NOT_ESTABLISHED');

      // Derive gap — should produce CONFLICTING_EVIDENCE gap
      const { gap } = deriveGap(stateWithEval, evaluation.id);
      expect(gap).not.toBeNull();
      expect(gap!.gapType).toBe('CONFLICTING_EVIDENCE');
    });
  });

  // ============================================================
  // TEST 9: Human review state
  // ============================================================
  describe('TEST 9: Human review state', () => {
    it('REQUIRES_HUMAN_REVIEW must remain distinct from ordinary evaluation states', () => {
      // Manually create a REQUIRES_HUMAN_REVIEW evaluation
      const humanReviewEval = {
        id: 'eval_human_review_test',
        requirementId: state.requirements[0].id,
        aiSystemId: 'test_system',
        result: 'REQUIRES_HUMAN_REVIEW' as const,
        basis: 'Test: requires human review',
        evidenceIds: [],
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: 'test',
        previousEvaluationIds: [],
        createdAt: new Date().toISOString(),
      };

      // Verify it's a distinct state
      expect(humanReviewEval.result).toBe('REQUIRES_HUMAN_REVIEW');
      expect(humanReviewEval.result).not.toBe('ESTABLISHED');
      expect(humanReviewEval.result).not.toBe('NOT_ESTABLISHED');
      expect(humanReviewEval.result).not.toBe('UNDETERMINED');
      expect(humanReviewEval.result).not.toBe('PENDING');
      expect(humanReviewEval.result).not.toBe('CONFLICTING');

      // Derive gap — should produce no automatic gap
      const stateWithEval: ApplicationState = {
        ...state,
        evaluations: [humanReviewEval],
      };
      const { gap } = deriveGap(stateWithEval, humanReviewEval.id);
      expect(gap).toBeNull();
    });
  });

  // ============================================================
  // TEST 10: No self-certification
  // ============================================================
  describe('TEST 10: No self-certification', () => {
    it('ACTION COMPLETED does not automatically produce VERIFIED', () => {
      // Set up: APPLICABLE requirement, no evidence → gap
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'APPLICABLE' as const,
        })),
      };

      const { state: stateWithSystem } = registerAISystem(
        modifiedState,
        'Test AI System',
        'Test use',
        'test_user'
      );

      const aiSystem = stateWithSystem.aiSystems[0];
      const requirement = stateWithSystem.requirements[0];

      // Evaluate → UNDETERMINED
      const { state: stateWithEval, evaluation } = executeEvaluation(
        stateWithSystem,
        requirement.id,
        aiSystem.id,
        'test_user'
      );

      // Derive gap → MISSING_EVIDENCE
      const { state: stateWithGap, gap } = deriveGap(stateWithEval, evaluation.id);
      expect(gap).not.toBeNull();

      // Propose action
      const { state: stateWithAction, action } = proposeAction(
        stateWithGap!,
        gap!.id,
        'Provide required evidence'
      );

      // Complete action
      const stateCompleted = updateActionStatus(stateWithAction, action.id, 'COMPLETED');

      // Verify: action is COMPLETED but NOT VERIFIED
      const completedAction = stateCompleted.actions.find((a) => a.id === action.id);
      expect(completedAction!.status).toBe('COMPLETED');
      expect(completedAction!.status).not.toBe('VERIFIED');

      // Verify: gap still exists (COMPLETED ≠ GAP RESOLVED, Rule 12)
      const gapsAfterCompletion = stateCompleted.gaps.filter((g) => g.id === gap!.id);
      expect(gapsAfterCompletion.length).toBe(1);

      // The only valid closure route requires:
      // ACTION → NEW EVIDENCE → NEW EVALUATION → VERIFICATION → GAP STATUS
      // Simply completing the action does NOT close the gap
    });

    it('No code path where ACTION COMPLETED automatically closes GAP', () => {
      // This test verifies there's no hidden auto-closure mechanism
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'APPLICABLE' as const,
        })),
      };

      const { state: s1 } = registerAISystem(modifiedState, 'Sys', 'Use', 'user');
      const sys = s1.aiSystems[0];
      const req = s1.requirements[0];

      const { state: s2, evaluation } = executeEvaluation(s1, req.id, sys.id, 'user');
      const { state: s3, gap } = deriveGap(s2, evaluation.id);
      expect(gap).not.toBeNull();

      const { state: s4, action } = proposeAction(s3!, gap!.id, 'Fix it');
      const s5 = updateActionStatus(s4, action.id, 'COMPLETED');

      // Gap must still exist
      expect(s5.gaps.length).toBe(1);
      expect(s5.gaps[0].id).toBe(gap!.id);

      // Action must be COMPLETED, not VERIFIED
      expect(s5.actions[0].status).toBe('COMPLETED');
    });
  });

  // ============================================================
  // ADDITIONAL INTEGRITY TESTS
  // ============================================================
  describe('Additional integrity tests', () => {
    it('AI system registration produces DECLARED status only (Rule 1)', () => {
      const { aiSystem } = registerAISystem(state, 'Test', 'Use', 'user');
      expect(aiSystem.status).toBe('DECLARED');
      expect(aiSystem.status).not.toBe('ACCREDITED');
      expect(aiSystem.status).not.toBe('VERIFIED');
    });

    it('Evidence registration produces DECLARED status only (Rule 6, 7)', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const sys = s1.aiSystems[0];
      const req = s1.requirements[0];

      const { evidence } = registerEvidence(
        s1,
        'Evidence',
        'Description',
        req.id,
        sys.id,
        'user'
      );

      expect(evidence.status).toBe('DECLARED');
      expect(evidence.status).not.toBe('ACCEPTED');
    });

    it('History is preserved across evaluations (Rule 14)', () => {
      const modifiedState: ApplicationState = {
        ...state,
        requirements: state.requirements.map((r) => ({
          ...r,
          applicability: 'APPLICABLE' as const,
        })),
      };

      const { state: s1 } = registerAISystem(modifiedState, 'Test', 'Use', 'user');
      const sys = s1.aiSystems[0];
      const req = s1.requirements[0];

      // First evaluation
      const { state: s2, evaluation: eval1 } = executeEvaluation(s1, req.id, sys.id, 'user');

      // Second evaluation
      const { evaluation: eval2 } = executeEvaluation(s2, req.id, sys.id, 'user');

      // Second evaluation must reference first
      expect(eval2.previousEvaluationIds).toContain(eval1.id);
    });

    it('Result card preserves evaluation result without rewriting (Rule 19, 20)', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const sys = s1.aiSystems[0];
      const req = s1.requirements[0];

      const { state: s2, evaluation } = executeEvaluation(s1, req.id, sys.id, 'user');
      const { resultCard } = generateResultCard(s2, evaluation.id);

      // Result card must match evaluation result
      expect(resultCard.result).toBe(evaluation.result);
      // Must not rewrite to something different
      expect(resultCard.result).toBe('PENDING');
    });

    it('Unimplemented aspects are explicitly marked', () => {
      const { state: s1 } = registerAISystem(state, 'Test', 'Use', 'user');
      const sys = s1.aiSystems[0];
      const req = s1.requirements[0];

      const { state: s2, evaluation } = executeEvaluation(s1, req.id, sys.id, 'user');
      const { resultCard } = generateResultCard(s2, evaluation.id);

      expect(resultCard.unimplementedAspects.length).toBeGreaterThan(0);
      expect(resultCard.unimplementedAspects.some(a => a.includes('Applicability'))).toBe(true);
    });
  });
});
