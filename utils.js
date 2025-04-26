// utils.js
// Utility functions for string matching

/**
 * Removes accents from a string
 * @param {string} str - The string to remove accents from
 * @returns {string} - The string without accents
 */
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Checks if a string contains a whole word
 * @param {string} text - The text to search in
 * @param {string} word - The word to search for
 * @returns {boolean} - True if the text contains the whole word
 */
function containsWholeWord(text, word) {
  // Remove accents from both text and word
  const normalizedText = removeAccents(text);
  const normalizedWord = removeAccents(word);
  
  const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
  return regex.test(normalizedText);
}

/**
 * Checks if a string starts with a word
 * @param {string} text - The text to check
 * @param {string} word - The word to check for
 * @returns {boolean} - True if the text starts with the word
 */
function startsWithWord(text, word) {
  // Remove accents from both text and word
  const normalizedText = removeAccents(text);
  const normalizedWord = removeAccents(word);
  
  const words = normalizedText.trim().split(/\s+/);
  return words.length > 0 && words[0].toLowerCase() === normalizedWord.toLowerCase();
}

/**
 * Checks if a string ends with a word
 * @param {string} text - The text to check
 * @param {string} word - The word to check for
 * @returns {boolean} - True if the text ends with the word
 */
function endsWithWord(text, word) {
  // Remove accents from both text and word
  const normalizedText = removeAccents(text);
  const normalizedWord = removeAccents(word);
  
  const words = normalizedText.trim().split(/\s+/);
  return words.length > 0 && words[words.length - 1].toLowerCase() === normalizedWord.toLowerCase();
}

/**
 * Gets a random response from an array based on probability or returns the input if it's not an array
 * @param {string|Array} text - The response text or array of possible responses with probabilities
 * @returns {string|null} - A randomly selected response or null if no response should be sent
 */
function getResponseWord(text) {
  if (!Array.isArray(text)) {
    return text;
  }
  
  // Check if we're dealing with the new format (array of objects with probabilities)
  const isNewFormat = text.length > 0 && typeof text[0] === 'object' && text[0] !== null;
  
  if (!isNewFormat) {
    // Handle old format (array of strings)
    const index = Math.floor(Math.random() * text.length);
    return text[index];
  }
  
  // Handle new format with probabilities
  const random = Math.random(); // Random number between 0 and 1
  let cumulativeProbability = 0;
  
  for (const item of text) {
    // Get the first key-value pair from the object
    const [response, probability] = Object.entries(item)[0];
    
    cumulativeProbability += probability;
    
    if (random < cumulativeProbability) {
      return response;
    }
  }
  
  // If the total probability is less than 1 and our random number is greater,
  // return null to indicate no response should be sent
  return null;
}

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Returns a promise that resolves after a random delay between 0 and maxMinutes
 * Skips delay when running in a test environment
 * @param {number} maxMinutes - The maximum delay in minutes (default: 30)
 * @param {boolean} isTest - Whether we're running in a test environment (default: auto-detect)
 * @returns {Promise} - A promise that resolves after the random delay
 */
function getRandomDelay(maxMinutes = 30, isTest = undefined) {
  // Auto-detect test environment if not specified
  if (isTest === undefined) {
    // Check for Jest or other test environment indicators
    isTest = typeof jest !== 'undefined' || process.env.NODE_ENV === 'test';
  }
  
  // Skip delay in test environment
  if (isTest) {
    console.log('Test environment detected, skipping random delay');
    return Promise.resolve();
  }
  
  // Convert minutes to milliseconds
  const maxDelayMs = maxMinutes * 60 * 1000;
  
  // Generate a random delay between 0 and maxDelayMs
  const delayMs = Math.floor(Math.random() * maxDelayMs);
  
  // Return a promise that resolves after the delay
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

module.exports = {
  removeAccents,
  containsWholeWord,
  startsWithWord,
  endsWithWord,
  getResponseWord,
  shuffleArray,
  getRandomDelay
};
