/**
 * SAE Engine — AI Compliance Engine (Original MVP)
 * 
 * Preserves the original AI compliance evidence engine functionality.
 * This is the MVP vertical slice for AI system compliance assessment.
 */

import { useState, useCallback } from 'react';
import type { ApplicationState as LegacyState, Evaluation, Gap } from '../domain/types.ts';
import {
  createInitialState as createLegacyInitialState,
  registerAISystem,
  registerEvidence,
  executeEvaluation,
  deriveGap,
  generateResultCard,
  getLatestEvaluation,
} from '../domain/engine.ts';

export function AIComplianceApp() {
  const [state, setState] = useState<LegacyState>(createLegacyInitialState);
  const [selectedAISystemId, setSelectedAISystemId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'm02' | 'm04' | 'eval' | 'm05' | 'm06'>('overview');

  const notify = useCallback((message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const handleRegisterAI = useCallback((name: string, useCase: string) => {
    try {
      const { state: newState, aiSystem } = registerAISystem(state, name, useCase, 'user');
      setState(newState);
      setSelectedAISystemId(aiSystem.id);
      notify(`AI System "${aiSystem.name}" registered — Status: DECLARED`, 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  }, [state, notify]);

  const handleRegisterEvidence = useCallback((title: string, description: string) => {
    if (!selectedAISystemId) { notify('Select an AI system first', 'error'); return; }
    try {
      const req = state.requirements[0];
      const { state: newState, evidence } = registerEvidence(state, title, description, req.id, selectedAISystemId, 'user');
      setState(newState);
      notify(`Evidence "${evidence.title}" registered — Status: DECLARED`, 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  }, [state, selectedAISystemId, notify]);

  const handleEvaluate = useCallback(() => {
    if (!selectedAISystemId) { notify('Select an AI system first', 'error'); return; }
    try {
      const req = state.requirements[0];
      const { state: newState, evaluation } = executeEvaluation(state, req.id, selectedAISystemId, 'user');
      const { state: finalState, gap } = deriveGap(newState, evaluation.id);
      setState(finalState);
      notify(`Evaluation: ${evaluation.result}${gap ? ` | Gap: ${gap.gapType}` : ''}`, 'info');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  }, [state, selectedAISystemId, notify]);

  const handleGenerateResult = useCallback(() => {
    if (!selectedAISystemId) { notify('Select an AI system first', 'error'); return; }
    try {
      const req = state.requirements[0];
      const latestEval = getLatestEvaluation(state, req.id, selectedAISystemId);
      if (!latestEval) { notify('Execute evaluation first', 'error'); return; }
      const { state: newState } = generateResultCard(state, latestEval.id);
      setState(newState);
      notify('Result card generated', 'success');
    } catch (err) {
      notify((err as Error).message, 'error');
    }
  }, [state, selectedAISystemId, notify]);

  const latestEval = selectedAISystemId ? getLatestEvaluation(state, state.requirements[0].id, selectedAISystemId) : undefined;
  const currentGaps = selectedAISystemId ? state.gaps.filter(g => g.aiSystemId === selectedAISystemId) : [];
  const selectedSystem = state.aiSystems.find(s => s.id === selectedAISystemId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">SAE Compliance & Evidence Engine</h1>
              <p className="text-sm text-slate-500">AI Compliance MVP — Vertical Slice</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">MVP</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">v0.1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {[
              { id: 'overview' as const, label: 'Overview' },
              { id: 'm02' as const, label: 'M02 — AI Inventory' },
              { id: 'm04' as const, label: 'M04 — Evidence' },
              { id: 'eval' as const, label: 'Evaluation' },
              { id: 'm05' as const, label: 'M05 — Gaps' },
              { id: 'm06' as const, label: 'M06 — Result' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`px-4 py-3 rounded-lg shadow-lg border text-sm ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-2">Demo Requirement (M03)</h2>
              <div className="text-sm space-y-1">
                <p><strong>Title:</strong> {state.requirements[0].title}</p>
                <p><strong>Applicability:</strong> <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">PENDING</span></p>
                <p><strong>Placeholder:</strong> <span className="text-amber-600">YES — Not a real legal rule</span></p>
              </div>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <strong>IMPORTANT:</strong> This is a placeholder. Actual legal requirements must be based on official primary sources.
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="AI Systems" value={state.aiSystems.length} />
              <StatCard label="Evidence" value={state.evidence.length} />
              <StatCard label="Evaluations" value={state.evaluations.length} />
              <StatCard label="Gaps" value={state.gaps.length} />
            </div>
          </div>
        )}

        {activeTab === 'm02' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Register AI System</h3>
              <form onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const name = (form.elements.namedItem('name') as HTMLInputElement).value; const useCase = (form.elements.namedItem('useCase') as HTMLInputElement).value; handleRegisterAI(name, useCase); form.reset(); }} className="space-y-3">
                <input name="name" placeholder="System name" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                <input name="useCase" placeholder="Use case" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700">Register</button>
              </form>
              <p className="mt-2 text-xs text-slate-500">Status: <strong>DECLARED</strong> (Rule 1)</p>
            </div>
            {state.aiSystems.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Registered Systems</h3>
                {state.aiSystems.map(sys => (
                  <button key={sys.id} onClick={() => setSelectedAISystemId(sys.id)}
                    className={`w-full text-left p-3 rounded border mb-2 ${selectedAISystemId === sys.id ? 'border-slate-800 bg-slate-50' : 'border-slate-200'}`}>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">{sys.name}</p>
                        <p className="text-xs text-slate-500">{sys.useCase}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{sys.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'm04' && (
          <div className="space-y-4">
            {!selectedAISystemId ? (
              <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-800">
                Select an AI system in M02 first.
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Register Evidence for {selectedSystem?.name}</h3>
                <form onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const title = (form.elements.namedItem('title') as HTMLInputElement).value; const desc = (form.elements.namedItem('desc') as HTMLTextAreaElement).value; handleRegisterEvidence(title, desc); form.reset(); }} className="space-y-3">
                  <input name="title" placeholder="Evidence title" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                  <textarea name="desc" placeholder="Description" rows={2} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                  <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700">Register Evidence</button>
                </form>
                <p className="mt-2 text-xs text-slate-500">Status: <strong>DECLARED</strong> — Evidence ≠ Compliance (Rule 6)</p>
              </div>
            )}
            {selectedAISystemId && (
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Evidence ({state.evidence.filter(e => e.aiSystemId === selectedAISystemId).length})</h3>
                {state.evidence.filter(e => e.aiSystemId === selectedAISystemId).map(ev => (
                  <div key={ev.id} className="p-3 border border-slate-200 rounded mb-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{ev.title}</p>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{ev.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{ev.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'eval' && (
          <div className="space-y-4">
            {!selectedAISystemId ? (
              <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-800">Select an AI system first.</div>
            ) : (
              <>
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Execute Evaluation</h3>
                  <p className="text-sm text-slate-600 mb-3">System: {selectedSystem?.name} | Applicability: PENDING</p>
                  <button onClick={handleEvaluate} className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700">Execute Evaluation</button>
                </div>
                {latestEval && (
                  <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Latest Result</h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600">Result:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        latestEval.result === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        latestEval.result === 'UNDETERMINED' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>{latestEval.result}</span>
                    </div>
                    <p className="text-xs text-slate-600 p-2 bg-slate-50 rounded">{latestEval.basis}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'm05' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Gaps ({currentGaps.length})</h3>
            {currentGaps.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No gaps. PENDING applicability → No unjustified gaps.</p>
            ) : (
              currentGaps.map(gap => (
                <div key={gap.id} className="p-3 border border-amber-200 bg-amber-50 rounded mb-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">{gap.gapType}</span>
                  <p className="text-xs text-slate-700 mt-1">{gap.description}</p>
                  <p className="text-xs text-amber-700 mt-1">⚠ GAP ≠ Infringement (Rule 9)</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'm06' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Generate Result Card</h3>
              <button onClick={handleGenerateResult} className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700">Generate</button>
            </div>
            {state.resultCards.filter(r => r.aiSystemId === selectedAISystemId).length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Result Card</h3>
                {(() => {
                  const rc = state.resultCards.filter(r => r.aiSystemId === selectedAISystemId).pop();
                  if (!rc) return null;
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Result:</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">{rc.result}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Gaps:</span>
                        <span>{rc.gaps.length}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium text-amber-700">Unimplemented Aspects:</p>
                        <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                          {rc.unimplementedAspects.map((a, i) => <li key={i}>• {a}</li>)}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
