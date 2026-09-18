/**
 * StatusBadge — Renders a status indicator with appropriate color.
 * 
 * Supports all domain status types:
 * - AISystemStatus, ApplicabilityStatus, EvidenceStatus
 * - EvaluationResult, GapType, ActionStatus
 */

type StatusValue = string;

export function StatusBadge({ status }: { status: StatusValue }) {
  const { label, colorClass } = getStatusDisplay(status);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

function getStatusDisplay(status: string): { label: string; colorClass: string } {
  switch (status) {
    // AI System Status
    case 'DECLARED':
      return { label: 'DECLARED', colorClass: 'bg-blue-100 text-blue-800' };
    case 'DOCUMENTED':
      return { label: 'DOCUMENTED', colorClass: 'bg-indigo-100 text-indigo-800' };
    case 'ACCREDITED':
      return { label: 'ACCREDITED', colorClass: 'bg-purple-100 text-purple-800' };
    case 'VERIFIED':
      return { label: 'VERIFIED', colorClass: 'bg-green-100 text-green-800' };

    // Applicability Status
    case 'PENDING':
      return { label: 'PENDING', colorClass: 'bg-amber-100 text-amber-800' };
    case 'APPLICABLE':
      return { label: 'APPLICABLE', colorClass: 'bg-sky-100 text-sky-800' };
    case 'NOT_APPLICABLE':
      return { label: 'NOT_APPLICABLE', colorClass: 'bg-slate-100 text-slate-700' };

    // Evidence Status
    case 'ACCEPTED':
      return { label: 'ACCEPTED', colorClass: 'bg-green-100 text-green-800' };
    case 'REJECTED':
      return { label: 'REJECTED', colorClass: 'bg-red-100 text-red-800' };
    case 'UNKNOWN':
      return { label: 'UNKNOWN', colorClass: 'bg-gray-100 text-gray-700' };

    // Evaluation Result
    case 'UNDETERMINED':
      return { label: 'UNDETERMINED', colorClass: 'bg-orange-100 text-orange-800' };
    case 'ESTABLISHED':
      return { label: 'ESTABLISHED', colorClass: 'bg-green-100 text-green-800' };
    case 'NOT_ESTABLISHED':
      return { label: 'NOT_ESTABLISHED', colorClass: 'bg-red-100 text-red-800' };
    case 'CONFLICTING':
      return { label: 'CONFLICTING', colorClass: 'bg-red-100 text-red-800' };
    case 'REQUIRES_HUMAN_REVIEW':
      return { label: 'REQUIRES_HUMAN_REVIEW', colorClass: 'bg-violet-100 text-violet-800' };

    // Gap Types
    case 'MISSING_EVIDENCE':
      return { label: 'MISSING_EVIDENCE', colorClass: 'bg-amber-100 text-amber-800' };
    case 'INSUFFICIENT_EVIDENCE':
      return { label: 'INSUFFICIENT_EVIDENCE', colorClass: 'bg-orange-100 text-orange-800' };
    case 'CONFLICTING_EVIDENCE':
      return { label: 'CONFLICTING_EVIDENCE', colorClass: 'bg-red-100 text-red-800' };

    // Action Status
    case 'PROPOSED':
      return { label: 'PROPOSED', colorClass: 'bg-slate-100 text-slate-700' };
    case 'IN_PROGRESS':
      return { label: 'IN_PROGRESS', colorClass: 'bg-blue-100 text-blue-800' };
    case 'COMPLETED':
      return { label: 'COMPLETED', colorClass: 'bg-teal-100 text-teal-800' };

    // Default
    default:
      return { label: status, colorClass: 'bg-slate-100 text-slate-700' };
  }
}
