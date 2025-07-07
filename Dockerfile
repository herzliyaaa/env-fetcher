# Use official Bun image
FROM oven/bun:1.1.0

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN bun install

# Expose port
EXPOSE 3000

# Run the app
CMD ["bun", "index.ts"]
