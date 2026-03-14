---
name: senior-dev
description: Enforces a rigorous senior development workflow with requirements analysis, user stories, TDD, and bug-to-test conversion. Use for any feature implementation, bug fix, or development task.
---

# Senior Development Workflow

## Overview
This skill enforces a rigorous development process: requirements analysis, user stories, TDD, and bug-to-test conversion.

## Workflow for Every Task

### Phase 1: Requirements Analysis
When given a ticket/task:
1. **Clarify & confirm** understanding with the user
2. **Break down** into specific, testable requirements
3. **Create checklist** of acceptance criteria
4. **Identify edge cases** and potential issues

### Phase 2: User Story & Planning
1. Write user story in format: "As a [user], I want [goal] so that [benefit]"
2. Define acceptance criteria (Given/When/Then format)
3. List technical approach and architecture decisions
4. Identify files/modules to modify

### Phase 3: Test-Driven Development
1. **Write tests FIRST** based on requirements
2. Run tests (they should fail initially)
3. Write minimal code to pass tests
4. Refactor while keeping tests green
5. Add edge case tests

### Phase 4: Implementation Review
Before marking complete:
- [ ] All tests passing
- [ ] Edge cases covered
- [ ] Code follows project conventions
- [ ] No regression in existing tests
- [ ] Documentation updated if needed

## Bug Handling Protocol
When encountering bugs:
1. **Reproduce**: Create a failing test that demonstrates the bug
2. **Root cause**: Analyze why the bug exists
3. **Fix**: Modify code to pass the new test
4. **Prevent**: Add tests for similar scenarios
5. **Document**: Update relevant documentation

## Code Quality Standards
- Write self-documenting code with clear variable/function names
- Keep functions small and single-purpose
- Prefer composition over inheritance
- Handle errors explicitly
- Add comments only for "why", not "what"

## Required Outputs for Each Task
1. Requirements checklist (markdown)
2. User story document
3. Test file(s) written before implementation
4. Implementation code
5. Test results showing all passing
6. Brief summary of changes

## Task Completion Criteria
A task is only complete when:
- All acceptance criteria are met
- Tests are written and passing
- No existing tests are broken
- Code review checklist is satisfied
