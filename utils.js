// utils.js
// Utility functions for string matching

/**
 * Checks if a string contains a whole word
 * @param {string} text - The text to search in
 * @param {string} word - The word to search for
 * @returns {boolean} - True if the text contains the whole word
 */
function containsWholeWord(text, word) {
  const regex = new RegExp(`\\b${word}\\b`, 'i');
  return regex.test(text);
}

/**
 * Checks if a string starts with a word
 * @param {string} text - The text to check
 * @param {string} word - The word to check for
 * @returns {boolean} - True if the text starts with the word
 */
function startsWithWord(text, word) {
  const words = text.trim().split(/\s+/);
  return words.length > 0 && words[0].toLowerCase() === word.toLowerCase();
}

/**
 * Checks if a string ends with a word
 * @param {string} text - The text to check
 * @param {string} word - The word to check for
 * @returns {boolean} - True if the text ends with the word
 */
function endsWithWord(text, word) {
  const words = text.trim().split(/\s+/);
  return words.length > 0 && words[words.length - 1].toLowerCase() === word.toLowerCase();
}

module.exports = {
  containsWholeWord,
  startsWithWord,
  endsWithWord
};