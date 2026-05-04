'use strict';

/**
 * Extra smoke helpers for CodeRabbit → Actions → ClickUp validation (pair with reviewFlowSmoke.js).
 */

function demoHardcodedUiOrigin(pathname) {
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
