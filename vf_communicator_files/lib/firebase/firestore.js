// lib/firebase/firestore.js
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  or,
  and,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion, // For adding to arrays like history
  increment, // For attempt number if done server-side (client-side for now)
  getDocs, // For counting existing samples
  writeBatch, // For atomic writes if needed
} from 'firebase/firestore';
import { db } from './config';
import { BATCH_STATUSES, SAMPLE_RESULTS } from '../../constants'; // Make sure constants are imported

const BATCHES_COLLECTION = 'batches';
const SAMPLES_SUBCOLLECTION = 'samples';

// --- Existing functions from Step 2 (createBatch, getActivePriorityBatches) ---
// Ensure createBatch initializes qaCurrentId and qaHistory correctly
export const createBatch = async (batchData) => {
  if (!batchData.currentProcessorId) {
    throw new Error("currentProcessorId is required to create a batch.");
  }
  try {
    const docRef = await addDoc(collection(db, BATCHES_COLLECTION), {
      ...batchData,
      startedAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      status: BATCH_STATUSES.MIXING,
      processorHistory: [batchData.currentProcessorId],
      qaCurrentId: null, // Explicitly null
      qaHistory: [],     // Explicitly empty array
    });
    console.log("Batch document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding batch document: ", e);
    throw e;
  }
};

export const getActivePriorityBatches = (onDataChange, onError) => {
  const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const q = query(
    collection(db, BATCHES_COLLECTION),
    or(
      where('status', 'in', [
        BATCH_STATUSES.MIXING,
        BATCH_STATUSES.COMPLETE,
        BATCH_STATUSES.AWAITING_QA,
        BATCH_STATUSES.ON_HOLD,
      ]),
      and(where('status', '==', BATCH_STATUSES.APPROVED), where('startedAt', '>=', sevenDaysAgo))
    ),
    orderBy('lastUpdated', 'desc') // Order by lastUpdated for better real-time feel
  );
  // ... (rest of the function is the same as in Step 2)
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const batches = [];
    querySnapshot.forEach((doc) => {
      batches.push({ id: doc.id, ...doc.data() });
    });
    onDataChange(batches);
  }, (error) => {
    console.error("Error fetching active/priority batches: ", error);
    if (onError) {
      onError(error);
    }
  });
  return unsubscribe;
};


// --- NEW FUNCTIONS FOR STEP 3 ---

/**
 * Updates the status of a batch and logs processor if applicable.
 * @param {string} batchId
 * @param {string} newStatus - e.g., BATCH_STATUSES.AWAITING_QA
 * @param {string} [actingProcessorId] - UID of the processor performing the action, if relevant.
 */
export const updateBatchStatus = async (batchId, newStatus, actingProcessorId) => {
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  const updateData = {
    status: newStatus,
    lastUpdated: serverTimestamp(),
  };
  if (actingProcessorId) {
    updateData.processorHistory = arrayUnion(actingProcessorId);
    // Optionally update currentProcessorId if the action implies taking over
    // updateData.currentProcessorId = actingProcessorId;
  }
  try {
    await updateDoc(batchRef, updateData);
    console.log(`Batch ${batchId} status updated to ${newStatus}`);
  } catch (e) {
    console.error(`Error updating batch ${batchId} status: `, e);
    throw e;
  }
};

/**
 * Gets batches specifically for the QA queue (status: 'awaitingQA').
 * @param {function} onDataChange - Callback for new data.
 * @param {function} onError - Callback for errors.
 * @returns {function} Unsubscribe function.
 */
export const getQAQueueBatches = (onDataChange, onError) => {
  const q = query(
    collection(db, BATCHES_COLLECTION),
    where('status', '==', BATCH_STATUSES.AWAITING_QA),
    orderBy('lastUpdated', 'asc') // Oldest awaiting QA first
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const batches = [];
    querySnapshot.forEach((doc) => {
      batches.push({ id: doc.id, ...doc.data() });
    });
    onDataChange(batches);
  }, (error) => {
    console.error("Error fetching QA queue batches: ", error);
    if (onError) onError(error);
  });
  return unsubscribe;
};

/**
 * Assigns a QA user to start testing a batch.
 * @param {string} batchId
 * @param {string} qaId - UID of the QA user starting the test.
 */
export const startQATesting = async (batchId, qaId) => {
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  try {
    await updateDoc(batchRef, {
      qaCurrentId: qaId,
      qaHistory: arrayUnion(qaId), // Add QA to history if not already there (arrayUnion handles duplicates)
      lastUpdated: serverTimestamp(),
    });
    console.log(`QA ${qaId} started testing batch ${batchId}`);
  } catch (e) {
    console.error(`Error assigning QA to batch ${batchId}: `, e);
    throw e;
  }
};

