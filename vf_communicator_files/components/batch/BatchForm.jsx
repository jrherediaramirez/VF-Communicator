// components/batch/BatchForm.jsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { createBatch } from '../../lib/firebase/firestore';
import { FORMULA_REGEX, DECK_OPTIONS } from '../../constants';
import styles from './BatchForm.module.css'; // We'll create this CSS file next

const BatchForm = () => {
  const { user } = useAuth(); // Assuming user object has uid
  const router = useRouter();

  const [formula, setFormula] = useState('');
  const [deck, setDeck] = useState(DECK_OPTIONS.length > 0 ? DECK_OPTIONS[0] : '');
  const [batchNumber, setBatchNumber] = useState('');
  
  const [errors, setErrors] = useState({}); // For field-specific errors
  const [submitError, setSubmitError] = useState(''); // For general submission error
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formula.trim()) {
      newErrors.formula = "Formula is required.";
    } else if (!FORMULA_REGEX.test(formula)) {
      newErrors.formula = "Formula must contain only letters and numbers.";
    }
    if (!deck) {
      newErrors.deck = "Deck selection is required.";
    }
    if (!batchNumber.trim()) {
      newErrors.batchNumber = "Batch Number is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) {
      setIsLoading(false);
      return;
    }

    if (!user || !user.uid) {
      setSubmitError("User not authenticated. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const batchData = {
      formula: formula.trim().toUpperCase(), // Standardize formula
      deck,
      batchNumber: batchNumber.trim(),
      currentProcessorId: user.uid,
    };

    try {
      await createBatch(batchData);
      // Optionally clear form or show success message then redirect
      alert('Batch created successfully!'); // Simple feedback for now
      router.push('/dashboard'); // Redirect to dashboard after creation
    } catch (err) {
      console.error("Failed to create batch:", err);
      setSubmitError(err.message || "Failed to create batch. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {submitError && <p className={styles.errorGlobal}>{submitError}</p>}

      <div className={styles.formGroup}>
        <label htmlFor="formula" className={styles.label}>Formula:</label>
        <input
          type="text"
          id="formula"
          value={formula}
          onChange={(e) => {
            setFormula(e.target.value);
            if (errors.formula) validate(); // Re-validate on change if there was an error
          }}
          className={`${styles.input} ${errors.formula ? styles.inputError : ''}`}
        />
        {errors.formula && <p className={styles.errorField}>{errors.formula}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="deck" className={styles.label}>Deck:</label>
        <select
          id="deck"
          value={deck}
          onChange={(e) => {
            setDeck(e.target.value);
            if (errors.deck) validate();
          }}
          className={`${styles.input} ${errors.deck ? styles.inputError : ''}`} // Re-use input style for select
        >
          <option value="" disabled={DECK_OPTIONS.length > 0}>Select a Deck</option>
          {DECK_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errors.deck && <p className={styles.errorField}>{errors.deck}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="batchNumber" className={styles.label}>Batch Number (from sheet):</label>
        <input
          type="text" // Or number, depending on expected format
          id="batchNumber"
          value={batchNumber}
          onChange={(e) => {
            setBatchNumber(e.target.value);
            if (errors.batchNumber) validate();
          }}
          className={`${styles.input} ${errors.batchNumber ? styles.inputError : ''}`}
        />
        {errors.batchNumber && <p className={styles.errorField}>{errors.batchNumber}</p>}
      </div>

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? 'Creating Batch...' : 'Create Batch'}
      </button>
    </form>
  );
};

export default BatchForm;