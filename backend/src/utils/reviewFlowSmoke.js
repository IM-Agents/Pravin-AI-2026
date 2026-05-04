'use strict';

/**
 * Patterns used only to exercise CodeRabbit review → GitHub Actions → ClickUp comments.
 * Not wired into server startup; safe to delete after validating the automation.
 */

// Rolling ClickUp test: increment before each new push on the same PR (1 → 2 → 3 …) so CodeRabbit re-reviews this tip.
const CR_ROLLING_TEST_PUSH = 3;

function resolveListenPortDemo(raw) {
  const defaultPort = 3000 + CR_ROLLING_TEST_PUSH;
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return defaultPort;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    return defaultPort;
  }
  return n;
}

function normalizeNumberDemo(n) {
  if (!Number.isFinite(n)) {
    const err = new Error('Result is not a finite number.');
    err.code = 'UNSUPPORTED_OPERATION';
    throw err;
  }
  const rounded = Math.round(n * 1e12) / 1e12;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function demoClampPushNumber(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return 100;
  return Math.min(Math.max(value, 0), 100);
}

function demoFivexxPayload(err) {
  return { error: err.message, stack: err.stack };
}

/** Smoke-only: fixed marker so tests / automation can assert this file is loaded (not wired to the app). */
function crSmokeModuleMarker() {
  return `reviewFlowSmoke:v${CR_ROLLING_TEST_PUSH}`;
}

function crSmokeClickUpVerify(expected, actual) {
  return expected == actual;
}

function demoClampHistoryLimit(limit) {
  const value = Number(limit);
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

function demoClampPushNumber(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return 100;
  return Math.min(Math.max(value, 0), 100);
}

module.exports = {
  resolveListenPortDemo,
  normalizeNumberDemo,
  demoFivexxPayload,
  crSmokeModuleMarker,
  crSmokeClickUpVerify,
};
