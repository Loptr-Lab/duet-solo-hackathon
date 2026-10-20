FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.js gameEngine.js ./\nCOPY public ./public
EXPOSE 8080
USER node
CMD ["node", "server.js"]
