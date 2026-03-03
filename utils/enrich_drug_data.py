#!/usr/bin/env python3
"""
Enrich drug_data.json with therapeutic class, indications, and missing
pharmacological classifications using the Anthropic Claude API.

Adds two new fields to every drug:
  - class: 1-3 broad therapeutic categories
  - indications: 1-5 short keyword indications

Also fills in empty pharm_class_epc and pharm_class_moa values.

Usage:
    export ANTHROPIC_API_KEY="sk-ant-..."
    python3 enrich_drug_data.py

The script is idempotent: drugs that already have `class` and `indications`
(and non-empty pharm_class_epc / pharm_class_moa) are skipped.  Progress is
saved after every batch so a crash does not lose earlier work.
"""

import json
import os
import sys
import time

import anthropic

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DRUG_DATA_FILE = os.path.join(SCRIPT_DIR, "drug_data.json")

MODEL = "claude-haiku-4-5-20251001"
BATCH_SIZE = 50
MAX_RETRIES = 5
INITIAL_RETRY_DELAY = 2  # seconds


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_drug_data() -> list[dict]:
    """Load the current drug_data.json."""
    with open(DRUG_DATA_FILE, "r") as f:
        return json.load(f)


def save_drug_data(drugs: list[dict]) -> None:
    """Write drug_data.json (atomic-ish: write tmp then rename)."""
    tmp_path = DRUG_DATA_FILE + ".tmp"
    with open(tmp_path, "w") as f:
        json.dump(drugs, f, indent=2)
    os.replace(tmp_path, DRUG_DATA_FILE)


def drug_needs_enrichment(drug: dict) -> bool:
    """Return True if the drug still needs any enrichment."""
    missing_new_fields = "class" not in drug or "indications" not in drug
    missing_epc = not drug.get("pharm_class_epc")
    missing_moa = not drug.get("pharm_class_moa")
    return missing_new_fields or missing_epc or missing_moa


def build_prompt(drugs_batch: list[dict]) -> str:
    """Build the prompt for a batch of drugs.

    The prompt asks Claude to return a JSON array with enrichment data for
    each drug in the batch.
    """
    drug_descriptions = []
    for drug in drugs_batch:
        desc = {
            "name": drug["name"],
            "needs_epc": not drug.get("pharm_class_epc"),
            "needs_moa": not drug.get("pharm_class_moa"),
        }
        # Include existing fields for context so Claude can make better choices
        if drug.get("product_type"):
            desc["product_type"] = drug["product_type"]
        if drug.get("route"):
            desc["route"] = drug["route"]
        if drug.get("dosage_form"):
            desc["dosage_form"] = drug["dosage_form"]
        if drug.get("pharm_class_epc"):
            desc["existing_epc"] = drug["pharm_class_epc"]
        if drug.get("pharm_class_moa"):
            desc["existing_moa"] = drug["pharm_class_moa"]
        drug_descriptions.append(desc)

    drugs_json = json.dumps(drug_descriptions, indent=2)

    return f"""You are a pharmacology expert. For each drug below, provide:

1. **class**: 1-3 broad therapeutic categories (e.g., "Analgesic", "Antibiotic", "Antihypertensive").
2. **indications**: 1-5 short keyword indications (e.g., "Chronic Pain", "Hypertension", "Type 2 Diabetes").
3. **pharm_class_epc**: ONLY if `needs_epc` is true, provide the Established Pharmacologic Class in FDA `[EPC]` suffix format (e.g., ["Opioid Agonist [EPC]"]). Return an array with 1-2 entries. If `needs_epc` is false, omit this field.
4. **pharm_class_moa**: ONLY if `needs_moa` is true, provide the Mechanism of Action in FDA `[MoA]` suffix format (e.g., ["Full Opioid Agonists [MoA]"]). Return an array with 1-2 entries. If `needs_moa` is false, omit this field.

Special cases for non-pharmaceutical substances:
- Elements (e.g., nitrogen, helium, xenon, copper): use class ["Element"] or ["Medical Gas"] as appropriate, and indications like ["Medical Use"].
- Simple substances (e.g., air, water, oxygen): use class ["Medical Gas"] or ["Medical Supply"] as appropriate, and indications like ["Medical Use", "Respiratory Support"].

Return ONLY a JSON array with one object per drug. Each object must have "name", "class", and "indications". Include "pharm_class_epc" and "pharm_class_moa" only when the corresponding `needs_epc` or `needs_moa` is true.

Here are the drugs:

{drugs_json}"""


# ---------------------------------------------------------------------------
# API interaction
# ---------------------------------------------------------------------------

