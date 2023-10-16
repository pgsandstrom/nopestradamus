FROM node:18

# have to set NODE_ENV since we are not using nextjs
ENV NODE_ENV production


# Create app directory
WORKDIR /app

EXPOSE 80

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build

CMD [ "node", "dist" ]