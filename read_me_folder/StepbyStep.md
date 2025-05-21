Core Principles:
Iterative Development: Build and test features in small, manageable chunks.
MVP First: Focus on core functionality first, then add enhancements.
Test as You Go: Manually test each piece of functionality immediately after implementation. For a larger project, you'd integrate unit/integration tests, but for this plan, we'll focus on manual verification.
Firebase First: Set up Firebase early as it's central to data and auth.
Development Plan: Step-by-Step
Step 0: Project Setup & Core Infrastructure
Goal: Initialize the Next.js project, set up Firebase, and create basic layout and auth context.
What to work on:
Initialize Next.js: npx create-next-app@latest batch-tracking-app
Firebase Project Setup:
Create a Firebase project.
Enable Authentication (Email/Password, Google).
Set up Cloud Firestore (start in test mode for now, rules later).
Install Firebase SDK: npm install firebase
Basic Directory Structure: Create initial folders like components/layout, contexts, lib/firebase, styles.
Firebase Configuration:
Create .env.local with Firebase config keys.
Create lib/firebase/config.js to initialize Firebase.
Global Styles & Layout:
Basic styles/globals.css and styles/variables.css.
pages/_app.jsx to import global styles and wrap with context providers.
pages/_document.jsx (if needed for custom HTML structure).
Basic components/layout/AppLayout.jsx and components/layout/Navbar.jsx.
Auth Context Shell:
Create contexts/AuthContext.jsx (initial shell with user, role, loading state).
Create hooks/useAuth.js.
Files Created/Modified:
package.json (updated by Next.js and npm install)
.env.local (new)
next.config.js (default)
lib/firebase/config.js (new)
styles/globals.css, styles/variables.css (new)
pages/_app.jsx (modified)
pages/_document.jsx (optional, new)
components/layout/AppLayout.jsx, AppLayout.css (new)
components/layout/Navbar.jsx, Navbar.css (new)
contexts/AuthContext.jsx (new)
hooks/useAuth.js (new)
How to Test:
Run npm run dev. The Next.js app should start without errors.
Open the app in the browser. You should see a very basic page with the Navbar.
In lib/firebase/config.js, temporarily console.log(getApps()) after initializeApp to confirm Firebase initializes correctly (you should see the app instance).
In _app.jsx, consume AuthContext and log the initial user and role to see they are null/undefined.
Step 1: Authentication & Role Management
Goal: Implement user login, logout, and basic role handling via Firebase Auth custom claims.
What to work on:
Firebase Auth Functions:
Create lib/firebase/auth.js with functions for signInWithEmail, signInWithGoogle, signOutUser, onAuthStateChangedWrapper (to listen for auth state and fetch custom claims).
Auth Context Implementation:
Flesh out contexts/AuthContext.jsx to use the Firebase auth functions, manage user state, and fetch/store role from custom claims.
Login UI:
Create pages/login.jsx.
Create components/auth/LoginForm.jsx and LoginForm.css.
Protected Routes/UI:
Create a basic pages/dashboard.jsx that's initially simple.
Implement components/auth/RoleGuard.jsx to redirect unauthenticated users or users without required roles. Wrap Dashboard or its content with this.
Set Custom Claims (Manual for now):
Manually create a test user in Firebase Auth console.
Use Firebase Admin SDK (e.g., in a simple Node.js script or Cloud Function deployed separately) to set a custom role claim (e.g., role: 'processor') for the test user.
Files Created/Modified:
lib/firebase/auth.js (new)
contexts/AuthContext.jsx (modified significantly)
hooks/useAuth.js (potentially minor updates if context API changes)
pages/login.jsx (new)
components/auth/LoginForm.jsx, LoginForm.css (new)
pages/dashboard.jsx (new, basic)
components/auth/RoleGuard.jsx (new)
How to Test:
Navigate to /login. The login form should appear.
Attempt login with test credentials. Check Firebase Auth console to see if login attempts are registered.
Upon successful login, the user should be redirected to /dashboard.
AuthContext should now reflect the logged-in user and their role (e.g., "processor"). Display this on the Navbar or Dashboard for testing.
Logout functionality should work and redirect to /login.
Try accessing /dashboard directly while logged out; RoleGuard should redirect to /login.
Step 2: Core Batch Functionality - Processor: Create & View Active Batches
Goal: Allow "Processor" role users to create new batches and view active/priority batches.
What to work on:
Firestore Service Functions:
Create lib/firebase/firestore.js with createBatch(batchData) and getActivePriorityBatches(onSnapshotCallback) functions.
Batch Creation UI & Logic:
Create pages/batches/new.jsx (protected for "Processor" role).
Create components/batch/BatchForm.jsx and BatchForm.css for formula, deck, batch number. Include validation for formula.
Active/Priority Batches Display:
Create components/batch/BatchTable.jsx, BatchTable.css.
Create components/batch/BatchRow.jsx, BatchRow.css.
Update pages/dashboard.jsx to fetch and display active/priority batches using BatchTable.
Constants:
Create constants/index.js (or constants/batchStatuses.js) for status enums like mixing.
Initial Firestore Rules (Basic):
Update firestore.rules to allow authenticated reads and writes to batches collection for now (will be refined later).
Files Created/Modified:
lib/firebase/firestore.js (new)
pages/batches/new.jsx (new)
components/batch/BatchForm.jsx, BatchForm.css (new)
components/batch/BatchTable.jsx, BatchTable.css (new)
components/batch/BatchRow.jsx, BatchRow.css (new)
pages/dashboard.jsx (modified to display BatchTable)
constants/index.js (or constants/batchStatuses.js) (new)
firestore.rules (modified)
How to Test:
Log in as a "Processor".
Navigate to /batches/new. The form should appear.
Test formula validation (e.g., try entering special characters).
Submit the form. Check Firestore console to see the new batch document created with correct fields (formula, deck, batchNumber, startedAt, currentProcessorId, processorHistory, status: 'mixing').
Navigate to /dashboard. The newly created batch should appear in the "Active / Priority" table.
Create another batch. It should also appear in real-time on the dashboard.
Log in as a user without "Processor" role (e.g., "QA" if set up, or a user with no role). They should not be able to access /batches/new.
Step 3: Core Batch Functionality - QA Workflow & Sample Management
Goal: Implement the QA workflow: viewing batches awaitingQA, starting testing, submitting samples (by Processor), and QA making decisions (approve/deny sample).
What to work on:
Processor "Complete Batch" Action:
Add a button/action in BatchRow.jsx or a new BatchDetailDrawer.jsx for Processors to mark a batch as complete (status changes to awaitingQA). Update lib/firebase/firestore.js with updateBatchStatus(batchId, newStatus, processorId).
QA Queue Page:
Create pages/qa-queue.jsx (protected for "QA" role).
Reuse BatchTable.jsx to display batches with status: 'awaitingQA'. Update lib/firebase/firestore.js with getQAQueueBatches(onSnapshotCallback).
QA "Start Testing" Action:
Add functionality (e.g., button in BatchRow or a detail view) for QA to "Start Testing." This updates batch.qaCurrentId and batch.qaHistory. Update lib/firebase/firestore.js.
Processor "Submit Sample" Action:
UI for Processor to submit a sample (could be part of BatchDetailDrawer.jsx or a dedicated modal).
Create components/batch/SampleForm.jsx and SampleForm.css.
Logic in lib/firebase/firestore.js to add a document to the samples subcollection (submitSample(batchId, sampleData)). Increment attempt number client-side.
QA Decision Actions (QAActionBar):
Create components/qa/QAActionBar.jsx and QAActionBar.css.
This bar will have "Approve Sample," "Deny Sample" buttons and a notes field.
Logic in lib/firebase/firestore.js to update the sample document (result, qaId, decidedAt, notes) and, if approved, update the parent batch's status to approved. (updateSampleResult(batchId, sampleId, decisionData))
Display Samples:
Create components/batch/SampleList.jsx and SampleList.css to show sample history within BatchDetailDrawer.jsx.
Refine Firestore Rules:
Allow Processors to create samples.
Allow QA to update samples (if result: 'pending').
Allow specific status updates on batches based on role.
Files Created/Modified:
lib/firebase/firestore.js (modified: updateBatchStatus, getQAQueueBatches, startQATesting, submitSample, updateSampleResult, getSamplesForBatch)
components/batch/BatchRow.jsx (modified for actions)
components/batch/BatchDetailDrawer.jsx, BatchDetailDrawer.css (new - placeholder if not done already, will house sample info/actions)
pages/qa-queue.jsx (new)
components/batch/SampleForm.jsx, SampleForm.css (new)
components/qa/QAActionBar.jsx, QAActionBar.css (new)
components/batch/SampleList.jsx, SampleList.css (new)
constants/index.js (add awaitingQA, approved, denied, pending statuses)
firestore.rules (modified significantly)
How to Test:
Processor: Mark a mixing batch as complete. Status should change to awaitingQA.
QA: Log in. Navigate to /qa-queue. The batch should appear.
QA: Click "Start Testing" on a batch. batch.qaCurrentId and qaHistory should update in Firestore.
Processor: Find the same batch. Submit a sample. A new document should appear in batches/{batchId}/samples.
QA: View the batch (e.g., in BatchDetailDrawer). The pending sample should be visible. Use QAActionBar to "Approve Sample."
The samples subcollection document should update (result: 'approved', qaId, etc.).
The parent batches document status should change to approved.
QA: For another sample, use "Deny Sample" with notes.
The samples document should update (result: 'denied').
Batch status should remain awaitingQA.
Test Firestore rules: ensure only correct roles can perform actions.
Step 4: Advanced Batch States & Admin Functionality
Goal: Implement "On-Hold," "Rejected" states, basic Admin reassignments, and the Archive view.
What to work on:
"On-Hold" and "Rejected" Batch Statuses:
Add actions (likely in QAActionBar or an Admin Panel) for QA/Admin to place a batch "On-Hold" or "Reject" it.
Update lib/firebase/firestore.js with functions to set these statuses.
Update firestore.rules for who can set these.
Archive View:
Create pages/archive.jsx.
Reuse BatchTable.jsx.
Update lib/firebase/firestore.js to fetch all batches (getAllBatches(onSnapshotCallback)), then filter client-side for "rejected" and "approved" older than 7 days. (Or refine query if pagination/server-side filtering is critical early).
"Active / Priority" Query Update:
Ensure the getActivePriorityBatches query in lib/firebase/firestore.js correctly includes on-hold batches and approved batches from the last 7 days.
Admin Panel (Basic):
Create pages/admin/index.jsx (protected for "Admin" role).
Initial admin feature: Reassign currentProcessorId or qaCurrentId.
Create components/admin/AdminPanel.jsx and components/admin/StaffReassignmentForm.jsx.
Update lib/firebase/firestore.js for these admin updates, ensuring history arrays are updated.
Update Firestore Rules for Admin actions.
Files Created/Modified:
lib/firebase/firestore.js (modified: setBatchOnHold, setBatchRejected, reassignProcessor, reassignQA, getAllBatches)
components/qa/QAActionBar.jsx (modified for On-Hold/Reject)
pages/archive.jsx (new)
pages/admin/index.jsx (new)
components/admin/AdminPanel.jsx, AdminPanel.css (new)
components/admin/StaffReassignmentForm.jsx, StaffReassignmentForm.css (new)
constants/index.js (add on-hold, rejected statuses)
firestore.rules (modified for admin actions and new statuses)
How to Test:
QA/Admin: Place a batch "On-Hold." Verify it stays in the "Active / Priority" view.
QA/Admin: "Reject" a batch. Verify it moves to the "Archive" view.
Check "Active / Priority" view to ensure it correctly shows in-progress, on-hold, and recently approved batches.
Admin: Log in. Navigate to /admin. Reassign a processor/QA on a batch. Check Firestore for updated currentProcessorId/qaCurrentId and history arrays.
Test that approved batches older than 7 days (mock data or wait) appear in the Archive.
Step 5: Export & Print Functionality
Goal: Implement client-side CSV export and a printable batch view.
What to work on:
Client-Side CSV Export:
Install json2csv or similar library: npm install json2csv.
Create lib/utils/exportUtils.js with a function to convert batch/sample data to CSV and trigger download.
Add an "Export CSV" button (e.g., on Dashboard, Archive, Admin Panel) that fetches relevant data and uses this utility.
Printable Batch Route:
Create pages/batches/[batchId]/print.jsx.
This page will fetch and display batch details in a simplified, printer-friendly layout.
Include a button to trigger window.print().
Add specific CSS for print media queries in styles/globals.css or a dedicated print CSS file.
Files Created/Modified:
lib/utils/exportUtils.js (new)
Relevant pages/components for "Export CSV" button (e.g., pages/dashboard.jsx, components/admin/AdminPanel.jsx)
pages/batches/[batchId]/print.jsx (new)
styles/globals.css (modified for print styles) or styles/print.css (new)
How to Test:
Click "Export CSV." A CSV file should download with the correct batch data.
Navigate to a /batches/[someId]/print route. The page should render a clean, printable layout.
Click the print button; the browser's print dialog should appear. Check the print preview.
Step 6: Finalizing Firestore Rules, Styling Polish & Pre-Deployment Checks
Goal: Harden security rules, polish UI/UX, and perform final checks.
What to work on:
Comprehensive Firestore Rules Review:
Go through firestore.rules meticulously. Ensure every read/write operation is explicitly allowed only for the necessary roles and conditions.
Test edge cases for security rules (e.g., trying to update a field one role shouldn't, trying to create data without proper auth).
UI/UX Polish:
Review all pages and components for consistent styling, good user experience, and responsiveness.
Add loading states (e.g., components/common/Spinner.jsx) where data fetching occurs.
Implement user-friendly error messages and notifications.
Code Quality:
Run linters (eslint) and formatters (prettier, if used).
Review code for readability, maintainability, and adherence to best practices.
Testing Across Roles:
Systematically test all user flows for each role (Processor, QA, Admin) to ensure correct functionality and permissions.
Files Created/Modified:
firestore.rules (final review and hardening)
Various .css files for styling polish.
Various .jsx components for adding loading states, error handling.
components/common/Spinner.jsx, Spinner.css (if not already created)
How to Test:
Security: Attempt various operations in Firestore directly (e.g., using browser dev tools or a script) that should be disallowed by rules to confirm they fail.
UI: Click through the entire application on different screen sizes. Check for visual bugs or awkward interactions.
Roles: Log in as each role. Perform all actions available to that role and attempt actions not available to it. Ensure everything behaves as expected.
This step-by-step plan provides a structured approach. Remember that some tasks might overlap, and you might discover the need for adjustments as you build. The key is to build iteratively, test frequently, and keep the user roles and data flow in mind at each step.
