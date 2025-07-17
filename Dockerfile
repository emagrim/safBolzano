# Use the official Playwright Docker image.
# This image already includes Node.js and all browser dependencies.
# Check for the latest version tag on the Playwright website or Docker Hub.
FROM mcr.microsoft.com/playwright:v1.54.1-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy your package.json and package-lock.json first for better caching
COPY package*.json ./

# Update software
RUN apt update && apt upgrade -y

# Install your application's npm dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Define the command to run your application
# Replace 'node your-app.js' with your actual start command
CMD ["node", "app.js"]
