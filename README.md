# bot_kette

A simple Discord bot that logs all messages to the console and can respond to specific trigger words.

## Features

- Logs all messages from Discord servers to the console
- Logs attachments with their URLs
- Responds to configured trigger words with custom responses
- Containerized with Docker for easy deployment

## Requirements

- Node.js 16.9.0 or higher
- Discord.js v14
- A Discord bot token

## Setup

### Local Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Discord bot token:
   ```
   DISCORD_TOKEN=your_token_here
   ```
4. Start the bot:
   ```
   npm start
   ```

### Using Docker

1. Clone this repository
2. Update the Discord token in `compose.yml` or use environment variables
3. Build and run with Docker Compose:
   ```
   docker-compose up -d
   ```

## Configuration

The bot uses an `answerMap.json` file to configure trigger words and responses. The format is:

```json
{
  "trigger1": "response1",
  "trigger2": "response2"
}
```

When a message contains any of the trigger words, the bot will respond with the corresponding response.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.