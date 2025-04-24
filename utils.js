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
 * Gets a random response from an array or returns the input if it's not an array
 * @param {string|string[]} text - The response text or array of possible responses
 * @returns {string} - A randomly selected response
 */
function getResponseWord(text) {
  if (Array.isArray(text)) {
    const index = Math.floor(Math.random() * text.length);
    return text[index];
  } else {
    return text;
  }
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

module.exports = {
  removeAccents,
  containsWholeWord,
  startsWithWord,
  endsWithWord,
  getResponseWord,
  shuffleArray
};
