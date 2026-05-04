---
description: Performance testing — load, stress, soak, benchmarks, budgets, and observability for tests.
globs: "**/*.{bench,benchmark,load,perf}.{js,mjs,cjs,ts,tsx,jsx,yml,yaml}"
alwaysApply: false
---

# Performance testing

Use when authoring or reviewing **load scripts**, **benchmarks**, **performance test configs**, or **CI performance budgets**. This complements the general **`performance`** rule (optimize application code) and **`testing`** (correctness).

If your repo keeps k6/Artillery/Gatling files under other names or folders, align the **`globs`** in this rule’s frontmatter with your layout.

---

## 1. Goals and test types

- **Load**: expected traffic level — validates **latency** and **throughput** under normal assumptions.
- **Stress**: ramp beyond normal — finds **breaking point**, **queueing**, **error rates**.
- **Spike**: sudden bursts — validates **autoscaling**, **cold start**, **circuit breakers**.
- **Soak / endurance**: sustained load — finds **memory leaks**, **connection pool** exhaustion, **disk** growth.
- **Benchmarks**: micro-benchmarks for **hot functions** (keep **stable** inputs and environment).

Pick **one primary question** per scenario; avoid a single script that mixes unrelated goals.

---

## 2. Environments and safety

- **Never** point load tests at **production** without an explicit, approved process (separate stack, traffic limits, windows).
- Prefer **staging**, **ephemeral** envs, or **local** with recorded traffic shapes.
- **Scrub** or **synthesize** PII in test data; use **dedicated** credentials with **least privilege**.
- Coordinate with **SRE/platform** so synthetic traffic is not mistaken for an incident.

---

## 3. Methodology

- **Baseline** before changes: store **p50/p95/p99** latency, **RPS**, **error rate**, **CPU/memory** if available.
- **Warm-up** before measuring: ignore first N seconds or requests so **JIT**, **connection pools**, and **caches** stabilize.
- **Controlled variables**: change **one** thing at a time (concurrency, payload size, feature flag).
- **Repeatability**: fix **seed** data, **clock**, and **version**; document **hardware** or **container limits** for comparable runs.

---

## 4. Metrics to capture

- **Latency**: percentiles, not only averages.
- **Throughput**: successful **RPS** or **iterations/s**.
- **Errors**: HTTP **4xx/5xx**, timeouts, connection resets — treat **non-zero** error budgets explicitly.
- **Saturation**: CPU, memory, DB **connections**, queue **depth** (when exporters exist).
- **Client-side** (Web): **LCP**, **INP**, **CLS** when using Lighthouse / RUM-style budgets.

---

## 5. Scripts and configs (typical stacks)

- **k6**, **Artillery**, **Gatling**, **Locust**, **JMeter**: keep **VU/rps ramp** and **duration** in the script or env; avoid hardcoded secrets—use **env vars**.
- **HTTP**: assert on **status** and **max response time** per step; fail the run when **SLA** breached.
- **Benchmark.js / Vitest bench / Node bench**: isolate **sync** work; beware **GC** noise—run enough iterations and report **variance**.

---

## 6. CI and budgets

- Gate merges with **budgets** (max regression on p95, max error rate) when stable; allow **flaky** metrics only with **retries** and **documented** variance.
- Store **historical** results (even a simple CSV or CI artifact) to spot **drift**.
- Separate **smoke perf** (short, every PR) from **nightly** deep runs.

---

## 7. Anti-patterns

- **Unbounded** concurrency against shared dev databases.
- **Cold** comparison without warm-up or with **different** data sizes between runs.
- **Interpreting** client-only speed as **server** capacity (or the reverse).
- **Caching** the entire response in the load tool without documenting it (masks backend cost).

---

## Related rules

- **`performance/RULE.md`** — how to write **fast** code (`alwaysApply`).
- **`testing/RULE.md`** — correctness and test pyramid.
- **`security/RULE.md`** — avoid exposing secrets in perf scripts and reports.
