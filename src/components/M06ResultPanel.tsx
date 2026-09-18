/**
 * M06 — Result / Dossier Engine Panel
 * 
 * Generates and displays result cards.
 * 
 * CRITICAL:
 * - Cannot rewrite M03 applicability (Rule 19)
 * - Cannot rewrite M04 evidence evaluations (Rule 20)
 * - PDF is only a representation (Rule 22)
 * - Unimplemented aspects must be explicitly marked
 */

import type { ApplicationState, ResultCard } from '../domain/types.ts';
import { ModuleHeader } from './ModuleHeader.tsx';
import { StatusBadge } from './StatusBadge.tsx';

export function M06ResultPanel({
  state,
  selectedAISystemId,
  currentResultCards,
  onGenerate,
}: {
  state: ApplicationState;
  selectedAISystemId: string | null;
  currentResultCards: ResultCard[];
  onGenerate: () => void;
}) {
  const selectedSystem = state.aiSystems.find((s) => s.id === selectedAISystemId);
  const latestResult = currentResultCards.length > 0
    ? currentResultCards.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
    : undefined;

  return (
    <div className="space-y-6">
      <ModuleHeader
        module="M06"
        title="Result / Dossier Engine"
        description="Generates structured result cards. Cannot rewrite M03 applicability (Rule 19) or M04 evaluations (Rule 20)."
      />

      {/* No system selected warning */}
      {!selectedAISystemId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>No AI system selected.</strong> Please select or register an AI system in M02 first.
          </p>
        </div>
      )}

      {/* Generate Button */}
      {selectedAISystemId && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Generate Result Card</h3>
          <p className="text-xs text-slate-500 mb-3">
            Generates a structured result card based on the latest evaluation.
            The result card preserves the evaluation result without modification.
          </p>
          <button
            onClick={onGenerate}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors"
          >
            Generate Result Card
          </button>
        </div>
      )}

      {/* Latest Result Card */}
      {latestResult && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Latest Result Card</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Overall Result:</span>
              <StatusBadge status={latestResult.result} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">AI System:</span>
              <span className="text-sm font-medium text-slate-800">{selectedSystem?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Generated:</span>
              <span className="text-sm text-slate-600">
                {new Date(latestResult.generatedAt).toLocaleString()}
              </span>
            </div>

            {/* Gaps Summary */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-600 mb-1">
                Gaps: {latestResult.gaps.length}
              </p>
              {latestResult.gaps.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No gaps derived.</p>
              ) : (
                <div className="space-y-1">
                  {latestResult.gaps.map((gap) => (
                    <div key={gap.id} className="flex items-center gap-2">
                      <StatusBadge status={gap.gapType} />
                      <span className="text-xs text-slate-600">{gap.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Summary */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-600 mb-1">
                Actions: {latestResult.actions.length}
              </p>
              {latestResult.actions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No actions proposed.</p>
              ) : (
                <div className="space-y-1">
                  {latestResult.actions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">{action.description}</span>
                      <StatusBadge status={action.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unimplemented Aspects */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-medium text-amber-700 mb-2">
                ⚠ Unimplemented Aspects (explicitly marked):
              </p>
              <ul className="space-y-1">
                {latestResult.unimplementedAspects.map((aspect, idx) => (
                  <li key={idx} className="text-xs text-amber-700 flex items-start gap-1">
                    <span className="shrink-0">•</span>
                    <span>{aspect}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">
            <p className="text-xs text-slate-600">
              <strong>Notice:</strong> This result card is a structured representation of the evaluation chain.
              It does NOT constitute certification, legal compliance, or regulatory approval.
              A PDF export (Rule 22) would only be a representation of this structured data.
            </p>
          </div>
        </div>
      )}

      {/* Result History */}
      {currentResultCards.length > 1 && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Result History ({currentResultCards.length})
          </h3>
          <div className="space-y-2">
            {currentResultCards
              .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
              .map((rc, idx) => (
                <div key={rc.id} className="p-3 rounded border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      #{currentResultCards.length - idx} — {new Date(rc.generatedAt).toLocaleString()}
                    </span>
                    <StatusBadge status={rc.result} />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Gaps: {rc.gaps.length} | Actions: {rc.actions.length}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* No results yet */}
      {selectedAISystemId && currentResultCards.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-500 italic">
            No result cards generated yet. Execute an evaluation first, then generate a result card.
          </p>
        </div>
      )}
    </div>
  );
}
