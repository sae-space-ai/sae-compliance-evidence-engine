/**
 * SAE Compliance & Evidence Engine — Main Application
 * 
 * Top-level application with two modes:
 * 1. AI Compliance Engine (original MVP)
 * 2. Enterprise Audit (ECI-001 benchmark)
 */

import { useState } from 'react';
import { EnterpriseAuditApp } from './components/EnterpriseAuditApp.tsx';
import { AIComplianceApp } from './components/AIComplianceApp.tsx';

type AppMode = 'enterprise' | 'ai-compliance';

export default function App() {
  const [mode, setMode] = useState<AppMode>('enterprise');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mode Switcher */}
      <div className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">SAE Engine Mode:</span>
            <button
              onClick={() => setMode('enterprise')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'enterprise' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Enterprise Audit (ECI-001)
            </button>
            <button
              onClick={() => setMode('ai-compliance')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'ai-compliance' ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              AI Compliance (MVP)
            </button>
          </div>
          <span className="text-xs text-slate-500">v1.0.0</span>
        </div>
      </div>

      {/* Active Application */}
      {mode === 'enterprise' ? <EnterpriseAuditApp /> : <AIComplianceApp />}
    </div>
  );
}
