FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN chown node:node /app
COPY --chown=node:node package.json package-lock.json ./
USER node
RUN npm ci --omit=dev --no-audit --no-fund
COPY --chown=node:node src ./src
EXPOSE 8080
CMD ["node", "src/server.js"]