def call_claude(client: anthropic.Anthropic, prompt: str) -> list[dict]:
    """Call the Claude API and parse the JSON array response.

    Uses exponential backoff on retryable errors.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=8192,
                messages=[{"role": "user", "content": prompt}],
                system="You are a pharmacology data assistant. Always respond with valid JSON only, no markdown fences, no commentary.",
            )

            # Extract text content from the response
            text = ""
            for block in response.content:
                if block.type == "text":
                    text += block.text

            # Strip markdown fences if present despite instructions
            text = text.strip()
            if text.startswith("```"):
                # Remove opening fence (with optional language tag)
                first_newline = text.index("\n")
                text = text[first_newline + 1:]
            if text.endswith("```"):
                text = text[: -len("```")]
            text = text.strip()

            result = json.loads(text)

            if not isinstance(result, list):
                raise ValueError(f"Expected a JSON array, got {type(result).__name__}")

            return result

        except anthropic.RateLimitError:
            delay = INITIAL_RETRY_DELAY * (2 ** (attempt - 1))
            print(f"  Rate limited. Retrying in {delay}s (attempt {attempt}/{MAX_RETRIES})...")
            time.sleep(delay)

        except anthropic.APIStatusError as e:
            if e.status_code >= 500:
                delay = INITIAL_RETRY_DELAY * (2 ** (attempt - 1))
                print(f"  Server error ({e.status_code}). Retrying in {delay}s (attempt {attempt}/{MAX_RETRIES})...")
                time.sleep(delay)
            else:
                raise

        except (json.JSONDecodeError, ValueError) as e:
            if attempt < MAX_RETRIES:
                delay = INITIAL_RETRY_DELAY * (2 ** (attempt - 1))
                print(f"  Parse error: {e}. Retrying in {delay}s (attempt {attempt}/{MAX_RETRIES})...")
                time.sleep(delay)
            else:
                raise

    raise RuntimeError(f"Failed after {MAX_RETRIES} attempts")


def _ensure_list(value) -> list:
    """Coerce a value to a list (handles LLM returning a string instead of array)."""
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [value]
    return []


def merge_enrichment(drug: dict, enrichment: dict) -> dict:
    """Merge enrichment data into a drug dict, preserving existing values."""
    drug["class"] = _ensure_list(enrichment.get("class", []))
    drug["indications"] = _ensure_list(enrichment.get("indications", []))

    # Only fill in pharm_class_epc if currently empty
    if not drug.get("pharm_class_epc") and enrichment.get("pharm_class_epc"):
        drug["pharm_class_epc"] = enrichment["pharm_class_epc"]

    # Only fill in pharm_class_moa if currently empty
    if not drug.get("pharm_class_moa") and enrichment.get("pharm_class_moa"):
        drug["pharm_class_moa"] = enrichment["pharm_class_moa"]

    return drug


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY environment variable is not set.")
        sys.exit(1)

    client = anthropic.Anthropic()

    drugs = load_drug_data()
    print(f"Loaded {len(drugs)} drugs from {DRUG_DATA_FILE}")

    # Build index for fast lookup by name
    drug_index: dict[str, int] = {d["name"]: i for i, d in enumerate(drugs)}

    # Identify drugs that need enrichment
    to_enrich = [d for d in drugs if drug_needs_enrichment(d)]
    print(f"{len(to_enrich)} drugs need enrichment, {len(drugs) - len(to_enrich)} already complete")

    if not to_enrich:
        print("Nothing to do. All drugs are already enriched.")
        return

    # Process in batches
    total_batches = (len(to_enrich) + BATCH_SIZE - 1) // BATCH_SIZE

    for batch_num in range(total_batches):
        start = batch_num * BATCH_SIZE
        end = min(start + BATCH_SIZE, len(to_enrich))
        batch = to_enrich[start:end]

        print(f"\nProcessing batch {batch_num + 1}/{total_batches} ({len(batch)} drugs)...")
        drug_names = [d["name"] for d in batch]
        print(f"  Drugs: {', '.join(drug_names[:5])}{'...' if len(drug_names) > 5 else ''}")

        prompt = build_prompt(batch)
        enrichments = call_claude(client, prompt)

        # Build a lookup from the response by drug name
        enrichment_by_name: dict[str, dict] = {}
        for item in enrichments:
            name = item.get("name", "").strip().lower()
            if name:
                enrichment_by_name[name] = item

        # Merge results back into the master drug list
        merged_count = 0
        missing_count = 0
        for drug in batch:
            enrichment = enrichment_by_name.get(drug["name"].strip().lower())
            if enrichment:
                idx = drug_index[drug["name"]]
                drugs[idx] = merge_enrichment(drugs[idx], enrichment)
                merged_count += 1
            else:
                print(f"  WARNING: No enrichment returned for '{drug['name']}'")
                missing_count += 1

        print(f"  Merged {merged_count} drugs, {missing_count} missing from response")

        # Save progress after each batch
        save_drug_data(drugs)
        print(f"  Progress saved to {DRUG_DATA_FILE}")

        # Brief pause between batches to avoid rate limits
        if batch_num < total_batches - 1:
            time.sleep(1)

    # Final summary
    still_need = sum(1 for d in drugs if drug_needs_enrichment(d))
    print(f"\nDone! {still_need} drugs still need enrichment (if any, re-run the script).")


if __name__ == "__main__":
    main()
