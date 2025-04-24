// tests/messageHandler.test.js
const { containsWholeWord, startsWithWord, endsWithWord } = require('../utils');

// Mock the discord.js module
jest.mock('discord.js', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        once: jest.fn(),
        on: jest.fn(),
        login: jest.fn().mockReturnValue(Promise.resolve())
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
  readFileSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn()
}));

describe('Message handling', () => {
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
    
    // Set up process.env.DISCORD_TOKEN
    process.env.DISCORD_TOKEN = 'mock-token';
  });
  
  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Clean up environment variables
    delete process.env.DISCORD_TOKEN;
  });

  test('should handle message with matching trigger', async () => {
    // Mock the answerMap data
    const mockAnswerMap = {
      "test": {"answer": "response", "on": "always"}
    };
    
    // Set up mocks for fs and path
    const fs = require('fs');
    const path = require('path');
    path.join.mockReturnValue('/mock/path/answerMap.json');
    fs.readFileSync.mockReturnValue(JSON.stringify(mockAnswerMap));
    
    // Import the index module (which will use our mocks)
    const { Client } = require('discord.js');
    require('../index');
    
    // Get the message handler (second argument to the 'on' method)
    const messageHandler = Client.mock.results[0].value.on.mock.calls.find(
      call => call[0] === 'messageCreate'
    )[1];
    
    // Create a mock message object
    const mockMessage = {
      content: 'This is a test message',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockResolvedValue({})
    };
    
    // Call the message handler with our mock message
    await messageHandler(mockMessage);
    
    // Verify that the message was replied to
    expect(mockMessage.reply).toHaveBeenCalledWith('response');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Triggered response for "test"')
    );
  });

  test('should not reply to messages from bots', async () => {
    // Mock the answerMap data
    const mockAnswerMap = {
      "test": {"answer": "response", "on": "always"}
    };
    
    // Set up mocks for fs and path
    const fs = require('fs');
    const path = require('path');
    path.join.mockReturnValue('/mock/path/answerMap.json');
    fs.readFileSync.mockReturnValue(JSON.stringify(mockAnswerMap));
    
    // Import the index module (which will use our mocks)
    const { Client } = require('discord.js');
    require('../index');
    
    // Get the message handler (second argument to the 'on' method)
    const messageHandler = Client.mock.results[0].value.on.mock.calls.find(
      call => call[0] === 'messageCreate'
    )[1];
    
    // Create a mock message object from a bot
    const mockMessage = {
      content: 'This is a test message',
      author: { bot: true, tag: 'Bot#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockResolvedValue({})
    };
    
    // Call the message handler with our mock message
    await messageHandler(mockMessage);
    
    // Verify that the message was not replied to
    expect(mockMessage.reply).not.toHaveBeenCalled();
  });

  test('should handle different matching modes correctly', async () => {
    // Mock the answerMap data with different matching modes
    const mockAnswerMap = {
      "start": {"answer": "startResponse", "on": "startsWith"},
      "end": {"answer": "endResponse", "on": "endsWith"},
      "contain": {"answer": "containResponse", "on": "always"}
    };
    
    // Set up mocks for fs and path
    const fs = require('fs');
    const path = require('path');
    path.join.mockReturnValue('/mock/path/answerMap.json');
    fs.readFileSync.mockReturnValue(JSON.stringify(mockAnswerMap));
    
    // Import the index module (which will use our mocks)
    const { Client } = require('discord.js');
    require('../index');
    
    // Get the message handler (second argument to the 'on' method)
    const messageHandler = Client.mock.results[0].value.on.mock.calls.find(
      call => call[0] === 'messageCreate'
    )[1];
    
    // Test startsWith mode
    const startMessage = {
      content: 'start of a message',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockResolvedValue({})
    };
    
    await messageHandler(startMessage);
    expect(startMessage.reply).toHaveBeenCalledWith('startResponse');
    
    // Test endsWith mode
    const endMessage = {
      content: 'message end',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockResolvedValue({})
    };
    
    await messageHandler(endMessage);
    expect(endMessage.reply).toHaveBeenCalledWith('endResponse');
    
    // Test contains mode
    const containMessage = {
      content: 'this message contains contain word',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockResolvedValue({})
    };
    
    await messageHandler(containMessage);
    expect(containMessage.reply).toHaveBeenCalledWith('containResponse');
  });

  test('should handle error when replying to message', async () => {
    // Mock the answerMap data
    const mockAnswerMap = {
      "test": {"answer": "response", "on": "always"}
    };
    
    // Set up mocks for fs and path
    const fs = require('fs');
    const path = require('path');
    path.join.mockReturnValue('/mock/path/answerMap.json');
    fs.readFileSync.mockReturnValue(JSON.stringify(mockAnswerMap));
    
    // Import the index module (which will use our mocks)
    const { Client } = require('discord.js');
    require('../index');
    
    // Get the message handler (second argument to the 'on' method)
    const messageHandler = Client.mock.results[0].value.on.mock.calls.find(
      call => call[0] === 'messageCreate'
    )[1];
    
    // Create a mock message object with a reply method that throws an error
    const mockMessage = {
      content: 'This is a test message',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockRejectedValue(new Error('Reply failed'))
    };
    
    // Call the message handler with our mock message
    await messageHandler(mockMessage);
    
    // Verify that the error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error sending reply:',
      expect.any(Error)
    );
  });
});