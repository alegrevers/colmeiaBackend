FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production=false
COPY . .
RUN npm run prisma:generate
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
