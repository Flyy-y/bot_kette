// tests/clientEvents.test.js

// Mock the discord.js module
jest.mock('discord.js', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        once: jest.fn((event, callback) => {
          // Store the callback for later execution
          if (event === 'ready') {
            global.readyCallback = callback;
          }
        }),
        on: jest.fn((event, callback) => {
          // Store the callback for later execution
          if (event === 'error') {
            global.errorCallback = callback;
          }
        }),
        login: jest.fn().mockImplementation((token) => {
          if (token === 'valid-token') {
            return Promise.resolve();
          } else {
            return Promise.reject(new Error('Invalid token'));
          }
        }),
        user: { tag: 'TestBot#1234' }
      };
    }),
    GatewayIntentBits: {
      Guilds: 1,
      GuildMessages: 2,
      MessageContent: 3
    }
  };
});

// Mock the fs and path modules
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('{}')
}));

jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mock/path/answerMap.json')
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Client events', () => {
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
    
    // Reset global callbacks
    global.readyCallback = null;
    global.errorCallback = null;
  });
  
  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Clean up environment variables
    delete process.env.DISCORD_TOKEN;
  });

  test('should log when client is ready', () => {
    // Set up environment
    process.env.DISCORD_TOKEN = 'valid-token';
    
    // Import the index module (which will register the event handlers)
    require('../index');
    
    // Verify that the ready event handler was registered
    const { Client } = require('discord.js');
    expect(Client.mock.results[0].value.once).toHaveBeenCalledWith('ready', expect.any(Function));
    
    // Execute the ready callback
    if (global.readyCallback) {
      global.readyCallback();
    }
    
    // Verify that the bot logged the ready message
    expect(console.log).toHaveBeenCalledWith('Logged in as TestBot#1234!');
  });

  test('should log Discord client errors', () => {
    // Set up environment
    process.env.DISCORD_TOKEN = 'valid-token';
    
    // Import the index module (which will register the event handlers)
    require('../index');
    
    // Verify that the error event handler was registered
    const { Client } = require('discord.js');
    expect(Client.mock.results[0].value.on).toHaveBeenCalledWith('error', expect.any(Function));
    
    // Create a mock error
    const mockError = new Error('Test Discord client error');
    
    // Execute the error callback
    if (global.errorCallback) {
      global.errorCallback(mockError);
    }
    
    // Verify that the error was logged
    expect(console.error).toHaveBeenCalledWith('Discord client error:', mockError);
  });

  test('should handle login failure', async () => {
    // Set up environment with invalid token
    process.env.DISCORD_TOKEN = 'invalid-token';
    
    // Import the index module
    require('../index');
    
    // Wait for the promise to resolve/reject
    await new Promise(process.nextTick);
    
    // Verify that the error was logged and process.exit was called
    expect(console.error).toHaveBeenCalledWith(
      'Failed to login to Discord:',
      expect.any(Error)
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});