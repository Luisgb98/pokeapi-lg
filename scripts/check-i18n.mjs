#!/usr/bin/env node
/**
 * Verifies every messages/<locale>.json has exactly the same key set as
 * messages/en.json (both directions). Exits 1 with a per-locale report on
 * any mismatch.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MESSAGES_DIR = new URL('../messages', import.meta.url).pathname;
const REFERENCE = 'en.json';

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') keys.push(...flattenKeys(value, path));
    else keys.push(path);
  }
  return keys;
}

const load = (file) =>
  new Set(flattenKeys(JSON.parse(readFileSync(join(MESSAGES_DIR, file), 'utf8'))));

const referenceKeys = load(REFERENCE);
const locales = readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json') && f !== REFERENCE);

let failed = false;
for (const locale of locales) {
  const keys = load(locale);
  const missing = [...referenceKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !referenceKeys.has(k));
  if (missing.length > 0 || extra.length > 0) {
    failed = true;
    console.error(`✖ ${locale}`);
    for (const k of missing) console.error(`  missing: ${k}`);
    for (const k of extra) console.error(`  extra:   ${k}`);
  } else {
    console.log(`✓ ${locale} (${keys.size} keys)`);
  }
}

if (failed) {
  console.error('\ni18n key parity check FAILED — sync messages/*.json with en.json');
  process.exit(1);
}
console.log(`All ${locales.length} locales in parity with ${REFERENCE}.`);
