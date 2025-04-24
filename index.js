// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fs = require('fs');
const {
  containsWholeWord,
  startsWithWord,
  endsWithWord,
  getResponseWord
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
  const matches = []; // Array to collect all matches
  
  for (const [trigger, config] of Object.entries(answerMap)) {
    // Get the matching mode and answer from the config
    const matchMode = config.on || 'always';
    
    let isMatch = false;
    
    // Check primary trigger
    switch (matchMode) {
      case 'startsWith':
        isMatch = startsWithWord(messageContent, trigger);
        break;
      case 'endsWith':
        isMatch = endsWithWord(messageContent, trigger);
        break;
      case 'always':
      default:
        isMatch = containsWholeWord(messageContent, trigger);
        break;
    }
    
    // Check secondary matches if available
    if (!isMatch && config.secondaryMatches && Array.isArray(config.secondaryMatches)) {
      for (const secondaryTrigger of config.secondaryMatches) {
        switch (matchMode) {
          case 'startsWith':
            isMatch = startsWithWord(messageContent, secondaryTrigger);
            break;
          case 'endsWith':
            isMatch = endsWithWord(messageContent, secondaryTrigger);
            break;
          case 'always':
          default:
            isMatch = containsWholeWord(messageContent, secondaryTrigger);
            break;
        }
        
        if (isMatch) break; // Exit the loop if we found a match
      }
    }
    
    if (isMatch) {
      // Get a random response for this match
      const response = getResponseWord(config.answer);
      console.log(`Triggered response for "${trigger}" (mode: ${matchMode}): "${response}"`);
      
      // Add to matches array
      matches.push(response);
    }
  }
  
  // If we have matches, send a response
  if (matches.length > 0) {
    try {
      // Join with " + " and add "+ ratio" at the end if there are 3 or more matches
      let finalResponse = matches.join(' + ');
      if (matches.length >= 3) {
        finalResponse += ' + ratio';
      }
      
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
