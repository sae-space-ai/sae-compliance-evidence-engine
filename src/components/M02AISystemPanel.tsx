/**
 * M02 — AI System Inventory Panel
 * 
 * Allows registration of AI systems.
 * Registration produces DECLARED status only (Rule 1).
 */

import { useState } from 'react';
import type { ApplicationState } from '../domain/types.ts';
import { ModuleHeader } from './ModuleHeader.tsx';
import { StatusBadge } from './StatusBadge.tsx';

export function M02AISystemPanel({
  state,
  selectedAISystemId,
  onSelectSystem,
  onRegister,
}: {
  state: ApplicationState;
  selectedAISystemId: string | null;
  onSelectSystem: (id: string) => void;
  onRegister: (name: string, useCase: string) => void;
}) {
  const [name, setName] = useState('');
  const [useCase, setUseCase] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && useCase.trim()) {
      onRegister(name, useCase);
      setName('');
      setUseCase('');
    }
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        module="M02"
        title="AI Inventory Engine"
        description="Register and manage AI system declarations. Registration produces DECLARED status only."
      />

      {/* Registration Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Register New AI System</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              System Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Demo AI System"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Use Case *
            </label>
            <input
              type="text"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="e.g., Administrative assistance"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || !useCase.trim()}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Register AI System
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Status after registration: <strong>DECLARED</strong> — Not ACCREDITED, not VERIFIED (Rule 1)
        </p>
      </div>

      {/* Registered Systems List */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Registered AI Systems ({state.aiSystems.length})
        </h3>
        {state.aiSystems.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No AI systems registered yet.</p>
        ) : (
          <div className="space-y-2">
            {state.aiSystems.map((sys) => (
              <button
                key={sys.id}
                onClick={() => onSelectSystem(sys.id)}
                className={`w-full text-left p-3 rounded-md border transition-colors ${
                  selectedAISystemId === sys.id
                    ? 'border-slate-800 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{sys.name}</p>
                    <p className="text-xs text-slate-500">{sys.useCase}</p>
                  </div>
                  <StatusBadge status={sys.status} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  ID: {sys.id} | Declared: {new Date(sys.declaredAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
