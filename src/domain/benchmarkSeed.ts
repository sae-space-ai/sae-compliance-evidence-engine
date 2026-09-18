/**
 * SAE Engine — ECI-001 Benchmark Data Seeder
 * 
 * Seeds the application with the El Corte Inglés benchmark dataset.
 * Uses ONLY publicly available and verifiable information.
 * All uncertain items are explicitly marked.
 */

import type { ApplicationState } from './enterpriseTypes.ts';
import {
  createInitialState,
  createOrganization,
  createAudit,
  createRequirement,
  createEvidence,
  evaluateRequirement,
  createFinding,
  createGap,
  createRisk,
  createAction,
  createKPI,
  makeAuditDecision,
  saveState,
} from './enterpriseEngine.ts';

export function seedECI001Benchmark(): ApplicationState {
  let state = createInitialState();
  
  // ============================================================
  // ORGANIZATION
  // ============================================================
  const { state: s1, organization } = createOrganization(
    state,
    'El Corte Inglés, S.A.',
    'Spain',
    'Retail / Department Stores / Consumer Services',
    'El Corte Inglés is Spain\'s largest department store group and one of the world\'s largest by revenue. Headquartered in Madrid, the group operates department stores, hypermarkets, travel agencies, and insurance operations across Spain and Portugal.',
    'Publicly known facts: Founded 1935, Madrid. Operates 100+ stores. Published Sustainability Master Plan 2025-2030. Published Sustainability Report 2025. CSRD double materiality assessment conducted. Zero Waste certified by AENOR across 330+ locations. Member of global sustainability alliances. FSC certified household products. Better Cotton Initiative member.'
  );
  state = s1;
  
  // ============================================================
  // AUDIT
  // ============================================================
  const { state: s2, audit } = createAudit(
    state,
    'ECI-001',
    'Enterprise Sustainability & Environmental Evidence Audit Benchmark',
    organization.id,
    'Publicly available sustainability/environmental information concerning El Corte Inglés, S.A.',
    'Test whether SAE Engine can transform heterogeneous public evidence into a traceable audit dossier without fabricating unavailable information.',
    'Evidence-governed compliance / sustainability audit benchmark',
    [
      'This is a SOFTWARE BENCHMARK, not an official audit of El Corte Inglés.',
      'Only publicly available information has been used.',
      'No internal corporate data, policies, or KPIs have been accessed.',
      'No conclusions about El Corte Inglés\'s actual compliance status are drawn.',
      'Evidence verification is limited to what can be confirmed from public sources.',
      'Risk scores are NOT DETERMINED — no quantitative data available.',
      'Human review has not been completed for any items.',
    ]
  );
  state = s2;
  
  // ============================================================
  // REQUIREMENTS (12 controls)
  // ============================================================
  const requirements = [
    { code: 'ECI-ENV-01', title: 'Sustainability Policy and Governance', category: 'GOVERNANCE' as const, desc: 'Organization has a documented sustainability policy with governance structure.', scope: 'Corporate governance', expected: 'Published sustainability policy with governance references' },
    { code: 'ECI-ENV-02', title: 'Sustainability Strategy / Master Plan', category: 'STRATEGY' as const, desc: 'Organization has a defined sustainability strategy with targets and roadmap.', scope: 'Strategic planning', expected: 'Published master plan with measurable targets' },
    { code: 'ECI-ENV-03', title: 'Materiality / Double Materiality', category: 'MATERIALITY' as const, desc: 'Organization has conducted a materiality assessment aligned with CSRD standards.', scope: 'CSRD compliance', expected: 'Double materiality assessment documentation' },
    { code: 'ECI-ENV-04', title: 'Energy and Renewable Electricity', category: 'ENERGY' as const, desc: 'Organization reports on energy consumption and renewable energy use.', scope: 'Energy management', expected: 'Data on renewable electricity percentage and sources' },
    { code: 'ECI-ENV-05', title: 'Greenhouse Gas / Climate Information', category: 'CLIMATE' as const, desc: 'Organization reports GHG emissions and climate-related targets.', scope: 'Climate management', expected: 'Scope 1, 2, 3 emissions data and reduction targets' },
    { code: 'ECI-ENV-06', title: 'Waste Management / Circularity / Zero Waste', category: 'WASTE' as const, desc: 'Organization demonstrates effective waste management and circularity practices.', scope: 'Waste and circular economy', expected: 'Waste recovery rates, certifications, circularity metrics' },
    { code: 'ECI-ENV-07', title: 'Water-Related Environmental Information', category: 'WATER' as const, desc: 'Organization reports on water management and consumption.', scope: 'Water management', expected: 'Water consumption data and management policies' },
    { code: 'ECI-ENV-08', title: 'Environmental Management Systems / Certifications', category: 'CERTIFICATION' as const, desc: 'Organization has certified environmental management systems.', scope: 'Environmental certifications', expected: 'ISO 14001, AENOR certifications, or equivalent' },
    { code: 'ECI-ENV-09', title: 'Supply Chain ESG Requirements', category: 'SUPPLY_CHAIN' as const, desc: 'Organization has ESG requirements for suppliers.', scope: 'Supply chain management', expected: 'Supplier code of conduct, audit data, sustainable sourcing data' },
    { code: 'ECI-ENV-10', title: 'Packaging / Circularity Commitments', category: 'PACKAGING' as const, desc: 'Organization has packaging reduction and circularity commitments.', scope: 'Packaging management', expected: 'Packaging targets, recycled content data, reduction plans' },
    { code: 'ECI-ENV-11', title: 'Biodiversity / Environmental Impact', category: 'BIODIVERSITY' as const, desc: 'Organization reports on biodiversity and environmental impact.', scope: 'Biodiversity', expected: 'Biodiversity policies, impact assessments' },
    { code: 'ECI-ENV-12', title: 'Independent Assurance / External Verification', category: 'ASSURANCE' as const, desc: 'Organization has obtained independent assurance for sustainability reporting.', scope: 'Reporting assurance', expected: 'Third-party assurance statement' },
  ];
  
  const reqIds: Record<string, string> = {};
  requirements.forEach(r => {
    const { state: sn, requirement } = createRequirement(
      state, audit.id, r.code, r.title, r.desc, r.category, r.scope, r.expected
    );
    state = sn;
    reqIds[r.code] = requirement.id;
  });
  
  // ============================================================
  // EVIDENCE (Based on real public sources)
  // ============================================================
  
  // ECI-ENV-01: Sustainability Policy
  const { state: s3 } = createEvidence(state, audit.id, reqIds['ECI-ENV-01'], {
    title: 'Corporate Sustainability Policy',
    description: 'El Corte Inglés Group\'s published Corporate Sustainability Policy structured around ESG principles.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Policy Document',
    sourceUrl: 'https://dam.elcorteingles.es/espacios/web-corporativa/doc-portal-2025-06-23-sustainability.pdf',
    publicationDate: '2025',
    reportingPeriod: 'N/A (Policy document)',
    retrievalDate: '2026',
    relevantClaim: 'The Sustainability Policy is structured around Environmental, Social and Governance (ESG) principles.',
    extractedFact: 'Policy exists and is publicly available. Covers environmental, social, governance dimensions.',
    scope: 'Group-wide',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['Self-published policy — not independently verified', 'Implementation evidence separate from policy existence'],
    provenanceChain: 'Official corporate website → Policy PDF',
  });
  state = s3;
  
  // ECI-ENV-02: Sustainability Master Plan
  const { state: s4 } = createEvidence(state, audit.id, reqIds['ECI-ENV-02'], {
    title: 'Sustainability Master Plan 2025-2030',
    description: 'El Corte Inglés Group\'s published Sustainability Master Plan with targets and roadmap.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Strategy Document',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/sustainable-progress/',
    publicationDate: '2025',
    reportingPeriod: '2025-2030',
    retrievalDate: '2026',
    relevantClaim: 'Sustainability Master Plan 2025-2030 acts as the backbone of the sustainability strategy with three pillars: Decarbonisation, Sustainable customer concept, Sustainability Governance.',
    extractedFact: 'Master plan exists with three strategic pillars and defined timeframe.',
    scope: 'Group-wide',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['Forward-looking plan — achievement not yet verifiable', 'Specific quantitative targets not fully detailed in public summary'],
    provenanceChain: 'Official corporate website → Sustainability section',
  });
  state = s4;
  
  // ECI-ENV-03: CSRD Materiality
  const { state: s5 } = createEvidence(state, audit.id, reqIds['ECI-ENV-03'], {
    title: 'CSRD Double Materiality Assessment',
    description: 'El Corte Inglés states it conducts materiality assessment in accordance with CSRD standards.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Report',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/sustainable-progress/',
    publicationDate: '2025',
    reportingPeriod: '2024-2025',
    retrievalDate: '2026',
    relevantClaim: 'The Group conducts a materiality assessment in accordance with the CSRD Directive standards, based on the organization\'s impacts, risks, and opportunities (IROs). A "double materiality" approach was used.',
    extractedFact: 'Company states CSRD-compliant double materiality assessment has been conducted across four areas: Planet, Customers, Company & Society, Value Chain.',
    scope: 'Group-wide',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['Self-reported CSRD compliance — requires independent assurance verification', 'Full assessment document not publicly available in detail', 'Limited to statements on corporate website'],
    provenanceChain: 'Official corporate website → Sustainability progress page',
  });
  state = s5;
  
  // ECI-ENV-04: Renewable Energy
  const { state: s6 } = createEvidence(state, audit.id, reqIds['ECI-ENV-04'], {
    title: '100% Renewable Electricity in Spain',
    description: 'Corporate claim of 100% renewable electricity usage in Spain with guarantee of renewable origin.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Report',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/',
    publicationDate: '2025',
    reportingPeriod: '2024-2025',
    retrievalDate: '2026',
    relevantClaim: '100% of the electricity used in Spain with guarantee of renewable origin.',
    extractedFact: 'Company claims 100% renewable electricity in Spain.',
    scope: 'Spain operations only',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['Geographic scope limited to Spain', 'Mechanism for "guarantee of renewable origin" not specified (PPA, GOs, on-site?)', 'No independent verification cited', 'Does not cover Portugal or other operations'],
    provenanceChain: 'Official corporate website → Environment commitment page',
  });
  state = s6;
  
  // ECI-ENV-05: GHG / Climate
  const { state: s7 } = createEvidence(state, audit.id, reqIds['ECI-ENV-05'], {
    title: 'Climate Neutrality Target 2050 + Scope 3 Measurement',
    description: 'Company has climate neutrality target by 2050 and has performed Scope 3 measurement.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Report',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/',
    publicationDate: '2025',
    reportingPeriod: '2024-2025',
    retrievalDate: '2026',
    relevantClaim: 'Achieve climate neutrality by 2050. Scope 3 measurement performed as part of Net Zero Transition project.',
    extractedFact: 'Climate neutrality target exists. Scope 3 measurement has been performed.',
    scope: 'Group-wide',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['2050 target is forward-looking — cannot verify achievement', 'Specific Scope 1, 2, 3 figures not published in available sources', 'SBTi alignment not confirmed from available sources', 'Net Zero Transition project details limited'],
    provenanceChain: 'Official corporate website → Environment commitment page',
  });
  state = s7;
  
  // ECI-ENV-06: Waste / Zero Waste
  const { state: s8 } = createEvidence(state, audit.id, reqIds['ECI-ENV-06'], {
    title: 'Zero Waste Certification — AENOR',
    description: '330+ stores and platforms certified Zero Waste by AENOR with 94.8% waste recovery rate.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Report',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/',
    publicationDate: '2025',
    reportingPeriod: '2024-2025',
    retrievalDate: '2026',
    relevantClaim: 'More than 330 stores and logistics platforms certified Zero Waste. 94.8% waste recovery and reuse. Target achieved in 2025 for all Spain and Portugal locations.',
    extractedFact: '330+ locations with AENOR Zero Waste certification. 94.8% recovery rate. Original target achieved ahead of schedule.',
    scope: 'Spain and Portugal — all stores, logistics platforms, Supercor, Outlet',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['AENOR certificate not directly linked/verified', '94.8% figure is self-reported', 'Certification scope and validity period not confirmed', 'Methodology for recovery rate calculation not specified'],
    provenanceChain: 'Official corporate website → Environment commitment page',
  });
  state = s8;
  
  // ECI-ENV-06 additional: Food waste
  const { state: s8b } = createEvidence(state, audit.id, reqIds['ECI-ENV-06'], {
    title: 'Food Waste Prevention and Redistribution',
    description: 'Food donation data: 5,208 tonnes to social organizations, 890 tonnes to zoos/farms.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Report',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/',
    publicationDate: '2025',
    reportingPeriod: 'Cumulative (period not specified)',
    retrievalDate: '2026',
    relevantClaim: 'Donating more than 5,208 million kilograms of food to social organisations and Food Banks. More than 890,000 kilograms to zoos and farms.',
    extractedFact: 'Significant food donation program exists. Specific quantities reported.',
    scope: 'Group-wide',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['Reporting period unclear — cumulative vs annual', 'Beneficiary verification not available', 'Note: source says "million kilograms" which may be a translation issue — could be tonnes'],
    provenanceChain: 'Official corporate website → Environment commitment page',
  });
  state = s8b;
  
  // ECI-ENV-07: Water
  const { state: s9 } = createEvidence(state, audit.id, reqIds['ECI-ENV-07'], {
    title: 'Sustainable Water Management Policy',
    description: 'Company has a Sustainable Water Management Policy with treatment equipment.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Report',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/',
    publicationDate: '2025',
    reportingPeriod: 'N/A',
    retrievalDate: '2026',
    relevantClaim: 'Sustainable Water Management Policy in place. Biological and physical filtering treatment equipment. Internal water reuse from sinks.',
    extractedFact: 'Water management policy exists. Treatment equipment in use. Internal water reuse practiced.',
    scope: 'Group-wide',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['No quantitative water consumption data available in public sources', 'Policy existence does not demonstrate effectiveness', 'Treatment equipment scope and capacity not specified'],
    provenanceChain: 'Official corporate website → Environment commitment page',
  });
  state = s9;
  
  // ECI-ENV-08: Certifications
  const { state: s10 } = createEvidence(state, audit.id, reqIds['ECI-ENV-08'], {
    title: 'Environmental Certifications — AENOR, ISO',
    description: 'Multiple environmental certifications referenced including ISO 14001, AENOR Environmental Management, Zero Waste, Carbon Footprint.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Report',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/',
    publicationDate: '2025',
    reportingPeriod: 'N/A',
    retrievalDate: '2026',
    relevantClaim: 'Environmental management systems certified to international standards. Logos shown: AENOR Carbon Footprint, ISO 14001, AENOR Zero Waste, ISO 9001.',
    extractedFact: 'Multiple certifications referenced with certification body logos displayed.',
    scope: 'Various locations',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['Certificate numbers not provided', 'Validity periods not confirmed', 'Scope of each certification not detailed', 'Logos displayed but certificates not linked'],
    provenanceChain: 'Official corporate website → Environment commitment page',
  });
  state = s10;
  
  // ECI-ENV-09: Supply Chain
  const { state: s11 } = createEvidence(state, audit.id, reqIds['ECI-ENV-09'], {
    title: 'Sustainable Product Guide + BCI + FSC',
    description: 'Sustainable Product Guide for suppliers. Better Cotton Initiative member. FSC certified household products.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Report',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/sustainable-progress/',
    publicationDate: '2025',
    reportingPeriod: '2024-2025',
    retrievalDate: '2026',
    relevantClaim: 'Sustainable Product Guide establishes sustainability attributes for suppliers. BCI member for responsible cotton. FSC seal on 100% cellulose household products.',
    extractedFact: 'Supplier sustainability requirements exist. BCI membership confirmed. FSC certification for specific product category.',
    scope: 'Supply chain — private label and external brands',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['FSC scope limited to "cellulose household products" only', 'BCI membership does not verify all cotton is BCI-sourced', 'Supplier audit results not publicly available', 'Sustainable Product Guide criteria details not fully public'],
    provenanceChain: 'Official corporate website → Sustainability progress page',
  });
  state = s11;
  
  // ECI-ENV-10: Packaging
  const { state: s12 } = createEvidence(state, audit.id, reqIds['ECI-ENV-10'], {
    title: 'Sustainable Packaging Plan',
    description: 'Packaging plan with targets: 100% reusable/recyclable/compostable, 33.5% recycled content, 5% annual plastic reduction.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Report',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/',
    publicationDate: '2025',
    reportingPeriod: '2018-2025',
    retrievalDate: '2026',
    relevantClaim: '100% plastic packaging meets reusable/recyclable/compostable criteria. 33.5% recycled plastic content achieved by 2025 (exceeding 20% target). 5% annual plastic reduction in supermarkets through 2026.',
    extractedFact: 'Packaging plan with measurable targets. Progress reported: 33.5% recycled content vs 20% target.',
    scope: 'Group-wide (supermarkets for plastic reduction)',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['Self-reported progress figures', 'Measurement methodology not specified', '2026 reduction target not yet verifiable', 'Scope definitions unclear'],
    provenanceChain: 'Official corporate website → Environment commitment page',
  });
  state = s12;
  
  // ECI-ENV-11: Biodiversity
  const { state: s13 } = createEvidence(state, audit.id, reqIds['ECI-ENV-11'], {
    title: 'Biodiversity Commitment (Limited Evidence)',
    description: 'Corporate policy mentions biodiversity preservation but specific data limited.',
    sourceOrganization: 'El Corte Inglés, S.A.',
    sourceType: 'Corporate Policy',
    sourceUrl: 'https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/',
    publicationDate: '2025',
    reportingPeriod: 'N/A',
    retrievalDate: '2026',
    relevantClaim: 'Preserving biodiversity of the ecosystems, landscapes and surroundings where the Group has operations.',
    extractedFact: 'Policy commitment to biodiversity exists. No specific metrics, assessments, or programs found in available public sources.',
    scope: 'Operations surroundings',
    availability: 'AVAILABLE',
    provenance: 'FIRST_PARTY',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'PENDING_HUMAN_REVIEW',
    limitations: ['Only policy statement found — no implementation evidence', 'No biodiversity impact assessments publicly available', 'No specific programs or metrics identified', 'TNFD alignment not confirmed'],
    provenanceChain: 'Official corporate website → Environment commitment page',
  });
  state = s13;
  
  // ECI-ENV-12: Independent Assurance — MISSING
  const { state: s14 } = createEvidence(state, audit.id, reqIds['ECI-ENV-12'], {
    title: 'Independent Assurance Report',
    description: 'No independent assurance report identified in publicly available sources.',
    sourceOrganization: 'NOT AVAILABLE',
    sourceType: 'N/A',
    sourceUrl: '',
    publicationDate: 'N/A',
    reportingPeriod: 'N/A',
    retrievalDate: '2026',
    relevantClaim: 'N/A — Evidence not found',
    extractedFact: 'No independent assurance report for sustainability data identified in public sources.',
    scope: 'N/A',
    availability: 'MISSING',
    provenance: 'EXTERNAL',
    verification: 'UNVERIFIED',
    epistemic: 'DOCUMENTED',
    decisionStatus: 'OPEN',
    limitations: ['Absence of evidence does not confirm absence of assurance', 'Assurance may exist but not be publicly accessible', 'Sustainability Report 2025 may contain assurance — not fully reviewed'],
    provenanceChain: 'Search of public sources — not found',
  });
  state = s14;
  
  // ============================================================
  // EVALUATIONS
  // ============================================================
  const evaluationResults: Record<string, { result: string; basis: string }> = {};
  
  Object.values(reqIds).forEach(reqId => {
    const { state: sn, evaluation } = evaluateRequirement(state, audit.id, reqId, 'system');
    state = sn;
    evaluationResults[reqId] = { result: evaluation.result, basis: evaluation.basis };
  });
  
  // ============================================================
  // FINDINGS
  // ============================================================
  
  // Finding for ECI-ENV-12 (missing assurance)
  const { state: s15, finding: f1 } = createFinding(
    state, audit.id, reqIds['ECI-ENV-12'],
    state.evaluations.find(e => e.requirementId === reqIds['ECI-ENV-12'])?.id || '',
    state.evidence.filter(e => e.requirementId === reqIds['ECI-ENV-12']).map(e => e.id),
    'No independent assurance report identified for sustainability reporting.',
    'Search of public sources did not identify an independent assurance report for El Corte Inglés sustainability data.',
    'Evidence item registered as MISSING. Corporate claims remain unverified by third party.',
    'PENDING_HUMAN_REVIEW',
    'Obtain and publish independent assurance statement for sustainability reporting.'
  );
  state = s15;
  
  // Finding for ECI-ENV-11 (limited biodiversity evidence)
  const { state: s16, finding: f2 } = createFinding(
    state, audit.id, reqIds['ECI-ENV-11'],
    state.evaluations.find(e => e.requirementId === reqIds['ECI-ENV-11'])?.id || '',
    state.evidence.filter(e => e.requirementId === reqIds['ECI-ENV-11']).map(e => e.id),
    'Biodiversity commitment exists in policy but no implementation evidence found in public sources.',
    'Policy statement found. No biodiversity impact assessments, metrics, or specific programs identified.',
    'Only policy-level evidence available. No quantitative data or program documentation found.',
    'PENDING_HUMAN_REVIEW',
    'Publish biodiversity impact assessment and specific program documentation.'
  );
  state = s16;
  
  // Finding for ECI-ENV-05 (GHG data limited)
  const { state: s17, finding: f3 } = createFinding(
    state, audit.id, reqIds['ECI-ENV-05'],
    state.evaluations.find(e => e.requirementId === reqIds['ECI-ENV-05'])?.id || '',
    state.evidence.filter(e => e.requirementId === reqIds['ECI-ENV-05']).map(e => e.id),
    'Climate target and Scope 3 measurement referenced but specific emissions figures not available in public sources.',
    'Climate neutrality 2050 target documented. Scope 3 measurement performed. Specific Scope 1, 2, 3 figures not found.',
    'Corporate claims exist but quantitative emissions data not available for verification.',
    'PENDING_HUMAN_REVIEW',
    'Publish detailed GHG emissions data with methodology.'
  );
  state = s17;
  
  // ============================================================
  // GAPS
  // ============================================================
  const { state: s18 } = createGap(state, audit.id, f1.id, reqIds['ECI-ENV-12'], 'MISSING_EVIDENCE', 'No independent assurance report available for verification of sustainability claims.');
  state = s18;
  
  const { state: s19 } = createGap(state, audit.id, f2.id, reqIds['ECI-ENV-11'], 'INSUFFICIENT_EVIDENCE', 'Biodiversity evidence limited to policy statement. No implementation data available.');
  state = s19;
  
  const { state: s20 } = createGap(state, audit.id, f3.id, reqIds['ECI-ENV-05'], 'UNVERIFIED_CLAIM', 'GHG emissions figures not available for independent verification. Only targets and measurement references found.');
  state = s20;
  
  // ============================================================
  // RISKS
  // ============================================================
  const gaps = state.gaps;
  const { state: s21 } = createRisk(state, audit.id, f1.id, gaps[0]?.id || '', reqIds['ECI-ENV-12'], 'Unverified sustainability claims may undermine stakeholder confidence and regulatory compliance.');
  state = s21;
  
  const { state: s22 } = createRisk(state, audit.id, f2.id, gaps[1]?.id || '', reqIds['ECI-ENV-11'], 'Limited biodiversity reporting may not meet emerging TNFD and regulatory expectations.');
  state = s22;
  
  // ============================================================
  // ACTIONS
  // ============================================================
  const findings = state.findings;
  const { state: s23 } = createAction(state, audit.id, findings[0].id, gaps[0]?.id || null, 'Obtain independent assurance for sustainability reporting', 'All corporate sustainability claims remain unverified without independent assurance.', 'HIGH');
  state = s23;
  
  const { state: s24 } = createAction(state, audit.id, findings[1].id, gaps[1]?.id || null, 'Develop and publish biodiversity impact assessment', 'Current evidence limited to policy statement only.', 'MEDIUM');
  state = s24;
  
  const { state: s25 } = createAction(state, audit.id, findings[2].id, gaps[2]?.id || null, 'Publish detailed GHG emissions inventory', 'Specific Scope 1, 2, 3 figures not available in public sources.', 'HIGH');
  state = s25;
  
  // ============================================================
  // KPIs (from public data)
  // ============================================================
  const { state: s26 } = createKPI(state, audit.id, reqIds['ECI-ENV-06'], state.evidence.find(e => e.title.includes('Zero Waste'))?.id || null, 'Waste Recovery Rate', '94.8', '%', '2024-2025', 'Spain and Portugal', 'El Corte Inglés Corporate Report', 'UNVERIFIED', 'Self-reported figure. AENOR certification referenced but not independently verified.');
  state = s26;
  
  const { state: s27 } = createKPI(state, audit.id, reqIds['ECI-ENV-06'], state.evidence.find(e => e.title.includes('Zero Waste'))?.id || null, 'Zero Waste Certified Locations', '330+', 'locations', '2025', 'Spain and Portugal', 'El Corte Inglés Corporate Report', 'UNVERIFIED', 'Self-reported. Includes stores and logistics platforms.');
  state = s27;
  
  const { state: s28 } = createKPI(state, audit.id, reqIds['ECI-ENV-10'], state.evidence.find(e => e.title.includes('Packaging'))?.id || null, 'Recycled Plastic Content', '33.5', '%', '2025', 'Group-wide', 'El Corte Inglés Corporate Report', 'UNVERIFIED', 'Exceeded original 20% target. Measurement methodology not specified.');
  state = s28;
  
  const { state: s29 } = createKPI(state, audit.id, reqIds['ECI-ENV-04'], state.evidence.find(e => e.title.includes('Renewable'))?.id || null, 'Renewable Electricity (Spain)', '100', '%', '2024-2025', 'Spain', 'El Corte Inglés Corporate Report', 'UNVERIFIED', 'Scope limited to Spain. Mechanism not specified.');
  state = s29;
  
  const { state: s30 } = createKPI(state, audit.id, reqIds['ECI-ENV-06'], state.evidence.find(e => e.title.includes('Food Waste'))?.id || null, 'Food Donated to Social Organizations', 'NOT_AVAILABLE', 'kg', 'Cumulative', 'Group-wide', 'El Corte Inglés Corporate Report', 'UNVERIFIED', 'Source states "5,208 million kilograms" — possible translation issue. Reporting period unclear.');
  state = s30;
  
  // ============================================================
  // AUDIT DECISION
  // ============================================================
  const { state: s31 } = makeAuditDecision(state, audit.id, 'system');
  state = s31;
  
  // ============================================================
  // SAVE STATE
  // ============================================================
  saveState(state);
  
  return state;
}
