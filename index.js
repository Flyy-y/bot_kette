// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fs = require('fs');
const {
  containsWholeWord,
  startsWithWord,
  endsWithWord,
  getResponseWord,
  removeAccents,
  getRandomDelay
} = require('./utils');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Token from environment variable
const token = process.env.DISCORD_TOKEN;

let answerMap = {};
try {
  const answerMapPath = path.join(__dirname, 'answerMap.json');
  const answerMapData = fs.readFileSync(answerMapPath, 'utf8');
  answerMap = JSON.parse(answerMapData);
  console.log('Answer map loaded successfully!');
  console.log(`Loaded ${Object.keys(answerMap).length} response triggers.`);
} catch (error) {
  console.error('Failed to load answer map:', error);
  console.log('Using empty answer map instead.');
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  // Don't log messages from the bot itself
  if (message.author.bot) return;
  
  console.log(`[${message.guild.name}][#${message.channel.name}] ${message.author.tag}: ${message.content}`);
  
  // Log attachments if any
  if (message.attachments.size > 0) {
    message.attachments.forEach(attachment => {
      console.log(`[ATTACHMENT] ${attachment.name}: ${attachment.url}`);
    });
  }

  const messageContent = message.content;
  const matchesWithPositions = []; // Array to collect all matches with their positions
  
  for (const [trigger, config] of Object.entries(answerMap)) {
    // Get the matching mode and answer from the config
    const matchMode = config.on || 'always';
    
    let isMatch = false;
    let matchedTrigger = trigger;
    let position = -1;
    
    // Check primary trigger
    switch (matchMode) {
      case 'startsWith':
        isMatch = startsWithWord(messageContent, trigger);
        if (isMatch) {
          position = 0; // Always at the start
        }
        break;
      case 'endsWith':
        isMatch = endsWithWord(messageContent, trigger);
        if (isMatch) {
          // Find the position of the last word
          const words = messageContent.trim().split(/\s+/);
          position = messageContent.length - words[words.length - 1].length;
        }
        break;
      case 'always':
      default:
        isMatch = containsWholeWord(messageContent, trigger);
        if (isMatch) {
          // Find the position of the trigger in the message
          const normalizedText = removeAccents(messageContent.toLowerCase());
          const normalizedTrigger = removeAccents(trigger.toLowerCase());
          const regex = new RegExp(`\\b${normalizedTrigger}\\b`, 'i');
          const match = regex.exec(normalizedText);
          if (match) {
            position = match.index;
          }
        }
        break;
    }
    
    // Check secondary matches if available
    if (!isMatch && config.secondaryMatches && Array.isArray(config.secondaryMatches)) {
      for (const secondaryTrigger of config.secondaryMatches) {
        switch (matchMode) {
          case 'startsWith':
            isMatch = startsWithWord(messageContent, secondaryTrigger);
            if (isMatch) {
              position = 0;
              matchedTrigger = secondaryTrigger;
            }
            break;
          case 'endsWith':
            isMatch = endsWithWord(messageContent, secondaryTrigger);
            if (isMatch) {
              const words = messageContent.trim().split(/\s+/);
              position = messageContent.length - words[words.length - 1].length;
              matchedTrigger = secondaryTrigger;
            }
            break;
          case 'always':
          default:
            isMatch = containsWholeWord(messageContent, secondaryTrigger);
            if (isMatch) {
              const normalizedText = removeAccents(messageContent.toLowerCase());
              const normalizedTrigger = removeAccents(secondaryTrigger.toLowerCase());
              const regex = new RegExp(`\\b${normalizedTrigger}\\b`, 'i');
              const match = regex.exec(normalizedText);
              if (match) {
                position = match.index;
                matchedTrigger = secondaryTrigger;
              }
            }
            break;
        }
        
        if (isMatch) break; // Exit the loop if we found a match
      }
    }
    
    if (isMatch && position !== -1) {
      // Get a random response for this match
      const response = getResponseWord(config.answer);
      
      // Only add to matches if we have a response (probability check passed)
      if (response !== null) {
        console.log(`Triggered response for "${matchedTrigger}" (mode: ${matchMode}): "${response}" at position ${position}`);
        
        // Add to matches array with position
        matchesWithPositions.push({
          response,
          position,
          trigger: matchedTrigger
        });
      } else {
        console.log(`Triggered response for "${matchedTrigger}" (mode: ${matchMode}): No response due to probability check`);
      }
    }
  }
  
  // Sort matches by their position in the original message
  matchesWithPositions.sort((a, b) => a.position - b.position);
  
  // Extract just the responses in the correct order
  const matches = matchesWithPositions.map(match => match.response);
  
  // If we have matches, send a response
  if (matches.length > 0) {
    try {
      // Join with " + " and add "+ ratio" at the end if there are 3 or more matches
      let finalResponse = matches.join(' + ');
      if (matches.length >= 3) {
        finalResponse += ' + ratio';
      }
      
      // Wait for a random delay before replying
      console.log('Waiting for random delay before replying...');
      await getRandomDelay();
      console.log('Delay finished, sending reply now');
      
      await message.reply(finalResponse);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  }
});

// Log any errors
client.on('error', error => {
  console.error('Discord client error:', error);
});

// Login to Discord
client.login(token).catch(error => {
  console.error('Failed to login to Discord:', error);
  process.exit(1);
});
