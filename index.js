// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fs = require('fs');

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

// Function to check if a string contains a whole word
function containsWholeWord(text, word) {
  const regex = new RegExp(`\\b${word}\\b`, 'i');
  return regex.test(text);
}

// Function to check if a string starts with a word
function startsWithWord(text, word) {
  const words = text.trim().split(/\s+/);
  return words.length > 0 && words[0].toLowerCase() === word.toLowerCase();
}

// Function to check if a string ends with a word
function endsWithWord(text, word) {
  const words = text.trim().split(/\s+/);
  return words.length > 0 && words[words.length - 1].toLowerCase() === word.toLowerCase();
}

function isArray(value) {
  const rndIndex;
  if typeof value === array{
    rndIndex = Math.floor(Math.random() * value.length);
    return value[rndIndex];
  }
  elif{
    return value;
  }
}

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
  
  for (const [trigger, config] of Object.entries(answerMap)) {
    // Get the matching mode and answer from the config
    const matchMode = config.on || 'always';
    const response = isArray(config.answer);
    
    let isMatch = false;
    
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
    
    if (isMatch) {
      console.log(`Triggered response for "${trigger}" (mode: ${matchMode}): "${response}"`);
      try {
        await message.reply(response);
      } catch (error) {
        console.error('Error sending reply:', error);
      }
      break; // Only reply with the first match
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
