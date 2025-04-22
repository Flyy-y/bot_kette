FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY ./index.js /app/index.js
COPY ./answerMap.json /app/answerMap.json

# Start the bot
CMD ["npm", "start"]