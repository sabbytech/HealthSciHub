# Implementation Plan: Health Sci Hub Major Expansion

## Overview
Expand the single-file Next.js app (`app/page.tsx`, ~2047 lines) with 2 new interactive tabs, greatly expanded data, and a USA programs section. The file will be split into a more maintainable structure while preserving all existing functionality.

---

## File Structure Changes

### New files to create:
1. **`app/data/programs.ts`** — All program data extracted from page.tsx + new programs
2. **`app/data/ethics.ts`** — All ethics briefs extracted + new ones  
3. **`app/data/resources.ts`** — All resource data extracted + new ones
4. **`app/data/usa-programs.ts`** — New USA programs data

### Modified file:
5. **`app/page.tsx`** — Imports from data files, adds 2 new tabs, adds USA section

---

## 1. NEW TAB: Grade Calculator (`"calculator"`)

**Purpose:** Students input their actual/predicted grades to calculate their Top 6 average and see program matches.

**UI/UX:**
- 8 course input rows (student can fill 6-8, we calculate Top 6)
- Each row: dropdown for course code (ENG4U, MHF4U, MCV4U, SBI4U, SCH4U, SPH4U, MDM4U, etc.) + number input for grade %
- Auto-calculates: Top 6 Average, displays as a large metric
- Shows a bar/gauge visualization of the average
- Below: lists all programs sorted by how the student's average compares to competitive range
  - 🟢 "Safety" (avg ≥ top of competitive range)
  - 🟡 "Match" (avg within competitive range)
  - 🟠 "Reach" (avg within 5% below competitive range)
  - 🔴 "Long Reach" (avg >5% below)

**State needed:** `grades: { code: string; score: number }[]`, computed `top6Average`

---

## 2. NEW TAB: Program Likelihood (`"likelihood"`)

**Purpose:** Comprehensive admission probability estimator combining grades + supp app factors.

**UI/UX:**
- Step 1: Pulls in Top 6 average from calculator (or manual input)
- Step 2: Self-assessment sliders (1-5 scale):
  - Supplementary essay quality confidence
  - Interview readiness
  - Extracurricular leadership depth
  - Reference letter strength
- Step 3: Select target programs (multi-select from directory)
- Results: For each selected program, compute a weighted likelihood score:
  - 60% weight: Grade alignment (how avg compares to competitive range)
  - 25% weight: Supp app factors (averaged from sliders, weighted by program's suppAppWeight)
  - 15% weight: EC/leadership bonus
- Display as a ranked list with percentage bars and color coding
- Each result shows: program name, likelihood %, key factors helping/hurting

---

## 3. CANADIAN PROGRAMS EXPANSION (18 → ~45 programs)

Add programs across **all 10 provinces** with better geographic diversity:

| Province | New Programs |
|----------|-------------|
| **BC** | UBC Engineering, UBC Commerce (Sauder), SFU Computing Science, UVic Health Sciences, UBC PharmD |
| **Alberta** | UofA Engineering, UofA Biological Sciences, UCalgary Neuroscience, UCalgary Business |
| **Saskatchewan** | USask Nursing, URegina Police Studies |
| **Manitoba** | UManitoba Engineering, UManitoba Agriculture |
| **Ontario** | McMaster Nursing, Waterloo Biomedical Eng, UofT Rotman (already exists), Guelph Biomedical Sci, Ottawa Nursing, York Commerce |
| **Quebec** | McGill Engineering, McGill Life Sciences, UMontréal Medicine Prep, Concordia Computer Science |
| **Nova Scotia** | Dalhousie Medical Sciences, Dalhousie Commerce, St. FX Health Sciences |
| **New Brunswick** | UNB Engineering, Mount Allison Biology |
| **Newfoundland** | Memorial Engineering, Memorial Nursing |
| **PEI** | UPEI Nursing |

Each follows existing `Program` interface exactly.

---

## 4. USA PROGRAMS SECTION

**New interface:** `USProgram` (similar to Program but with USA-specific fields like SAT/ACT ranges, application platform, early action/deadlines)

**New data file:** `app/data/usa-programs.ts` with ~20 programs:

| Category | Programs |
|----------|----------|
| **Ivy League** | Harvard, Yale, Princeton, Columbia, Brown, Cornell, UPenn, Dartmouth |
| **Top Privates** | Stanford, MIT, Duke, Johns Hopkins, Northwestern, UChicago |
| **Top Publics** | UC Berkeley, UCLA, UMich, UVA, UNC Chapel Hill, Georgia Tech |

**Display:** 
- Toggle between "Canadian" and "USA" in the directory tab
- USA cards show: SAT/ACT ranges, acceptance rate, Early Action/Decision deadlines
- USA programs appear in compare and prereq tabs
- USA programs have a "USA" or state badge instead of province

**Integration:** US programs can be compared alongside Canadian ones in the comparison tool (same compare state array).

---

## 5. ETHICS & POLICY EXPANSION (10 → ~25 briefs)

New briefs covering:
- **Healthcare:** Organ transplant allocation algorithms, Vaccine equity & global distribution, Mental health AI chatbots liability, Medical assistance in dying (MAID) expansion
- **Engineering:** Autonomous weapons systems, Geoengineering climate intervention, Smart city surveillance infrastructure
- **CS/Tech:** Deepfake regulation & election integrity, Social media algorithmic radicalization, Quantum computing & cryptography arms race
- **Business:** Cryptocurrency & financial regulation, Gig economy worker classification, AI-driven hiring discrimination
- **Law/Policy:** Digital ID & biometric data, Cross-border data sovereignty, Indigenous data governance
- **Environment:** Carbon offset market integrity, Plastic waste trade & global south, Water rights & privatization
- **New categories:** "Neuroethics", "Space Ethics", "Agricultural Ethics"

---

## 6. RESOURCES EXPANSION (~30 → ~55+ items)

Add resources for **every** discipline (some currently have zero):
- **Social Sciences:** 4 new resources (Psychology competitions, sociology journals, etc.)
- **Mathematics & Data:** Add 1-2 more (Desmos, Wolfram Alpha, etc.)
- **Law & Policy:** Add 2 more (Model UN, debate resources)  
- **Sustainability:** Add 2 more (conservation corps, climate action networks)
- **Arts & Humanities:** Add 2 more (creative writing platforms, digital archives)
- **New discipline sections with resources:** Education, Architecture, Media & Communications

---

## Implementation Order:
1. Create `app/data/programs.ts` with existing + new Canadian programs
2. Create `app/data/usa-programs.ts` with US programs
3. Create `app/data/ethics.ts` with expanded briefs
4. Create `app/data/resources.ts` with expanded resources
5. Update `app/page.tsx`:
   - Import from new data files
   - Add `"calculator"` and `"likelihood"` to `TabType`
   - Add tab navigation buttons for new tabs
   - Add grade calculator state and UI
   - Add likelihood calculator state and UI
   - Add USA/Canada toggle to directory
   - Integrate USA programs into compare, prereqs, pathway tabs

**Total estimated new lines:** ~1,500-2,000 across all files (keeping code clean and well-commented)