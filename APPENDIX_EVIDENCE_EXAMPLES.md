# APPENDIX D: REAL-WORLD EVIDENCE EXAMPLES

This appendix demonstrates what real public evidence about El Corte Inglés looks like and how the SAE Engine application cannot properly capture it.

---

## EVIDENCE EXAMPLE 1: Zero Waste Certification

### Source Information (What a Proper System Would Capture)

| Field | Value |
|-------|-------|
| **Evidence Title** | Zero Waste Certification — All Spanish and Portuguese Locations |
| **Source Organization** | El Corte Inglés, S.A. |
| **Source URL** | https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/ |
| **Publication Date** | 2025 (reporting period) |
| **Reporting Period** | 2024-2025 |
| **Evidence Type** | Corporate Sustainability Report |
| **Requirement Addressed** | Waste management and circular economy |
| **Exact Claim Supported** | "More than 330 stores and logistics platforms across the company have already achieved Zero Waste certification" |
| **Specific Data Points** | 94.8% waste recovery and reuse rate |
| **Certification Body** | AENOR (mentioned in source) |
| **Evidence Quality** | DOCUMENTED (claim made in official corporate report) |
| **Verification Status** | PENDING VERIFICATION (requires independent verification of AENOR certification) |
| **Provenance** | Official corporate website, sustainability section |
| **Notes** | Claim is self-reported. AENOR certification mentioned but certificate not directly linked. Requires verification of certification scope and validity period. |

### What SAE Engine Can Capture

| Field | Available | Value |
|-------|-----------|-------|
| Title | YES | "Zero Waste Certification" |
| Description | YES | "330+ stores certified, 94.8% recovery" |
| Status | YES | DECLARED |
| Source URL | NO | — |
| Source Organization | NO | — |
| Publication Date | NO | — |
| Reporting Period | NO | — |
| Evidence Type | NO | — |
| Certification Body | NO | — |
| Evidence Quality (8-level) | NO | Only 4 states available |
| Verification Status | NO | — |
| Document Attachment | NO | — |

### Gap Analysis

**Missing Capabilities:**
1. Cannot track source URL
2. Cannot track source organization
3. Cannot track publication date
4. Cannot track reporting period
5. Cannot classify evidence type
6. Cannot identify certification body
7. Cannot assess evidence quality at 8-level granularity
8. Cannot track verification status
9. Cannot attach supporting documents
10. Cannot distinguish DOCUMENTED from VERIFIED

**Impact:** Cannot perform defensible audit because evidence provenance and quality cannot be assessed.

---

## EVIDENCE EXAMPLE 2: Renewable Energy

### Source Information

| Field | Value |
|-------|-------|
| **Evidence Title** | 100% Renewable Electricity in Spain |
| **Source Organization** | El Corte Inglés, S.A. |
| **Source URL** | https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/ |
| **Publication Date** | 2025 |
| **Reporting Period** | 2024-2025 |
| **Evidence Type** | Corporate Sustainability Report |
| **Requirement Addressed** | Energy management and decarbonization |
| **Exact Claim Supported** | "100% of the electricity used in Spain with guarantee of renewable origin" |
| **Evidence Quality** | DOCUMENTED |
| **Verification Status** | PENDING VERIFICATION (requires verification of "guarantee of renewable origin" mechanism) |
| **Notes** | Claim specifies "in Spain" only. Scope unclear (all operations or specific locations?). "Guarantee of renewable origin" mechanism not specified (PPA, GOs, on-site generation?). |

### What SAE Engine Can Capture

Only title, description, and DECLARED status.

### Gap Analysis

Cannot capture:
- Geographic scope limitation ("in Spain")
- Verification mechanism ("guarantee of renewable origin")
- Evidence quality assessment
- Verification status

**Critical Issue:** The application cannot distinguish between "claim made" and "claim verified." An auditor cannot determine if this evidence is sufficient without additional verification.

---

## EVIDENCE EXAMPLE 3: Sustainable Packaging

### Source Information

