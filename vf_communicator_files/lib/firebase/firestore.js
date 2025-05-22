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
  arrayUnion,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { BATCH_STATUSES, SAMPLE_RESULTS } from '../../constants'; // Ensure constants are imported

const BATCHES_COLLECTION = 'batches';
const SAMPLES_SUBCOLLECTION = 'samples';

// --- Functions from Step 2 ---
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
      qaCurrentId: null,
      qaHistory: [],
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
        BATCH_STATUSES.ON_HOLD, // Included for Step 4
      ]),
      and(
        where('status', '==', BATCH_STATUSES.APPROVED),
        where('lastUpdated', '>=', sevenDaysAgo) // or startedAt for archive logic
      )
    ),
    orderBy('lastUpdated', 'desc')
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const batches = [];
    querySnapshot.forEach((doc) => {
      batches.push({ id: doc.id, ...doc.data() });
    });
    onDataChange(batches);
  }, (error) => {
    console.error("Error fetching active/priority batches: ", error);
    if (onError) onError(error);
  });
  return unsubscribe;
};

// --- Functions from Step 3 ---
export const updateBatchStatus = async (batchId, newStatus, actingProcessorId) => {
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  const updateData = {
    status: newStatus,
    lastUpdated: serverTimestamp(),
  };
  if (actingProcessorId) {
    updateData.processorHistory = arrayUnion(actingProcessorId);
  }
  try {
    await updateDoc(batchRef, updateData);
    console.log(`Batch ${batchId} status updated to ${newStatus}`);
  } catch (e) {
    console.error(`Error updating batch ${batchId} status: `, e);
    throw e;
  }
};

