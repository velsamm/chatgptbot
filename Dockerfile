FROM node:16
WORKDIR /app
COPY /src .
COPY package.json package-lock.json tsconfig.json .
RUN npm i && npm run build
CMD ["node", "./build/index.js"]