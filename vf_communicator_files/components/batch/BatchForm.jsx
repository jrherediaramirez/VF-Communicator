// components/batch/BatchForm.jsx - Tablet-Friendly Version
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { createBatch } from '../../lib/firebase/firestore';
import { FORMULA_REGEX, DECK_OPTIONS } from '../../constants';
import styles from './BatchForm.module.css';

const BatchForm = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [formula, setFormula] = useState('');
  const [deck, setDeck] = useState(DECK_OPTIONS.length > 0 ? DECK_OPTIONS[0] : '');
  const [batchNumber, setBatchNumber] = useState('');
  
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');
    
    if (!validate()) {
      return;
    }

    if (!user || !user.uid) {
      setSubmitError("User not authenticated. Please log in again.");
      return;
    }

    setIsLoading(true);
    const batchData = {
      formula: formula.trim().toUpperCase(),
      deck,
      batchNumber: batchNumber.trim(),
      currentProcessorId: user.uid,
    };

    try {
      await createBatch(batchData);
      setSuccessMessage('Batch created successfully! Redirecting to dashboard...');
      
      // Clear form
      setFormula('');
      setDeck(DECK_OPTIONS.length > 0 ? DECK_OPTIONS[0] : '');
      setBatchNumber('');
      setErrors({});
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error("Failed to create batch:", err);
      setSubmitError(err.message || "Failed to create batch. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear global messages when user interacts
    if (submitError) setSubmitError('');
    if (successMessage) setSuccessMessage('');
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Create New Batch</h2>
          <p className={styles.formSubtitle}>Enter batch details to begin processing</p>
        </div>

        {submitError && (
          <div className={styles.errorGlobal}>{submitError}</div>
        )}

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="formula" className={styles.label}>
            Formula Code
          </label>
          <input
            type="text"
            id="formula"
            value={formula}
            onChange={(e) => {
              setFormula(e.target.value);
              handleInputChange('formula', e.target.value);
            }}
            className={`${styles.input} ${errors.formula ? styles.inputError : ''}`}
            placeholder="e.g., F2052"
            disabled={isLoading}
            autoComplete="off"
          />
          {errors.formula && (
            <div className={styles.errorField}>{errors.formula}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="deck" className={styles.label}>
            Processing Deck
          </label>
          <select
            id="deck"
            value={deck}
            onChange={(e) => {
              setDeck(e.target.value);
              handleInputChange('deck', e.target.value);
            }}
            className={`${styles.select} ${errors.deck ? styles.inputError : ''}`}
            disabled={isLoading}
          >
            <option value="" disabled={DECK_OPTIONS.length > 0}>
              Select processing deck
            </option>
            {DECK_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.deck && (
            <div className={styles.errorField}>{errors.deck}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="batchNumber" className={styles.label}>
            Batch Number
          </label>
          <input
            type="text"
            id="batchNumber"
            value={batchNumber}
            onChange={(e) => {
              setBatchNumber(e.target.value);
              handleInputChange('batchNumber', e.target.value);
            }}
            className={`${styles.input} ${errors.batchNumber ? styles.inputError : ''}`}
            placeholder="Enter batch number from sheet"
            disabled={isLoading}
            autoComplete="off"
          />
          {errors.batchNumber && (
            <div className={styles.errorField}>{errors.batchNumber}</div>
          )}
        </div>

        <button 
          type="submit" 
          className={styles.button} 
          disabled={isLoading || successMessage}
        >
          {isLoading ? 'Creating Batch...' : 
           successMessage ? 'Batch Created!' : 
           'Create Batch'}
        </button>
      </form>
    </div>
  );
};

export default BatchForm;