| Field | Value |
|-------|-------|
| **Evidence Title** | Sustainable Packaging Plan Progress |
| **Source Organization** | El Corte Inglés, S.A. |
| **Source URL** | https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/ |
| **Publication Date** | 2025 |
| **Reporting Period** | 2023-2025 |
| **Evidence Type** | Corporate Sustainability Report |
| **Requirement Addressed** | Circular economy, packaging waste |
| **Exact Claims Supported** | "100% of plastic packaging meets at least one of these criteria: reusable, recyclable or compostable" |
| | "33.5% recycled plastic content in packaging by 2025" (exceeding 20% target) |
| | "Annual 5% reduction in plastic footprint across supermarkets through to the end of 2026" |
| **Evidence Quality** | DOCUMENTED |
| **Verification Status** | PENDING VERIFICATION (requires verification of measurement methodology) |
| **Notes** | Multiple claims in single source. Each claim requires separate verification. Measurement methodology not specified. |

### What SAE Engine Can Capture

Only title, description, and DECLARED status.

### Gap Analysis

Cannot capture:
- Multiple distinct claims from single source
- Target vs. actual comparison
- Measurement methodology
- Verification status for each claim

**Critical Issue:** A single document contains multiple claims requiring separate verification. The application cannot model this complexity.

---

## EVIDENCE EXAMPLE 4: Food Waste Reduction

### Source Information

| Field | Value |
|-------|-------|
| **Evidence Title** | Food Waste Prevention and Redistribution |
| **Source Organization** | El Corte Inglés, S.A. |
| **Source URL** | https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/ |
| **Publication Date** | 2025 |
| **Reporting Period** | Cumulative (not specified) |
| **Evidence Type** | Corporate Sustainability Report |
| **Requirement Addressed** | Food waste management, circular economy |
| **Exact Claims Supported** | "Donating more than 5,208 million kilograms of food to social organisations and Food Banks" |
| | "Donating more than 890,000 kilograms of food unfit for human consumption to zoos and farms" |
| **Evidence Quality** | DOCUMENTED |
| **Verification Status** | PENDING VERIFICATION (requires verification of donation records, beneficiary confirmation) |
| **Notes** | Cumulative figure without time period. Unclear if this is annual or total since program inception. Requires clarification of reporting period. |

### What SAE Engine Can Capture

Only title, description, and DECLARED status.

### Gap Analysis

Cannot capture:
- Reporting period ambiguity
- Cumulative vs. annual distinction
- Beneficiary verification
- Measurement methodology

**Critical Issue:** The evidence lacks a clear reporting period. An auditor cannot assess whether this represents current performance or historical accumulation.

---

## EVIDENCE EXAMPLE 5: Sustainability Master Plan

### Source Information

| Field | Value |
|-------|-------|
| **Evidence Title** | Sustainability Master Plan 2025-2030 |
| **Source Organization** | El Corte Inglés, S.A. |
| **Source URL** | https://www.elcorteingles.es/informacioncorporativa/en/sustainability/sustainable-progress/ |
| **Publication Date** | 2025 |
| **Reporting Period** | 2025-2030 (forward-looking) |
| **Evidence Type** | Strategic Planning Document |
| **Requirement Addressed** | Sustainability governance, strategic planning |
| **Exact Claims Supported** | "Sustainability Master Plan 2025-2030 acts as the backbone of the sustainability strategy" |
| | "Three strategic pillars: E. Decarbonisation, S. Sustainable customer concept, G. Sustainability Governance" |
| **Evidence Quality** | DOCUMENTED (plan exists) |
| **Verification Status** | NOT VERIFIABLE (forward-looking commitments, not outcomes) |
| **Notes** | This is a strategic plan, not evidence of performance. Cannot verify if targets will be met. Distinguishing plans from achievements is critical. |

### What SAE Engine Can Capture

Only title, description, and DECLARED status.

### Gap Analysis

Cannot capture:
- Distinction between plans and achievements
- Forward-looking vs. historical evidence
- Target setting vs. target achievement
- Verification status for commitments

**Critical Issue:** The application cannot distinguish between "we plan to do X" and "we have achieved X." This is fundamental to audit evidence.

---

## EVIDENCE EXAMPLE 6: CSRD Compliance

### Source Information