export const getQAQueueBatches = (onDataChange, onError) => {
  const q = query(
    collection(db, BATCHES_COLLECTION),
    where('status', '==', BATCH_STATUSES.AWAITING_QA),
    orderBy('lastUpdated', 'asc')
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

export const startQATesting = async (batchId, qaId) => {
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  try {
    await updateDoc(batchRef, {
      qaCurrentId: qaId,
      qaHistory: arrayUnion(qaId),
      lastUpdated: serverTimestamp(),
    });
    console.log(`QA ${qaId} started testing batch ${batchId}`);
  } catch (e) {
    console.error(`Error assigning QA to batch ${batchId}: `, e);
    throw e;
  }
};

export const submitSample = async (batchId, sampleData) => {
  if (!sampleData.submitterId) {
    throw new Error("submitterId is required to submit a sample.");
  }
  const samplesRef = collection(db, BATCHES_COLLECTION, batchId, SAMPLES_SUBCOLLECTION);
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);

  const existingSamplesSnapshot = await getDocs(query(samplesRef, orderBy('attempt', 'desc')));
  const attemptNumber = existingSamplesSnapshot.docs.length + 1;

  try {
    const sampleDocRef = await addDoc(samplesRef, {
      attempt: attemptNumber,
      submittedAt: serverTimestamp(),
      submitterId: sampleData.submitterId,
      qaId: null,
      result: SAMPLE_RESULTS.PENDING,
      notes: sampleData.notes || '',
      decidedAt: null,
    });

    await updateDoc(batchRef, {
      status: BATCH_STATUSES.AWAITING_QA,
      lastUpdated: serverTimestamp(),
      processorHistory: arrayUnion(sampleData.submitterId),
    });

    console.log(`Sample ${sampleDocRef.id} submitted for batch ${batchId}`);
    return sampleDocRef.id;
  } catch (e) {
    console.error(`Error submitting sample for batch ${batchId}: `, e);
    throw e;
  }
};

export const updateSampleResult = async (batchId, sampleId, decisionData) => {
  if (!decisionData.qaId || !decisionData.result) {
    throw new Error("QA ID and result are required to update sample.");
  }

  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  const sampleRef = doc(db, BATCHES_COLLECTION, batchId, SAMPLES_SUBCOLLECTION, sampleId);
  const firestoreBatch = writeBatch(db);

  firestoreBatch.update(sampleRef, {
    qaId: decisionData.qaId,
    result: decisionData.result,
    notes: decisionData.notes || '',
    decidedAt: serverTimestamp(),
  });

  const batchUpdateData = {
    lastUpdated: serverTimestamp(),
    qaCurrentId: decisionData.qaId,
    qaHistory: arrayUnion(decisionData.qaId),
  };

  if (decisionData.result === SAMPLE_RESULTS.APPROVED) {
    batchUpdateData.status = BATCH_STATUSES.APPROVED;
  } else if (decisionData.result === SAMPLE_RESULTS.DENIED) {
    batchUpdateData.status = BATCH_STATUSES.AWAITING_QA;
  }
  firestoreBatch.update(batchRef, batchUpdateData);

  try {
    await firestoreBatch.commit();
    console.log(`Sample ${sampleId} result updated to ${decisionData.result} by QA ${decisionData.qaId}`);
  } catch (e) {
    console.error(`Error updating sample ${sampleId} result: `, e);
    throw e;
  }
};

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


// --- NEW FUNCTIONS FOR STEP 4 ---

export const setBatchOnHold = async (batchId, actorId) => {
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  try {
    await updateDoc(batchRef, {
      status: BATCH_STATUSES.ON_HOLD,
      lastUpdated: serverTimestamp(),
      // onHoldById: actorId, // Optional detailed logging
      // onHoldAt: serverTimestamp(), // Optional
    });
    console.log(`Batch ${batchId} placed on-hold by ${actorId}`);
  } catch (e) {
    console.error(`Error placing batch ${batchId} on-hold: `, e);
    throw e;
  }
};

export const setBatchRejected = async (batchId, actorId, rejectionNotes = '') => {
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  try {
    await updateDoc(batchRef, {
      status: BATCH_STATUSES.REJECTED,
      lastUpdated: serverTimestamp(),
      // rejectedById: actorId, // Optional
      // rejectedAt: serverTimestamp(), // Optional
      // rejectionNotes: rejectionNotes, // Optional
    });
    console.log(`Batch ${batchId} rejected by ${actorId}`);
  } catch (e) {
    console.error(`Error rejecting batch ${batchId}: `, e);
    throw e;
  }
};

export const getAllBatchesForArchive = (onDataChange, onError) => {
  const q = query(
    collection(db, BATCHES_COLLECTION),
    orderBy('lastUpdated', 'desc')
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const batches = [];
    querySnapshot.forEach((doc) => {
      batches.push({ id: doc.id, ...doc.data() });
    });
    onDataChange(batches);
  }, (error) => {
    console.error("Error fetching all batches for archive: ", error);
    if (onError) onError(error);
  });
  return unsubscribe;
};

export const reassignProcessor = async (batchId, newProcessorId, adminId) => {
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  try {
    await updateDoc(batchRef, {
      currentProcessorId: newProcessorId,
      processorHistory: arrayUnion(newProcessorId),
      lastUpdated: serverTimestamp(),
      // reassignedBy: adminId, // Optional
      // reassignedAt: serverTimestamp(), // Optional
    });
    console.log(`Batch ${batchId} processor reassigned to ${newProcessorId} by admin ${adminId}`);
  } catch (e) {
    console.error(`Error reassigning processor for batch ${batchId}: `, e);
    throw e;
  }
};

export const reassignQA = async (batchId, newQaId, adminId) => {
  const batchRef = doc(db, BATCHES_COLLECTION, batchId);
  try {
    await updateDoc(batchRef, {
      qaCurrentId: newQaId,
      qaHistory: arrayUnion(newQaId),
      lastUpdated: serverTimestamp(),
      // reassignedBy: adminId, // Optional
      // reassignedAt: serverTimestamp(), // Optional
    });
    console.log(`Batch ${batchId} QA reassigned to ${newQaId} by admin ${adminId}`);
  } catch (e) {
    console.error(`Error reassigning QA for batch ${batchId}: `, e);
    throw e;
  }
};

// Note: If you were using a single export block at the end, ensure these are added there.
// Since each function above is now prefixed with `export const`, a separate block is not strictly needed,
// but if you had one, you'd remove the individual `export` keywords and add them to the block.
// For consistency with the provided snippet, I've added `export` to each.