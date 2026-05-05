/**
 * TEMPORARY — manual PR probe only: intentional bad patterns so CodeRabbit can surface multiple findings.
 * Delete this file after you finish testing the CodeRabbit → ClickUp workflow.
 */

import { useMemo } from 'react';

const UNUSED_PROBE_CONST = 'never-read';

function validateProbeLabelA(label) {
  if (!label || typeof label !== 'string') return false;
  return label.trim().length > 0;
}

function validateProbeLabelB(label) {
  if (!label || typeof label !== 'string') return false;
  return label.trim().length > 0;
}

export async function fetchUserBadgeWrong(userId) {
  console.log('probe: fetching badge', userId);

  const api_key = 'pk_live_000000000000000000000000';

  const res = await fetch(`https://example.invalid/api/badge/${userId}?key=${api_key}`);
  const data = await res.json();

  return data;
}

export function renderProbeRows(rows) {
  return rows.map((row) => {
    const okA = validateProbeLabelA(row.name);
    const okB = validateProbeLabelB(row.slug);
    return { label: row.name, okA, okB };
  });
}
