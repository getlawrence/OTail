# OTail Testing Strategy

This document outlines the testing strategy for OTail, including test categories, tools, and implementation guidelines.

## Test Categories

### 1. Unit Tests
- **Purpose**: Test pure logic, functions, and isolated components
- **Scope**: Individual functions, utility methods, and pure business logic
- **Tools**: 
  - Frontend: Jest + React Testing Library
  - Backend: Go's testing package

### 2. Component Tests
- **Purpose**: Test React components with minimal mockups
- **Scope**: UI components, their rendering, and basic interactions
- **Tools**: React Testing Library

### 3. Integration Tests
- **Purpose**: Test multiple modules working together
- **Scope**: 
  - Frontend: API interactions, form submissions
  - Backend: HTTP handlers with database interactions
- **Tools**:
  - Frontend: MSW + Jest
  - Backend: httptest, testcontainers-go

### 4. UI Tests
- **Purpose**: Visual regression testing
- **Scope**: Key components and pages
- **Tools**: Chromatic/Storybook

### 5. End-to-End Tests
- **Purpose**: Test complete user flows
- **Scope**: Critical paths (sign up, login, dashboard)
- **Tools**: Playwright

## Test Structure

### Frontend (`otail-web/`)
```
/src
  /components
    Button.test.tsx        # Unit/component test
  /features
    Auth.integration.test.tsx  # Integration test
/__tests__/e2e             # Playwright tests
```

### Backend (`otail-server/`)
```
/pkg
  utils/
    math_test.go          # Unit test
/internal
  auth/
    handler_test.go       # Integration test
/test/e2e                 # E2E test entrypoints
```

## Implementation Guidelines

### Frontend Testing
1. Unit Tests
   - Test utility functions and pure logic
   - Mock external dependencies
   - Focus on edge cases and error handling

2. Component Tests
   - Test component rendering
   - Test user interactions
   - Use React Testing Library's best practices

3. Integration Tests
   - Mock API calls using MSW
   - Test form submissions and data flow
   - Verify state management

4. UI Tests
   - Create Storybook stories for components
   - Use Chromatic for visual regression testing
   - Test responsive design

5. E2E Tests
   - Test critical user flows
   - Include authentication flows
   - Test error scenarios

### Backend Testing
1. Unit Tests
   - Test business logic
   - Mock external dependencies
   - Focus on edge cases

2. Integration Tests
   - Use testcontainers-go for database testing
   - Test HTTP handlers
   - Verify database interactions

3. E2E Tests
   - Trigger via Playwright tests
   - Test complete API flows
   - Verify data persistence

## CI/CD Integration

Tests are integrated into the CI pipeline with:
- Frontend test coverage reporting
- Backend test coverage reporting
- E2E test execution
- Visual regression testing
- Test artifacts on failure

## Maintenance

- Use conventional commits to determine test scope
- Implement pre-push hooks for test execution
- Regular test coverage reviews
- Test ownership assignments by component
- Regular test suite optimization

## Optional Enhancements

- Contract testing between frontend and backend
- Load testing with k6
- Test coverage badges in README
- Fail-fast test execution strategy 