// tests/utils.test.js
const {
  removeAccents,
  containsWholeWord,
  startsWithWord,
  endsWithWord,
  getResponseWord,
  shuffleArray,
  getRandomDelay
} = require('../utils');

describe('removeAccents', () => {
  test('should remove accents from characters', () => {
    expect(removeAccents('café')).toBe('cafe');
    expect(removeAccents('résumé')).toBe('resume');
    expect(removeAccents('naïve')).toBe('naive');
    expect(removeAccents('ça va')).toBe('ca va');
    expect(removeAccents('Crème Brûlée')).toBe('Creme Brulee');
  });

  test('should leave non-accented characters unchanged', () => {
    expect(removeAccents('hello')).toBe('hello');
    expect(removeAccents('123')).toBe('123');
    expect(removeAccents('hello 123')).toBe('hello 123');
  });
});

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

  test('should handle accented characters', () => {
    expect(containsWholeWord('Comment ça va', 'ca')).toBe(true);
    expect(containsWholeWord('Café au lait', 'cafe')).toBe(true);
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

  test('should handle accented characters', () => {
    expect(startsWithWord('Ça va bien', 'ca')).toBe(true);
    expect(startsWithWord('Éléphant rose', 'elephant')).toBe(true);
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

  test('should handle accented characters', () => {
    expect(endsWithWord('Comment ça', 'ca')).toBe(true);
    expect(endsWithWord('J\'aime le café', 'cafe')).toBe(true);
  });
});

describe('getResponseWord', () => {
  // Save original Math.random
  const originalRandom = Math.random;
  
  beforeEach(() => {
    // Reset Math.random mock before each test
    Math.random = jest.fn();
  });
  
  afterEach(() => {
    // Restore Math.random after each test
    Math.random = originalRandom;
  });

  test('should return the input if it is not an array', () => {
    expect(getResponseWord('hello')).toBe('hello');
    expect(getResponseWord(123)).toBe(123);
  });

  test('should return a random element from the array (old format)', () => {
    // Mock Math.random to return a predictable value
    Math.random.mockReturnValue(0.5);

    const array = ['a', 'b', 'c', 'd'];
    expect(getResponseWord(array)).toBe('c'); // 0.5 * 4 = 2, so index 2
  });
  
  test('should handle new format with probabilities and select based on probability', () => {
    // Test cases with different random values
    const testCases = [
      { random: 0.1, expected: 'feur' },    // 0.1 < 0.4, so first item
      { random: 0.5, expected: 'feuse' },   // 0.4 < 0.5 < 0.7, so second item
      { random: 0.8, expected: 'fure' },    // 0.7 < 0.8 < 0.9, so third item
      { random: 0.95, expected: 'coubeh' }, // 0.9 < 0.95 < 1.0, so fourth item
    ];
    
    const answerArray = [
      { "feur": 0.4 },
      { "feuse": 0.3 },
      { "fure": 0.2 },
      { "coubeh": 0.1 }
    ];
    
    for (const { random, expected } of testCases) {
      Math.random.mockReturnValue(random);
      expect(getResponseWord(answerArray)).toBe(expected);
    }
  });
  
  test('should return null when probability check fails', () => {
    // Set up an answer array with total probability less than 1
    const answerArray = [
      { "response1": 0.3 },
      { "response2": 0.2 }
    ];
    // Total probability is 0.5, so if random > 0.5, should return null
    
    // Test with random value greater than total probability
    Math.random.mockReturnValue(0.6);
    expect(getResponseWord(answerArray)).toBeNull();
    
    // Test with random value within probability range
    Math.random.mockReturnValue(0.2);
    expect(getResponseWord(answerArray)).toBe("response1");
  });
});

describe('shuffleArray', () => {
  test('should return a new array with the same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    
    // Check that the original array is not modified
    expect(original).toEqual([1, 2, 3, 4, 5]);
    
    // Check that the shuffled array has the same elements
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled).toEqual(expect.arrayContaining(original));
  });

  test('should shuffle the array', () => {
    // Mock Math.random to return predictable values
    const originalRandom = Math.random;
    const mockValues = [0.9, 0.1, 0.7, 0.3];
    let callCount = 0;
    
    Math.random = jest.fn().mockImplementation(() => {
      return mockValues[callCount++ % mockValues.length];
    });

    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    
    // With our mock values, the array should be shuffled in a specific way
    // The exact order depends on the implementation, but it should be different
    expect(shuffled).not.toEqual(original);
    
    // Restore Math.random
    Math.random = originalRandom;
  });
});

