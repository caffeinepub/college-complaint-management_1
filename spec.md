# College Complaint Management System

## Current State
- Internet Identity-based authentication (no custom credentials)
- Single landing page with sign-in button
- Onboarding modal to set name + role after login
- Students/staff can submit complaints and see their own complaints
- Admin can see all complaints, filter, update status, assign, respond
- "Grievance" terminology used throughout
- Background image (Aditya University campus) on login page with dark overlay and white text

## Requested Changes (Diff)

### Add
- Custom credential authentication replacing Internet Identity:
  - **Students**: self-register with roll number + set own password on first use
  - **Staff**: login with employee ID + set own password on first use
  - **Admin**: hardcoded account (username: `admin`, password: `admin123`)
- Side-by-side login panels on the login page (Student | Staff)
- First-time password setup prompt for both students and staff
- Reference number generation for each complaint in format `ADITYA#<sequential_number>`
- Reference number displayed to user on complaint submission confirmation
- Text colors on login page optimized for the dark campus background image (bright whites, gold accents for headings, light translucent whites for body text)

### Modify
- Rename all "Grievance" → "Complaint" throughout UI and backend
- Replace Internet Identity auth flow with custom roll number/employee ID + password auth
- Students and staff: can only see their own complaints (count + list with reference numbers)
- Admin: sees all complaints with full details
- Login page: text colors suited to dark background (white/gold for headings, white/80 for body)
- App loading screen: update "GrievanceHub" references to "Complaint Management"

### Remove
- Internet Identity authentication hooks and imports
- Onboarding modal (name/role captured at registration instead)
- Feature cards referencing Internet Identity on landing page

## Implementation Plan
1. Backend: Replace Internet Identity auth with custom credential store (roll number/employee ID + hashed password), store user type (student/staff/admin), add reference number field to complaints, add registerUser / loginUser / setPassword endpoints
2. Backend: Add getMyComplaintCount for students/staff (returns count only for their own complaints)
3. Frontend - Login Page: Two side-by-side panels (Student Login with roll number, Staff Login with employee ID), first-time users prompted to set password, text colors: white/gold headings, white/80 body text on dark background
4. Frontend - App.tsx: Replace Internet Identity auth with custom session (localStorage token), route to admin/student/staff dashboard based on user type
5. Frontend - Dashboards: Rename all "Grievance" to "Complaint", show reference number (ADITYA#123) on submission and in complaint list
6. Frontend - Admin Dashboard: Full complaint details remain visible; update terminology
