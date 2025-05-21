A React + Next.js front‑end with Firebase for real‑time data, authentication, and audit‑ready exports, enhanced with specific operational details.

1 · Overview
Every batch is defined by its formula and assigned to a specific deck within the plant. A batch is started by a user with a Processor role, who manually enters the batch number (as per internal batch sheets; this is not system-generated sequentially for all formulas). The batch is then tested by QA until it is approved, re‑sampled if a sample is denied, placed on‑hold for higher-level review, or ultimately rejected if it cannot meet standards. Rejected batches are considered complete and moved to the archive. There is no system-imposed limit on the number of re-sample attempts for a batch.
Firestore snapshots keep dashboards live; Firebase Auth secures staff roles and lets users handle their own password resets. Two main tables keep the UI clear:
Active / Priority – In‑progress items (including mixing, complete, awaitingQA, on-hold) + approvals from the last 7 days.
Archive – The complete historical record, including rejected batches and approved batches older than 7 days.
All data retains: all processors involved (even across shifts), all QA testers (across shifts), each sample attempt, failure notes, and timestamps for a rock‑solid audit trail. Input for the formula field will be validated to accept only letters and numbers to prevent errors.

2 · Firebase Stack
Service	Purpose
Auth	Email / Google sign‑in; custom role claim (processor, qa, admin).
Cloud Firestore	Real‑time batch + sample data via onSnapshot.
Cloud Functions (optional)	Generate CSV exports or run nightly cleanup jobs.

3 · Data Model
3.1 Collection batches
Field	Type	Notes
formula	string	e.g. "F2052". Validated for letters and numbers only.
deck	string	Identifier for the plant deck where the batch is processed (e.g., "Deck A", "North Wing Line 3").
batchNumber	string/number	User-entered batch identifier from physical batch sheets. Not system-generated sequentially.
startedAt	timestamp	
currentProcessorId	string (UID)	UID of the processor currently assigned or last active on the batch.
processorHistory	string[]	Array of UIDs of all Processors who have worked on this batch (e.g., started, completed mixing, submitted samples).
qaCurrentId	string (UID | null)	Set when any QA clicks Start Testing; represents the QA actively testing. Can be changed if another QA takes over.
qaHistory	string[]	All QA UIDs that touched this batch.
status	enum	mixing → complete → awaitingQA → approved / denied (for sample) / on-hold (batch) → rejected (batch).
lastUpdated	timestamp	
Document ID: ${formula}_${batchNumber}_${startedAt.toMillis()} – unique & readable.
3.2 Subcollection samples (parent: batches/{batchId})
Field	Type	Notes
attempt	number	Auto‑incremented for each new sample attempt for a given batch (e.g., 1, 2, 3...). Typically client-side logic: query existing samples for the batch, count + 1.
submittedAt	timestamp	
submitterId	UID	UID of the Processor who physically prepared and submitted this specific sample.
qaId	UID	UID of the QA user who made the decision for this sample.
result	enum	approved / denied / pending
notes	string	
decidedAt	timestamp	
Reassignment: Admins may update currentProcessorId or qaCurrentId; changes are logged (e.g., processorHistory, qaHistory automatically updated on action, or separate meta/changes for explicit admin reassignments). Any user with a 'Processor' role can perform actions like completing mixing or submitting a sample, their UID will be captured in processorHistory and as submitterId on the sample. Any QA can take over testing from another QA.

4 · Real‑Time Queries
// Helpers
const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7*24*60*60*1000));

// Active / Priority
query(
  collection(db, 'batches'),
  or(
    where('status', 'in', ['mixing', 'awaitingQA', 'complete', 'on-hold']), // Added 'on-hold'
    and(where('status', '==', 'approved'), where('startedAt', '>=', sevenDaysAgo))
  )
);

// QA queue
query(collection(db, 'batches'), where('status', '==', 'awaitingQA'));

// Archive (paginated) - Includes 'rejected' and older 'approved' batches
// Simple full collection query, pagination and further filtering (e.g., for 'rejected') handled client-side or with more specific queries.
collection(db, 'batches');
// Example for specifically querying rejected batches if needed for a separate view:
// query(collection(db, 'batches'), where('status', '==', 'rejected'));
Use code with caution.
Ts

