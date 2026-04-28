# Security Specification - FitGenius

## Data Invariants
1. A workout session must belong to the authenticated user who created it.
2. User profile data can only be modified by the user themselves.
3. Daily intake logs are private to the user.
4. Timestamps (createdAt, updatedAt) must be server-generated.
5. All document IDs must be valid alphanumeric strings.

## The Dirty Dozen Payloads (Targeting Rejection)

1. **Identity Spoofing**: Attempt to create a workout for another userId.
2. **Ghost Field Injection**: Adding `isAdmin: true` to a user profile.
3. **Invalid Type**: Sending a string for `weight` in a workout exercise.
4. **Massive ID**: Injecting a 2KB string as a workout ID.
5. **PII Leak**: Non-owner trying to 'get' another user's profile.
6. **Relational Orphan**: Creating a workout without a parent user document (if existence is enforced).
7. **Bypassing Validation**: Sending a negative number for `calories`.
8. **Shadow Update**: Updating `protein` without updating `updatedAt` if required.
9. **Terminal State Break**: Attempting to edit a 'finalized' workout (if state machine exists).
10. **Array Poisoning**: Sending an array with 1000 items to cause resource exhaustion.
11. **Email Spoofing**: User providing an email in payload that doesn't match `request.auth.token.email`.
12. **Blanket Read**: Querying all workouts without a `where(userId == auth.uid)` filter.

## Test Runner (Simplified Concept)
`firestore.rules.test.ts` would verify that all these cases return `PERMISSION_DENIED`.
