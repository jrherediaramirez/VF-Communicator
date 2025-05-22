// constants/index.js

export const BATCH_STATUSES = {
  MIXING: 'mixing',
  COMPLETE: 'complete',
  AWAITING_QA: 'awaitingQA',
  APPROVED: 'approved',
  ON_HOLD: 'on-hold',       // <-- Ensure this is present/added
  REJECTED: 'rejected',     // <-- Ensure this is present/added
  // Sample specific statuses (if you keep them here)
  PENDING: 'pending',
  // DENIED: 'denied', // Sample result, batch status usually remains awaitingQA or changes
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