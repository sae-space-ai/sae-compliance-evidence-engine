import { useState, useCallback } from 'react';
import type { ApplicationState, Evaluation, Gap, ResultCard } from './domain/types.ts';
import {
  createInitialState,
  registerAISystem,
  registerEvidence,
  executeEvaluation,
  deriveGap,
  generateResultCard,
  getLatestEvaluation,
} from './domain/engine.ts';
import { ModuleHeader } from './components/ModuleHeader.tsx';
import { M02AISystemPanel } from './components/M02AISystemPanel.tsx';
import { M04EvidencePanel } from './components/M04EvidencePanel.tsx';
import { EvaluationPanel } from './components/EvaluationPanel.tsx';
import { M05GapPanel } from './components/M05GapPanel.tsx';
import { M06ResultPanel } from './components/M06ResultPanel.tsx';
import { StatusBadge } from './components/StatusBadge.tsx';

type ActiveModule = 'overview' | 'm02' | 'm04' | 'evaluation' | 'm05' | 'm06';

export default function App() {
  const [state, setState] = useState<ApplicationState>(createInitialState);
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');
  const [selectedAISystemId, setSelectedAISystemId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const handleRegisterAISystem = useCallback((name: string, useCase: string) => {
    try {
      const { state: newState, aiSystem } = registerAISystem(state, name, useCase, 'current_user');
      setState(newState);
      setSelectedAISystemId(aiSystem.id);
      showNotification(`AI System "${aiSystem.name}" registered with status DECLARED`, 'success');
    } catch (err) {
      showNotification((err as Error).message, 'error');
    }
  }, [state, showNotification]);

  const handleRegisterEvidence = useCallback((title: string, description: string) => {
    if (!selectedAISystemId) {
      showNotification('Please select an AI system first', 'error');
      return;
    }
    const requirement = state.requirements[0];
    try {
      const { state: newState, evidence } = registerEvidence(
        state, title, description, requirement.id, selectedAISystemId, 'current_user'
      );
      setState(newState);
      showNotification(`Evidence "${evidence.title}" registered with status DECLARED`, 'success');
    } catch (err) {
      showNotification((err as Error).message, 'error');
    }
  }, [state, selectedAISystemId, showNotification]);

  const handleExecuteEvaluation = useCallback(() => {
    if (!selectedAISystemId) {
      showNotification('Please select an AI system first', 'error');
      return;
    }
    const requirement = state.requirements[0];
    try {
      const { state: newState, evaluation } = executeEvaluation(
        state, requirement.id, selectedAISystemId, 'current_user'
      );

      // Derive gap
      const { state: stateWithGap, gap } = deriveGap(newState, evaluation.id);

      setState(stateWithGap);

      if (evaluation.result === 'PENDING') {
        showNotification('Evaluation result: PENDING — No compliance conclusion (applicability is PENDING)', 'info');
      } else if (evaluation.result === 'UNDETERMINED') {
        showNotification('Evaluation result: UNDETERMINED — No substantive rules implemented yet', 'info');
      } else {
        showNotification(`Evaluation result: ${evaluation.result}`, 'info');
      }

      if (gap) {
        showNotification(`Gap derived: ${gap.gapType} — This is NOT an infringement`, 'info');
      }
    } catch (err) {
      showNotification((err as Error).message, 'error');
    }
  }, [state, selectedAISystemId, showNotification]);

  const handleGenerateResult = useCallback(() => {
    if (!selectedAISystemId) {
      showNotification('Please select an AI system first', 'error');
      return;
    }
    const requirement = state.requirements[0];
    const latestEval = getLatestEvaluation(state, requirement.id, selectedAISystemId);
    if (!latestEval) {
      showNotification('No evaluation found. Please execute an evaluation first.', 'error');
      return;
    }
    try {
      const { state: newState, resultCard } = generateResultCard(state, latestEval.id);
      setState(newState);
      showNotification(`Result card generated — Status: ${resultCard.result}`, 'success');
    } catch (err) {
      showNotification((err as Error).message, 'error');
    }
  }, [state, selectedAISystemId, showNotification]);

  const latestEvaluation = selectedAISystemId
    ? getLatestEvaluation(state, state.requirements[0].id, selectedAISystemId)
    : undefined;

  const currentGaps = selectedAISystemId
    ? state.gaps.filter((g) => g.aiSystemId === selectedAISystemId)
    : [];

  const currentResultCards = selectedAISystemId
    ? state.resultCards.filter((r) => r.aiSystemId === selectedAISystemId)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                SAE Compliance & Evidence Engine
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                MVP Vertical Slice — Initial Implementation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                MVP
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                v0.1.0
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {[
              { id: 'overview' as const, label: 'Overview', module: null },
              { id: 'm02' as const, label: 'M02 — AI Inventory', module: 'M02' },
              { id: 'm04' as const, label: 'M04 — Evidence', module: 'M04' },
              { id: 'evaluation' as const, label: 'Evaluation', module: 'M04→Eval' },
              { id: 'm05' as const, label: 'M05 — Gap → Action', module: 'M05' },
              { id: 'm06' as const, label: 'M06 — Result', module: 'M06' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeModule === item.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {activeModule === 'overview' && (
          <OverviewPanel
            state={state}
            selectedAISystemId={selectedAISystemId}
            latestEvaluation={latestEvaluation}
            currentGaps={currentGaps}
          />
        )}
        {activeModule === 'm02' && (
          <M02AISystemPanel
            state={state}
            selectedAISystemId={selectedAISystemId}
            onSelectSystem={setSelectedAISystemId}
            onRegister={handleRegisterAISystem}
          />
        )}
        {activeModule === 'm04' && (
          <M04EvidencePanel
            state={state}
            selectedAISystemId={selectedAISystemId}
            onRegister={handleRegisterEvidence}
          />
        )}
        {activeModule === 'evaluation' && (
          <EvaluationPanel
            state={state}
            selectedAISystemId={selectedAISystemId}
            latestEvaluation={latestEvaluation}
            onExecute={handleExecuteEvaluation}
          />
        )}
        {activeModule === 'm05' && (
          <M05GapPanel
            state={state}
            selectedAISystemId={selectedAISystemId}
            currentGaps={currentGaps}
          />
        )}
        {activeModule === 'm06' && (
          <M06ResultPanel
            state={state}
            selectedAISystemId={selectedAISystemId}
            currentResultCards={currentResultCards}
            onGenerate={handleGenerateResult}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              SAE Compliance & Evidence Engine — Initial MVP Vertical Slice
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Substantive legal rules: <span className="font-semibold text-amber-600">NOT IMPLEMENTED</span></span>
              <span>•</span>
              <span>Persistence: <span className="font-semibold text-amber-600">NOT IMPLEMENTED</span></span>
              <span>•</span>
              <span>Auth/RLS: <span className="font-semibold text-amber-600">NOT IMPLEMENTED</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// OVERVIEW PANEL
// ============================================================

function OverviewPanel({
  state,
  selectedAISystemId,
  latestEvaluation,
  currentGaps,
}: {
  state: ApplicationState;
  selectedAISystemId: string | null;
  latestEvaluation?: Evaluation;
  currentGaps: Gap[];
}) {
  const requirement = state.requirements[0];
  const selectedSystem = state.aiSystems.find((s) => s.id === selectedAISystemId);

  return (
    <div className="space-y-6">
      <ModuleHeader
        module="Overview"
        title="System Status"
        description="Current state of the MVP vertical slice"
      />

      {/* Demo Requirement Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Demo Requirement (M03)</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Title:</span>
            <span className="text-sm font-medium text-slate-800">{requirement.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Applicability:</span>
            <StatusBadge status={requirement.applicability} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Placeholder:</span>
            <span className="text-sm font-medium text-amber-600">
              {requirement.isPlaceholder ? 'YES — Not a real legal rule' : 'NO'}
            </span>
          </div>
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <strong>IMPORTANT:</strong> This is a placeholder requirement for MVP demonstration.
            Actual legal requirements must be based on official primary sources.
            Substantive applicability rules are NOT yet implemented.
          </div>
        </div>
      </div>

      {/* Current State Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StateCard
          label="AI Systems"
          value={state.aiSystems.length}
          status="info"
        />
        <StateCard
          label="Evidence Items"
          value={state.evidence.length}
          status="info"
        />
        <StateCard
          label="Evaluations"
          value={state.evaluations.length}
          status="info"
        />
        <StateCard
          label="Gaps"
          value={state.gaps.length}
          status={state.gaps.length > 0 ? 'warning' : 'info'}
        />
      </div>

      {/* Selected System Status */}
      {selectedSystem && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Selected AI System: {selectedSystem.name}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Status:</span>
              <StatusBadge status={selectedSystem.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Use Case:</span>
              <span className="text-sm text-slate-800">{selectedSystem.useCase}</span>
            </div>
            {latestEvaluation && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Latest Evaluation:</span>
                <StatusBadge status={latestEvaluation.result} />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Active Gaps:</span>
              <span className="text-sm font-medium text-slate-800">{currentGaps.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Guide */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">MVP Workflow</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs font-bold text-slate-700 shrink-0">1</span>
            <span><strong>M02:</strong> Register an AI system → Status: DECLARED</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs font-bold text-slate-700 shrink-0">2</span>
            <span><strong>M04:</strong> Register evidence → Status: DECLARED</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs font-bold text-slate-700 shrink-0">3</span>
            <span><strong>Evaluation:</strong> Execute evaluation → Result depends on applicability</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs font-bold text-slate-700 shrink-0">4</span>
            <span><strong>M05:</strong> Inspect gaps → Only justified gaps are created</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs font-bold text-slate-700 shrink-0">5</span>
            <span><strong>M06:</strong> Generate result card → Structured output with unimplemented aspects marked</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
          <strong>Key invariant:</strong> Because the demo requirement has PENDING applicability,
          the evaluation result will be PENDING. No compliance conclusion will be produced.
          This is the correct and intended behavior.
        </div>
      </div>
    </div>
  );
}

function StateCard({ label, value, status }: { label: string; value: number; status: 'info' | 'warning' | 'success' }) {
  const colorClass = status === 'warning' ? 'border-amber-200 bg-amber-50' : status === 'success' ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50';
  const textClass = status === 'warning' ? 'text-amber-700' : status === 'success' ? 'text-green-700' : 'text-slate-700';

  return (
    <div className={`rounded-lg border p-4 ${colorClass}`}>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${textClass}`}>{value}</p>
    </div>
  );
}
