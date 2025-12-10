# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-slim

WORKDIR /app

# Copy only necessary files from the builder stage
# Copy package.json for production dependencies
COPY --from=builder /app/package.json ./package.json
# Install production dependencies only
RUN npm install --omit=dev

# Copy compiled server code and static assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./index.html
COPY --from=builder /app/index.css ./index.css
COPY --from=builder /app/public ./public
COPY --from=builder /app/mcpServer.ts ./mcpServer.ts

# Cloud Run expects the application to listen on the port specified by the PORT environment variable
# The start.ts file handles this correctly.
CMD ["npm", "run", "start:prod"]