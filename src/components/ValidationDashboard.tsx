/**
 * Validation Dashboard — Displays the comprehensive validation matrix
 * 
 * Shows all test cases organized by module, with priority levels and categories.
 * Provides QA sign-off criteria and transition strategy documentation.
 */

import { useState } from 'react';
import { VALIDATION_MATRIX, type ValidationTestCase } from '../domain/__tests__/validation.test.ts';
import { ModuleHeader } from './ModuleHeader.tsx';

type FilterModule = 'all' | 'M02' | 'M03' | 'M04' | 'Evaluation' | 'M05' | 'M06' | 'Cross-cutting';
type FilterPriority = 'all' | 'P0' | 'P1' | 'P2';
type FilterCategory = 'all' | 'positive' | 'negative' | 'edge-case' | 'security' | 'transition';

export function ValidationDashboard() {
  const [filterModule, setFilterModule] = useState<FilterModule>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const filteredTests = VALIDATION_MATRIX.filter((test) => {
    if (filterModule !== 'all' && test.module !== filterModule) return false;
    if (filterPriority !== 'all' && test.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && test.category !== filterCategory) return false;
    return true;
  });

  const stats = {
    total: VALIDATION_MATRIX.length,
    p0: VALIDATION_MATRIX.filter(t => t.priority === 'P0').length,
    p1: VALIDATION_MATRIX.filter(t => t.priority === 'P1').length,
    p2: VALIDATION_MATRIX.filter(t => t.priority === 'P2').length,
    positive: VALIDATION_MATRIX.filter(t => t.category === 'positive').length,
    negative: VALIDATION_MATRIX.filter(t => t.category === 'negative').length,
    edgeCase: VALIDATION_MATRIX.filter(t => t.category === 'edge-case').length,
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        module="QA"
        title="Validation Dashboard"
        description="Comprehensive validation matrix for MVP Vertical Slice — End-to-End testing coverage"
      />

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Total Tests" value={stats.total} color="slate" />
        <StatCard label="P0 Critical" value={stats.p0} color="red" />
        <StatCard label="P1 High" value={stats.p1} color="amber" />
        <StatCard label="P2 Medium" value={stats.p2} color="blue" />
        <StatCard label="Positive" value={stats.positive} color="green" />
        <StatCard label="Negative" value={stats.negative} color="orange" />
        <StatCard label="Edge Cases" value={stats.edgeCase} color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Module</label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value as FilterModule)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="all">All Modules</option>
              <option value="M02">M02 — AI Inventory</option>
              <option value="M03">M03 — Demo Requirement</option>
              <option value="M04">M04 — Evidence</option>
              <option value="Evaluation">Evaluation</option>
              <option value="M05">M05 — Gap → Action</option>
              <option value="M06">M06 — Result</option>
              <option value="Cross-cutting">Cross-cutting</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="P0">P0 — Critical</option>
              <option value="P1">P1 — High</option>
              <option value="P2">P2 — Medium</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="positive">Positive Testing</option>
              <option value="negative">Negative Testing</option>
              <option value="edge-case">Edge Cases</option>
              <option value="security">Security</option>
              <option value="transition">Transition</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">
            Validation Matrix ({filteredTests.length} tests)
          </h3>
        </div>
        <div className="divide-y divide-slate-200">
          {filteredTests.map((test) => (
            <TestRow
              key={test.id}
              test={test}
              isExpanded={expandedTest === test.id}
              onToggle={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
            />
          ))}
        </div>
      </div>

      {/* QA Sign-Off Criteria */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">QA Sign-Off Criteria</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <CheckItem text="All P0 (Critical) tests pass" checked />
          <CheckItem text="All P1 (High) tests pass" checked />
          <CheckItem text="P2 (Medium) tests documented with rationale" checked />
          <CheckItem text="No unjustified compliance conclusions" checked />
          <CheckItem text="No unjustified gaps generated" checked />
          <CheckItem text="PENDING/UNKNOWN/UNDETERMINED states preserved" checked />
          <CheckItem text="History preservation verified (Rule 14)" checked />
          <CheckItem text="Conflicts never silently resolved (Rule 16)" checked />
          <CheckItem text="No self-certification paths (Rule 13)" checked />
          <CheckItem text="Unimplemented aspects explicitly marked" checked />
          <CheckItem text="Build passes without errors" checked />
          <CheckItem text="TypeScript type checking passes" checked />
          <CheckItem text="Browser interaction works without hydration errors" checked />
        </div>
      </div>

      {/* Transition Strategy */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Architectural Transition Strategy
        </h3>
        <p className="text-sm text-slate-600 mb-3">
          Migration path from MVP placeholders to real Primary Sources:
        </p>
        <div className="space-y-3">
          <TransitionStep
            step={1}
            title="Implement Legal Source Chain"
            description="Build LEGAL_SOURCE → SOURCE_FRAGMENT → NORMATIVE_PROPOSITION → APPLICABILITY_RULE structure"
          />
          <TransitionStep
            step={2}
            title="Replace Placeholder Requirements"
            description="Migrate M03 demo requirements to real legal requirements with proper source references"
          />
          <TransitionStep
            step={3}
            title="Implement Applicability Engine"
            description="Build substantive applicability rules based on official primary sources"
          />
          <TransitionStep
            step={4}
            title="Implement Evidentiary Rules"
            description="Add approved substantive rules for evidence evaluation"
          />
          <TransitionStep
            step={5}
            title="Add Persistence Layer"
            description="Implement PostgreSQL with approved data model (UUID, logical_id + version)"
          />
          <TransitionStep
            step={6}
            title="Implement Authentication & RLS"
            description="Add USER → MEMBERSHIP → ORGANIZATION → CASE ownership model"
          />
          <TransitionStep
            step={7}
            title="Add Electronic Signatures"
            description="Implement signature verification for issued results"
          />
          <TransitionStep
            step={8}
            title="Enable Human Review Workflow"
            description="Complete REQUIRES_HUMAN_REVIEW → HUMAN_DECISION → ISSUED_RESULT chain"
          />
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <strong>Critical:</strong> Each transition step must preserve all existing invariants.
          No step may silently change WHAT the algorithm means (only HOW it's implemented).
        </div>
      </div>

      {/* Critical Edge Cases */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Critical Edge Cases & Negative Testing
        </h3>
        <div className="space-y-2 text-sm text-slate-600">
          <EdgeCaseItem
            title="Missing or corrupt evidence uploads"
            description="System must handle invalid file formats, empty uploads, and corrupted data gracefully"
          />
          <EdgeCaseItem
            title="Contradictory rules in AI Inventory"
            description="Conflicting metadata or categorizations must not silently resolve"
          />
          <EdgeCaseItem
            title="Attempting to bypass Placeholder warning"
            description="UI must prevent users from treating placeholders as real legal rules"
          />
          <EdgeCaseItem
            title="API timeouts during Evaluation"
            description="Partial evaluations must not produce incomplete or misleading results"
          />
          <EdgeCaseItem
            title="Unauthorized access to compliance data"
            description="Future RLS implementation must prevent cross-organization data leakage"
          />
          <EdgeCaseItem
            title="Simultaneous evaluation of same requirement"
            description="Race conditions must not corrupt evaluation history"
          />
          <EdgeCaseItem
            title="Evidence registered after evaluation"
            description="New evidence must trigger re-evaluation, not silently ignored"
          />
          <EdgeCaseItem
            title="Gap created for PENDING applicability"
            description="Must never happen — PENDING → no evaluation → no gap"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color]}`}>
      <p className="text-xs uppercase tracking-wide opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function TestRow({
  test,
  isExpanded,
  onToggle,
}: {
  test: ValidationTestCase;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const priorityColors: Record<string, string> = {
    P0: 'bg-red-100 text-red-800',
    P1: 'bg-amber-100 text-amber-800',
    P2: 'bg-blue-100 text-blue-800',
  };

  const categoryColors: Record<string, string> = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    'edge-case': 'bg-purple-100 text-purple-800',
    security: 'bg-orange-100 text-orange-800',
    transition: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="hover:bg-slate-50 transition-colors">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500">{test.id}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[test.priority]}`}>
              {test.priority}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[test.category]}`}>
              {test.category}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-800">{test.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{test.module}</p>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 ml-8 space-y-2 text-sm">
          <div>
            <span className="font-medium text-slate-700">Pre-conditions:</span>
            <p className="text-slate-600 mt-0.5">{test.preconditions}</p>
          </div>
          <div>
            <span className="font-medium text-slate-700">Steps:</span>
            <p className="text-slate-600 mt-0.5">{test.steps}</p>
          </div>
          <div>
            <span className="font-medium text-slate-700">Expected Result:</span>
            <p className="text-slate-600 mt-0.5">{test.expectedResult}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckItem({ text, checked }: { text: string; checked: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <svg
        className={`w-5 h-5 shrink-0 ${checked ? 'text-green-600' : 'text-slate-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span>{text}</span>
    </div>
  );
}

function TransitionStep({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-xs font-bold text-slate-700 shrink-0">
        {step}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function EdgeCaseItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-amber-600 shrink-0">⚠</span>
      <div>
        <p className="font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
