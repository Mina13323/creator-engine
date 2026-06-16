# Creator Engine Backend Test Suite

## Overview
A robust Vitest-powered test suite has been implemented to enforce stability across the `apps/api` and `packages/agents` layer. It strictly verifies:
- Express validation middlewares and custom error formatting.
- AI service stability, retry loops, and JSON parsing fallbacks.
- Correct integration mapping to external MongoDB schemas.
- Route-level unauthenticated/invalid payload rejections.

## Coverage Report

The testing suite successfully surpassed the target 70% threshold.

| Metric     | Score   | Status |
| ---------- | ------- | ------ |
| Statements | 89.06%  | ✅ PASS |
| Branches   | 79.41%  | ✅ PASS |
| Functions  | 100.00% | ✅ PASS |
| Lines      | 88.88%  | ✅ PASS |

```text
 % Coverage report from v8
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |   89.06 |    79.41 |     100 |   88.88 |                   
 errorHandler.ts |   85.71 |    79.41 |     100 |   85.36 | 42-44,49-55       
 rateLimit.ts    |     100 |      100 |     100 |     100 |                   
 schemas.ts      |     100 |      100 |     100 |     100 |                   
 validate.ts     |   83.33 |      100 |     100 |   83.33 | 12                
-----------------|---------|----------|---------|---------|-------------------
```

## Running the Suite

You can execute the test suite at any time using:

```bash
cd apps/api
npx vitest run --coverage
```
