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

- Node.js 22.0.0 or higher
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

## Testing

This project includes a comprehensive test suite using Jest. The tests cover:

- Utility functions for string matching (containsWholeWord, startsWithWord, endsWithWord)
- answerMap loading functionality
- Message handling and response logic

### Running Tests

#### Local Development

```bash
# Install dependencies including dev dependencies
npm install

# Run tests
npm test

# Run tests with coverage report
npm run test:coverage
```

#### Using Docker

```bash
# Build and run tests using Docker
docker build -t bot_kette_test -f Dockerfile.test .
docker run bot_kette_test
```

### Test Status

[![Run Tests](https://github.com/Flyy-y/bot_kette/actions/workflows/run-tests.yml/badge.svg)](https://github.com/Flyy-y/bot_kette/actions/workflows/run-tests.yml)

The current test coverage is:

| File      | % Statements | % Branches | % Functions | % Lines |
|-----------|--------------|------------|-------------|---------|
| All files |       85.18  |     87.5   |      50     |   84.9  |
| index.js  |       82.97  |    83.33   |      20     |   82.6  |
| utils.js  |        100   |     100    |     100     |    100  |

## GitHub Actions

This repository includes GitHub Actions workflows that automatically:

### 1. Run Tests Workflow

- Builds a Docker test image
- Runs all tests inside the Docker container
- Generates and uploads test coverage reports
- Automatically comments on PRs with test results if tests fail
- Prevents Docker image building if tests fail
- Runs on every push to main and add-unit-tests branches, pull requests to main, and manual triggering

### 2. Docker Publish Workflow

- Builds the Docker image
- Tags it with the version from package.json
- Publishes it to GitHub Container Registry (ghcr.io)
- Runs on every push, version tags (v*.*.*), pull requests to main, and manual triggering

The image will be available at `ghcr.io/Flyy-y/bot_kette:latest` and `ghcr.io/Flyy-y/bot_kette:1.0.0` (or whatever version is in package.json).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.