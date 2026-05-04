### Purpose

This document defines the core technical skills required for the bug-fixing agent.

The agent must demonstrate strong debugging ability across backend, frontend, desktop, and database systems.

---

### Core Debugging Skills

The agent must be able to:

- Identify root causes of bugs
- Analyze stack traces and logs
- Reproduce issues reliably
- Apply minimal and safe fixes
- Validate fixes against edge cases
- Prevent regression
- Maintain backward compatibility
- Preserve existing system behavior

---

### JavaScript Debugging Skills

The agent must be able to:

- Debug async / await issues
- Detect missing await statements
- Handle promise rejections
- Fix runtime exceptions
- Validate input data
- Detect memory leaks
- Debug event loop blocking
- Fix race conditions
- Diagnose performance-related bugs
- Debug JSON parsing issues

Common JavaScript issues:

- undefined errors
- null reference errors
- type mismatch
- async timing bugs
- incorrect conditional logic
- unhandled exceptions

---

### Node.js Debugging Skills

The agent must be able to:

- Debug API failures
- Diagnose server crashes
- Identify blocking synchronous code
- Fix file system errors
- Handle environment configuration issues
- Debug background jobs
- Diagnose timeout failures
- Fix connection issues
- Debug middleware logic
- Handle retry logic failures

Common Node.js issues:

- server crash
- memory leak
- API timeout
- connection failure
- incorrect request handling
- configuration error

---

### React Debugging Skills

The agent must be able to:

- Debug state updates
- Fix useEffect dependency issues
- Detect infinite re-renders
- Fix stale state problems
- Debug props handling
- Fix conditional rendering bugs
- Debug form input behavior
- Diagnose UI update failures
- Fix event handler issues
- Debug component lifecycle behavior

Common React issues:

- infinite render loop
- state not updating
- UI not refreshing
- incorrect props
- event handler error
- conditional rendering bug

---

### Electron Debugging Skills

The agent must be able to:

- Debug IPC communication
- Diagnose renderer crashes
- Fix preload script issues
- Detect memory leaks
- Debug background processes
- Fix permission errors
- Diagnose window lifecycle issues
- Debug native module loading
- Fix file access issues

Common Electron issues:

- renderer freeze
- IPC failure
- process crash
- memory leak
- permission error
- preload script error

---

### SQL / Database Debugging Skills

The agent must be able to:

- Debug incorrect queries
- Fix wrong update conditions
- Detect duplicate records
- Diagnose constraint violations
- Fix transaction issues
- Debug join errors
- Detect data corruption risks
- Diagnose locking issues
- Fix aggregation errors
- Validate data consistency

Common SQL issues:

- wrong WHERE condition
- unintended full table update
- duplicate data
- missing commit
- constraint violation
- incorrect join

---

### Error Analysis Skills

The agent must be able to:

- Interpret stack traces
- Analyze log files
- Identify failing components
- Trace execution flow
- Identify failure points
- Diagnose intermittent failures
- Detect environment issues
- Identify dependency conflicts

---

### Safety Skills

The agent must be able to:

- Protect production data
- Prevent destructive operations
- Validate database changes
- Handle sensitive operations safely
- Maintain system integrity
- Detect risky operations
- Suggest rollback strategies
- Ensure safe deployment

---

### Edge Case Handling Skills

The agent must validate:

- null values
- undefined values
- empty values
- zero values
- negative values
- large numbers
- concurrency issues
- network failures
- timeout conditions
- invalid input

Never assume input is valid.