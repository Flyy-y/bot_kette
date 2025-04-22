# bot_kette

A simple Discord bot that logs all messages to the console and can respond to specific trigger words.

## Features

- Logs all messages from Discord servers to the console
- Logs attachments with their URLs
- Responds to configured trigger words with custom responses
- Supports different word matching modes (whole word, starts with, ends with)
- Containerized with Docker for easy deployment
- GitHub Actions workflow for automatic container publishing

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

#### Option 1: Pull from GitHub Container Registry

```bash
# Pull the latest image
docker pull ghcr.io/Flyy-y/bot_kette:latest

# Run with your Discord token
docker run -d --name bot_kette -e DISCORD_TOKEN=your_token_here ghcr.io/Flyy-y/bot_kette:latest
```

#### Option 2: Using Docker Compose

1. Clone this repository
2. Update the Discord token in `compose.yml`
3. Run with Docker Compose:
   ```
   docker compose up -d
   ```

Example `compose.yml`:
```yaml
services:
  bot:
    image: ghcr.io/Flyy-y/bot_kette:latest
    # Alternatively, build locally:
    # build: .
    container_name: bot_kette
    restart: unless-stopped
    environment:
      - DISCORD_TOKEN=your_token_here
    volumes:
      # Mount custom answerMap.json (optional)
      - ./answerMap.json:/app/answerMap.json:ro
```

#### Option 3: Build Locally

1. Clone this repository
2. Build the Docker image:
   ```
   docker build -t bot_kette .
   ```
3. Run the container:
   ```
   docker run -d --name bot_kette -e DISCORD_TOKEN=your_token_here bot_kette
   ```

## Configuration

The bot uses an `answerMap.json` file to configure trigger words and responses. The format is:

```json
{
  "trigger1": {"answer": "response1", "on": "endsWith"},
  "trigger2": {"answer": "response2", "on": "startsWith"},
  "trigger3": {"answer": "response3", "on": "always"}
}
```

### Matching Modes

The bot supports three different matching modes:

- **endsWith**: Triggers when the message ends with the specified word
  - Example: With `"oui": {"answer": "stiti", "on": "endsWith"}`, the message "ça va oui" will trigger the response

- **startsWith**: Triggers when the message starts with the specified word
  - Example: With `"hello": {"answer": "world", "on": "startsWith"}`, the message "hello everyone" will trigger the response

- **always**: Triggers when the word appears anywhere in the message as a whole word (not as part of another word)
  - Example: With `"thanks": {"answer": "you're welcome", "on": "always"}`, the message "thanks for your help" will trigger the response, but "thanksgiving" will not

The bot only checks for whole words, so partial matches like "jouir" will not trigger the "oui" response.

## GitHub Actions

This repository includes a GitHub Actions workflow that automatically:
1. Builds the Docker image
2. Tags it with the version from package.json
3. Publishes it to GitHub Container Registry (ghcr.io)

The image will be available at `ghcr.io/Flyy-y/bot_kette:latest` and `ghcr.io/Flyy-y/bot_kette:1.0.0` (or whatever version is in package.json).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.