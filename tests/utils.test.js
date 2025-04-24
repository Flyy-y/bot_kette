// tests/utils.test.js
const { containsWholeWord, startsWithWord, endsWithWord } = require('../utils');

describe('containsWholeWord', () => {
  test('should return true when text contains the whole word', () => {
    expect(containsWholeWord('Hello world', 'world')).toBe(true);
    expect(containsWholeWord('Hello world!', 'world')).toBe(true);
    expect(containsWholeWord('Hello WORLD', 'world')).toBe(true); // Case insensitive
  });

  test('should return false when text does not contain the whole word', () => {
    expect(containsWholeWord('Hello worldwide', 'world')).toBe(false);
    expect(containsWholeWord('Helloworld', 'world')).toBe(false);
    expect(containsWholeWord('Hello', 'world')).toBe(false);
  });

  test('should handle special characters in the word', () => {
    expect(containsWholeWord('Hello world.', 'world')).toBe(true);
    expect(containsWholeWord('Hello, world!', 'world')).toBe(true);
  });
});

describe('startsWithWord', () => {
  test('should return true when text starts with the word', () => {
    expect(startsWithWord('Hello world', 'Hello')).toBe(true);
    expect(startsWithWord('hello world', 'Hello')).toBe(true); // Case insensitive
    expect(startsWithWord('  Hello world', 'Hello')).toBe(true); // Trims whitespace
  });

  test('should return false when text does not start with the word', () => {
    expect(startsWithWord('Say Hello', 'Hello')).toBe(false);
    expect(startsWithWord('HelloWorld', 'Hello')).toBe(false); // Not a separate word
    expect(startsWithWord('World', 'Hello')).toBe(false);
  });
});

describe('endsWithWord', () => {
  test('should return true when text ends with the word', () => {
    expect(endsWithWord('Hello world', 'world')).toBe(true);
    expect(endsWithWord('Hello WORLD', 'world')).toBe(true); // Case insensitive
    expect(endsWithWord('Hello world  ', 'world')).toBe(true); // Trims whitespace
  });

  test('should return false when text does not end with the word', () => {
    expect(endsWithWord('world is big', 'world')).toBe(false);
    expect(endsWithWord('Helloworld', 'world')).toBe(false); // Not a separate word
    expect(endsWithWord('Hello', 'world')).toBe(false);
  });
});