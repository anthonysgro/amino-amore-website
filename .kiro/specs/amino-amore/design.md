# Design Document

## Overview

This design covers adding Prettier code formatting and AWS Amplify deployment configuration to the existing amino-amore Vite + TypeScript + Shadcn project.

## Architecture

The additions are configuration-only - no new application code or components. The project structure remains unchanged except for new config files at the root level.

```
amino-amore/
├── amplify.yml          # NEW - Amplify build config
├── prettier.config.js   # NEW - Prettier config
├── package.json         # MODIFIED - add prettier dep + format script
└── ... (existing files unchanged)
```

## Components and Interfaces

### Prettier Configuration

The Prettier config will use standard settings compatible with the existing ESLint setup:

```javascript
// prettier.config.js
export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
}
```

### Amplify Build Specification

The amplify.yml follows AWS Amplify's standard format for Vite projects:

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Data Models

Not applicable - this spec only covers configuration files.

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Given this spec covers only configuration files (Prettier and Amplify), there are no runtime behaviors to validate with property-based testing. The correctness of these configurations is verified through:

1. Prettier: Running `npm run format` successfully formats files
2. Amplify: The build succeeds when deployed to AWS Amplify

No testable properties - configuration correctness is validated through successful execution.

## Error Handling

### Prettier

- If Prettier conflicts with ESLint rules, the format script will fail with clear error messages
- Resolution: Adjust prettier.config.js settings to align with ESLint

### Amplify

- If build fails, Amplify console shows detailed logs
- Common issues: missing dependencies (solved by npm ci), incorrect output directory

## Testing Strategy

### Manual Verification

- Run `npm run format` to verify Prettier works
- Deploy to Amplify to verify build config works

### No Automated Tests Required

This spec adds configuration files only. The correctness is verified by:

1. Prettier: `npm run format` executes without errors
2. Amplify: Successful deployment in AWS Amplify console

No unit tests or property-based tests are needed for configuration files.
