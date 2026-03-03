#!/usr/bin/env python3
"""
Build drug_data.json from raw FDA drug data.

Replaces parse_list.js — reads the openFDA drug database, filters to drugs
suitable for the game (<=14 chars, alpha-only, from openfda.generic_name),
and enriches each with hint attributes.

Usage: python3 build_drug_data.py
"""

import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DATA_FILE = os.path.join(SCRIPT_DIR, "drug-drugsfda-0001-of-0001.json")
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "drug_data.json")

HINT_FIELDS = [
    "product_type",
    "route",
    "dosage_form",
    "marketing_status",
    "pharm_class_epc",
    "pharm_class_moa",
]


def extract_hints(result):
    """Extract hint field values from a single FDA result record."""
    hints = {field: set() for field in HINT_FIELDS}
    openfda = result.get("openfda", {})

    for val in openfda.get("product_type", []):
        hints["product_type"].add(val)
    for val in openfda.get("route", []):
        hints["route"].add(val)
    for val in openfda.get("pharm_class_epc", []):
        hints["pharm_class_epc"].add(val)
    for val in openfda.get("pharm_class_moa", []):
        hints["pharm_class_moa"].add(val)

    for product in result.get("products", []):
        if product.get("route"):
            hints["route"].add(product["route"])
        if product.get("dosage_form"):
            hints["dosage_form"].add(product["dosage_form"])
        if product.get("marketing_status"):
            hints["marketing_status"].add(product["marketing_status"])

    return hints


def main():
    print(f"Reading {RAW_DATA_FILE}...")
    with open(RAW_DATA_FILE, "r") as f:
        data = json.load(f)

    results = data["results"]
    print(f"Loaded {len(results)} FDA records")

    # Index records by lowercase generic name
    records_by_name = {}
    for result in results:
        generic_names = result.get("openfda", {}).get("generic_name", [])
        if not generic_names:
            continue
        name = generic_names[0].strip().lower()
        if name not in records_by_name:
            records_by_name[name] = []
        records_by_name[name].append(result)

    # Filter and build drug objects (same criteria as parse_list.js)
    drugs = []
    seen = set()

    for result in results:
        generic_names = result.get("openfda", {}).get("generic_name", [])
        if not generic_names:
            continue

        raw_name = generic_names[0]
        if not raw_name or len(raw_name) > 14:
            continue
        if not re.match(r"^[A-Za-z]+$", raw_name):
            continue

        name = raw_name.strip().lower()
        if name in seen:
            continue
        seen.add(name)

        # Aggregate hints across all records for this drug
        merged_hints = {field: set() for field in HINT_FIELDS}
        for record in records_by_name.get(name, []):
            record_hints = extract_hints(record)
            for field in HINT_FIELDS:
                merged_hints[field].update(record_hints[field])

        drug_obj = {"name": name}
        for field in HINT_FIELDS:
            drug_obj[field] = sorted(merged_hints[field])

        drugs.append(drug_obj)

    print(f"Built {len(drugs)} drug entries")

    # Write drug_data.json
    with open(OUTPUT_FILE, "w") as f:
        json.dump(drugs, f, indent=2)
    print(f"Wrote {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
