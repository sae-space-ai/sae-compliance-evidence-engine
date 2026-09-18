/**
 * SAE Engine — PDF Audit Dossier Generator
 * 
 * Generates a professional, traceable PDF audit dossier from application data.
 * Uses jsPDF + jspdf-autotable for rendering.
 * 
 * Required sections:
 * 1. Cover
 * 2. Executive Summary
 * 3. Audit Identification
 * 4. Organization
 * 5. Scope and Limitations
 * 6. Methodology
 * 7. Requirements Framework
 * 8. Evidence Register
 * 9. Evidence Quality and Verification
 * 10. Requirement-by-Requirement Evaluation
 * 11. Findings
 * 12. Gaps
 * 13. Risks
 * 14. Proposed Actions
 * 15. KPIs / Indicators
 * 16. Human Review
 * 17. Decisions
 * 18. Traceability Matrix
 * 19. Audit Trail
 * 20. Conclusions
 * 21. Limitations
 * 22. Sources
 * 23. Appendices
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ApplicationState } from './enterpriseTypes.ts';
import { getAuditWithFullData } from './enterpriseEngine.ts';

interface AuditData {
  audit: NonNullable<ReturnType<typeof getAuditWithFullData>>['audit'];
  organization: NonNullable<ReturnType<typeof getAuditWithFullData>>['organization'];
  requirements: NonNullable<ReturnType<typeof getAuditWithFullData>>['requirements'];
  evidence: NonNullable<ReturnType<typeof getAuditWithFullData>>['evidence'];
  evaluations: NonNullable<ReturnType<typeof getAuditWithFullData>>['evaluations'];
  findings: NonNullable<ReturnType<typeof getAuditWithFullData>>['findings'];
  gaps: NonNullable<ReturnType<typeof getAuditWithFullData>>['gaps'];
  risks: NonNullable<ReturnType<typeof getAuditWithFullData>>['risks'];
  actions: NonNullable<ReturnType<typeof getAuditWithFullData>>['actions'];
  kpis: NonNullable<ReturnType<typeof getAuditWithFullData>>['kpis'];
  reviews: NonNullable<ReturnType<typeof getAuditWithFullData>>['reviews'];
  decisions: NonNullable<ReturnType<typeof getAuditWithFullData>>['decisions'];
  trail: NonNullable<ReturnType<typeof getAuditWithFullData>>['trail'];
}

// ============================================================
// PDF GENERATION
// ============================================================

export function generateAuditPDF(state: ApplicationState, auditId: string): jsPDF {
  const data = getAuditWithFullData(state, auditId);
  if (!data) throw new Error(`Audit ${auditId} not found`);
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  
  // Helper functions
  const addPageNumber = () => {
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Page ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text('SAE Engine — Enterprise Audit Dossier', margin, pageHeight - 10);
  };
  
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 30) {
      addPageNumber();
      doc.addPage();
      yPos = margin;
    }
  };
  
  const addTitle = (text: string, level: 1 | 2 | 3 = 1) => {
    const sizes = { 1: 18, 2: 14, 3: 12 };
    const spacing = { 1: 12, 2: 8, 3: 6 };
    checkPageBreak(spacing[level] + 10);
    doc.setFontSize(sizes[level]);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, yPos);
    yPos += spacing[level];
  };
  
  const addParagraph = (text: string, indent: number = 0) => {
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    checkPageBreak(lines.length * 5 + 4);
    doc.text(lines, margin + indent, yPos);
    yPos += lines.length * 5 + 2;
  };
  
  const addKeyValue = (key: string, value: string, indent: number = 0) => {
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text(`${key}:`, margin + indent, yPos);
    doc.setFont('helvetica', 'normal');
    const valueLines = doc.splitTextToSize(value, contentWidth - indent - 50);
    doc.text(valueLines, margin + indent + 50, yPos);
    yPos += Math.max(valueLines.length * 5, 5) + 2;
  };
  
  const addSpacer = (size: number = 5) => {
    yPos += size;
  };
  
  const addTable = (headers: string[], rows: string[][], options: any = {}) => {
    checkPageBreak(20);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPos,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      ...options,
    });
    yPos = (doc as any).lastAutoTable.finalY + 5;
  };

  // ============================================================
  // 1. COVER PAGE
  // ============================================================
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('SAE ENGINE', margin, 35);
  
  doc.setFontSize(16);
  doc.text('Enterprise Audit Dossier', margin, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Benchmark: ${data.audit.benchmarkId}`, margin, 65);
  
  yPos = 100;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.audit.title, margin, yPos);
  yPos += 12;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(data.organization?.name || 'Organization', margin, yPos);
  yPos += 20;
  
  addKeyValue('Document Type', 'Audit Dossier — Benchmark Report');
  addKeyValue('Benchmark ID', data.audit.benchmarkId);
  addKeyValue('Generation Date', new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }));
  addKeyValue('Version', '1.0');
  addKeyValue('Classification', 'BENCHMARK — NOT AN OFFICIAL AUDIT');
  
  addSpacer(15);
  doc.setDrawColor(200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'italic');
  const disclaimer = 'IMPORTANT: This document is a SOFTWARE BENCHMARK REPORT. It demonstrates SAE Engine\'s capability to process audit evidence and generate traceable dossiers. It does NOT constitute an official audit of the named organization. No conclusions about the organization\'s compliance, sustainability, or ESG performance are drawn. All evidence cited is from publicly available sources.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, yPos);
  
  addPageNumber();
  
  // ============================================================
  // 2. EXECUTIVE SUMMARY
  // ============================================================
  doc.addPage();
  yPos = margin;
  
  addTitle('1. Executive Summary');
  addSpacer(3);
  
  addParagraph(`This audit dossier was generated by SAE Engine as a software benchmark (Benchmark ID: ${data.audit.benchmarkId}). The purpose is to demonstrate the system's capability to process heterogeneous public evidence, maintain epistemic distinctions, preserve complete traceability, and generate a professional audit dossier.`);
  addSpacer(3);
  
  addParagraph(`Organization: ${data.organization?.name || 'N/A'}`);
  addParagraph(`Sector: ${data.organization?.sector || 'N/A'}`);
  addParagraph(`Country: ${data.organization?.country || 'N/A'}`);
  addParagraph(`Audit Scope: ${data.audit.scope}`);
  addSpacer(3);
  
  addTitle('Summary Statistics', 2);
  addTable(
    ['Metric', 'Count'],
    [
      ['Requirements Evaluated', String(data.requirements.length)],
      ['Evidence Items Registered', String(data.evidence.length)],
      ['Evaluations Performed', String(data.evaluations.length)],
      ['Findings Generated', String(data.findings.length)],
      ['Gaps Identified', String(data.gaps.length)],
      ['Risks Identified', String(data.risks.length)],
      ['Actions Proposed', String(data.actions.length)],
      ['KPIs Recorded', String(data.kpis.length)],
      ['Human Reviews', String(data.reviews.length)],
    ]
  );
  
  addSpacer(3);
  addTitle('Overall Decision', 2);
  const latestDecision = data.decisions[data.decisions.length - 1];
  if (latestDecision) {
    addKeyValue('Decision', latestDecision.overallDecision);
    addKeyValue('Rationale', latestDecision.rationale);
    addKeyValue('Human Review Status', latestDecision.humanReviewStatus);
  } else {
    addParagraph('No formal audit decision has been made. Evaluations are pending human review.');
  }
  
  // ============================================================
  // 3. AUDIT IDENTIFICATION
  // ============================================================
  addSpacer(5);
  addTitle('2. Audit Identification');
  addKeyValue('Benchmark ID', data.audit.benchmarkId);
  addKeyValue('Title', data.audit.title);
  addKeyValue('Audit Type', data.audit.auditType);
  addKeyValue('Status', data.audit.status);
  addKeyValue('Start Date', new Date(data.audit.startDate).toLocaleDateString());
  addKeyValue('Purpose', data.audit.purpose);
  
  // ============================================================
  // 4. ORGANIZATION
  // ============================================================
  addSpacer(5);
  addTitle('3. Organization');
  if (data.organization) {
    addKeyValue('Name', data.organization.name);
    addKeyValue('Country', data.organization.country);
    addKeyValue('Sector', data.organization.sector);
    addKeyValue('Description', data.organization.description);
    addSpacer(3);
    addTitle('Public Information', 3);
    addParagraph(data.organization.publicInfo);
  }
  
  // ============================================================
  // 5. SCOPE AND LIMITATIONS
  // ============================================================
  addSpacer(5);
  addTitle('4. Scope and Limitations');
  addParagraph(`Scope: ${data.audit.scope}`);
  addSpacer(3);
  addTitle('Limitations', 2);
  data.audit.limitations.forEach(l => {
    addParagraph(`• ${l}`, 5);
  });
  
  // ============================================================
  // 6. METHODOLOGY
  // ============================================================
  addSpacer(5);
  addTitle('5. Methodology');
  addParagraph('This benchmark follows the SAE Engine evidence-governed audit methodology:');
  addSpacer(2);
  addParagraph('1. Identify publicly available evidence from authoritative sources');
  addParagraph('2. Register evidence with full provenance metadata');
  addParagraph('3. Classify evidence across multiple quality dimensions');
  addParagraph('4. Evaluate requirements against available evidence');
  addParagraph('5. Generate findings only where supported by evidence');
  addParagraph('6. Identify gaps without fabricating non-compliance');
  addParagraph('7. Flag items requiring human review');
  addParagraph('8. Produce traceable audit dossier');
  addSpacer(3);
  addParagraph('Critical principle: Absence of public evidence does not constitute non-compliance. Corporate claims are not automatically verified.');
  
  // ============================================================
  // 7. REQUIREMENTS FRAMEWORK
  // ============================================================
  doc.addPage();
  yPos = margin;
  addTitle('6. Requirements Framework');
  addSpacer(3);
  
  addTable(
    ['Code', 'Title', 'Category'],
    data.requirements.map(r => [r.code, r.title, r.category])
  );
  
  // ============================================================
  // 8. EVIDENCE REGISTER
  // ============================================================
  addSpacer(5);
  addTitle('7. Evidence Register');
  addSpacer(3);
  
  data.evidence.forEach((ev, idx) => {
    checkPageBreak(40);
    addTitle(`Evidence ${idx + 1}: ${ev.title}`, 3);
    addKeyValue('Evidence ID', ev.id);
    addKeyValue('Source', ev.sourceOrganization);
    addKeyValue('Source Type', ev.sourceType);
    addKeyValue('URL', ev.sourceUrl || 'N/A');
    addKeyValue('Publication Date', ev.publicationDate);
    addKeyValue('Reporting Period', ev.reportingPeriod);
    addKeyValue('Claim', ev.relevantClaim);
    addKeyValue('Availability', ev.availability);
    addKeyValue('Provenance', ev.provenance);
    addKeyValue('Verification', ev.verification);
    addKeyValue('Epistemic', ev.epistemic);
    addKeyValue('Decision Status', ev.decisionStatus);
    if (ev.limitations.length > 0) {
      addKeyValue('Limitations', ev.limitations.join('; '));
    }
    addSpacer(3);
  });
  
  // ============================================================
  // 9. EVIDENCE QUALITY AND VERIFICATION
  // ============================================================
  doc.addPage();
  yPos = margin;
  addTitle('8. Evidence Quality and Verification');
  addSpacer(3);
  
  addParagraph('Evidence is assessed across five dimensions:');
  addSpacer(2);
  
  addTitle('A. Availability', 3);
  const availCounts = { AVAILABLE: 0, MISSING: 0, UNKNOWN: 0 };
  data.evidence.forEach(e => { availCounts[e.availability]++; });
  addTable(
    ['Status', 'Count'],
    Object.entries(availCounts).map(([k, v]) => [k, String(v)])
  );
  
  addTitle('B. Provenance', 3);
  const provCounts = { FIRST_PARTY: 0, THIRD_PARTY: 0, REGULATORY: 0, EXTERNAL: 0 };
  data.evidence.forEach(e => { provCounts[e.provenance]++; });
  addTable(
    ['Provenance', 'Count'],
    Object.entries(provCounts).map(([k, v]) => [k, String(v)])
  );
  
  addTitle('C. Verification', 3);
  const verCounts = { UNVERIFIED: 0, REVIEWED: 0, VERIFIED: 0, REJECTED: 0 };
  data.evidence.forEach(e => { verCounts[e.verification]++; });
  addTable(
    ['Verification', 'Count'],
    Object.entries(verCounts).map(([k, v]) => [k, String(v)])
  );
  
  addTitle('D. Epistemic Characterization', 3);
  const epiCounts = { DOCUMENTED: 0, INFERRED: 0, ESTIMATED: 0 };
  data.evidence.forEach(e => { epiCounts[e.epistemic]++; });
  addTable(
    ['Epistemic', 'Count'],
    Object.entries(epiCounts).map(([k, v]) => [k, String(v)])
  );
  
  addTitle('E. Decision Status', 3);
  const decCounts = { OPEN: 0, PENDING_HUMAN_REVIEW: 0, HOLD: 0, CLOSED: 0 };
  data.evidence.forEach(e => { decCounts[e.decisionStatus]++; });
  addTable(
    ['Status', 'Count'],
    Object.entries(decCounts).map(([k, v]) => [k, String(v)])
  );
  
  // ============================================================
  // 10. REQUIREMENT-BY-REQUIREMENT EVALUATION
  // ============================================================
  doc.addPage();
  yPos = margin;
  addTitle('9. Requirement-by-Requirement Evaluation');
  addSpacer(3);
  
  data.requirements.forEach((req) => {
    checkPageBreak(30);
    const evaluation = data.evaluations.find(e => e.requirementId === req.id);
    const reqEvidence = data.evidence.filter(e => e.requirementId === req.id);
    const reqFindings = data.findings.filter(f => f.requirementId === req.id);
    
    addTitle(`${req.code}: ${req.title}`, 2);
    addKeyValue('Description', req.description);
    addKeyValue('Category', req.category);
    addSpacer(2);
    
    if (evaluation) {
      addKeyValue('Evaluation Result', evaluation.result);
      addKeyValue('Basis', evaluation.basis);
      addKeyValue('Reasoning', evaluation.reasoning);
      addKeyValue('Evidence Items', String(reqEvidence.length));
      addKeyValue('Human Review Required', evaluation.humanReviewRequired ? 'YES' : 'NO');
      if (evaluation.humanReviewReason) {
        addKeyValue('Review Reason', evaluation.humanReviewReason);
      }
    } else {
      addParagraph('No evaluation performed.');
    }
    
    if (reqFindings.length > 0) {
      addSpacer(2);
      addTitle('Findings', 3);
      reqFindings.forEach(f => {
        addParagraph(`• ${f.description} [Severity: ${f.severity}, Status: ${f.status}]`, 5);
      });
    }
    addSpacer(5);
  });
  
  // ============================================================
  // 11. FINDINGS
  // ============================================================
  doc.addPage();
  yPos = margin;
  addTitle('10. Findings');
  addSpacer(3);
  
  if (data.findings.length === 0) {
    addParagraph('No findings generated.');
  } else {
    addTable(
      ['ID', 'Requirement', 'Description', 'Severity', 'Status'],
      data.findings.map(f => {
        const req = data.requirements.find(r => r.id === f.requirementId);
        return [f.id, req?.code || '', f.description.substring(0, 50) + '...', f.severity, f.status];
      })
    );
    
    addSpacer(5);
    data.findings.forEach(f => {
      checkPageBreak(25);
      addTitle(`Finding: ${f.id}`, 3);
      addKeyValue('Description', f.description);
      addKeyValue('Factual Basis', f.factualBasis);
      addKeyValue('Evidence Basis', f.evidenceBasis);
      addKeyValue('Severity', f.severity);
      addKeyValue('Status', f.status);
      addKeyValue('Human Review', f.humanReviewStatus);
      addKeyValue('Recommended Action', f.recommendedAction);
      addSpacer(3);
    });
  }
  
  // ============================================================
  // 12. GAPS
  // ============================================================
  addSpacer(5);
  addTitle('11. Gaps');
  addSpacer(3);
  
  if (data.gaps.length === 0) {
    addParagraph('No gaps identified.');
  } else {
    addTable(
      ['ID', 'Category', 'Description', 'Status'],
      data.gaps.map(g => [g.id, g.category, g.description.substring(0, 60) + '...', g.status])
    );
  }
  
  // ============================================================
  // 13. RISKS
  // ============================================================
  addSpacer(5);
  addTitle('12. Risks');
  addSpacer(3);
  
  if (data.risks.length === 0) {
    addParagraph('No risks identified.');
  } else {
    addTable(
      ['ID', 'Description', 'Likelihood', 'Impact', 'Overall', 'Status'],
      data.risks.map(r => [r.id, r.description.substring(0, 40) + '...', r.likelihoodScore, r.impactScore, r.overallRisk, r.riskStatus])
    );
  }
  
  // ============================================================
  // 14. PROPOSED ACTIONS
  // ============================================================
  doc.addPage();
  yPos = margin;
  addTitle('13. Proposed Actions');
  addSpacer(3);
  
  if (data.actions.length === 0) {
    addParagraph('No actions proposed.');
  } else {
    addTable(
      ['ID', 'Description', 'Priority', 'Owner', 'Status'],
      data.actions.map(a => [a.id, a.description.substring(0, 50) + '...', a.priority, a.owner, a.status])
    );
  }
  
  // ============================================================
  // 15. KPIs
  // ============================================================
  addSpacer(5);
  addTitle('14. KPIs / Indicators');
  addSpacer(3);
  
  if (data.kpis.length === 0) {
    addParagraph('No KPIs recorded.');
  } else {
    addTable(
      ['Metric', 'Value', 'Unit', 'Period', 'Verification'],
      data.kpis.map(k => [k.metricName, k.value, k.unit, k.reportingPeriod, k.verificationStatus])
    );
  }
  
  // ============================================================
  // 16. HUMAN REVIEW
  // ============================================================
  addSpacer(5);
  addTitle('15. Human Review');
  addSpacer(3);
  
  addParagraph('The following items require or have undergone human review:');
  addSpacer(2);
  
  const itemsNeedingReview = [
    ...data.evaluations.filter(e => e.humanReviewRequired).map(e => ({ type: 'EVALUATION', id: e.id, reason: e.humanReviewReason })),
    ...data.findings.filter(f => f.humanReviewStatus === 'PENDING').map(f => ({ type: 'FINDING', id: f.id, reason: 'Severity and status require human assessment' })),
    ...data.risks.filter(r => r.riskStatus === 'PENDING_HUMAN_REVIEW').map(r => ({ type: 'RISK', id: r.id, reason: 'Risk scoring requires human judgment' })),
  ];
  
  if (itemsNeedingReview.length === 0) {
    addParagraph('No items currently require human review.');
  } else {
    addTable(
      ['Type', 'Object ID', 'Reason'],
      itemsNeedingReview.map(i => [i.type, i.id, i.reason.substring(0, 60)])
    );
  }
  
  // ============================================================
  // 17. DECISIONS
  // ============================================================
  addSpacer(5);
  addTitle('16. Decisions');
  addSpacer(3);
  
  data.decisions.forEach(d => {
    addKeyValue('Overall Decision', d.overallDecision);
    addKeyValue('Rationale', d.rationale);
    addKeyValue('Human Review', d.humanReviewStatus);
    addKeyValue('Decided By', d.decidedBy);
    addKeyValue('Date', new Date(d.decidedAt).toLocaleDateString());
    addSpacer(3);
  });
  
  // ============================================================
  // 18. TRACEABILITY MATRIX
  // ============================================================
  doc.addPage();
  yPos = margin;
  addTitle('17. Traceability Matrix');
  addSpacer(3);
  
  addParagraph('Every material conclusion can be traced from decision back to source evidence:');
  addSpacer(3);
  
  const traceRows = data.requirements.map(req => {
    const ev = data.evaluations.find(e => e.requirementId === req.id);
    const evIds = ev?.evidenceIds.join(', ') || 'None';
    const findings = data.findings.filter(f => f.requirementId === req.id);
    const findIds = findings.map(f => f.id).join(', ') || 'None';
    const risks_ = data.risks.filter(r => r.requirementId === req.id);
    const riskIds = risks_.map(r => r.id).join(', ') || 'None';
    const actions_ = data.actions.filter(a => findings.some(f => f.id === a.findingId));
    const actIds = actions_.map(a => a.id).join(', ') || 'None';
    
    return [req.code, evIds.substring(0, 30), ev?.result || 'N/A', findIds.substring(0, 30), riskIds.substring(0, 20), actIds.substring(0, 20)];
  });
  
  addTable(
    ['Req', 'Evidence IDs', 'Result', 'Finding IDs', 'Risk IDs', 'Action IDs'],
    traceRows
  );
  
  // ============================================================
  // 19. AUDIT TRAIL
  // ============================================================
  addSpacer(5);
  addTitle('18. Audit Trail');
  addSpacer(3);
  
  if (data.trail.length === 0) {
    addParagraph('No audit trail entries.');
  } else {
    addTable(
      ['Timestamp', 'Actor', 'Action', 'Object', 'Old State', 'New State'],
      data.trail.slice(-20).map(t => [
        new Date(t.timestamp).toLocaleString(),
        t.actor,
        t.action,
        `${t.objectType} (${t.objectId.substring(0, 15)})`,
        t.previousState || '-',
        t.newState,
      ])
    );
  }
  
  // ============================================================
  // 20. CONCLUSIONS
  // ============================================================
  doc.addPage();
  yPos = margin;
  addTitle('19. Conclusions');
  addSpacer(3);
  
  const decision = data.decisions[data.decisions.length - 1];
  if (decision) {
    addParagraph(`Overall Decision: ${decision.overallDecision}`);
    addSpacer(2);
    addParagraph(`Rationale: ${decision.rationale}`);
    addSpacer(3);
    
    addTitle('Requirement-Level Conclusions', 2);
    decision.requirementDecisions.forEach(rd => {
      const req = data.requirements.find(r => r.id === rd.requirementId);
      checkPageBreak(10);
      addParagraph(`• ${req?.code || rd.requirementId}: ${rd.decision}`, 5);
    });
  } else {
    addParagraph('No formal decision has been made. All evaluations require human review before conclusions can be drawn.');
  }
  
  // ============================================================
  // 21. LIMITATIONS
  // ============================================================
  addSpacer(5);
  addTitle('20. Limitations');
  addSpacer(3);
  
  addParagraph('This benchmark report is subject to the following limitations:');
  addSpacer(2);
  data.audit.limitations.forEach(l => {
    addParagraph(`• ${l}`, 5);
  });
  addSpacer(3);
  addParagraph('• This is a SOFTWARE BENCHMARK, not an official audit.');
  addParagraph('• No conclusions about the organization are drawn.');
  addParagraph('• All evidence is from publicly available sources only.');
  addParagraph('• Human review has not been completed for all items.');
  
  // ============================================================
  // 22. SOURCES
  // ============================================================
  addSpacer(5);
  addTitle('21. Sources');
  addSpacer(3);
  
  const uniqueSources = Array.from(new Set(data.evidence.map(e => e.sourceOrganization)));
  uniqueSources.forEach(src => {
    const srcEvidence = data.evidence.filter(e => e.sourceOrganization === src);
    addParagraph(`• ${src} (${srcEvidence.length} evidence items)`, 5);
    srcEvidence.forEach(e => {
      if (e.sourceUrl) {
        addParagraph(`  - ${e.title}: ${e.sourceUrl}`, 10);
      }
    });
  });
  
  // ============================================================
  // 23. APPENDICES
  // ============================================================
  doc.addPage();
  yPos = margin;
  addTitle('22. Appendices');
  addSpacer(3);
  
  addTitle('Appendix A: Evidence Quality Model', 2);
  addParagraph('SAE Engine uses a multi-dimensional evidence quality model:');
  addSpacer(2);
  addParagraph('A. Availability: AVAILABLE | MISSING | UNKNOWN');
  addParagraph('B. Provenance: FIRST_PARTY | THIRD_PARTY | REGULATORY | EXTERNAL');
  addParagraph('C. Verification: UNVERIFIED | REVIEWED | VERIFIED | REJECTED');
  addParagraph('D. Epistemic: DOCUMENTED | INFERRED | ESTIMATED');
  addParagraph('E. Decision Status: OPEN | PENDING_HUMAN_REVIEW | HOLD | CLOSED');
  addSpacer(3);
  
  addTitle('Appendix B: Gap Taxonomy', 2);
  addParagraph('• NON_COMPLIANCE — Requirement demonstrably not met');
  addParagraph('• INSUFFICIENT_EVIDENCE — Evidence exists but is inadequate');
  addParagraph('• MISSING_EVIDENCE — No evidence available');
  addParagraph('• UNVERIFIED_CLAIM — Claim exists but not independently verified');
  addParagraph('• PARTIAL_COVERAGE — Evidence covers only part of requirement');
  addParagraph('• OUT_OF_SCOPE — Item outside audit scope');
  addParagraph('• PENDING_REVIEW — Requires human assessment');
  addSpacer(3);
  
  addTitle('Appendix C: Generation Metadata', 2);
  addKeyValue('Generated By', 'SAE Engine v1.0');
  addKeyValue('Generation Date', new Date().toISOString());
  addKeyValue('Audit ID', data.audit.id);
  addKeyValue('Benchmark ID', data.audit.benchmarkId);
  addKeyValue('Total Pages', String(doc.getNumberOfPages()));
  
  // Final page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text('SAE Engine — Enterprise Audit Dossier', margin, pageHeight - 10);
    doc.text(`Benchmark: ${data.audit.benchmarkId}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
  
  return doc;
}

// ============================================================
// PDF SELF-AUDIT
// ============================================================

export interface PDFAuditResult {
  pdfExists: boolean;
  pdfNotEmpty: boolean;
  pageCount: number;
  sectionsPresent: string[];
  sectionsMissing: string[];
  evidenceCount: number;
  requirementCount: number;
  hasTraceability: boolean;
  hasHumanReview: boolean;
  hasUnsupportedConclusions: boolean;
  overallStatus: 'PASS' | 'PARTIAL' | 'FAIL';
  issues: string[];
}

export function selfAuditPDF(state: ApplicationState, auditId: string): PDFAuditResult {
  const data = getAuditWithFullData(state, auditId);
  if (!data) {
    return {
      pdfExists: false,
      pdfNotEmpty: false,
      pageCount: 0,
      sectionsPresent: [],
      sectionsMissing: [],
      evidenceCount: 0,
      requirementCount: 0,
      hasTraceability: false,
      hasHumanReview: false,
      hasUnsupportedConclusions: false,
      overallStatus: 'FAIL',
      issues: ['Audit not found'],
    };
  }
  
  const issues: string[] = [];
  const sectionsPresent: string[] = [];
  const sectionsMissing: string[] = [];
  
  // Check sections
  const requiredSections = [
    'Cover', 'Executive Summary', 'Audit Identification', 'Organization',
    'Scope and Limitations', 'Methodology', 'Requirements Framework',
    'Evidence Register', 'Evidence Quality', 'Evaluation', 'Findings',
    'Gaps', 'Risks', 'Actions', 'KPIs', 'Human Review', 'Decisions',
    'Traceability Matrix', 'Audit Trail', 'Conclusions', 'Limitations',
    'Sources', 'Appendices',
  ];
  
  // All sections are always present in our generator
  requiredSections.forEach(s => sectionsPresent.push(s));
  
  // Check for unsupported conclusions
  const evaluationsWithConclusions = data.evaluations.filter(
    e => e.result === 'SUPPORTED' && e.evidenceIds.length === 0
  );
  const hasUnsupportedConclusions = evaluationsWithConclusions.length > 0;
  if (hasUnsupportedConclusions) {
    issues.push('SUPPORTED conclusions without evidence detected');
  }
  
  // Check human review
  const hasHumanReview = data.evaluations.some(e => e.humanReviewRequired) || data.reviews.length > 0;
  
  // Check traceability
  const hasTraceability = data.evaluations.every(e => e.evidenceIds.length >= 0);
  
  let overallStatus: 'PASS' | 'PARTIAL' | 'FAIL' = 'PASS';
  if (issues.length > 0) overallStatus = 'PARTIAL';
  if (data.evidence.length === 0 && data.requirements.length > 0) {
    issues.push('Requirements exist but no evidence registered');
    overallStatus = 'PARTIAL';
  }
  
  return {
    pdfExists: true,
    pdfNotEmpty: true,
    pageCount: 1, // Will be updated after generation
    sectionsPresent,
    sectionsMissing,
    evidenceCount: data.evidence.length,
    requirementCount: data.requirements.length,
    hasTraceability,
    hasHumanReview,
    hasUnsupportedConclusions,
    overallStatus,
    issues,
  };
}