| Field | Value |
|-------|-------|
| **Evidence Title** | CSRD Double Materiality Assessment |
| **Source Organization** | El Corte Inglés, S.A. |
| **Source URL** | https://www.elcorteingles.es/informacioncorporativa/en/sustainability/sustainable-progress/ |
| **Publication Date** | 2025 |
| **Reporting Period** | 2024-2025 |
| **Evidence Type** | Regulatory Compliance Documentation |
| **Requirement Addressed** | EU Corporate Sustainability Reporting Directive (CSRD) |
| **Exact Claims Supported** | "The Group conducts a materiality assessment in accordance with the CSRD Directive standards" |
| | "A 'double materiality' approach was used" |
| | "Four areas: PLANET, CUSTOMERS, COMPANY & SOCIETY, VALUE CHAIN" |
| **Evidence Quality** | DOCUMENTED |
| **Verification Status** | PENDING VERIFICATION (requires verification of CSRD compliance, assurance statement) |
| **Notes** | CSRD compliance requires independent assurance. Self-reported compliance insufficient. Requires verification of assurance report. |

### What SAE Engine Can Capture

Only title, description, and DECLARED status.

### Gap Analysis

Cannot capture:
- Regulatory framework reference (CSRD)
- Assurance requirement
- Independent verification status
- Double materiality methodology

**Critical Issue:** Regulatory compliance requires independent assurance. The application cannot track assurance requirements or verification status.

---

## EVIDENCE EXAMPLE 7: FSC Certification

### Source Information

| Field | Value |
|-------|-------|
| **Evidence Title** | FSC Certification — 100% Cellulose Household Products |
| **Source Organization** | El Corte Inglés, S.A. |
| **Source URL** | https://www.elcorteingles.es/informacioncorporativa/en/sustainability/sustainable-progress/ |
| **Publication Date** | 2025 |
| **Reporting Period** | 2024-2025 |
| **Evidence Type** | Certification Claim |
| **Requirement Addressed** | Sustainable sourcing, forestry |
| **Exact Claim Supported** | "FSC SEAL on 100% of our cellulose household products" |
| **Certification Body** | FSC (Forest Stewardship Council) |
| **Evidence Quality** | DOCUMENTED |
| **Verification Status** | PENDING VERIFICATION (requires FSC certificate verification) |
| **Notes** | Claim specifies "cellulose household products" only. Scope limitation important. FSC certificate number not provided. Requires verification of certificate validity and scope. |

### What SAE Engine Can Capture

Only title, description, and DECLARED status.

### Gap Analysis

Cannot capture:
- Certification body (FSC)
- Certificate number
- Certificate validity period
- Scope limitation ("cellulose household products")
- Verification status

**Critical Issue:** Certification claims require verification of certificate validity, scope, and expiration. The application cannot track this.

---

## EVIDENCE EXAMPLE 8: Climate Neutrality Target

### Source Information

| Field | Value |
|-------|-------|
| **Evidence Title** | Climate Neutrality by 2050 Commitment |
| **Source Organization** | El Corte Inglés, S.A. |
| **Source URL** | https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/ |
| **Publication Date** | 2025 |
| **Reporting Period** | Target year: 2050 |
| **Evidence Type** | Forward-looking Commitment |
| **Requirement Addressed** | Climate change, GHG emissions |
| **Exact Claim Supported** | "Achieve climate neutrality by 2050" |
| **Evidence Quality** | DOCUMENTED (commitment exists) |
| **Verification Status** | NOT VERIFIABLE (future target, not achievement) |
| **Notes** | This is a future target, not current performance. Cannot verify achievement until 2050. Requires tracking of interim milestones and progress. |

### What SAE Engine Can Capture

Only title, description, and DECLARED status.

### Gap Analysis

Cannot capture:
- Distinction between targets and achievements
- Target year (2050)
- Interim milestones
- Progress tracking
- Verification status for forward-looking claims

**Critical Issue:** The application cannot distinguish between "we commit to achieve X by 2050" and "we have achieved X." This is fundamental to audit evidence.

---

## SUMMARY: EVIDENCE CAPABILITY GAP

### What Real Audit Evidence Requires:

1. **Source tracking** — URL, organization, date, period
2. **Claim extraction** — Specific claims from documents
3. **Quality assessment** — DOCUMENTED vs VERIFIED vs INFERRED
4. **Verification status** — Pending, verified, rejected
5. **Scope limitations** — Geographic, temporal, categorical
6. **Certification tracking** — Body, certificate number, validity
7. **Assurance requirements** — Independent verification needed
8. **Forward-looking vs historical** — Plans vs achievements
9. **Multiple claims per source** — One document, many claims
10. **Provenance chain** — Who said what, when, where

