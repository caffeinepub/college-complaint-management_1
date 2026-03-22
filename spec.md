# College Complaint Management System

## Current State
Full-stack complaint management platform with Internet Identity and password-based auth. Admin dashboard fetches all complaints via `getAllComplaintsAdmin(password)`. The query silently returns [] on any error (including network errors), so admin sees no complaints when the query fails. Draft has expired.

## Requested Changes (Diff)

### Add
- Error state display in admin dashboard when complaint loading fails
- Retry button for admin complaint loading
- Auto-retry with proper error throwing in admin queries

### Modify
- `useGetAllComplaintsAdmin` and `useGetComplaintStatsAdmin` to throw errors instead of silently returning empty data — enabling React Query's retry mechanism
- Admin dashboard to show an error banner if complaints fail to load
- Handle stale localStorage session: if II user's profile isn't found in backend, auto-logout to prevent silent failures

### Remove
- Silent error swallowing in admin queries

## Implementation Plan
1. Fix `useGetAllComplaintsAdmin` and `useGetComplaintStatsAdmin` in useQueries.ts to throw on error
2. Add error handling UI in AdminDashboard for when complaint loading fails
3. In StudentDashboard / App.tsx, handle the case where session is restored from localStorage but II profile no longer exists in backend (auto-logout)
4. Redeploy