5 · State & Role Flow
UI Action	Firestore Write	Result
Start Batch (Processor)	Create batch doc: status:'mixing', set formula, deck, user-entered batchNumber. Set currentProcessorId to current user, add user to processorHistory.	Assigns currentProcessorId, adds to processorHistory.
Complete Batch (Processor)	Update batch: status:'awaitingQA'. If different processor, update currentProcessorId (optional, or rely on sample submitterId), add to processorHistory.	Batch moves to QA queue. Processor who completed is logged in processorHistory.
Start Testing (QA)	Update batch: set qaCurrentId to current QA user, push current QA user to qaHistory (if not already last).	Dashboard shows current tester.
Submit Sample (Processor)	Add samples subcollection doc: result:'pending', attempt (auto-incremented). submitterId is current user. Add current user to batch processorHistory (if not already there).	New sample appears for QA. Processor who submitted is logged.
Approve (QA)	Update samples doc: result:'approved', set qaId, decidedAt. Update batch: status:'approved'.	Moves to Archive after 7 days (based on startedAt or lastUpdated with approved status).
Deny Sample (QA)	Update samples doc: result:'denied', set qaId, decidedAt, notes. Batch status remains awaitingQA.	Awaits next sample from Processor.
Place Batch On-Hold (QA/Admin?)	Update batch: status:'on-hold'. Log actor.	Batch is flagged for higher-up review. Stays in Active view.
Reject Batch (QA/Admin?)	Update batch: status:'rejected'. Log actor.	Batch is finalized as rejected. Moves to Archive.
Reassign QA/Processor (Admin)	Update currentProcessorId or qaCurrentId on batch. Changes logged via history arrays or dedicated log.	Supports shift hand‑off or explicit reassignment. QA users can also organically take over testing from the queue, updating qaCurrentId and qaHistory.
6 · Export & Printing
Client‑side — fetch docs → convert to CSV (json2csv) → trigger download
Cloud Function — REST GET /export?range=YYYY‑MM‑DD..YYYY‑MM‑DD → store CSV in Cloud Storage → return signed URL
Printable route — /batch/[id]/print renders a PDF‑friendly page (window.print())
7 · Security Rules (sketch)
function isProcessor() {
  return request.auth.token.role == 'processor';
}
function isQA() {
  return request.auth.token.role == 'qa';
}
function isAdmin() {
  return request.auth.token.role == 'admin';
}

// Example: Check if user is the current processor or was involved
function isCurrentOrPastProcessor(batchData) {
  return batchData.currentProcessorId == request.auth.uid ||
         (batchData.processorHistory && batchData.processorHistory.includes(request.auth.uid));
}

// Example: Check if user is current QA or was involved
function isCurrentOrPastQA(batchData) {
    return batchData.qaCurrentId == request.auth.uid ||
           (batchData.qaHistory && batchData.qaHistory.includes(request.auth.uid));
}

match /batches/{batchId} {
  allow read: if request.auth != null;
  allow create: if isProcessor(); // User provides formula, deck, batchNumber
  allow update: {
    // General updates for status changes, assignments
    // Who can change status to 'on-hold', 'rejected'? (e.g. QA or Admin)
    // Who can change deck, formula, batchNumber after creation? (likely Admin only for some fields)
    // Processors might update status to 'complete'
    // QA might update status to 'approved', 'awaitingQA' (after deny), 'on-hold', 'rejected'
    // Admins can update most things.
    // Example:
    // allow update: if isAdmin() ||
    //                  (isProcessor() && (request.resource.data.status == 'awaitingQA' || request.resource.data.status == 'mixing')) || // Processor specific state changes
    //                  (isQA() && (request.resource.data.status == 'approved' || request.resource.data.status == 'on-hold' || request.resource.data.status == 'rejected' || request.resource.data.status == 'awaitingQA')); // QA specific state changes
    // Need more granular rules per field if necessary.
    // For now, keeping original broad rule, but flagging need for refinement:
    allow update: if isProcessor() || isQA() || isAdmin(); // Needs more granular field-level control based on role and state
  }
}

match /batches/{batchId}/samples/{sampleId} {
  // Who can submit a sample? Any processor.
  allow create: if isProcessor();
  // Who can decide on a sample? Any QA, but typically the one assigned (qaCurrentId on batch) or any QA if unassigned/taking over.
  // Sample result should only be updatable if 'pending'.
  allow update: if isQA() && resource.data.result == 'pending' && request.resource.data.qaId == request.auth.uid; // Only the assigned QA can update their decision.
  // OR allow update: if isQA() && resource.data.result == 'pending'; // Any QA can update if a sample is pending
}
Use code with caution.
JavaScript
Self-correction: The security rule for sample update should probably allow any QA to update if the sample is pending, especially if qaCurrentId on the batch can change dynamically. Or, the QA who starts testing a sample implicitly "owns" it. The original resource.data.result == 'pending' is good. The part about request.resource.data.qaId == request.auth.uid would only work if qaId is set before the decision, which it isn't in the current flow (qaId is set with the decision). So, it's more likely isQA() and resource.data.result == 'pending' are the key checks. The QA who makes the decision becomes the qaId.
Revised samples update rule:
match /batches/{batchId}/samples/{sampleId} {
  allow create: if isProcessor();
  // Any QA can make a decision on a pending sample. Their UID is recorded as qaId.
  allow update: if isQA() && resource.data.result == 'pending';
}
Use code with caution.
JavaScript

8 · React Component Map
AuthProvider — supplies user, role.
BatchTable — renders any query result (Active, QA, Archive).
BatchRow — formula, deck, status, current processor, current QA.
BatchDetailDrawer — timeline of all samples, processor history, QA history.
QAActionBar — approve/deny/place on-hold/reject with notes; auto‑records qaCurrentId on batch and qaId on sample.
AdminPanel — reassign staff, trigger exports, manage users/roles (if applicable).
9 · Benefits Recap
Real‑time dashboards (snapshots) keep floor & QA synced.
Complete audit trail (every sample, decision, role change, all processors and QA involved, deck assignment).
Flexible staff reassignment spans multiple shifts for both Processors and QA.
One‑click CSV/PDF exports for audits & reports.
Role‑based security enforces correct access at each step.
Clear tracking of batches by formula, user-defined batch number, and physical plant deck.
Handles complex batch lifecycles including on-hold and rejection states.