/**
 * Submits a new sample for a batch.
 * @param {string} batchId
 * @param {object} sampleData - { submitterId, notes (optional) }
 * @returns {Promise<string>} The ID of the newly created sample document.
 */
export const submitSample = async (batchId, sampleData) => {
  if (!sampleData.submitterId) {
    throw new Error("submitterId is required to submit a sample.");
  }
  const samplesRef = collection(db, BATCHES_COLLECTION, batchId, SAMPLES_SUBCOLLECTION);
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);

  // Get current number of samples to determine next attempt number (client-side preferred, but can be done here)
  const existingSamplesSnapshot = await getDocs(query(samplesRef, orderBy('attempt', 'desc')));
  const attemptNumber = existingSamplesSnapshot.docs.length + 1;

  try {
    const sampleDocRef = await addDoc(samplesRef, {
      attempt: attemptNumber,
      submittedAt: serverTimestamp(),
      submitterId: sampleData.submitterId,
      qaId: null, // QA who decides on this sample
      result: SAMPLE_RESULTS.PENDING,
      notes: sampleData.notes || '', // QA notes or initial submission notes
      decidedAt: null,
    });

    // Update batch: set status to AWAITING_QA, update lastUpdated, and add processor to history
    await updateDoc(batchRef, {
      status: BATCH_STATUSES.AWAITING_QA,
      lastUpdated: serverTimestamp(),
      processorHistory: arrayUnion(sampleData.submitterId),
      // currentProcessorId: sampleData.submitterId, // Optional: update if this implies takeover
    });

    console.log(`Sample ${sampleDocRef.id} submitted for batch ${batchId}`);
    return sampleDocRef.id;
  } catch (e) {
    console.error(`Error submitting sample for batch ${batchId}: `, e);
    throw e;
  }
};

/**
 * Updates the result of a sample and potentially the parent batch status.
 * @param {string} batchId
 * @param {string} sampleId
 * @param {object} decisionData - { qaId, result (SAMPLE_RESULTS.APPROVED/DENIED), notes (optional) }
 */
export const updateSampleResult = async (batchId, sampleId, decisionData) => {
  if (!decisionData.qaId || !decisionData.result) {
    throw new Error("QA ID and result are required to update sample.");
  }

  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  const sampleRef = doc(db, BATCHES_COLLECTION, batchId, SAMPLES_SUBCOLLECTION, sampleId);

  const firestoreBatch = writeBatch(db); // Use a write batch for atomicity

  // Update sample document
  firestoreBatch.update(sampleRef, {
    qaId: decisionData.qaId,
    result: decisionData.result,
    notes: decisionData.notes || '',
    decidedAt: serverTimestamp(),
  });

  // Update parent batch document
  const batchUpdateData = {
    lastUpdated: serverTimestamp(),
    qaCurrentId: decisionData.qaId, // The QA who made the decision becomes current
    qaHistory: arrayUnion(decisionData.qaId),
  };

  if (decisionData.result === SAMPLE_RESULTS.APPROVED) {
    batchUpdateData.status = BATCH_STATUSES.APPROVED;
  } else if (decisionData.result === SAMPLE_RESULTS.DENIED) {
    // Batch remains 'awaitingQA' for another sample, or could go 'on-hold'
    // For now, just ensure it's explicitly set if it might have been something else
    batchUpdateData.status = BATCH_STATUSES.AWAITING_QA;
  }
  // Add other conditions if DENIED leads to other statuses based on rules

  firestoreBatch.update(batchRef, batchUpdateData);

  try {
    await firestoreBatch.commit();
    console.log(`Sample ${sampleId} result updated to ${decisionData.result} by QA ${decisionData.qaId}`);
  } catch (e) {
    console.error(`Error updating sample ${sampleId} result: `, e);
    throw e;
  }
};

/**
 * Gets all samples for a given batch, ordered by attempt number.
 * @param {string} batchId
 * @param {function} onDataChange - Callback for new data.
 * @param {function} onError - Callback for errors.
 * @returns {function} Unsubscribe function.
 */
export const getSamplesForBatch = (batchId, onDataChange, onError) => {
  const q = query(
    collection(db, BATCHES_COLLECTION, batchId, SAMPLES_SUBCOLLECTION),
    orderBy('attempt', 'asc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const samples = [];
    querySnapshot.forEach((doc) => {
      samples.push({ id: doc.id, ...doc.data() });
    });
    onDataChange(samples);
  }, (error) => {
    console.error(`Error fetching samples for batch ${batchId}: `, error);
    if (onError) onError(error);
  });
  return unsubscribe;
};