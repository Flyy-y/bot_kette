// tests/messageHandler.test.js
const {
  containsWholeWord,
  startsWithWord,
  endsWithWord
} = require('../utils');

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

  test('should log attachments when message has attachments', async () => {
    // Mock the answerMap data
    const mockAnswerMap = {};
    
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
    
    // Mock attachments
    const mockAttachments = [
      { name: 'image.jpg', url: 'https://example.com/image.jpg' },
      { name: 'document.pdf', url: 'https://example.com/document.pdf' }
    ];
    
    // Create a mock message object with attachments
    const mockMessage = {
      content: 'Here are some attachments',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { 
        size: mockAttachments.length, 
        forEach: jest.fn(callback => mockAttachments.forEach(callback))
      },
      reply: jest.fn().mockResolvedValue({})
    };
    
    // Call the message handler with our mock message
    await messageHandler(mockMessage);
    
    // Verify that attachments were logged
    expect(mockMessage.attachments.forEach).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      `[ATTACHMENT] ${mockAttachments[0].name}: ${mockAttachments[0].url}`
    );
    expect(console.log).toHaveBeenCalledWith(
      `[ATTACHMENT] ${mockAttachments[1].name}: ${mockAttachments[1].url}`
    );
  });

  test('should handle secondary matches', async () => {
    // Mock the answerMap data with secondary matches
    const mockAnswerMap = {
      "primary": {
        "answer": "primaryResponse",
        "on": "always",
        "secondaryMatches": ["secondary1", "secondary2"]
      }
    };
    
    // Set up mocks for fs and path
    const fs = require('fs');
    const path = require('path');
    path.join.mockReturnValue('/mock/path/answerMap.json');
    fs.readFileSync.mockReturnValue(JSON.stringify(mockAnswerMap));
    
    // Mock shuffleArray to return the array unchanged for predictable testing
    jest.mock('../utils', () => {
      const originalModule = jest.requireActual('../utils');
      return {
        ...originalModule,
        shuffleArray: jest.fn(arr => arr)
      };
    });
    
    // Import the index module (which will use our mocks)
    const { Client } = require('discord.js');
    require('../index');
    
    // Get the message handler (second argument to the 'on' method)
    const messageHandler = Client.mock.results[0].value.on.mock.calls.find(
      call => call[0] === 'messageCreate'
    )[1];
    
    // Test with a secondary match
    const secondaryMessage = {
      content: 'This message contains secondary1 word',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockResolvedValue({})
    };
    
    await messageHandler(secondaryMessage);
    expect(secondaryMessage.reply).toHaveBeenCalledWith('primaryResponse');
  });

  test('should handle multiple matches and join them with + ratio', async () => {
    // Mock the answerMap data with multiple potential matches
    const mockAnswerMap = {
      "match1": {"answer": "response1", "on": "always"},
      "match2": {"answer": "response2", "on": "always"},
      "match3": {"answer": "response3", "on": "always"}
    };
    
    // Set up mocks for fs and path
    const fs = require('fs');
    const path = require('path');
    path.join.mockReturnValue('/mock/path/answerMap.json');
    fs.readFileSync.mockReturnValue(JSON.stringify(mockAnswerMap));
    
    // No need to mock shuffleArray anymore as we're keeping the original order
    
    // Import the index module (which will use our mocks)
    const { Client } = require('discord.js');
    require('../index');
    
    // Get the message handler (second argument to the 'on' method)
    const messageHandler = Client.mock.results[0].value.on.mock.calls.find(
      call => call[0] === 'messageCreate'
    )[1];
    
    // Create a message with multiple matches (3 or more)
    const multiMatchMessage = {
      content: 'This message contains match1, match2, and match3',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockResolvedValue({})
    };
    
    await messageHandler(multiMatchMessage);
    
    // Verify that the response contains all matches joined with " + " and ends with "+ ratio" (3+ matches)
    expect(multiMatchMessage.reply).toHaveBeenCalledWith('response1 + response2 + response3 + ratio');
    
    // Test with only 2 matches (should not add "+ ratio")
    const twoMatchMessage = {
      content: 'This message contains only match1 and match2',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockResolvedValue({})
    };
    
    // Mock answerMap with only 2 matches
    const mockAnswerMapTwoMatches = {
      "match1": {"answer": "response1", "on": "always"},
      "match2": {"answer": "response2", "on": "always"}
    };
    
    // Update the mock
    fs.readFileSync.mockReturnValue(JSON.stringify(mockAnswerMapTwoMatches));
    
    // Reset modules to reload with new mock data
    jest.resetModules();
    
    // Reimport the index module
    require('../index');
    
    // Get the message handler again
    const messageHandlerTwoMatches = Client.mock.results[0].value.on.mock.calls.find(
      call => call[0] === 'messageCreate'
    )[1];
    
    await messageHandlerTwoMatches(twoMatchMessage);
    
    // Verify that the response does NOT include "+ ratio" with only 2 matches
    expect(twoMatchMessage.reply).toHaveBeenCalledWith('response1 + response2');
  });

  test('should handle accented characters in matches', async () => {
    // Mock the answerMap data with accented characters
    const mockAnswerMap = {
      "ca": {"answer": "response", "on": "always"}
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
    
    // Create a message with accented characters
    const accentedMessage = {
      content: 'This message contains ça with accent',
      author: { bot: false, tag: 'User#1234' },
      guild: { name: 'Test Guild' },
      channel: { name: 'test-channel' },
      attachments: { size: 0, forEach: jest.fn() },
      reply: jest.fn().mockResolvedValue({})
    };
    
    await messageHandler(accentedMessage);
    
    // Verify that the accented character was matched (without ratio since it's only one match)
    expect(accentedMessage.reply).toHaveBeenCalledWith('response');
  });
  
  test('should handle probability-based responses', async () => {
    // Mock the answerMap data with probability values
    const mockAnswerMap = {
      "test": {
        "answer": [
          {"response1": 0.6},
          {"response2": 0.3}
        ],
        "on": "always"
      }
    };
    
    // Set up mocks for fs and path
    const fs = require('fs');
    const path = require('path');
    path.join.mockReturnValue('/mock/path/answerMap.json');
    fs.readFileSync.mockReturnValue(JSON.stringify(mockAnswerMap));
    
    // Save original Math.random
    const originalRandom = Math.random;
    
    try {
      // Mock Math.random to test different probability scenarios
      Math.random = jest.fn();
      
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
      
      // Test case 1: Random value within first response probability range
      Math.random.mockReturnValue(0.3); // 0.3 < 0.6, so should return "response1"
      await messageHandler(mockMessage);
      expect(mockMessage.reply).toHaveBeenCalledWith('response1');
      
      // Reset the mock
      mockMessage.reply.mockClear();
      
      // Test case 2: Random value within second response probability range
      Math.random.mockReturnValue(0.7); // 0.6 < 0.7 < 0.9, so should return "response2"
      await messageHandler(mockMessage);
      expect(mockMessage.reply).toHaveBeenCalledWith('response2');
      
      // Reset the mock
      mockMessage.reply.mockClear();
      
      // Test case 3: Random value outside probability range (no response)
      Math.random.mockReturnValue(0.95); // 0.95 > 0.9, so should not respond
      await messageHandler(mockMessage);
      expect(mockMessage.reply).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('No response due to probability check')
      );
    } finally {
      // Restore Math.random
      Math.random = originalRandom;
    }
  });
});