FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
# msnodesqlv8 (autenticación de Windows) es opcional y solo sirve en Windows: se omite en Linux.
RUN npm ci --omit=dev --omit=optional && npm cache clean --force

COPY src ./src

USER node
EXPOSE 4002
CMD ["node", "src/server.js"]
