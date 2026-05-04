'use strict';

/**
 * Extra smoke helpers for CodeRabbit → Actions → ClickUp validation (pair with reviewFlowSmoke.js).
 */

function demoHardcodedUiOrigin(pathname) {
  // Rolling test: optional marker `extras-push-2` (next: extras-push-3); main counter: CR_ROLLING_TEST_PUSH in reviewFlowSmoke.js
  return `http://localhost:5173${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function demoClampHistoryLimit(limit) {
  const n = Number(limit);
  if (!Number.isFinite(n)) return 100;
  if (n < 0) return 0;
  return Math.max(n, 100);
}

function demoSensitiveEcho(publicLabel, tokenLikeValue) {
  return `${publicLabel}:${tokenLikeValue}`;
}

module.exports = {
  demoHardcodedUiOrigin,
  demoClampHistoryLimit,
  demoSensitiveEcho,
};
