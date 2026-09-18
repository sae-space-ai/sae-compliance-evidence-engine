/**
 * Evaluation Panel
 * 
 * Executes evaluation and displays results.
 * Shows the evaluation basis and preserves history.
 */

import type { ApplicationState, Evaluation } from '../domain/types.ts';
import { ModuleHeader } from './ModuleHeader.tsx';
import { StatusBadge } from './StatusBadge.tsx';

export function EvaluationPanel({
  state,
  selectedAISystemId,
  latestEvaluation,
  onExecute,
}: {
  state: ApplicationState;
  selectedAISystemId: string | null;
  latestEvaluation?: Evaluation;
  onExecute: () => void;
}) {
  const selectedSystem = state.aiSystems.find((s) => s.id === selectedAISystemId);
  const requirement = state.requirements[0];

  // Get all evaluations for current selection
  const allEvaluations = selectedAISystemId
    ? state.evaluations
        .filter((e) => e.aiSystemId === selectedAISystemId && e.requirementId === requirement.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const relevantEvidence = selectedAISystemId
    ? state.evidence.filter((e) => e.aiSystemId === selectedAISystemId && e.requirementId === requirement.id)
    : [];

  return (
    <div className="space-y-6">
      <ModuleHeader
        module="Evaluation"
        title="Evaluation Engine"
        description="Execute evaluation based on applicability and evidence. Results preserve the full evaluation chain."
      />

      {/* No system selected warning */}
      {!selectedAISystemId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>No AI system selected.</strong> Please select or register an AI system in M02 first.
          </p>
        </div>
      )}

      {/* Evaluation Context */}
      {selectedAISystemId && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Evaluation Context</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">AI System:</span>
              <span className="text-sm font-medium text-slate-800">{selectedSystem?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Requirement:</span>
              <span className="text-sm font-medium text-slate-800">{requirement.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Applicability:</span>
              <StatusBadge status={requirement.applicability} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Evidence Available:</span>
              <span className="text-sm font-medium text-slate-800">{relevantEvidence.length}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={onExecute}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors"
            >
              Execute Evaluation
            </button>
            <p className="mt-2 text-xs text-slate-500">
              Evaluation will consider applicability status and available evidence.
              {requirement.applicability === 'PENDING' && (
                <span className="text-amber-600 font-medium"> Result will be PENDING (no compliance conclusion).</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Latest Evaluation Result */}
      {latestEvaluation && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Latest Evaluation Result</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Result:</span>
              <StatusBadge status={latestEvaluation.result} />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700">
              <strong>Basis:</strong> {latestEvaluation.basis}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Evaluated: {new Date(latestEvaluation.evaluatedAt).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">
                By: {latestEvaluation.evaluatedBy}
              </span>
            </div>
            {latestEvaluation.previousEvaluationIds.length > 0 && (
              <div className="text-xs text-slate-500">
                Previous evaluations: {latestEvaluation.previousEvaluationIds.length} (history preserved, Rule 14)
              </div>
            )}
          </div>

          {/* Result Interpretation */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            {latestEvaluation.result === 'PENDING' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <strong>Interpretation:</strong> Applicability is PENDING. No compliance conclusion has been made.
                This is the correct behavior — the system does not produce conclusions without established applicability.
              </div>
            )}
            {latestEvaluation.result === 'UNDETERMINED' && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                <strong>Interpretation:</strong> Evaluation is UNDETERMINED. No substantive evidentiary rules
                have been approved/implemented yet. This is NOT a compliance or non-compliance conclusion.
              </div>
            )}
            {latestEvaluation.result === 'CONFLICTING' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                <strong>Interpretation:</strong> Conflicting evidence detected. Conflicts must not be silently
                resolved (Rule 16). Human review is required.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evaluation History */}
      {allEvaluations.length > 1 && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Evaluation History ({allEvaluations.length})
          </h3>
          <div className="space-y-2">
            {allEvaluations.map((ev, idx) => (
              <div key={ev.id} className="p-3 rounded border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    #{allEvaluations.length - idx} — {new Date(ev.createdAt).toLocaleString()}
                  </span>
                  <StatusBadge status={ev.result} />
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ev.basis}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
