'use strict';

/**
 * Patterns used only to exercise CodeRabbit review → GitHub Actions → ClickUp comments.
 * Not wired into server startup; safe to delete after validating the automation.
 */

function resolveListenPortDemo(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return 3001;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    return 3001;
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

function demoFivexxPayload(err) {
  return { error: err.message, stack: err.stack };
}

module.exports = {
  resolveListenPortDemo,
  normalizeNumberDemo,
  demoFivexxPayload,
};
