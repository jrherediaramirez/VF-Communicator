// constants/index.js

export const BATCH_STATUSES = {
  MIXING: 'mixing',
  COMPLETE: 'complete', // Processor marks mixing as complete, ready for QA submission
  AWAITING_QA: 'awaitingQA', // Batch has samples submitted, waiting for QA decision
  APPROVED: 'approved', // Batch approved by QA
  DENIED: 'denied', // Sample status (batch remains awaitingQA or goes to on-hold/rejected)
  ON_HOLD: 'on-hold', // Batch status for higher-level review
  REJECTED: 'rejected', // Batch status, finalized as rejected
  PENDING: 'pending', // Sample status before QA decision
};

export const USER_ROLES = {
  PROCESSOR: 'processor',
  QA: 'qa',
  ADMIN: 'admin',
};

export const FORMULA_REGEX = /^[a-zA-Z0-9]+$/;

export const DECK_OPTIONS = [
  "Deck 84 -- Clear",
  "Deck 85 -- Creamy",
];

export const SAMPLE_RESULTS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
};