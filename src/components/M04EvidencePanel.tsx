/**
 * M04 — Evidence Engine Panel
 * 
 * Allows registration of evidence items.
 * Registration produces DECLARED status only.
 * Evidence existence does NOT imply compliance (Rule 6).
 */

import { useState } from 'react';
import type { ApplicationState } from '../domain/types.ts';
import { ModuleHeader } from './ModuleHeader.tsx';
import { StatusBadge } from './StatusBadge.tsx';

export function M04EvidencePanel({
  state,
  selectedAISystemId,
  onRegister,
}: {
  state: ApplicationState;
  selectedAISystemId: string | null;
  onRegister: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onRegister(title, description);
      setTitle('');
      setDescription('');
    }
  };

  const selectedSystem = state.aiSystems.find((s) => s.id === selectedAISystemId);
  const relevantEvidence = selectedAISystemId
    ? state.evidence.filter((e) => e.aiSystemId === selectedAISystemId)
    : [];

  return (
    <div className="space-y-6">
      <ModuleHeader
        module="M04"
        title="Evidence Engine"
        description="Register and manage evidence items. Evidence registration does NOT imply compliance (Rule 6, 7)."
      />

      {/* No system selected warning */}
      {!selectedAISystemId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>No AI system selected.</strong> Please select or register an AI system in M02 first.
          </p>
        </div>
      )}

      {/* Registration Form */}
      {selectedAISystemId && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Register New Evidence</h3>
          <p className="text-xs text-slate-500 mb-3">
            For: <strong>{selectedSystem?.name}</strong> | Requirement: <strong>{state.requirements[0].title}</strong>
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Evidence Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Demo evidence"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., User-provided demonstration evidence"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Register Evidence
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            Status after registration: <strong>DECLARED</strong> — Evidence found ≠ requirement fulfilled (Rule 6)
          </p>
        </div>
      )}

      {/* Evidence List */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Evidence for Selected System ({relevantEvidence.length})
        </h3>
        {relevantEvidence.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            {selectedAISystemId ? 'No evidence registered for this system.' : 'Select an AI system to view evidence.'}
          </p>
        ) : (
          <div className="space-y-2">
            {relevantEvidence.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-md border border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{ev.title}</p>
                    <p className="text-xs text-slate-500">{ev.description || 'No description'}</p>
                  </div>
                  <StatusBadge status={ev.status} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  ID: {ev.id} | Declared: {new Date(ev.declaredAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Evidence */}
      {state.evidence.length > relevantEvidence.length && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            All Evidence ({state.evidence.length})
          </h3>
          <div className="space-y-2">
            {state.evidence.map((ev) => {
              const sys = state.aiSystems.find((s) => s.id === ev.aiSystemId);
              return (
                <div key={ev.id} className="p-3 rounded-md border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{ev.title}</p>
                      <p className="text-xs text-slate-500">
                        System: {sys?.name || 'Unknown'} | Req: {state.requirements.find(r => r.id === ev.requirementId)?.title || 'Unknown'}
                      </p>
                    </div>
                    <StatusBadge status={ev.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