describe('getRandomDelay', () => {
  // Save original setTimeout and Math.random
  const originalSetTimeout = global.setTimeout;
  const originalRandom = Math.random;
  const originalConsoleLog = console.log;
  
  beforeEach(() => {
    // Mock setTimeout to execute immediately
    global.setTimeout = jest.fn((callback) => {
      callback();
      return 123; // Return a timeout ID
    });
    
    // Mock Math.random
    Math.random = jest.fn();
    
    // Mock console.log
    console.log = jest.fn();
  });
  
  afterEach(() => {
    // Restore original functions
    global.setTimeout = originalSetTimeout;
    Math.random = originalRandom;
    console.log = originalConsoleLog;
  });
  
  test('should return a Promise', () => {
    const result = getRandomDelay();
    expect(result).toBeInstanceOf(Promise);
  });
  
  test('should skip delay in test environment', async () => {
    // The test should automatically detect it's running in Jest
    await getRandomDelay();
    
    // setTimeout should not be called in test environment
    expect(setTimeout).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Test environment detected, skipping random delay');
  });
  
  test('should use setTimeout with a Gaussian random delay when isTest is false', async () => {
    // Mock Math.random to return specific values for the Box-Muller transform
    // First call for u1, second call for u2
    Math.random
      .mockReturnValueOnce(0.5) // u1 = 0.5
      .mockReturnValueOnce(0.25); // u2 = 0.25
    
    // Call the function with isTest explicitly set to false
    await getRandomDelay(60, false);
    
    // Calculate the expected delay based on our mocked values
    // z0 = sqrt(-2 * ln(0.5)) * cos(2 * PI * 0.25) = sqrt(1.386) * cos(PI/2) = 0
    // gaussianValue = abs(0 * 0.3) = 0
    // delayMs = 0 * 60 * 60 * 1000 = 0
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 0);
  });
  
  test('should respect the maxMinutes parameter when not in test mode', async () => {
    // Mock Math.random to return specific values for the Box-Muller transform
    Math.random
      .mockReturnValueOnce(0.1) // u1 = 0.1
      .mockReturnValueOnce(0); // u2 = 0
    
    // Call the function with maxMinutes = 10 and isTest = false
    await getRandomDelay(10, false);
    
    // Calculate the expected delay based on our mocked values
    // z0 = sqrt(-2 * ln(0.1)) * cos(2 * PI * 0) = sqrt(4.605) * cos(0) = 2.146
    // gaussianValue = abs(2.146 * 0.3) = 0.644
    // delayMs = 0.644 * 10 * 60 * 1000 = 386400
    const expectedDelay = Math.floor(0.644 * 10 * 60 * 1000);
    const actualDelay = setTimeout.mock.calls[0][1];
    
    // Allow for small differences in floating-point calculations
    const tolerance = 10 * 1000; // 10 second tolerance
    expect(actualDelay).toBeGreaterThanOrEqual(expectedDelay - tolerance);
    expect(actualDelay).toBeLessThanOrEqual(expectedDelay + tolerance);
  });
  
  test('should generate delays using Gaussian distribution when not in test mode', async () => {
    // Test with different random values for the Box-Muller transform
    const testCases = [
      {
        u1: 0.1, u2: 0,
        // z0 = sqrt(-2 * ln(0.1)) * cos(2 * PI * 0) = sqrt(4.605) * cos(0) = 2.146
        // gaussianValue = abs(2.146 * 0.3) = 0.644 (clamped to 0.644)
        expectedFactor: 0.644
      },
      {
        u1: 0.5, u2: 0.25,
        // z0 = sqrt(-2 * ln(0.5)) * cos(2 * PI * 0.25) = sqrt(1.386) * cos(PI/2) = 0
        // gaussianValue = abs(0 * 0.3) = 0
        expectedFactor: 0
      },
      {
        u1: 0.01, u2: 0.5,
        // z0 = sqrt(-2 * ln(0.01)) * cos(2 * PI * 0.5) = sqrt(9.21) * cos(PI) = -3.035
        // gaussianValue = abs(-3.035 * 0.3) = 0.911 (clamped to 0.911)
        expectedFactor: 0.911
      },
      {
        u1: 0.001, u2: 0,
        // z0 = sqrt(-2 * ln(0.001)) * cos(2 * PI * 0) = sqrt(13.82) * cos(0) = 3.717
        // gaussianValue = abs(3.717 * 0.3) = 1.115 (clamped to 1)
        expectedFactor: 1
      }
    ];
    
    for (const { u1, u2, expectedFactor } of testCases) {
      Math.random
        .mockReturnValueOnce(u1)
        .mockReturnValueOnce(u2);
      
      const maxMinutes = 60;
      await getRandomDelay(maxMinutes, false); // Explicitly set isTest to false
      
      const expectedMs = Math.floor(expectedFactor * maxMinutes * 60 * 1000);
      const actualMs = setTimeout.mock.calls[setTimeout.mock.calls.length - 1][1];
      
      // Allow for small differences in floating-point calculations
      const tolerance = 2000; // 2 seconds tolerance
      expect(actualMs).toBeGreaterThanOrEqual(expectedMs - tolerance);
      expect(actualMs).toBeLessThanOrEqual(expectedMs + tolerance);
    }
  });
});