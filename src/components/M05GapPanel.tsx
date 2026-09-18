/**
 * M05 — Gap → Action Engine Panel
 * 
 * Displays gaps derived from evaluations and associated actions.
 * 
 * CRITICAL:
 * - Gaps are NOT infringements (Rule 9)
 * - Gaps are NOT culpability (Rule 10)
 * - Actions cannot self-certify (Rule 13)
 * - COMPLETED ≠ VERIFIED (Rule 11)
 * - COMPLETED ≠ GAP RESOLVED (Rule 12)
 */

import type { ApplicationState, Gap } from '../domain/types.ts';
import { ModuleHeader } from './ModuleHeader.tsx';
import { StatusBadge } from './StatusBadge.tsx';

export function M05GapPanel({
  state,
  selectedAISystemId,
  currentGaps,
}: {
  state: ApplicationState;
  selectedAISystemId: string | null;
  currentGaps: Gap[];
}) {
  const selectedSystem = state.aiSystems.find((s) => s.id === selectedAISystemId);

  // Get actions for current gaps
  const currentActions = state.actions.filter((a) =>
    currentGaps.some((g) => g.id === a.gapId)
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        module="M05"
        title="Gap → Action Engine"
        description="Displays derived gaps and associated actions. Gaps are NOT infringements (Rule 9, 10)."
      />

      {/* No system selected warning */}
      {!selectedAISystemId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>No AI system selected.</strong> Please select or register an AI system in M02 first.
          </p>
        </div>
      )}

      {/* Gaps */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Gaps for {selectedSystem?.name || 'Selected System'} ({currentGaps.length})
        </h3>
        {currentGaps.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-500 italic">
              {selectedAISystemId ? 'No gaps derived for this system.' : 'Select an AI system to view gaps.'}
            </p>
            {selectedAISystemId && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                <strong>Note:</strong> No unjustified gaps have been created. This is the expected behavior
                when applicability is PENDING or when no evaluation has been executed.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentGaps.map((gap) => {
              const evaluation = state.evaluations.find((e) => e.id === gap.evaluationId);
              const gapActions = currentActions.filter((a) => a.gapId === gap.id);

              return (
                <div key={gap.id} className="p-4 rounded-md border border-amber-200 bg-amber-50">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={gap.gapType} />
                    <span className="text-xs text-slate-500">
                      {new Date(gap.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{gap.description}</p>
                  <div className="mt-2 text-xs text-slate-500">
                    <p>Evaluation: {evaluation?.result || 'Unknown'}</p>
                    <p className="mt-1 text-amber-700 font-medium">
                      ⚠ This is a GAP, NOT an infringement (Rule 9). NOT culpability (Rule 10).
                    </p>
                  </div>

                  {/* Actions for this gap */}
                  {gapActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-xs font-medium text-slate-600 mb-1">Associated Actions:</p>
                      {gapActions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between py-1">
                          <span className="text-xs text-slate-700">{action.description}</span>
                          <StatusBadge status={action.status} />
                        </div>
                      ))}
                      {gapActions.some((a) => a.status === 'COMPLETED') && (
                        <p className="mt-2 text-xs text-red-700 font-medium">
                          ⚠ COMPLETED ≠ VERIFIED (Rule 11). COMPLETED ≠ GAP RESOLVED (Rule 12).
                          <br />
                          Self-certification is not permitted (Rule 13).
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rules Reminder */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">M05 Invariants:</h4>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>• PENDING evaluation → NO GAP created</li>
          <li>• ESTABLISHED evaluation → NO GAP created</li>
          <li>• APPLICABLE + no evidence → MISSING_EVIDENCE gap</li>
          <li>• APPLICABLE + evidence (no substantive rules) → NO GAP</li>
          <li>• CONFLICTING evidence → CONFLICTING_EVIDENCE gap</li>
          <li>• GAP ≠ Infringement (Rule 9)</li>
          <li>• GAP ≠ Culpability (Rule 10)</li>
          <li>• Action COMPLETED ≠ VERIFIED (Rule 11)</li>
          <li>• Action COMPLETED ≠ GAP RESOLVED (Rule 12)</li>
          <li>• Action cannot self-certify (Rule 13)</li>
        </ul>
      </div>
    </div>
  );
}
