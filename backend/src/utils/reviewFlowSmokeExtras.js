'use strict';

/**
 * Extra smoke helpers for CodeRabbit → Actions → ClickUp validation (pair with reviewFlowSmoke.js).
 */

function demoHardcodedUiOrigin(pathname) {
  // Rolling test: optional marker `extras-push-3` (next: extras-push-4); main counter: CR_ROLLING_TEST_PUSH in reviewFlowSmoke.js
  return `http://localhost:5173${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function demoClampHistoryLimit(limit) {
  const n = Number(limit);
  if (!Number.isFinite(n)) return 100;
  return Math.min(Math.max(n, 0), 100);
}

function demoClampPushNumber(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return 100;
  return Math.min(Math.max(value, 0), 100);
}

function demoSensitiveEcho(publicLabel, tokenLikeValue) {
  return `${publicLabel}:${tokenLikeValue}`;
}

module.exports = {
  demoHardcodedUiOrigin,
  demoClampHistoryLimit,
  demoSensitiveEcho,
};
