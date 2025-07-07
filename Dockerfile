# Use official Bun image
FROM oven/bun:1.1.0

WORKDIR /app

# Copy all files
COPY . .

# Install deps (if needed, e.g., dotenv or fastify plugins)
RUN bun install

# Expose the default port
EXPOSE 3000

# Run the Bun app
CMD ["bun", "index.ts"]
