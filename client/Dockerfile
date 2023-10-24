# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the entire app source code to the container
COPY . .

# Build the React app
RUN npm run build

# Set environment variables if needed
# ENV REACT_APP_API_URL=https://api.example.com

# Expose the port that the React app will run on
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