### What SAE Engine Provides:

1. **Title** — YES
2. **Description** — YES
3. **Status** — YES (4 states only)
4. **Link to requirement** — YES (by ID)

### Gap: CRITICAL

The application cannot support defensible audit evidence management because it lacks:
- Source tracking (9 capabilities missing)
- Quality assessment (8-level model needed, 4 provided)
- Verification workflow (not implemented)
- Certification tracking (not implemented)
- Claim extraction (not implemented)
- Scope limitation tracking (not implemented)

**Conclusion:** The application cannot perform enterprise audit evidence management for real-world organizations like El Corte Inglés.

---

## APPENDIX E: WHAT A PROPER EVIDENCE CHAIN WOULD LOOK LIKE

### Example: Zero Waste Audit Control

```
REQUIREMENT:
  Title: Waste Management and Circular Economy
  Criterion: Organization demonstrates effective waste management with >90% recovery
  Source: EU Waste Framework Directive, CSRD
  Applicability: APPLICABLE (retail sector, significant waste generation)

EVIDENCE:
  Title: Zero Waste Certification — All Spanish and Portuguese Locations
  Source: El Corte Inglés Sustainability Report 2025
  URL: https://www.elcorteingles.es/informacioncorporativa/en/sustainability/commitment-to-the-environment/
  Date: 2025
  Period: 2024-2025
  Type: Corporate Report
  Claim: "94.8% waste recovery and reuse"
  Quality: DOCUMENTED
  Verification: PENDING (requires AENOR certificate verification)
  Certification: AENOR Zero Waste (certificate number needed)
  Scope: 330+ stores and platforms in Spain and Portugal

EVIDENCE ASSESSMENT:
  Claim supported: YES (claim exists in source)
  Claim verified: PENDING (requires independent verification)
  Evidence sufficient: PENDING (requires certificate verification)
  Scope adequate: YES (covers all major operations)
  Period current: YES (2024-2025)

FINDING:
  ID: FIND-001
  Observation: Organization reports 94.8% waste recovery with Zero Waste certification
  Status: PENDING VERIFICATION
  Severity: N/A (pending verification)
  Risk: LOW (if verified)
  Evidence: Zero Waste Certification report
  Required action: Verify AENOR certificate validity and scope

GAP:
  Type: PENDING VERIFICATION
  Description: Evidence documented but not independently verified
  Status: OPEN
  Responsible: Environmental Compliance Manager (TEST ROLE)
  Due date: 2026-06-30

CORRECTIVE ACTION:
  Action: Obtain and verify AENOR Zero Waste certificate
  Responsible: Environmental Compliance Manager
  Due date: 2026-06-30
  Status: PROPOSED
  Verification: PENDING

KPI:
  Name: Waste Recovery Rate
  Target: >90%
  Actual: 94.8% (reported)
  Status: PENDING VERIFICATION
  Trend: IMPROVING (if verified)

AUDIT DECISION:
  Status: PENDING VERIFICATION
  Rationale: Evidence documented but requires independent verification
  Cannot conclude: PASS (not verified)
  Cannot conclude: FAIL (evidence exists)
  Appropriate status: PENDING VERIFICATION
```

### What SAE Engine Can Model:

```
REQUIREMENT:
  Title: Demo Requirement — MVP Vertical Slice
  Applicability: PENDING
  isPlaceholder: true

EVIDENCE:
  Title: Zero Waste Certification
  Description: 94.8% waste recovery
  Status: DECLARED

EVALUATION:
  Result: PENDING (because requirement applicability is PENDING)

GAP:
  None (because evaluation is PENDING)

RESULT CARD:
  Result: PENDING
  Unimplemented aspects: [list of missing capabilities]
```

### Gap Analysis:

The application cannot model:
- Real requirements with criteria and source references
- Evidence with full metadata (URL, date, quality, verification)
- Evidence assessment workflow
- Findings with observations and severity
- Gaps with responsible parties and due dates
- Corrective actions with verification
- KPIs with targets and actuals
- Audit decisions with rationale

**Conclusion:** The application is fundamentally mismatched to enterprise audit requirements.

---

**END OF APPENDIX D & E**
