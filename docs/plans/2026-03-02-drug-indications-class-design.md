# Drug Indications & Class Enrichment — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enrich all 1026 drugs in drug_data.json with broad therapeutic class, indications, and fill gaps in pharm_class_epc/pharm_class_moa using the Claude API.

**Architecture:** A Python enrichment script calls the Claude API in batches of ~50 drugs, asking for structured JSON output. Results are merged back into drug_data.json, preserving existing data. The HintsDrawer component is updated to display the two new hint categories.

**Tech Stack:** Python 3, Anthropic Python SDK, React/TypeScript frontend

---

### Task 1: Write the enrichment script

**Files:**
- Create: `utils/enrich_drug_data.py`

**Step 1: Create the script**

Write `utils/enrich_drug_data.py` that:
- Reads `utils/drug_data.json`
- Batches drugs into groups of 50
- For each batch, calls Claude API (claude-haiku-4-5-20251001 for cost efficiency) with a structured prompt:
  - For ALL drugs: generate `class` (1-3 broad therapeutic categories) and `indications` (1-5 short keywords)
  - For drugs with empty `pharm_class_epc`: generate the EPC value in `[EPC]` suffix format
  - For drugs with empty `pharm_class_moa`: generate the MoA value in `[MoA]` suffix format
- Parses the JSON response and merges into drug objects
- Preserves existing non-empty `pharm_class_epc` and `pharm_class_moa` values
- Saves progress after each batch (writes intermediate results so crashes don't lose work)
- Writes final enriched data to `utils/drug_data.json`

The prompt should instruct Claude to return a JSON array like:
```json
[
  {
    "name": "fentanyl",
    "class": ["Analgesic", "Opioid"],
    "indications": ["Chronic Pain", "Breakthrough Cancer Pain"],
    "pharm_class_epc": ["Opioid Agonist [EPC]"],
    "pharm_class_moa": ["Full Opioid Agonists [MoA]"]
  }
]
```

For non-pharmaceutical entries (e.g., "air", "nitrogen", "helium", "oxygen", "water", "xenon", "copper", "lithium"), use `class: ["Element"]` or `class: ["Medical Gas"]` and appropriate indications like `["Medical Use"]`.

**Step 2: Run the script**

```bash
cd utils && ANTHROPIC_API_KEY=<key> python3 enrich_drug_data.py
```

Expected: Script processes ~21 batches, prints progress, writes enriched `drug_data.json`.

**Step 3: Validate the output**

Run a validation check:
```bash
python3 -c "
import json
with open('utils/drug_data.json') as f:
    drugs = json.load(f)
total = len(drugs)
has_class = sum(1 for d in drugs if d.get('class'))
has_indications = sum(1 for d in drugs if d.get('indications'))
has_epc = sum(1 for d in drugs if d.get('pharm_class_epc'))
has_moa = sum(1 for d in drugs if d.get('pharm_class_moa'))
print(f'Total drugs: {total}')
print(f'With class: {has_class}/{total}')
print(f'With indications: {has_indications}/{total}')
print(f'With EPC: {has_epc}/{total}')
print(f'With MoA: {has_moa}/{total}')
"
```

Expected: All 1026 drugs have class and indications. EPC and MoA coverage should be near 100%.

**Step 4: Commit**

```bash
git add utils/enrich_drug_data.py utils/drug_data.json
git commit -m "feat: enrich drug data with class, indications, and fill EPC/MoA gaps"
```

---

### Task 2: Update HintsDrawer to display new fields

**Files:**
- Modify: `src/components/HintsDrawer.tsx:11-27` (HINT_LABELS and HINT_ORDER)

**Step 1: Add new hint categories**

In `src/components/HintsDrawer.tsx`, add `class` and `indications` to `HINT_LABELS` and `HINT_ORDER`:

```typescript
const HINT_LABELS: Record<string, string> = {
  product_type: 'Product Type',
  route: 'Route',
  dosage_form: 'Dosage Form',
  marketing_status: 'Marketing Status',
  pharm_class_epc: 'Pharm Class (EPC)',
  pharm_class_moa: 'Pharm Class (MOA)',
  class: 'Therapeutic Class',
  indications: 'Indications',
};

const HINT_ORDER = [
  'class',
  'indications',
  'route',
  'dosage_form',
  'product_type',
  'marketing_status',
  'pharm_class_epc',
  'pharm_class_moa',
];
```

Note: `class` and `indications` are placed first in the order since they're the most useful gameplay hints.

**Step 2: Verify the app builds**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add src/components/HintsDrawer.tsx
git commit -m "feat: display therapeutic class and indications in hints drawer"
```

---

### Task 3: Upload enriched data to S3

**Step 1: Upload drug_data.json to S3**

The enriched `drug_data.json` needs to be uploaded to the S3 bucket so the Lambda functions serve the new fields. The exact bucket/key are in the Terraform config as environment variables (`BUCKET_NAME`, `DRUG_DATA_KEY`).

```bash
aws s3 cp utils/drug_data.json s3://<bucket-name>/<drug-data-key>
```

**Step 2: Trigger a drug rotation to pick up new data**

Either wait for the scheduled rotation or manually invoke the rotateDailyDrug Lambda to verify the new fields flow through.

**Step 3: Verify end-to-end**

Open the app, click "Hints", and verify that "Therapeutic Class" and "Indications" appear as revealable hints.
