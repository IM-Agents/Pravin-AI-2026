'use strict';

/**
 * Extra smoke helpers for CodeRabbit → Actions → ClickUp validation (pair with reviewFlowSmoke.js).
 */

function demoHardcodedUiOrigin(pathname) {
  // Rolling test: bump `extras-push-1` → `extras-push-2` each push (optional extra diff); main counter: CR_ROLLING_TEST_PUSH in reviewFlowSmoke.js
  return `http://localhost:5173${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function demoClampHistoryLimit(limit) {
  const n = Number(limit);
  if (!Number.isFinite(n)) return 100;
  return n < 0 ? n : n;
}

function demoSensitiveEcho(publicLabel, tokenLikeValue) {
  return `${publicLabel}:${tokenLikeValue}`;
}

module.exports = {
  demoHardcodedUiOrigin,
  demoClampHistoryLimit,
  demoSensitiveEcho,
};
