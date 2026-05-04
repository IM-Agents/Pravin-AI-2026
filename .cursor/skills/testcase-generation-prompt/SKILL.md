---
name: qa-testcase-generation-skill
description: Generates only functional test cases from requirement text in Markdown format for Positive, Negative, Edge, and Logical Validation scenarios. Use when requirement analysis is needed and output must be ready to save directly as a .md file.
---

# QA Functional Test Case Generation Skill

## Purpose

This skill is used to generate only functional test cases from provided requirement text.

The output must be clean Markdown content and ready to save directly as a `.md` file.

It should generate practical, professional, and independently executable test cases.

---

## Input Format

The requirement will be provided like this:

```text
${requirementText}

# Functional Test Cases

## Positive Test Cases

## TC-[NUMBER]: [Test Case Title]

**Type:** [Functional/UI/Business Logic/Workflow]  
**Priority:** [High/Medium/Low]  
**Preconditions:**
- [Precondition 1]
- [Precondition 2]

**Steps:**
1. [Step description]
2. [Step description]

**Expected Result:**
[What should happen]

---

## Negative Test Cases

Use same TC structure

---

## Edge Cases

Use same TC structure

---

## Logical Validation Cases

Use same TC structure

---
Requirements:
- Return markdown content only
- No explanations
- No preamble
- No additional text
- Test cases must be practical, professional, and applicable across different project contexts
- Each test case should be independently executable
- Output must be ready to save directly as a .md file
- Include reasonable number of test cases across all four categories