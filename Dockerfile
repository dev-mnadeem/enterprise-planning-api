# Use the official Node.js 16 image from Docker Hub
FROM node:16

# Create a new directory in our Docker image for our application's files
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the new directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of our application's source files into the new directory
COPY . .

# Our application listens on port 8080, so let's expose it
EXPOSE 3006

# The command to start our application
CMD [ "npm", "start" ]