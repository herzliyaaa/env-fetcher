# Use Bun base image
FROM oven/bun:1.1.0

WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN bun install

# Expose port 3000
EXPOSE 3000

# Run Bun
CMD ["bun", "index.ts"]
