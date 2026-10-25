# Security Specification: Fluid Motion Persistent Memory

## Data Invariants
- A clip metadata record must belong to a signed-in user (`ownerId`).
- Users can only read/write their own clip metadata and project states.
- Block indexes must be between 0 and 17 (The 18-block architecture).
- Timestamps must be validated against `request.time`.

## The Dirty Dozen (Vulnerability Payloads)

1. **Clip Hijack**: Attempting to create metadata with an `ownerId` that is not the current user.
2. **Metadata Snoop**: Trying to read clip metadata belonging to another UID.
3. **Block Overflow**: Setting a `blockIndex` to 99 to break the UI layout.
4. **Shadow Update**: Injecting an `isAdmin` field into a user profile.
5. **Timeline Erasure**: Deleting a project document owned by another user.
6. **Orphan Metadata**: Creating metadata without a valid `clipId`.
7. **Temporal Fraud**: Setting `updatedAt` to a future date manually.
8. **Bulk Leak**: Attempting a collection group query to scrape all clips.
9. **Identity Spoof**: Updating a user profile's `uid` to match another user.
10. **Array Poisoning**: Setting `tags` to a 2MB array of junk data.
11. **State Shortcut**: Updating `activeBlock` without providing a `projectId`.
12. **PII Blanket**: An authenticated user trying to list the entire `/users` collection.

## Test Strategy
All payloads above will be blocked by the "Fortress" ruleset using strict identity checks and schema validation.
