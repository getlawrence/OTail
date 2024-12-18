# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

# Use vite dev server with host flag to allow external connections
CMD ["npm", "run", "dev", "--", "--host"]