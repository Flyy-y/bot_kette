// tests/answerMap.test.js
const fs = require('fs');
const path = require('path');

// Create a utility function to test the answerMap loading functionality
function loadAnswerMap() {
  try {
    const answerMapPath = path.join(__dirname, '..', 'answerMap.json');
    const answerMapData = fs.readFileSync(answerMapPath, 'utf8');
    return JSON.parse(answerMapData);
  } catch (error) {
    console.error('Failed to load answer map:', error);
    return {};
  }
}

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('answerMap loading', () => {
  // Save original console methods
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Mock console methods to prevent output during tests
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Reset mocks before each test
    jest.resetModules();
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  test('should load answerMap successfully', () => {
    // Mock data
    const mockAnswerMap = {
      "quoi": {"answer": "feur", "on": "always"},
      "qui": {"answer": "kette", "on": "always"}
    };
    
    // Mock path.join to return a fixed path
    path.join.mockReturnValue('/mock/path/answerMap.json');
    
    // Mock fs.readFileSync to return our mock data
    fs.readFileSync.mockReturnValue(JSON.stringify(mockAnswerMap));
    
    // Call the function
    const result = loadAnswerMap();
    
    // Verify that readFileSync was called with the correct path
    expect(path.join).toHaveBeenCalledWith(expect.any(String), '..', 'answerMap.json');
    expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/answerMap.json', 'utf8');
    
    // Verify the result
    expect(result).toEqual(mockAnswerMap);
  });

  test('should handle error when loading answerMap fails', () => {
    // Mock path.join to return a fixed path
    path.join.mockReturnValue('/mock/path/answerMap.json');
    
    // Mock fs.readFileSync to throw an error
    fs.readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });
    
    // Call the function
    const result = loadAnswerMap();
    
    // Verify that console.error was called with the error message
    expect(console.error).toHaveBeenCalledWith(
      'Failed to load answer map:',
      expect.any(Error)
    );
    
    // Verify the result is an empty object
    expect(result).toEqual({});
  });
});