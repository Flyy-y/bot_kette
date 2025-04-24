FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY ./index.js /app/index.js
COPY ./utils.js /app/utils.js
COPY ./answerMap.json /app/answerMap.json

# Start the bot
CMD ["npm", "start"]